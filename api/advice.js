export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { hex, r, g, b, skinTone, occasion, country, category, profile, lang } = req.body;

    const PERSONAS = {
      en: 'Maya', hi: 'Priya', pt: 'Valentina', zh: 'Mei', id: 'Sari', ng: 'Adaeze',
      es: 'Isabella', ar: 'Layla', fr: 'Céline', bn: 'Ananya', sw: 'Amara',
    };
    const persona = PERSONAS[lang] || 'Maya';

    const categoryNote = category ? ` Focus on ${category.replace('_', ' ')} products.` : '';

    let profileContext = '';
    if (profile) {
      const parts = [];
      if (profile.ageRange) parts.push(`Age range: ${profile.ageRange}`);
      if (profile.skinTone) parts.push(`Skin tone: ${profile.skinTone}`);
      if (profile.ethnicity?.length) parts.push(`Heritage: ${profile.ethnicity.join(', ')}`);
      if (profile.skinConcerns?.length) parts.push(`Skin concerns: ${profile.skinConcerns.join(', ')}`);
      if (profile.beautyGoals?.length) parts.push(`Beauty goals: ${profile.beautyGoals.join(', ')}`);
      if (profile.budget) parts.push(`Budget: ${profile.budget}`);
      if (profile.climate) parts.push(`Climate: ${profile.climate}`);
      if (parts.length > 0) profileContext = ` User beauty profile: ${parts.join('. ')}.`;
    }

    const countryContext = country || 'global';
    const prompt = `You are ${persona}, a globally-minded makeup expert. The user scanned color ${hex} (R:${r} G:${g} B:${b}). Skin tone: ${skinTone || 'any'}. Occasion: ${occasion || 'everyday'}. Shopping region: ${countryContext}.${categoryNote}${profileContext} Give 3 sentences of warm, personalized beauty advice relevant to the user's region. Do not assume any specific country unless one is provided.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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
