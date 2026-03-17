/**
 * Country utilities — flag images, names, Apple TV store URLs
 */

export const COUNTRY_DATA = {
  US: { name: 'United States', emoji: '🇺🇸' },
  CA: { name: 'Canada', emoji: '🇨🇦' },
  MX: { name: 'Mexico', emoji: '🇲🇽' },
  JP: { name: 'Japan', emoji: '🇯🇵' },
  KR: { name: 'South Korea', emoji: '🇰🇷' },
  HK: { name: 'Hong Kong', emoji: '🇭🇰' },
  TW: { name: 'Taiwan', emoji: '🇹🇼' },
  SG: { name: 'Singapore', emoji: '🇸🇬' },
  TH: { name: 'Thailand', emoji: '🇹🇭' },
  MY: { name: 'Malaysia', emoji: '🇲🇾' },
  PH: { name: 'Philippines', emoji: '🇵🇭' },
  ID: { name: 'Indonesia', emoji: '🇮🇩' },
  IN: { name: 'India', emoji: '🇮🇳' },
  GB: { name: 'United Kingdom', emoji: '🇬🇧' },
  DE: { name: 'Germany', emoji: '🇩🇪' },
  FR: { name: 'France', emoji: '🇫🇷' },
  IT: { name: 'Italy', emoji: '🇮🇹' },
  ES: { name: 'Spain', emoji: '🇪🇸' },
  PT: { name: 'Portugal', emoji: '🇵🇹' },
  NL: { name: 'Netherlands', emoji: '🇳🇱' },
  BE: { name: 'Belgium', emoji: '🇧🇪' },
  IE: { name: 'Ireland', emoji: '🇮🇪' },
  AT: { name: 'Austria', emoji: '🇦🇹' },
  CH: { name: 'Switzerland', emoji: '🇨🇭' },
  SE: { name: 'Sweden', emoji: '🇸🇪' },
  DK: { name: 'Denmark', emoji: '🇩🇰' },
  NO: { name: 'Norway', emoji: '🇳🇴' },
  FI: { name: 'Finland', emoji: '🇫🇮' },
  PL: { name: 'Poland', emoji: '🇵🇱' },
  CZ: { name: 'Czech Republic', emoji: '🇨🇿' },
  HU: { name: 'Hungary', emoji: '🇭🇺' },
  RO: { name: 'Romania', emoji: '🇷🇴' },
  AU: { name: 'Australia', emoji: '🇦🇺' },
  NZ: { name: 'New Zealand', emoji: '🇳🇿' },
  BR: { name: 'Brazil', emoji: '🇧🇷' },
  AR: { name: 'Argentina', emoji: '🇦🇷' },
  CL: { name: 'Chile', emoji: '🇨🇱' },
  CO: { name: 'Colombia', emoji: '🇨🇴' },
  TR: { name: 'Turkey', emoji: '🇹🇷' },
  AE: { name: 'UAE', emoji: '🇦🇪' },
  SA: { name: 'Saudi Arabia', emoji: '🇸🇦' },
  IL: { name: 'Israel', emoji: '🇮🇱' },
  ZA: { name: 'South Africa', emoji: '🇿🇦' },
};

/**
 * CheapCharts country code mapping.
 * Only countries supported by CheapCharts are clickable.
 * Source: cheapcharts.info available country pages
 */
const CHEAPCHARTS_COUNTRIES = {
  US: 'us', CA: 'ca', MX: 'mx',
  GB: 'gb', DE: 'de', FR: 'fr', IT: 'it', ES: 'es', PT: 'pt',
  NL: 'nl', BE: 'be', IE: 'ie', AT: 'at', CH: 'ch',
  SE: 'se', DK: 'dk', NO: 'no', FI: 'fi',
  PL: 'pl', CZ: 'cz', HU: 'hu', RO: 'ro',
  AU: 'au', NZ: 'nz', BR: 'br', AR: 'ar', CL: 'cl', CO: 'co',
  IN: 'in', JP: 'jp', KR: 'kr',
  TR: 'tr', ZA: 'za', IL: 'il',
  SG: 'sg', TH: 'th', MY: 'my', PH: 'ph', ID: 'id',
  HK: 'hk', TW: 'tw',
  AE: 'ae', SA: 'sa',
};

/** Get flag image URL from flagcdn */
export function getFlagUrl(code, size = 32) {
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

/** Get country name */
export function getCountryName(code) {
  return COUNTRY_DATA[code]?.name || code;
}

/** Check if a country is supported by CheapCharts */
export function hasCheapCharts(code) {
  return code in CHEAPCHARTS_COUNTRIES;
}

/**
 * Get CheapCharts search URL for a movie in a specific country.
 * Returns URL string or null if country not supported.
 */
export function getCheapChartsUrl(code, title) {
  const cc = CHEAPCHARTS_COUNTRIES[code];
  if (!cc) return null;
  return `https://www.cheapcharts.info/${cc}/search?q=${encodeURIComponent(title)}`;
}

/** Create a flag element with tooltip — opens CheapCharts page on click */
export function createFlagElement(code, clickable = true, title = '') {
  const item = document.createElement('div');
  item.className = 'flag-item';

  const img = document.createElement('img');
  img.className = 'flag-img';
  img.src = getFlagUrl(code, 40);
  img.alt = getCountryName(code);
  img.loading = 'lazy';
  item.appendChild(img);

  const tooltip = document.createElement('div');
  tooltip.className = 'flag-tooltip';
  tooltip.textContent = getCountryName(code);
  item.appendChild(tooltip);

  const cheapChartsUrl = title ? getCheapChartsUrl(code, title) : null;

  if (clickable && cheapChartsUrl) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Direct navigation — no API call, no popup blocker, no confirmation
      window.open(cheapChartsUrl, '_blank');
    });
  }

  return item;
}

