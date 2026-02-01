export interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/scan' && request.method === 'POST') {
      try {
        const body = await request.json() as { content: string };
        const { content } = body;

        if (!content) {
          return new Response(
            JSON.stringify({ error: 'Content is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: `You are a family content scanner. Analyze the following content and determine if it is appropriate for all family members. Provide a brief assessment and a rating from 1-5 (1 = not family-friendly, 5 = completely family-friendly).

Content to analyze:
${content}

Respond in JSON format:
{
  "rating": <number 1-5>,
  "assessment": "<brief explanation>",
  "concerns": ["<list of any concerns, if applicable>"]
}`,
              },
            ],
          }),
        });

        const data = await response.json() as {
          content: Array<{ type: string; text: string }>;
          error?: { message: string };
        };

        if (!response.ok) {
          throw new Error(data.error?.message || 'Anthropic API error');
        }

        const textContent = data.content.find((c) => c.type === 'text');
        const analysisText = textContent?.text || '';

        // Try to parse JSON from the response
        let analysis;
        try {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysisText };
        } catch {
          analysis = { raw: analysisText };
        }

        return new Response(JSON.stringify(analysis), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
          JSON.stringify({ error: message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ message: 'Family Scanner API', endpoints: ['/api/scan'] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  },
};
