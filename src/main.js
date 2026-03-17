/**
 * Apple TV Quality Explorer — Main Application
 */

import './style.css';
import { loadMovies, searchMovies, getMovies, getMovieCountriesMap } from './data.js';
import { getPoster, loadPostersForMovies } from './tmdb.js';
import { analyzeQuality, qualityLabel, qualityColor } from './quality.js';
import { COUNTRY_DATA, getFlagUrl, getCountryName, createFlagElement } from './countries.js';

// ===== State =====
let movies = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

// ===== Router =====
function getRoute() {
  const hash = window.location.hash || '#/';
  const parts = hash.slice(2).split('/');
  return { page: parts[0] || 'home', param: parts[1] || '' };
}

function navigate(path) {
  window.location.hash = '#/' + path;
}

// ===== Render Engine =====
const content = () => document.getElementById('page-content');

function updateNav() {
  const route = getRoute();
  document.querySelectorAll('.nav-link').forEach(link => {
    const page = link.dataset.page;
    link.classList.toggle('active', page === route.page || (route.page === 'search' && page === 'home'));
  });
}

async function render() {
  const route = getRoute();
  updateNav();

  const el = content();
  el.innerHTML = '';
  el.className = 'page-enter';

  switch (route.page) {
    case 'home': renderHome(el); break;
    case 'search': renderSearch(el, route.param); break;
    case 'movie': renderMovie(el, route.param); break;
    case 'discover': renderDiscover(el); break;
    case 'analytics': renderAnalytics(el); break;
    case 'watchlist': renderWatchlist(el); break;
    default: renderHome(el);
  }
}

// ===== Poster Card Component =====
function createPosterCard(movie) {
  const analysis = analyzeQuality(movie);
  const card = document.createElement('a');
  card.className = 'poster-card';
  card.href = `#/movie/${movie.id}`;

  const imgWrap = document.createElement('div');
  imgWrap.className = 'poster-image-wrap';

  if (movie.poster) {
    const img = document.createElement('img');
    img.className = 'poster-image';
    img.src = movie.poster;
    img.alt = movie.title;
    img.loading = 'lazy';
    imgWrap.appendChild(img);
  } else {
    const noImg = document.createElement('div');
    noImg.className = 'poster-no-image';
    noImg.textContent = '🎬';
    imgWrap.appendChild(noImg);
    // Async load poster
    getPoster(movie.title, movie.year).then(url => {
      if (url) {
        movie.poster = url;
        const img = document.createElement('img');
        img.className = 'poster-image';
        img.src = url;
        img.alt = movie.title;
        imgWrap.innerHTML = '';
        imgWrap.appendChild(img);
      }
    });
  }

  // Badges
  const badges = document.createElement('div');
  badges.className = 'poster-badges';
  if (analysis.dvCount > 0) badges.innerHTML += '<span class="badge badge-dv">DV</span>';
  if (analysis.atmosCount > 0) badges.innerHTML += '<span class="badge badge-atmos">Atmos</span>';
  else if (analysis.fourKCount > 0) badges.innerHTML += '<span class="badge badge-4k">4K</span>';

  imgWrap.appendChild(badges);

  card.appendChild(imgWrap);

  const info = document.createElement('div');
  info.className = 'poster-info';
  info.innerHTML = `
    <div class="poster-title">${escapeHtml(movie.title)}</div>
    <div class="poster-meta">
      <span>${movie.year || '-'}</span>
      ${movie.imdbScore ? `<span class="imdb">⭐ ${movie.imdbScore}</span>` : ''}
      ${analysis.atmosCount > 0 ? `<span class="atmos-count">🔊 ${analysis.atmosCount}</span>` : ''}
    </div>
  `;
  card.appendChild(info);

  return card;
}

// ===== Pages =====

function renderHome(el) {
  el.innerHTML = `
    <div class="hero-section">
      <h1 class="hero-title">Apple TV Quality Explorer</h1>
      <p class="hero-subtitle">Compare 4K, Dolby Vision & Atmos quality across 40+ countries</p>
    </div>
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" id="home-search" placeholder="Search movies... (e.g. Dune, Matrix, Interstellar)" autocomplete="off" />
    </div>
    <section id="trending-section">
      <h2 class="section-title"><span class="emoji">🔥</span> Trending Movies</h2>
      <div class="carousel-wrapper"><div class="carousel-track" id="trending-carousel"></div></div>
    </section>
    <section id="dv-atmos-section" style="margin-top:40px">
      <h2 class="section-title"><span class="emoji">🏆</span> Dolby Vision + Atmos Collection</h2>
      <div class="poster-grid" id="dv-atmos-grid"></div>
    </section>
  `;

  // Search handler
  const searchInput = document.getElementById('home-search');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) {
        navigate(`search/${encodeURIComponent(q)}`);
        // After navigation, focus the search input on the new page
        requestAnimationFrame(() => {
          const newInput = document.getElementById('search-input');
          if (newInput) { newInput.focus(); newInput.selectionStart = newInput.selectionEnd = newInput.value.length; }
        });
      }
    }
  });

  // Trending: top IMDB rated with 4K DV
  const trending = movies
    .filter(m => {
      const a = analyzeQuality(m);
      return a.dvCount > 0 && m.imdbScore;
    })
    .sort((a, b) => parseFloat(b.imdbScore || 0) - parseFloat(a.imdbScore || 0))
    .slice(0, 20);

  const carousel = document.getElementById('trending-carousel');
  trending.forEach(m => carousel.appendChild(createPosterCard(m)));

  // DV + Atmos
  const dvAtmos = movies
    .filter(m => {
      const a = analyzeQuality(m);
      return a.dvCount > 0 && a.atmosCount > 0;
    })
    .sort((a, b) => parseFloat(b.imdbScore || 0) - parseFloat(a.imdbScore || 0))
    .slice(0, 24);

  const grid = document.getElementById('dv-atmos-grid');
  dvAtmos.forEach(m => grid.appendChild(createPosterCard(m)));
}

function renderSearch(el, query) {
  const q = decodeURIComponent(query);
  const results = searchMovies(q, movies);

  el.innerHTML = `
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" id="search-input" value="${escapeHtml(q)}" placeholder="Search movies..." autocomplete="off" />
    </div>
    <h2 class="section-title" id="search-count">${results.length} results for "${escapeHtml(q)}"</h2>
    <div class="poster-grid" id="search-grid"></div>
  `;

  const searchInput = document.getElementById('search-input');
  let debounce;

  // Update results WITHOUT re-rendering the whole page (fixes cursor jump)
  function updateResults() {
    const nq = searchInput.value.trim();
    if (nq.length < 2) return;
    const newResults = searchMovies(nq, movies);

    // Update URL hash silently (without triggering hashchange)
    const newHash = `#/search/${encodeURIComponent(nq)}`;
    history.replaceState(null, '', newHash);

    // Update results count
    const countEl = document.getElementById('search-count');
    if (countEl) countEl.textContent = `${newResults.length} results for "${nq}"`;

    // Update grid only
    const grid = document.getElementById('search-grid');
    if (grid) {
      grid.innerHTML = '';
      newResults.forEach(m => grid.appendChild(createPosterCard(m)));
    }
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(updateResults, 400);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounce);
      updateResults();
    }
  });

  // Focus input and place cursor at end
  requestAnimationFrame(() => {
    searchInput.focus();
    searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length;
  });

  const grid = document.getElementById('search-grid');
  results.forEach(m => grid.appendChild(createPosterCard(m)));
}

function renderMovie(el, id) {
  const movie = movies.find(m => m.id === parseInt(id));
  if (!movie) {
    el.innerHTML = '<p>Movie not found</p>';
    return;
  }

  const analysis = analyzeQuality(movie);
  const isWatchlisted = watchlist.includes(movie.id);

  el.innerHTML = `
    <div class="back-btn" id="back-btn">← Back</div>
    <div class="movie-detail">
      <div class="movie-hero">
        <div class="movie-hero-poster" id="hero-poster">
          <div class="poster-no-image" style="aspect-ratio:2/3;font-size:4rem">🎬</div>
        </div>
        <div class="movie-hero-info">
          <h1 class="movie-title-main">${escapeHtml(movie.title)}</h1>
          ${movie.titleJP ? `<p style="color:var(--text-secondary);font-size:0.95rem">${escapeHtml(movie.titleJP)}</p>` : ''}
          <div class="movie-scores">
            <div class="score-pill"><span class="label">Year</span> ${movie.year || '-'}</div>
            ${movie.imdbScore ? `<div class="score-pill"><span class="label">IMDB</span> ⭐ ${movie.imdbScore}</div>` : ''}
            ${movie.rottenScore ? `<div class="score-pill"><span class="label">Rotten</span> 🍅 ${movie.rottenScore}%</div>` : ''}
            <div class="score-pill"><span class="label">Atmos</span> 🔊 ${analysis.atmosCount} countries</div>
            <div class="score-pill"><span class="label">DV</span> ${analysis.dvCount} countries</div>
          </div>
          <div class="movie-actions">
            <button class="btn ${isWatchlisted ? 'btn-active' : 'btn-primary'}" id="watchlist-btn">
              ${isWatchlisted ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>

      ${analysis.bestLabel ? `
      <div class="best-quality-banner">
        <div class="best-quality-label">Best Quality Available</div>
        <div class="best-quality-value">${analysis.bestLabel}</div>
        <div class="flag-row" id="best-flags"></div>
      </div>
      ` : ''}

      <h2 class="section-title" style="margin-top:32px"><span class="emoji">🌍</span> Quality by Country</h2>
      <div id="quality-groups"></div>
    </div>
  `;

  // Back button
  document.getElementById('back-btn').onclick = () => history.back();

  // Poster
  getPoster(movie.title, movie.year, 'w500').then(url => {
    const wrap = document.getElementById('hero-poster');
    if (url) {
      wrap.innerHTML = `<img src="${url}" alt="${escapeHtml(movie.title)}" style="width:100%;aspect-ratio:2/3;object-fit:cover" />`;
    }
  });

  // Best quality flags
  if (analysis.bestCountries.length > 0) {
    const flagRow = document.getElementById('best-flags');
    analysis.bestCountries.forEach(code => {
      flagRow.appendChild(createFlagElement(code, true, movie.title));
    });
  }

  // Quality groups
  const groupsEl = document.getElementById('quality-groups');
  analysis.groups.forEach(group => {
    const g = document.createElement('div');
    g.className = 'quality-group';
    g.innerHTML = `<div class="quality-group-label">${group.label} <span style="color:var(--text-muted);font-size:0.8rem">(${group.countries.length} countries)</span></div>`;
    const flagRow = document.createElement('div');
    flagRow.className = 'flag-row';
    group.countries.forEach(code => {
      flagRow.appendChild(createFlagElement(code, true, movie.title));
    });
    g.appendChild(flagRow);
    groupsEl.appendChild(g);
  });

  // Watchlist button
  document.getElementById('watchlist-btn').onclick = () => {
    toggleWatchlist(movie.id);
    renderMovie(el, id);
  };
}

function renderDiscover(el) {
  el.innerHTML = `
    <h1 class="section-title" style="font-size:1.8rem;margin-bottom:24px"><span class="emoji">🔎</span> Discover</h1>
    <div class="filter-chips" id="filter-chips">
      <button class="chip active" data-filter="dv-atmos">Dolby Vision + Atmos</button>
      <button class="chip" data-filter="dv">Dolby Vision</button>
      <button class="chip" data-filter="atmos">Atmos</button>
      <button class="chip" data-filter="4k">4K</button>
      <button class="chip" data-filter="jp-hd-abroad-4k">🇯🇵 HD / 🌍 4K</button>
      <button class="chip" data-filter="major-hd-other-4k">🇯🇵🇺🇸🇬🇧 非4K / 他国 4K</button>
      <button class="chip" data-filter="all">All Movies</button>
    </div>
    <div class="sort-bar">
      <label class="sort-label">Sort by</label>
      <select class="sort-select" id="sort-select">
        <option value="imdb-desc">⭐ IMDB ↓</option>
        <option value="imdb-asc">⭐ IMDB ↑</option>
        <option value="rotten-desc">🍅 Rotten ↓</option>
        <option value="rotten-asc">🍅 Rotten ↑</option>
        <option value="year-desc">📅 Year ↓ (New→Old)</option>
        <option value="year-asc">📅 Year ↑ (Old→New)</option>
        <option value="title-asc">🔤 Title A→Z</option>
        <option value="title-desc">🔤 Title Z→A</option>
      </select>
      <span class="sort-count" id="sort-count"></span>
    </div>
    <div class="poster-grid" id="discover-grid"></div>
  `;

  let currentFilter = 'dv-atmos';
  let currentSort = 'imdb-desc';

  function sortMovies(list, sortKey) {
    const sorted = [...list];
    switch (sortKey) {
      case 'imdb-desc':  return sorted.sort((a, b) => parseFloat(b.imdbScore || 0) - parseFloat(a.imdbScore || 0));
      case 'imdb-asc':   return sorted.sort((a, b) => parseFloat(a.imdbScore || 0) - parseFloat(b.imdbScore || 0));
      case 'rotten-desc': return sorted.sort((a, b) => parseFloat(b.rottenScore || 0) - parseFloat(a.rottenScore || 0));
      case 'rotten-asc':  return sorted.sort((a, b) => parseFloat(a.rottenScore || 0) - parseFloat(b.rottenScore || 0));
      case 'year-desc':  return sorted.sort((a, b) => parseInt(b.year || 0) - parseInt(a.year || 0));
      case 'year-asc':   return sorted.sort((a, b) => parseInt(a.year || 0) - parseInt(b.year || 0));
      case 'title-asc':  return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc': return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      default: return sorted;
    }
  }

  // Cache filtered results so sort changes don't re-filter
  let filteredCache = [];

  function applyFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === filter));

    filteredCache = movies.filter(m => {
      const a = analyzeQuality(m);
      switch (filter) {
        case 'dv-atmos': return a.dvCount > 0 && a.atmosCount > 0;
        case 'dv': return a.dvCount > 0;
        case 'atmos': return a.atmosCount > 0;
        case '4k': return a.fourKCount > 0;
        case 'jp-hd-abroad-4k':
          const cmap = getMovieCountriesMap(m.id);
          const jpData = cmap['JP'];
          if (jpData && jpData.video && jpData.video !== 'SDR' && jpData.video !== '-') {
            return false;
          }
          for (const [code, data] of Object.entries(cmap)) {
            if (code !== 'JP' && data.video && data.video !== 'SDR' && data.video !== '-') {
              return true;
            }
          }
          return false;
        case 'major-hd-other-4k': {
          const cm = getMovieCountriesMap(m.id);
          const is4K = (v) => v && v !== 'SDR' && v !== '-';
          // JP, US, UK がいずれも 4K でないこと
          if (is4K(cm['JP']?.video) || is4K(cm['US']?.video) || is4K(cm['GB']?.video)) return false;
          // 他の国で 4K があるか
          for (const [code, d] of Object.entries(cm)) {
            if (code !== 'JP' && code !== 'US' && code !== 'GB' && is4K(d.video)) return true;
          }
          return false;
        }
        case 'all': return true;
        default: return true;
      }
    });

    applySort(currentSort);
  }

  function applySort(sortKey) {
    currentSort = sortKey;
    const sorted = sortMovies(filteredCache, sortKey).slice(0, 1500);

    // Update count
    const countEl = document.getElementById('sort-count');
    if (countEl) countEl.textContent = `${sorted.length} movies`;

    const grid = document.getElementById('discover-grid');
    grid.innerHTML = '';
    sorted.forEach(m => grid.appendChild(createPosterCard(m)));
  }

  // Wire up filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.onclick = () => applyFilter(chip.dataset.filter);
  });

  // Wire up sort selector
  document.getElementById('sort-select').onchange = (e) => applySort(e.target.value);

  applyFilter('dv-atmos');
}

function renderAnalytics(el) {
  // Calculate stats
  let totalAtmos = 0, totalDV = 0, total4K = 0;
  const countryAtmos = {};
  const countryTotal = {};

  const countryCodes = Object.keys(COUNTRY_DATA);
  countryCodes.forEach(c => { countryAtmos[c] = 0; countryTotal[c] = 0; });

  movies.forEach(m => {
    const a = analyzeQuality(m);
    if (a.atmosCount > 0) totalAtmos++;
    if (a.dvCount > 0) totalDV++;
    if (a.fourKCount > 0) total4K++;

    const countriesMap = getMovieCountriesMap(m.id);
    for (const [code, data] of Object.entries(countriesMap)) {
      if (data.video && data.video !== '-') {
        countryTotal[code] = (countryTotal[code] || 0) + 1;
        if (data.audio === 'Atmos' || data.audio === 'Dolby Atmos') {
          countryAtmos[code] = (countryAtmos[code] || 0) + 1;
        }
      }
    }
  });

  // Country ranking by Atmos %
  const ranking = countryCodes
    .filter(c => countryTotal[c] > 0)
    .map(c => ({
      code: c,
      name: getCountryName(c),
      atmosPct: countryTotal[c] > 0 ? Math.round(countryAtmos[c] / countryTotal[c] * 100) : 0,
      atmosCount: countryAtmos[c],
      total: countryTotal[c],
    }))
    .sort((a, b) => b.atmosPct - a.atmosPct || b.total - a.total);

  el.innerHTML = `
    <h1 class="section-title" style="font-size:1.8rem;margin-bottom:24px"><span class="emoji">📊</span> Analytics</h1>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">${movies.length.toLocaleString()}</div><div class="stat-label">Total Movies</div></div>
      <div class="stat-card"><div class="stat-number">${total4K.toLocaleString()}</div><div class="stat-label">4K Titles</div></div>
      <div class="stat-card"><div class="stat-number">${totalDV.toLocaleString()}</div><div class="stat-label">Dolby Vision</div></div>
      <div class="stat-card"><div class="stat-number">${totalAtmos.toLocaleString()}</div><div class="stat-label">Dolby Atmos</div></div>
      <div class="stat-card"><div class="stat-number">${ranking.length}</div><div class="stat-label">Countries Tracked</div></div>
    </div>

    <h2 class="section-title"><span class="emoji">🏅</span> Country Atmos Ranking</h2>
    <div class="ranking-list" id="ranking-list"></div>
  `;

  const rankList = document.getElementById('ranking-list');
  ranking.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'ranking-item';
    item.innerHTML = `
      <div class="ranking-position ${i < 3 ? 'top-3' : ''}">${i + 1}</div>
      <img class="flag-img" src="${getFlagUrl(r.code, 40)}" alt="${r.name}" />
      <div class="ranking-name">${r.name}</div>
      <div class="ranking-bar-wrap"><div class="ranking-bar" style="width:${r.atmosPct}%"></div></div>
      <div class="ranking-pct">${r.atmosPct}%</div>
    `;
    rankList.appendChild(item);
  });
}

function renderWatchlist(el) {
  const watchlistedMovies = movies.filter(m => watchlist.includes(m.id));

  // Stats
  let wAtmos = 0, wDV = 0;
  watchlistedMovies.forEach(m => {
    const a = analyzeQuality(m);
    if (a.atmosCount > 0) wAtmos++;
    if (a.dvCount > 0) wDV++;
  });

  el.innerHTML = `
    <h1 class="section-title" style="font-size:1.8rem;margin-bottom:24px"><span class="emoji">❤️</span> Watchlist</h1>
    ${watchlistedMovies.length > 0 ? `
    <div class="stats-grid" style="margin-bottom:32px">
      <div class="stat-card"><div class="stat-number">${watchlistedMovies.length}</div><div class="stat-label">Saved Movies</div></div>
      <div class="stat-card"><div class="stat-number">${wAtmos}</div><div class="stat-label">Atmos Movies</div></div>
      <div class="stat-card"><div class="stat-number">${wDV}</div><div class="stat-label">Dolby Vision</div></div>
    </div>
    <div class="poster-grid" id="watchlist-grid"></div>
    ` : `
    <div class="watchlist-empty">
      <div class="icon">📋</div>
      <p>Your watchlist is empty</p>
      <p style="font-size:0.85rem;margin-top:8px">Browse movies and click "Add to Watchlist" to save them here</p>
    </div>
    `}
  `;

  if (watchlistedMovies.length > 0) {
    const grid = document.getElementById('watchlist-grid');
    watchlistedMovies.forEach(m => grid.appendChild(createPosterCard(m)));
  }
}

// ===== Watchlist =====
function toggleWatchlist(movieId) {
  const idx = watchlist.indexOf(movieId);
  if (idx >= 0) watchlist.splice(idx, 1);
  else watchlist.push(movieId);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// ===== Utilities =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Init =====
async function init() {
  window.addEventListener('hashchange', render);

  // Load data
  try {
    movies = await loadMovies();
  } catch (e) {
    console.error('Failed to load movies:', e);
  }

  // Initial render
  render();
}

init();
