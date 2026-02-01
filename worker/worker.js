// Family Scanner Cloudflare Worker
// Deploy to: https://family-scanner.avimilst.workers.dev
//
// Required environment variables:
//   - ANTHROPIC_API_KEY: Your Anthropic API key
//
// Required KV namespace binding:
//   - CACHE: KV namespace for caching scan results

const SCAN_PROMPT = `Search the web for information about the specified title and analyze it for family content concerns. For each of the following categories, provide findings ONLY if relevant content exists. Be factual, objective, and brief (2-3 sentences max per category). Do not make judgments about whether content is good or bad - just report what exists.

Categories:
1. Violence - physical violence, fighting, weapons, death, blood, war themes
2. Sexual content - romance, kissing, innuendo, nudity, sexual references
3. LGBTQ+ characters/themes - gay, lesbian, bisexual, transgender, non-binary characters, same-sex relationships, gender identity
4. Scary content - horror, jump scares, monsters, ghosts, demons, nightmares, dark themes
5. Religious affiliation/themes - religious content, practices, holidays, anti-religious messaging, occult/witchcraft

Return ONLY valid JSON in this exact format (no markdown code blocks, no extra text):
{
  "title": "string",
  "content_type": "tv_show|movie|book",
  "findings": [
    {
      "category": "string",
      "description": "string"
    }
  ]
}

Only include categories where notable content was found. If nothing found for a category, omit it entirely from the findings array.`;

// Generate cache key from title and content type
function getCacheKey(title, contentType) {
  const normalized = `${title.toLowerCase().trim()}:${contentType}`;
  return `scan:${normalized}`;
}

// Call Claude API with web search
async function callClaudeAPI(title, contentType, apiKey) {
  const contentTypeLabel = contentType === 'tv_show' ? 'TV Show' :
                           contentType === 'movie' ? 'Movie' : 'Book';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 5
      }],
      messages: [
        {
          role: 'user',
          content: `Analyze "${title}" (${contentTypeLabel}) for family content concerns.\n\n${SCAN_PROMPT}`
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extract text content from response
  let textContent = '';
  for (const block of data.content) {
    if (block.type === 'text') {
      textContent += block.text;
    }
  }

  // Parse JSON from response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Claude response');
  }

  const result = JSON.parse(jsonMatch[0]);

  // Ensure proper structure
  return {
    title: result.title || title,
    content_type: result.content_type || contentType,
    findings: result.findings || []
  };
}

// Handle scan request
async function handleScan(request, env) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { title, content_type } = body;

  // Validate required fields
  if (!title || typeof title !== 'string' || !title.trim()) {
    return jsonResponse({ error: 'Title is required' }, 400);
  }

  if (!content_type || !['tv_show', 'movie', 'book'].includes(content_type)) {
    return jsonResponse({ error: 'Valid content_type is required (tv_show, movie, book)' }, 400);
  }

  const cacheKey = getCacheKey(title, content_type);

  // Check cache first
  try {
    const cached = await env.CACHE.get(cacheKey, 'json');
    if (cached) {
      return jsonResponse({ ...cached, cached: true });
    }
  } catch (error) {
    // Cache read failed, continue without cache
    console.error('Cache read error:', error);
  }

  // Call Claude API
  let result;
  try {
    result = await callClaudeAPI(title.trim(), content_type, env.ANTHROPIC_API_KEY);
  } catch (error) {
    console.error('Claude API error:', error);
    return jsonResponse({ error: 'Failed to scan content: ' + error.message }, 500);
  }

  // Try to cache the result (gracefully handle failures)
  try {
    await env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 60 * 60 * 24 * 7 // 7 days
    });
  } catch (error) {
    // KV write failed - log but don't fail the request
    console.error('Cache write error (continuing without cache):', error);
  }

  return jsonResponse(result);
}

// Handle get cached result
async function handleGetCached(request, env) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title');
  const contentType = url.searchParams.get('content_type');

  if (!title) {
    return jsonResponse({ error: 'Title parameter is required' }, 400);
  }

  // Default to movie if not specified
  const type = contentType || 'movie';
  const cacheKey = getCacheKey(title, type);

  try {
    const cached = await env.CACHE.get(cacheKey, 'json');
    if (cached) {
      return jsonResponse({ ...cached, cached: true });
    }
    return jsonResponse({ error: 'Not found in cache' }, 404);
  } catch (error) {
    console.error('Cache read error:', error);
    return jsonResponse({ error: 'Cache lookup failed' }, 500);
  }
}

// Health check endpoint
async function handleHealth() {
  return jsonResponse({ status: 'ok', service: 'family-scanner' });
}

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Handle CORS preflight
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests
      if (path === '/api/content/scan' && request.method === 'POST') {
        return await handleScan(request, env);
      }

      if (path === '/api/content/cached' && request.method === 'GET') {
        return await handleGetCached(request, env);
      }

      if (path === '/api/health' && request.method === 'GET') {
        return handleHealth();
      }

      // 404 for unknown routes
      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error) {
      console.error('Unhandled error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }
};
