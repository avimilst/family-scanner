export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      const body = await request.json();
      const { title, content_type } = body;

      if (!title || !content_type) {
        return jsonResponse({ error: 'Missing required fields: title, content_type' }, 400);
      }

      const validTypes = ['tv_show', 'movie', 'book'];
      if (!validTypes.includes(content_type)) {
        return jsonResponse({ error: `Invalid content_type. Must be one of: ${validTypes.join(', ')}` }, 400);
      }

      if (!env.ANTHROPIC_API_KEY) {
        return jsonResponse({ error: 'API key not configured' }, 500);
      }

      const result = await analyzeContent(title, content_type, env.ANTHROPIC_API_KEY);
      return jsonResponse(result);

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: 'Internal server error', details: error.message }, 500);
    }
  },
};

async function analyzeContent(title, contentType, apiKey) {
  const contentTypeLabel = contentType.replace('_', ' ');

  const prompt = `Search the web for information about "${title}" (${contentTypeLabel}) and analyze it for family content concerns. Be factual and brief (2-3 sentences max per category). Return JSON with only categories where findings exist:
{
  "title": "string",
  "content_type": "tv_show|movie|book",
  "findings": [{"category": "string", "description": "string"}]
}

Categories to check:
- Violence
- Sexual content
- LGBTQ+ characters/themes
- Scary content
- Religious themes

Only include categories where there are actual findings. If no concerns in a category, omit it entirely.`;

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
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5,
        },
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
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
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
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      // Ensure consistent structure
      return {
        title: parsed.title || title,
        content_type: parsed.content_type || contentType,
        findings: parsed.findings || [],
      };
    } catch (e) {
      // Return structured response even if parsing fails
      return {
        title: title,
        content_type: contentType,
        findings: [],
        raw_response: textContent,
      };
    }
  }

  return {
    title: title,
    content_type: contentType,
    findings: [],
    raw_response: textContent,
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
