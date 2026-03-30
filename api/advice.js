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
      en: { name: 'Maya', langInstruction: 'Respond in English.', culture: 'You draw on global beauty trends and are inclusive of all backgrounds.' },
      hi: { name: 'Priya', langInstruction: 'हिन्दी में जवाब दें। Respond in Hindi.', culture: 'You understand Indian beauty traditions — turmeric skincare, kajal, Ayurvedic ingredients, festive bridal looks, and the diversity of Indian skin tones from Kashmir to Kerala.' },
      pt: { name: 'Valentina', langInstruction: 'Responda em português. Respond in Portuguese.', culture: 'You know Brazilian beauty culture — beachy glow, bold carnival colors, Natura and O Boticário heritage, and the importance of sun protection in tropical climates.' },
      zh: { name: 'Mei', langInstruction: '用普通话回答。Respond in Mandarin Chinese.', culture: 'You understand Chinese beauty ideals — glass skin, C-beauty innovation from Perfect Diary and Florasis, traditional herbal ingredients, and the preference for natural, luminous finishes.' },
      id: { name: 'Sari', langInstruction: 'Jawab dalam Bahasa Indonesia. Respond in Bahasa Indonesia.', culture: 'You know Indonesian beauty culture — halal-certified cosmetics from Wardah, tropical humidity-proof formulas, natural ingredients like jamu, and the K-beauty influence in Southeast Asia.' },
      ng: { name: 'Adaeze', langInstruction: 'Respond in Nigerian Pidgin English.', culture: 'You understand West African beauty — melanin-rich skin care, shea butter traditions, bold lip colors, and brands like Zaron and House of Tara that celebrate deep skin tones.' },
      es: { name: 'Isabella', langInstruction: 'Responde en español. Respond in Spanish.', culture: 'You know Latin American beauty — telenovela glam, warm undertones, bold red lips, and the blend of indigenous and European beauty traditions across the region.' },
      ar: { name: 'Layla', langInstruction: 'أجب باللغة العربية. Respond in Arabic.', culture: 'You understand Middle Eastern beauty — dramatic smoky eyes, oud-infused luxury, gold highlighters, and the importance of long-lasting formulas in hot climates.' },
      fr: { name: 'Céline', langInstruction: 'Répondez en français. Respond in French.', culture: 'You embody French beauty philosophy — effortless chic, less-is-more approach, pharmacy skincare, red lip classics, and the art of looking put-together without trying too hard.' },
      bn: { name: 'Ananya', langInstruction: 'বাংলায় উত্তর দিন। Respond in Bengali.', culture: 'You understand South Asian beauty in Bangladesh — sindoor and alta traditions, monsoon-proof makeup, affordable beauty solutions, and the growing local cosmetics scene.' },
      sw: { name: 'Amara', langInstruction: 'Jibu kwa Kiswahili. Respond in Swahili.', culture: 'You know East African beauty — celebrating dark skin tones, natural shea and coconut oil traditions, vibrant Maasai-inspired colors, and the rising beauty scene in Kenya and Tanzania.' },
    };
    const p = PERSONAS[lang] || PERSONAS.en;
    const persona = p.name;

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
    const prompt = `You are ${persona}, a beauty expert. ${p.culture} The user scanned color ${hex} (R:${r} G:${g} B:${b}). Skin tone: ${skinTone || 'any'}. Occasion: ${occasion || 'everyday'}. Shopping region: ${countryContext}.${categoryNote}${profileContext} Give 3 sentences of warm, personalized beauty advice. ${p.langInstruction}`;

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
