/**
 * Family Scanner Cloudflare Worker
 *
 * This worker handles scan requests from the mobile app,
 * calls Claude API with web search, and caches results in KV.
 *
 * Required Environment Variables:
 * - ANTHROPIC_API_KEY: Your Claude API key (stored as a secret)
 *
 * Required KV Namespace Binding:
 * - SCAN_CACHE: KV namespace for caching scan results
 */

// CORS headers for mobile app access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// The scanning prompt for Claude
const SCAN_PROMPT = `You are a family content advisor helping parents make informed decisions about media for their children. Analyze the following content and provide a comprehensive, balanced review.

IMPORTANT: Use your web search capability to find recent reviews, parent guides, and content warnings for this title. Look for sources like Common Sense Media, IMDB Parents Guide, and other parenting resources.

Analyze the content and respond with a JSON object in this exact format:
{
  "title": "The exact title provided",
  "content_type": "tv_show|movie|book",
  "overall_rating": "A brief 1-2 sentence rating summary",
  "summary": "A 2-3 paragraph summary of what this content is about and who it's best suited for",
  "content_warnings": [
    {
      "category": "Violence|Language|Sexual Content|Scary Scenes|Substance Use|Other",
      "severity": "mild|moderate|strong",
      "description": "Specific description of the concern",
      "episodes_or_chapters": ["Optional: specific episodes or chapters where this appears"]
    }
  ],
  "age_recommendation": {
    "minimum_age": 0,
    "ideal_age_range": "X-Y years",
    "reasoning": "Why this age range is appropriate"
  },
  "positive_elements": [
    {
      "category": "Educational Value|Positive Messages|Role Models|Diversity|Other",
      "description": "Description of the positive element"
    }
  ],
  "discussion_topics": [
    {
      "topic": "A topic parents might want to discuss",
      "suggested_questions": ["Question 1", "Question 2"]
    }
  ],
  "similar_alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"],
  "sources_consulted": ["Source 1", "Source 2"]
}

Be thorough but balanced. Include both concerns AND positive elements. Parents want complete information to make their own decisions - we scan, they decide.

CONTENT TO ANALYZE:
Title: {TITLE}
Type: {CONTENT_TYPE}`;

// Generate a cache key from title and content type
function getCacheKey(title, contentType) {
  const normalized = `${title.toLowerCase().trim()}_${contentType}`;
  return normalized.replace(/[^a-z0-9_]/g, '_');
}

// Parse and validate the Claude response
function parseClaudeResponse(responseText) {
  // Try to extract JSON from the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const data = JSON.parse(jsonMatch[0]);

  // Validate required fields
  const requiredFields = ['title', 'content_type', 'overall_rating', 'summary', 'age_recommendation'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return data;
}

// Call Claude API with web search
async function callClaudeAPI(title, contentType, apiKey) {
  const prompt = SCAN_PROMPT
    .replace('{TITLE}', title)
    .replace('{CONTENT_TYPE}', contentType);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5,
        }
      ],
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract the text response from Claude's response
  let textContent = '';
  for (const block of data.content) {
    if (block.type === 'text') {
      textContent += block.text;
    }
  }

  if (!textContent) {
    throw new Error('No text content in Claude response');
  }

  return parseClaudeResponse(textContent);
}

// Main request handler
async function handleRequest(request, env) {
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Scan endpoint
  if (url.pathname === '/scan' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { title, content_type } = body;

      // Validate input
      if (!title || typeof title !== 'string') {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!content_type || !['tv_show', 'movie', 'book'].includes(content_type)) {
        return new Response(JSON.stringify({ error: 'Valid content_type is required (tv_show, movie, book)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const cacheKey = getCacheKey(title, content_type);

      // Check cache first
      if (env.SCAN_CACHE) {
        try {
          const cached = await env.SCAN_CACHE.get(cacheKey, 'json');
          if (cached) {
            console.log(`Cache hit for: ${cacheKey}`);
            return new Response(JSON.stringify({
              success: true,
              data: { ...cached, cached: true },
              cached: true,
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (cacheError) {
          console.error('Cache read error:', cacheError);
          // Continue without cache
        }
      }

      // Call Claude API
      console.log(`Calling Claude API for: ${title} (${content_type})`);
      const result = await callClaudeAPI(title, content_type, env.ANTHROPIC_API_KEY);

      // Add timestamp
      result.scanned_at = new Date().toISOString();

      // Try to cache the result (gracefully handle failures)
      if (env.SCAN_CACHE) {
        try {
          // Cache for 30 days (in seconds)
          await env.SCAN_CACHE.put(cacheKey, JSON.stringify(result), {
            expirationTtl: 30 * 24 * 60 * 60,
          });
          console.log(`Cached result for: ${cacheKey}`);
        } catch (cacheError) {
          // Log but don't fail - still return result to user
          console.error('Cache write error (non-fatal):', cacheError);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        data: result,
        cached: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Scan error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to scan content',
        details: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Default 404
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};
