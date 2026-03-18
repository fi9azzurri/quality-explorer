/**
 * TMDb API — Fetch movie posters
 */

const TMDB_API_KEY = 'bda8d46b3b1b9c717d1d3448901c2a93';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

// Cache posters in localStorage (versioned to allow auto-invalidation)
const CACHE_KEY = 'tmdb_poster_cache';
const CACHE_VERSION_KEY = 'tmdb_poster_cache_v';
const CACHE_VERSION = 4; // Bump this to invalidate all cached posters
const posterCache = loadCache();

// Manual overrides for difficult or contentious posters
const POSTER_OVERRIDES = {
  'Heat_1995': '/EJFkJD9BH400jfzKz3W5xLYHQa.jpg',
};

function loadCache() {
  try {
    const ver = parseInt(localStorage.getItem(CACHE_VERSION_KEY) || '0');
    if (ver < CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, String(CACHE_VERSION));
      return {};
    }
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch { return {}; }
}

function saveCache() {
  try {
    // Limit cache size
    const keys = Object.keys(posterCache);
    if (keys.length > 3000) {
      const toRemove = keys.slice(0, keys.length - 2000);
      toRemove.forEach(k => delete posterCache[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(posterCache));
  } catch { /* localStorage full */ }
}

/** Find best poster from TMDB results, preferring exact title match */
function pickBestPoster(results, title) {
  if (!results || results.length === 0) return null;
  const titleLower = title.toLowerCase();
  const exactMatch = results.find(r =>
    (r.title || r.name || '').toLowerCase() === titleLower
  );
  return (exactMatch || results[0]).poster_path || null;
}

/**
 * Get poster URL for a movie (falls back to TV search)
 * @returns {string|null} poster URL or null
 */
export async function getPoster(title, year, size = 'w342') {
  const cacheKey = `${title}_${year}`;
  
  if (POSTER_OVERRIDES[cacheKey]) {
    return `${TMDB_IMG}/${size}${POSTER_OVERRIDES[cacheKey]}`;
  }

  if (posterCache[cacheKey] !== undefined) {
    return posterCache[cacheKey] ? `${TMDB_IMG}/${size}${posterCache[cacheKey]}` : null;
  }

  try {
    // 1) Search movies
    const movieParams = new URLSearchParams({
      api_key: TMDB_API_KEY, query: title, language: 'en-US',
    });
    if (year) movieParams.set('year', year);

    const movieResp = await fetch(`${TMDB_BASE}/search/movie?${movieParams}`);
    const movieData = await movieResp.json();
    let posterPath = pickBestPoster(movieData.results, title);

    // 2) If no exact match in movies, also try TV search
    if (!posterPath || (movieData.results && !movieData.results.find(r => r.title && r.title.toLowerCase() === title.toLowerCase()))) {
      const tvParams = new URLSearchParams({
        api_key: TMDB_API_KEY, query: title, language: 'en-US',
      });
      const tvResp = await fetch(`${TMDB_BASE}/search/tv?${tvParams}`);
      const tvData = await tvResp.json();
      const tvPoster = pickBestPoster(tvData.results, title);
      // Prefer TV exact match over movie non-exact match
      if (tvPoster && tvData.results && tvData.results.find(r => (r.name || '').toLowerCase() === title.toLowerCase())) {
        posterPath = tvPoster;
      } else if (!posterPath) {
        posterPath = tvPoster;
      }
    }

    posterCache[cacheKey] = posterPath || null;
    saveCache();
    return posterPath ? `${TMDB_IMG}/${size}${posterPath}` : null;
  } catch (e) {
    console.warn(`TMDb error for "${title}":`, e);
    return null;
  }
}

/**
 * Batch-load posters for visible movies with rate limiting
 */
export async function loadPostersForMovies(movies, onUpdate) {
  const BATCH_SIZE = 5;
  const DELAY = 250;

  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const batch = movies.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (m) => {
      if (!m.poster) {
        m.poster = await getPoster(m.title, m.year);
      }
    }));
    if (onUpdate) onUpdate();
    if (i + BATCH_SIZE < movies.length) {
      await new Promise(r => setTimeout(r, DELAY));
    }
  }
}
