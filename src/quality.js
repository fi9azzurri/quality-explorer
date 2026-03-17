/**
 * Quality analysis utilities
 */
import { getMovieCountriesMap } from './data.js';

const VIDEO_PRIORITY = {
  'Dolby Vision': 4,
  'HDR10+': 3,
  'HDR10': 3,
  'HDR': 3,
  'SDR': 1,
  '-': 0,
  '': 0,
};

const AUDIO_PRIORITY = {
  'Atmos': 3,
  'Dolby Atmos': 3,
  '5.1': 2,
  'Stereo': 1,
  '-': 0,
  '': 0,
};

/** Get numeric score for video quality */
export function videoScore(v) {
  return VIDEO_PRIORITY[v] ?? 0;
}

/** Get numeric score for audio quality */
export function audioScore(a) {
  return AUDIO_PRIORITY[a] ?? 0;
}

/** Combined quality score */
export function qualityScore(video, audio) {
  return videoScore(video) * 10 + audioScore(audio);
}

/** Get quality label string */
export function qualityLabel(video, audio) {
  if (!video || video === '-') return 'Not Available';
  const parts = [];
  if (video === 'Dolby Vision' || video === 'HDR10' || video === 'HDR10+' || video === 'HDR') {
    parts.push(`4K ${video}`);
  } else if (video === 'SDR') {
    parts.push('HD SDR');
  } else {
    parts.push(video);
  }
  if (audio && audio !== '-') {
    parts.push(audio === 'Atmos' ? 'Dolby Atmos' : audio);
  }
  return parts.join(' + ');
}

/** Analyze a movie's quality across all countries */
export function analyzeQuality(movie) {
  const groups = {};
  let bestScore = -1;
  let bestLabel = '';
  let atmosCount = 0;
  let dvCount = 0;
  let fourKCount = 0;

  // Use normalized data: getMovieCountriesMap returns { code: { video, audio } }
  const countriesMap = getMovieCountriesMap(movie.id);

  for (const [code, data] of Object.entries(countriesMap)) {
    if (!data.video || data.video === '-') continue;

    const label = qualityLabel(data.video, data.audio);
    const score = qualityScore(data.video, data.audio);

    if (!groups[label]) {
      groups[label] = { label, score, countries: [] };
    }
    groups[label].countries.push(code);

    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
    }

    if (data.audio === 'Atmos' || data.audio === 'Dolby Atmos') atmosCount++;
    if (data.video === 'Dolby Vision') dvCount++;
    if (data.video !== 'SDR' && data.video !== '-') fourKCount++;
  }

  const sortedGroups = Object.values(groups).sort((a, b) => b.score - a.score);

  return {
    bestLabel,
    bestScore,
    bestCountries: groups[bestLabel]?.countries || [],
    groups: sortedGroups,
    atmosCount,
    dvCount,
    fourKCount,
  };
}

/** Get quality color */
export function qualityColor(video) {
  if (video === 'Dolby Vision') return 'var(--quality-dv)';
  if (video === 'HDR10' || video === 'HDR10+' || video === 'HDR') return 'var(--quality-hdr)';
  if (video === 'SDR') return 'var(--quality-sdr)';
  return 'var(--text-muted)';
}
