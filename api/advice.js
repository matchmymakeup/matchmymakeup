export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured', hasKey: !!process.env.ANTHROPIC_API_KEY, envKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')) });
  }

  try {
    const { hex, r, g, b, skinTone, occasion, country, category } = req.body;

    const categoryNote = category ? ` Focus on ${category.replace('_', ' ')} products.` : '';
    const prompt = `You are a makeup expert named Maya. The user scanned color ${hex} (R:${r} G:${g} B:${b}). Skin tone: ${skinTone || 'any'}. Occasion: ${occasion || 'everyday'}. Country: ${country || 'global'}.${categoryNote} Give 3 sentences of warm, personalized beauty advice.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    return res.status(200).json({ advice: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
