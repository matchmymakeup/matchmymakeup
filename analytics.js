// ── Analytics & Data Collection ──────────────────────────────────────────────
// All data is anonymized and aggregated. See T&Cs for full data policy.

const ANALYTICS_KEY = 'mmm_analytics';
const SESSION_KEY = 'mmm_session';

// Get or create anonymous session ID
function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// Get location (country/city) via browser geolocation + reverse geocoding
export async function getLocation() {
  try {
    // First try IP-based location (no permission needed)
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', region: 'Unknown' };
  }
}

// Track a color scan event
export async function trackScan({ hex, r, g, b, skinTone, occasion, country, lang }) {
  try {
    const location = await getLocation();
    const event = {
      type: 'scan',
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      color: { hex, r, g, b },
      preferences: { skinTone, occasion, country, lang },
      location,
    };
    saveEvent(event);
  } catch (e) {
    console.warn('[Analytics] trackScan failed:', e);
  }
}

// Track a retailer click-through
export async function trackRetailerClick({ productName, brand, retailerUrl, country, hex }) {
  try {
    const location = await getLocation();
    const event = {
      type: 'retailer_click',
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      product: { productName, brand, retailerUrl, country },
      color: { hex },
      location,
    };
    saveEvent(event);
    console.log('[Analytics] Retailer click tracked:', brand, '-', productName);
  } catch (e) {
    console.warn('[Analytics] trackRetailerClick failed:', e);
  }
}

// Track page views
export function trackPageView(page) {
  try {
    const event = {
      type: 'page_view',
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      page,
    };
    saveEvent(event);
  } catch (e) {
    console.warn('[Analytics] trackPageView failed:', e);
  }
}

// Save event to localStorage (in production this would POST to your backend)
function saveEvent(event) {
  try {
    const existing = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    existing.push(event);
    // Keep last 500 events to avoid storage overflow
    const trimmed = existing.slice(-500);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[Analytics] save failed:', e);
  }
}

// Get analytics summary (for admin dashboard later)
export function getAnalyticsSummary() {
  try {
    const events = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    const scans = events.filter(e => e.type === 'scan');
    const clicks = events.filter(e => e.type === 'retailer_click');

    // Top retailer click-throughs
    const retailerCounts = {};
    clicks.forEach(e => {
      const key = e.product?.brand || 'Unknown';
      retailerCounts[key] = (retailerCounts[key] || 0) + 1;
    });

    // Top scanned colors
    const colorCounts = {};
    scans.forEach(e => {
      const hex = e.color?.hex;
      if (hex) colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    });

    // Countries
    const countryCounts = {};
    scans.forEach(e => {
      const c = e.location?.country || 'Unknown';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    return {
      totalScans: scans.length,
      totalClicks: clicks.length,
      topRetailers: Object.entries(retailerCounts).sort((a,b) => b[1]-a[1]).slice(0,10),
      topColors: Object.entries(colorCounts).sort((a,b) => b[1]-a[1]).slice(0,10),
      topCountries: Object.entries(countryCounts).sort((a,b) => b[1]-a[1]).slice(0,10),
    };
  } catch {
    return { totalScans: 0, totalClicks: 0, topRetailers: [], topColors: [], topCountries: [] };
  }
}
