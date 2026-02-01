const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

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

const scanContent = async (title, contentType) => {
  try {
    const contentTypeLabel = contentType === 'tv_show' ? 'TV Show' :
                             contentType === 'movie' ? 'Movie' : 'Book';

    const response = await client.messages.create({
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
    });

    // Extract text content from response
    let textContent = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Ensure proper structure
    return {
      title: result.title || title,
      content_type: result.content_type || contentType,
      findings: result.findings || []
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to scan content: ' + error.message);
  }
};

module.exports = { scanContent };
