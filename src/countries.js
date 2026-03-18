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



/** Get flag image URL from flagcdn */
export function getFlagUrl(code, size = 32) {
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

/** Get country name */
export function getCountryName(code) {
  return COUNTRY_DATA[code]?.name || code;
}

/**
 * Convert title to JustWatch slug format
 */
function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Get JustWatch URL for a movie in a specific country.
 */
export function getJustWatchUrl(code, title) {
  // Use 'uk' instead of 'gb' for JustWatch UK (though gb often redirects, uk is safer)
  const cc = code.toLowerCase() === 'gb' ? 'uk' : code.toLowerCase();
  return `https://www.justwatch.com/${cc}/movie/${slugify(title)}`;
}

/** Create a flag element with tooltip — opens JustWatch page on click */
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

  const justWatchUrl = title ? getJustWatchUrl(code, title) : null;

  if (clickable && justWatchUrl) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Direct navigation — no API call, no popup blocker, no confirmation
      window.open(justWatchUrl, '_blank');
    });
  }

  return item;
}

