/**
 * Family Scanner Worker - Cloudflare Worker
 * Calls Claude API with web search to analyze products for family-friendly content
 *
 * Deploy to: https://family-scanner.avimilst.workers.dev
 *
 * Environment Variables Required:
 * - ANTHROPIC_API_KEY: Your Anthropic API key
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
      const url = new URL(request.url);

      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Main scan endpoint
      if (url.pathname === '/scan' && request.method === 'POST') {
        const body = await request.json();
        const { barcode, productName } = body;

        if (!barcode && !productName) {
          return new Response(
            JSON.stringify({ error: 'Please provide a barcode or product name' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const query = productName || `barcode ${barcode}`;
        const result = await analyzeProduct(query, env.ANTHROPIC_API_KEY);

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function analyzeProduct(query, apiKey) {
  const systemPrompt = `You are a family content analyzer. Your job is to research products and provide parents with information about whether the content is appropriate for children.

For each product, provide:
1. Product name and type (game, movie, book, toy, etc.)
2. Age rating (if applicable)
3. Content warnings (violence, language, mature themes, etc.)
4. Brief description
5. Your recommendation (suitable for: young children, tweens, teens, adults only)

Be concise but thorough. Use web search to find accurate, up-to-date information about the product.

Respond in JSON format:
{
  "productName": "string",
  "productType": "string",
  "ageRating": "string or null",
  "contentWarnings": ["array of strings"],
  "description": "brief description",
  "recommendation": {
    "suitableFor": "young children | tweens | teens | adults only",
    "minimumAge": number,
    "summary": "one sentence summary for parents"
  },
  "sources": ["urls used for research"]
}`;

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
          type: 'web_search',
          name: 'web_search',
          max_uses: 3,
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Research this product and analyze it for family-friendly content: "${query}"`,
        },
      ],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract the text response from Claude
  let analysisText = '';
  for (const block of data.content) {
    if (block.type === 'text') {
      analysisText += block.text;
    }
  }

  // Try to parse as JSON, otherwise return raw text
  try {
    // Find JSON in the response (it might be wrapped in markdown code blocks)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed,
        scannedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    // JSON parsing failed, return raw text
  }

  return {
    success: true,
    data: {
      rawAnalysis: analysisText,
    },
    scannedAt: new Date().toISOString(),
  };
}
