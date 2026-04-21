/**
 * MatchMyMakeup™ — AI Beauty Intelligence Platform
 * © 2026 Craig Pretorius trading as MatchMyMakeup. All rights reserved.
 * ABN 64 378 129 621 · Trademark TM #2640607
 * Unauthorised copying, reverse engineering, or distribution is prohibited.
 */

const rateLimitMap = new Map();
function checkRateLimit(ip, limit = 30) {
  const now = Date.now();
  const windowMs = 60000;
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  const entry = rateLimitMap.get(ip);
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

const ALLOWED_ORIGINS = ['https://matchmymakeup.ai', 'https://www.matchmymakeup.ai', 'http://localhost:5173', 'http://localhost:3000'];
const VALID_LANGS = ['en','hi','pt','zh','id','ng','es','ar','fr','bn','sw','tl','af','zu','en-za'];
const VALID_COUNTRIES = ['','USA','Australia','India','Brazil','Indonesia','Nigeria','China','Philippines','South Africa'];
const VALID_CATEGORIES = ['','lipstick','foundation','blush','eyeshadow','nail_polish','mascara','highlighter','lip_liner','eyeliner','hair_colour','concealer','tinted_sunscreen','mineral_powder'];

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : 'https://matchmymakeup.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!checkRateLimit(ip, 30)) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }

  try {
    const { skinTone, occasion, country, category, profile, lang } = req.body;

    // Input validation
    const hex = (req.body.hex || '').replace(/[^#0-9a-fA-F]/g, '').slice(0, 7);
    if (hex && !/^#?[0-9A-Fa-f]{6}$/.test(hex)) return res.status(400).json({ error: 'Invalid input' });
    const r = Math.max(0, Math.min(255, parseInt(req.body.r) || 0));
    const g = Math.max(0, Math.min(255, parseInt(req.body.g) || 0));
    const b = Math.max(0, Math.min(255, parseInt(req.body.b) || 0));
    if (lang && !VALID_LANGS.includes(lang)) return res.status(400).json({ error: 'Invalid input' });
    if (country && !VALID_COUNTRIES.includes(country)) return res.status(400).json({ error: 'Invalid input' });
    if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid input' });

    const PERSONAS = {
      en: { name: 'Maya', lang: 'You must respond entirely in English.', culture: 'You draw on global beauty trends and are inclusive of all backgrounds.' },
      zh: { name: 'Mei', lang: 'You must respond entirely in Mandarin Chinese (简体中文). Do not use any English.', culture: 'You understand Chinese beauty ideals — glass skin, C-beauty innovation from Perfect Diary (完美日记) and Florasis (花西子), traditional herbal ingredients, and the preference for natural, luminous finishes. You reference Xiaohongshu (小红书) and Douyin for beauty trends, and Taobao/Tmall for shopping. Never mention Instagram or Sephora — those are not relevant to Chinese consumers.' },
      hi: { name: 'Priya', lang: 'You must respond entirely in Hindi (हिन्दी). Do not use any English.', culture: 'You understand Indian beauty traditions — turmeric skincare, kajal, Ayurvedic ingredients, festive bridal looks, and the diversity of Indian skin tones from Kashmir to Kerala.' },
      id: { name: 'Sari', lang: 'You must respond entirely in Bahasa Indonesia. Do not use any English.', culture: 'You know Indonesian beauty culture — halal-certified cosmetics from Wardah, tropical humidity-proof formulas, natural ingredients like jamu, and the K-beauty influence in Southeast Asia.' },
      pt: { name: 'Valentina', lang: 'You must respond entirely in Portuguese (Português). Do not use any English.', culture: 'You know Brazilian beauty culture — beachy glow, bold carnival colors, Natura and O Boticário heritage, and the importance of sun protection in tropical climates.' },
      ng: { name: 'Adaeze', lang: 'You must respond entirely in Nigerian Pidgin English.', culture: 'You understand West African beauty — melanin-rich skin care, shea butter traditions, bold lip colors, and brands like Zaron and House of Tara that celebrate deep skin tones.' },
      fr: { name: 'Céline', lang: 'You must respond entirely in French (Français). Do not use any English.', culture: 'You embody French beauty philosophy — effortless chic, less-is-more approach, pharmacy skincare, red lip classics, and the art of looking put-together without trying too hard.' },
      es: { name: 'Isabella', lang: 'You must respond entirely in Spanish (Español). Do not use any English.', culture: 'You know Latin American beauty — telenovela glam, warm undertones, bold red lips, and the blend of indigenous and European beauty traditions across the region.' },
      ar: { name: 'Layla', lang: 'You must respond entirely in Arabic (العربية). Do not use any English.', culture: 'You understand Middle Eastern beauty — dramatic smoky eyes, oud-infused luxury, gold highlighters, and the importance of long-lasting formulas in hot climates.' },
      bn: { name: 'Ananya', lang: 'You must respond entirely in Bengali (বাংলা). Do not use any English.', culture: 'You understand South Asian beauty in Bangladesh — sindoor and alta traditions, monsoon-proof makeup, affordable beauty solutions, and the growing local cosmetics scene.' },
      sw: { name: 'Amara', lang: 'You must respond entirely in Swahili (Kiswahili). Do not use any English.', culture: 'You know East African beauty — celebrating dark skin tones, natural shea and coconut oil traditions, vibrant Maasai-inspired colors, and the rising beauty scene in Kenya and Tanzania.' },
      tl: { name: 'Gabriela', lang: 'You must respond entirely in Filipino (Tagalog). Do not use any English.', culture: 'You are Gabriela, a Filipino beauty consultant. You celebrate morena skin tones and Filipino beauty traditions. Reference local brands like BLK Cosmetics, Happy Skin, and Colourette. Mention Shopee and Lazada for shopping. Reference TikTok and Instagram as primary beauty platforms. Celebrate the Filipino concept of natural glow and mestiza beauty diversity.' },
      'en-za': { name: 'Maya', lang: 'You must respond entirely in English.', culture: 'You understand South African beauty culture — the diversity of skin tones from the Cape to KwaZulu-Natal, local retailers like Clicks, Dischem, and Woolworths Beauty. You reference brands available in SA like Sorbet, and understand the importance of SPF in the Southern Hemisphere climate.' },
      af: { name: 'Liezel', lang: 'Jy moet uitsluitlik in Afrikaans antwoord. Moenie Engels gebruik nie.', culture: 'Jy is Liezel, \'n Afrikaanse skoonheidskonsultant. Jy vier Suid-Afrikaanse skoonheid en verwys na plaaslike handelsmerke soos Sorbet, Clicks, en Dischem. Verwys na die Suid-Afrikaanse klimaat en uiteenlopende velstone van die Kaap.' },
      zu: { name: 'Nomvula', lang: 'Kufanele uphendule ngesiZulu kuphela. Ungasebenzisi isiNgisi.', culture: 'UnguNomvula, umeluleki wezobuhle baseNingizimu Afrika. Ugubha ubuhle besikhumba esimnyama nesiZulu. Ukhomba izimpahla ezifana ne-Clicks, Dischem, kanye nezimpahla zomhlaba wonke ezikhona eNingizimu Afrika. Ugubha ubuhle babantu baseAfrika.' },
    };
    const p = PERSONAS[lang] || PERSONAS.en;
    const persona = p.name;

    // [FIX 6] Global regex so all underscores are replaced
    const categoryNote = category ? ` Focus on ${category.replace(/_/g, ' ')} products.` : '';

    let profileContext = '';
    if (profile) {
      const parts = [];
      if (profile.ageRange) parts.push(`Age range: ${profile.ageRange}`);
      if (profile.skinTone) parts.push(`Skin tone: ${profile.skinTone}`);
      // [FIX 5] Array.isArray guards — req.body is a system boundary
      if (Array.isArray(profile.ethnicity) && profile.ethnicity.length) parts.push(`Heritage: ${profile.ethnicity.join(', ')}`);
      if (Array.isArray(profile.skinConcerns) && profile.skinConcerns.length) parts.push(`Skin concerns: ${profile.skinConcerns.join(', ')}`);
      if (Array.isArray(profile.beautyGoals) && profile.beautyGoals.length) parts.push(`Beauty goals: ${profile.beautyGoals.join(', ')}`);
      if (profile.budget) parts.push(`Budget: ${profile.budget}`);
      if (profile.climate) parts.push(`Climate: ${profile.climate}`);
      if (parts.length > 0) profileContext = ` User beauty profile: ${parts.join('. ')}.`;
    }

    const countryContext = country || 'global';
    const systemPrompt = `${p.lang} You are ${persona}, a beauty expert. ${p.culture}`;
    const userPrompt = `The user scanned color ${hex} (R:${r} G:${g} B:${b}). Skin tone: ${skinTone || 'any'}. Occasion: ${occasion || 'everyday'}. Shopping region: ${countryContext}.${categoryNote}${profileContext} Give exactly 2 sentences of warm, confident, editorial beauty advice. Be concise and luxurious — like a Vogue beauty editor, not a blog post. Maximum 50 words total.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01', // [FIX 7] Dated — review for newer version when updating SDK
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    // [FIX 3] Handle non-JSON error bodies without throwing
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errData.error?.message || `Anthropic API error (${response.status})` });
    }

    const data = await response.json();

    // [FIX 4] Defensive check — empty or unexpected response shape
    const advice = data.content?.[0]?.text;
    if (!advice) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({ advice });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
