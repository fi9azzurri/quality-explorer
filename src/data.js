/**
 * Normalized Database Layer — Movies / Countries / Qualities
 * ==========================================================
 * Relational schema with indexes for fast search, filter, and join.
 *
 * Tables:
 *   movies[]      — { id, title, titleJP, year, imdbScore, rottenScore, posterUrl }
 *   countries[]   — { id, countryCode, countryName, flagImageUrl }
 *   qualities[]   — { movieId, countryId, videoFormat, audioFormat }
 *
 * Indexes:
 *   titleIndex         — trigram → Set<movieId>   (fast substring search)
 *   videoFormatIndex   — videoFormat → Set<qualityIdx>
 *   audioFormatIndex   — audioFormat → Set<qualityIdx>
 *   movieQualityIndex  — movieId → qualityIdx[]   (fast join)
 *   countryQualityIndex— countryId → qualityIdx[] (fast join)
 */

import { COUNTRY_DATA, getFlagUrl } from './countries.js';

// ===== Normalized Tables =====
const db = {
  movies: [],
  countries: [],
  qualities: [],
};

// ===== Indexes =====
const idx = {
  movieById: new Map(),         // movieId → movie ref
  countryByCode: new Map(),     // countryCode → country ref
  titleTrigrams: new Map(),     // trigram → Set<movieId>
  titleWords: new Map(),        // word → Set<movieId>
  videoFormat: new Map(),       // videoFormat → Set<qualityIdx>
  audioFormat: new Map(),       // audioFormat → Set<qualityIdx>
  movieQualities: new Map(),    // movieId → qualityIdx[]
  countryQualities: new Map(),  // countryId → qualityIdx[]
};

let isLoaded = false;

// ===== Country Table Initialization =====
function initCountries() {
  let id = 1;
  for (const [code, data] of Object.entries(COUNTRY_DATA)) {
    const country = {
      id: id++,
      countryCode: code,
      countryName: data.name,
      flagImageUrl: getFlagUrl(code, 40),
    };
    db.countries.push(country);
    idx.countryByCode.set(code, country);
  }
}
initCountries();

// ===== Index Builders =====

/** Build trigram index for fast substring search */
function buildTrigramIndex(movieId, text) {
  const lower = text.toLowerCase();
  // Trigrams
  for (let i = 0; i <= lower.length - 3; i++) {
    const tri = lower.substring(i, i + 3);
    if (!idx.titleTrigrams.has(tri)) idx.titleTrigrams.set(tri, new Set());
    idx.titleTrigrams.get(tri).add(movieId);
  }
  // Word index
  const words = lower.split(/\s+/).filter(w => w.length >= 2);
  for (const word of words) {
    if (!idx.titleWords.has(word)) idx.titleWords.set(word, new Set());
    idx.titleWords.get(word).add(movieId);
  }
}

function addToSetIndex(map, key, value) {
  if (!key || key === '-') return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function addToArrayIndex(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

// ===== CSV Parser =====

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { result.push(current); current = ''; }
      else current += ch;
    }
  }
  result.push(current);
  return result;
}

function cleanValue(v) {
  if (!v) return '';
  return v.replace(/^"+|"+$/g, '').trim();
}

// ===== Load & Normalize =====

export async function loadMovies(csvUrl) {
  if (isLoaded) return db.movies;

  let csvText = '';
  if (csvUrl) {
    const resp = await fetch(csvUrl);
    csvText = await resp.text();
  } else {
    try {
      const resp = await fetch(`${import.meta.env.BASE_URL}data/movies.csv`);
      csvText = await resp.text();
    } catch (e) {
      console.warn('No CSV data found');
      isLoaded = true;
      return db.movies;
    }
  }

  const lines = csvText.split('\n').map(l => l.replace(/\r$/, ''));
  if (lines.length < 2) { isLoaded = true; return db.movies; }

  const headers = parseCSVLine(lines[0]);
  const colMap = {};
  headers.forEach((h, i) => { colMap[h.trim()] = i; });

  const countryCodes = Object.keys(COUNTRY_DATA);
  let movieId = 0;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCSVLine(lines[i]);

    const title = cleanValue(cols[colMap['Title']]);
    if (!title) continue;

    movieId++;

    // --- Movies Table ---
    const movie = {
      id: movieId,
      title,
      titleJP: cleanValue(cols[colMap['Title (Japanese)']]) || '',
      year: cleanValue(cols[colMap['Year']]) || '',
      imdbScore: cleanValue(cols[colMap['IMDB Score']]) || cleanValue(cols[colMap['IMDB']]) || '',
      rottenScore: cleanValue(cols[colMap['Rotten Tomato']]) || cleanValue(cols[colMap['Rotten']]) || '',
      posterUrl: null,
    };
    db.movies.push(movie);
    idx.movieById.set(movieId, movie);

    // Build title search indexes
    buildTrigramIndex(movieId, title);
    if (movie.titleJP) buildTrigramIndex(movieId, movie.titleJP);

    // --- Qualities Table ---
    for (const code of countryCodes) {
      const vIdx = colMap[`${code} Video`];
      const aIdx = colMap[`${code} Audio`];
      if (vIdx === undefined) continue;

      const video = cleanValue(cols[vIdx]) || '-';
      const audio = cleanValue(cols[aIdx]) || '-';
      if (video === '-' && audio === '-') continue;

      const country = idx.countryByCode.get(code);
      if (!country) continue;

      const qualityIdx = db.qualities.length;
      const quality = {
        movieId,
        countryId: country.id,
        videoFormat: video,
        audioFormat: audio,
      };
      db.qualities.push(quality);

      // Indexes
      addToSetIndex(idx.videoFormat, video, qualityIdx);
      addToSetIndex(idx.audioFormat, audio, qualityIdx);
      addToArrayIndex(idx.movieQualities, movieId, qualityIdx);
      addToArrayIndex(idx.countryQualities, country.id, qualityIdx);
    }
  }

  isLoaded = true;
  console.log(`DB loaded: ${db.movies.length} movies, ${db.countries.length} countries, ${db.qualities.length} quality records`);
  return db.movies;
}

// ===== Query Functions =====

/**
 * Search movies by title — uses trigram + word index for fast lookup
 */
export function searchMovies(query, _unused) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  // Score each movie
  const scores = new Map();

  function addScore(movieId, score) {
    scores.set(movieId, (scores.get(movieId) || 0) + score);
  }

  // Exact match boost
  for (const movie of db.movies) {
    const t = movie.title.toLowerCase();
    if (t === q) addScore(movie.id, 1000);
    else if (t.startsWith(q)) addScore(movie.id, 500);
  }

  // Trigram matching (fast substring)
  if (q.length >= 3) {
    const trigramSets = [];
    for (let i = 0; i <= q.length - 3; i++) {
      const tri = q.substring(i, i + 3);
      const set = idx.titleTrigrams.get(tri);
      if (set) trigramSets.push(set);
    }
    if (trigramSets.length > 0) {
      // Count how many trigrams matched per movie
      const counts = new Map();
      for (const set of trigramSets) {
        for (const mid of set) {
          counts.set(mid, (counts.get(mid) || 0) + 1);
        }
      }
      for (const [mid, cnt] of counts) {
        const ratio = cnt / trigramSets.length;
        if (ratio >= 0.5) addScore(mid, ratio * 200);
      }
    }
  }

  // Word matching
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  for (const word of words) {
    // Direct word match
    const set = idx.titleWords.get(word);
    if (set) {
      for (const mid of set) addScore(mid, 100);
    }
    // Partial word match via trigrams
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const tri = word.substring(i, i + 3);
        const triSet = idx.titleTrigrams.get(tri);
        if (triSet) {
          for (const mid of triSet) addScore(mid, 10);
        }
      }
    }
  }

  // Also check Japanese title contains
  for (const movie of db.movies) {
    if (movie.titleJP && movie.titleJP.includes(q)) addScore(movie.id, 300);
  }

  // Sort by score, return top 50
  const results = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([mid]) => idx.movieById.get(mid))
    .filter(Boolean);

  return results;
}

/**
 * Get quality records for a movie (JOIN movies ↔ qualities ↔ countries)
 */
export function getMovieQualities(movieId) {
  const qualityIdxs = idx.movieQualities.get(movieId) || [];
  return qualityIdxs.map(qi => {
    const q = db.qualities[qi];
    const country = db.countries.find(c => c.id === q.countryId);
    return {
      countryCode: country?.countryCode || '',
      countryName: country?.countryName || '',
      videoFormat: q.videoFormat,
      audioFormat: q.audioFormat,
    };
  });
}

/**
 * Get movie's countries as legacy format { code: { video, audio } }
 * (backward compatibility for quality.js analyzeQuality)
 */
export function getMovieCountriesMap(movieId) {
  const qualityIdxs = idx.movieQualities.get(movieId) || [];
  const map = {};
  for (const qi of qualityIdxs) {
    const q = db.qualities[qi];
    const country = db.countries.find(c => c.id === q.countryId);
    if (country) {
      map[country.countryCode] = { video: q.videoFormat, audio: q.audioFormat };
    }
  }
  return map;
}

/**
 * Filter movies by video format
 */
export function filterByVideoFormat(format) {
  const qualityIdxs = idx.videoFormat.get(format);
  if (!qualityIdxs) return [];
  const movieIds = new Set();
  for (const qi of qualityIdxs) movieIds.add(db.qualities[qi].movieId);
  return [...movieIds].map(id => idx.movieById.get(id)).filter(Boolean);
}

/**
 * Filter movies by audio format
 */
export function filterByAudioFormat(format) {
  const qualityIdxs = idx.audioFormat.get(format);
  if (!qualityIdxs) return [];
  const movieIds = new Set();
  for (const qi of qualityIdxs) movieIds.add(db.qualities[qi].movieId);
  return [...movieIds].map(id => idx.movieById.get(id)).filter(Boolean);
}

/**
 * Get all movies
 */
export function getMovies() {
  return db.movies;
}

/**
 * Get the database object (for analytics)
 */
export function getDB() {
  return db;
}

/**
 * Get indexes (for analytics)
 */
export function getIndexes() {
  return idx;
}
