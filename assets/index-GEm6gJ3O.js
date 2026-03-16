(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={US:{name:`United States`,emoji:`🇺🇸`},CA:{name:`Canada`,emoji:`🇨🇦`},MX:{name:`Mexico`,emoji:`🇲🇽`},JP:{name:`Japan`,emoji:`🇯🇵`},KR:{name:`South Korea`,emoji:`🇰🇷`},HK:{name:`Hong Kong`,emoji:`🇭🇰`},TW:{name:`Taiwan`,emoji:`🇹🇼`},SG:{name:`Singapore`,emoji:`🇸🇬`},TH:{name:`Thailand`,emoji:`🇹🇭`},MY:{name:`Malaysia`,emoji:`🇲🇾`},PH:{name:`Philippines`,emoji:`🇵🇭`},ID:{name:`Indonesia`,emoji:`🇮🇩`},IN:{name:`India`,emoji:`🇮🇳`},GB:{name:`United Kingdom`,emoji:`🇬🇧`},DE:{name:`Germany`,emoji:`🇩🇪`},FR:{name:`France`,emoji:`🇫🇷`},IT:{name:`Italy`,emoji:`🇮🇹`},ES:{name:`Spain`,emoji:`🇪🇸`},PT:{name:`Portugal`,emoji:`🇵🇹`},NL:{name:`Netherlands`,emoji:`🇳🇱`},BE:{name:`Belgium`,emoji:`🇧🇪`},IE:{name:`Ireland`,emoji:`🇮🇪`},AT:{name:`Austria`,emoji:`🇦🇹`},CH:{name:`Switzerland`,emoji:`🇨🇭`},SE:{name:`Sweden`,emoji:`🇸🇪`},DK:{name:`Denmark`,emoji:`🇩🇰`},NO:{name:`Norway`,emoji:`🇳🇴`},FI:{name:`Finland`,emoji:`🇫🇮`},PL:{name:`Poland`,emoji:`🇵🇱`},CZ:{name:`Czech Republic`,emoji:`🇨🇿`},HU:{name:`Hungary`,emoji:`🇭🇺`},RO:{name:`Romania`,emoji:`🇷🇴`},AU:{name:`Australia`,emoji:`🇦🇺`},NZ:{name:`New Zealand`,emoji:`🇳🇿`},BR:{name:`Brazil`,emoji:`🇧🇷`},AR:{name:`Argentina`,emoji:`🇦🇷`},CL:{name:`Chile`,emoji:`🇨🇱`},CO:{name:`Colombia`,emoji:`🇨🇴`},TR:{name:`Turkey`,emoji:`🇹🇷`},AE:{name:`UAE`,emoji:`🇦🇪`},SA:{name:`Saudi Arabia`,emoji:`🇸🇦`},IL:{name:`Israel`,emoji:`🇮🇱`},ZA:{name:`South Africa`,emoji:`🇿🇦`}},t={US:`us`,CA:`ca`,MX:`mx`,GB:`gb`,DE:`de`,FR:`fr`,IT:`it`,ES:`es`,PT:`pt`,NL:`nl`,BE:`be`,IE:`ie`,AT:`at`,CH:`ch`,SE:`se`,DK:`dk`,NO:`no`,FI:`fi`,PL:`pl`,CZ:`cz`,HU:`hu`,RO:`ro`,AU:`au`,NZ:`nz`,BR:`br`,AR:`ar`,CL:`cl`,CO:`co`,IN:`in`,JP:`jp`,KR:`kr`,TR:`tr`,ZA:`za`,IL:`il`,SG:`sg`,TH:`th`,MY:`my`,PH:`ph`,ID:`id`,HK:`hk`,TW:`tw`,AE:`ae`,SA:`sa`};function n(e,t=32){return`https://flagcdn.com/w${t}/${e.toLowerCase()}.png`}function r(t){return e[t]?.name||t}function i(e,n){let r=t[e];return r?`https://www.cheapcharts.info/${r}/search?q=${encodeURIComponent(n)}`:null}function a(e,t=!0,a=``){let o=document.createElement(`div`);o.className=`flag-item`;let s=document.createElement(`img`);s.className=`flag-img`,s.src=n(e,40),s.alt=r(e),s.loading=`lazy`,o.appendChild(s);let c=document.createElement(`div`);c.className=`flag-tooltip`,c.textContent=r(e),o.appendChild(c);let l=a?i(e,a):null;return t&&l&&(o.style.cursor=`pointer`,o.addEventListener(`click`,e=>{e.preventDefault(),window.open(l,`_blank`)})),o}var o={movies:[],countries:[],qualities:[]},s={movieById:new Map,countryByCode:new Map,titleTrigrams:new Map,titleWords:new Map,videoFormat:new Map,audioFormat:new Map,movieQualities:new Map,countryQualities:new Map},c=!1;function l(){let t=1;for(let[r,i]of Object.entries(e)){let e={id:t++,countryCode:r,countryName:i.name,flagImageUrl:n(r,40)};o.countries.push(e),s.countryByCode.set(r,e)}}l();function u(e,t){let n=t.toLowerCase();for(let t=0;t<=n.length-3;t++){let r=n.substring(t,t+3);s.titleTrigrams.has(r)||s.titleTrigrams.set(r,new Set),s.titleTrigrams.get(r).add(e)}let r=n.split(/\s+/).filter(e=>e.length>=2);for(let t of r)s.titleWords.has(t)||s.titleWords.set(t,new Set),s.titleWords.get(t).add(e)}function d(e,t,n){!t||t===`-`||(e.has(t)||e.set(t,new Set),e.get(t).add(n))}function f(e,t,n){e.has(t)||e.set(t,[]),e.get(t).push(n)}function p(e){let t=[],n=``,r=!1;for(let i=0;i<e.length;i++){let a=e[i];r?a===`"`?i+1<e.length&&e[i+1]===`"`?(n+=`"`,i++):r=!1:n+=a:a===`"`?r=!0:a===`,`?(t.push(n),n=``):n+=a}return t.push(n),t}function m(e){return e?e.replace(/^"+|"+$/g,``).trim():``}async function h(t){if(c)return o.movies;let n=``;if(t)n=await(await fetch(t)).text();else try{n=await(await fetch(`/quality-explorer/data/movies.csv`)).text()}catch{return console.warn(`No CSV data found`),c=!0,o.movies}let r=n.split(`
`).map(e=>e.replace(/\r$/,``));if(r.length<2)return c=!0,o.movies;let i=p(r[0]),a={};i.forEach((e,t)=>{a[e.trim()]=t});let l=Object.keys(e),h=0;for(let e=1;e<r.length;e++){if(!r[e].trim())continue;let t=p(r[e]),n=m(t[a.Title]);if(!n)continue;h++;let i={id:h,title:n,titleJP:m(t[a[`Title (Japanese)`]])||``,year:m(t[a.Year])||``,imdbScore:m(t[a[`IMDB Score`]])||m(t[a.IMDB])||``,rottenScore:m(t[a[`Rotten Tomato`]])||m(t[a.Rotten])||``,posterUrl:null};o.movies.push(i),s.movieById.set(h,i),u(h,n),i.titleJP&&u(h,i.titleJP);for(let e of l){let n=a[`${e} Video`],r=a[`${e} Audio`];if(n===void 0)continue;let i=m(t[n])||`-`,c=m(t[r])||`-`;if(i===`-`&&c===`-`)continue;let l=s.countryByCode.get(e);if(!l)continue;let u=o.qualities.length,p={movieId:h,countryId:l.id,videoFormat:i,audioFormat:c};o.qualities.push(p),d(s.videoFormat,i,u),d(s.audioFormat,c,u),f(s.movieQualities,h,u),f(s.countryQualities,l.id,u)}}return c=!0,console.log(`DB loaded: ${o.movies.length} movies, ${o.countries.length} countries, ${o.qualities.length} quality records`),o.movies}function g(e,t){if(!e||!e.trim())return[];let n=e.toLowerCase().trim(),r=new Map;function i(e,t){r.set(e,(r.get(e)||0)+t)}for(let e of o.movies){let t=e.title.toLowerCase();t===n?i(e.id,1e3):t.startsWith(n)&&i(e.id,500)}if(n.length>=3){let e=[];for(let t=0;t<=n.length-3;t++){let r=n.substring(t,t+3),i=s.titleTrigrams.get(r);i&&e.push(i)}if(e.length>0){let t=new Map;for(let n of e)for(let e of n)t.set(e,(t.get(e)||0)+1);for(let[n,r]of t){let t=r/e.length;t>=.5&&i(n,t*200)}}}let a=n.split(/\s+/).filter(e=>e.length>=2);for(let e of a){let t=s.titleWords.get(e);if(t)for(let e of t)i(e,100);if(e.length>=3)for(let t=0;t<=e.length-3;t++){let n=e.substring(t,t+3),r=s.titleTrigrams.get(n);if(r)for(let e of r)i(e,10)}}for(let e of o.movies)e.titleJP&&e.titleJP.includes(n)&&i(e.id,300);return[...r.entries()].sort((e,t)=>t[1]-e[1]).slice(0,50).map(([e])=>s.movieById.get(e)).filter(Boolean)}function _(e){let t=s.movieQualities.get(e)||[],n={};for(let e of t){let t=o.qualities[e],r=o.countries.find(e=>e.id===t.countryId);r&&(n[r.countryCode]={video:t.videoFormat,audio:t.audioFormat})}return n}var v=`bda8d46b3b1b9c717d1d3448901c2a93`,y=`https://api.themoviedb.org/3`,b=`https://image.tmdb.org/t/p`,x=`tmdb_poster_cache`,S=C();function C(){try{return JSON.parse(localStorage.getItem(x)||`{}`)}catch{return{}}}function w(){try{let e=Object.keys(S);e.length>3e3&&e.slice(0,e.length-2e3).forEach(e=>delete S[e]),localStorage.setItem(x,JSON.stringify(S))}catch{}}async function T(e,t,n=`w342`){let r=`${e}_${t}`;if(S[r]!==void 0)return S[r]?`${b}/${n}${S[r]}`:null;try{let i=new URLSearchParams({api_key:v,query:e,language:`en-US`});t&&i.set(`year`,t);let a=await(await fetch(`${y}/search/movie?${i}`)).json();if(a.results&&a.results.length>0){let e=a.results[0].poster_path;return S[r]=e||null,w(),e?`${b}/${n}${e}`:null}return S[r]=null,w(),null}catch(t){return console.warn(`TMDb error for "${e}":`,t),null}}var E={"Dolby Vision":4,"HDR10+":3,HDR10:3,HDR:3,SDR:1,"-":0,"":0},D={Atmos:3,"Dolby Atmos":3,"5.1":2,Stereo:1,"-":0,"":0};function O(e){return E[e]??0}function k(e){return D[e]??0}function A(e,t){return O(e)*10+k(t)}function j(e,t){if(!e||e===`-`)return`Not Available`;let n=[];return e===`Dolby Vision`||e===`HDR10`||e===`HDR10+`||e===`HDR`?n.push(`4K ${e}`):e===`SDR`?n.push(`HD SDR`):n.push(e),t&&t!==`-`&&n.push(t===`Atmos`?`Dolby Atmos`:t),n.join(` + `)}function M(e){let t={},n=-1,r=``,i=0,a=0,o=0,s=_(e.id);for(let[e,c]of Object.entries(s)){if(!c.video||c.video===`-`)continue;let s=j(c.video,c.audio),l=A(c.video,c.audio);t[s]||(t[s]={label:s,score:l,countries:[]}),t[s].countries.push(e),l>n&&(n=l,r=s),(c.audio===`Atmos`||c.audio===`Dolby Atmos`)&&i++,c.video===`Dolby Vision`&&a++,c.video!==`SDR`&&c.video!==`-`&&o++}let c=Object.values(t).sort((e,t)=>t.score-e.score);return{bestLabel:r,bestScore:n,bestCountries:t[r]?.countries||[],groups:c,atmosCount:i,dvCount:a,fourKCount:o}}var N=[],P=JSON.parse(localStorage.getItem(`watchlist`)||`[]`);function F(){let e=(window.location.hash||`#/`).slice(2).split(`/`);return{page:e[0]||`home`,param:e[1]||``}}function I(e){window.location.hash=`#/`+e}var L=()=>document.getElementById(`page-content`);function R(){let e=F();document.querySelectorAll(`.nav-link`).forEach(t=>{let n=t.dataset.page;t.classList.toggle(`active`,n===e.page||e.page===`search`&&n===`home`)})}async function z(){let e=F();R();let t=L();switch(t.innerHTML=``,t.className=`page-enter`,e.page){case`home`:V(t);break;case`search`:H(t,e.param);break;case`movie`:U(t,e.param);break;case`discover`:W(t);break;case`analytics`:G(t);break;case`watchlist`:K(t);break;default:V(t)}}function B(e){let t=M(e),n=document.createElement(`div`);n.className=`poster-card`,n.onclick=()=>I(`movie/${e.id}`);let r=document.createElement(`div`);if(r.className=`poster-image-wrap`,e.poster){let t=document.createElement(`img`);t.className=`poster-image`,t.src=e.poster,t.alt=e.title,t.loading=`lazy`,r.appendChild(t)}else{let t=document.createElement(`div`);t.className=`poster-no-image`,t.textContent=`🎬`,r.appendChild(t),T(e.title,e.year).then(t=>{if(t){e.poster=t;let n=document.createElement(`img`);n.className=`poster-image`,n.src=t,n.alt=e.title,r.innerHTML=``,r.appendChild(n)}})}let i=document.createElement(`div`);i.className=`poster-badges`,t.dvCount>0&&(i.innerHTML+=`<span class="badge badge-dv">DV</span>`),t.atmosCount>0?i.innerHTML+=`<span class="badge badge-atmos">Atmos</span>`:t.fourKCount>0&&(i.innerHTML+=`<span class="badge badge-4k">4K</span>`),r.appendChild(i),n.appendChild(r);let a=document.createElement(`div`);return a.className=`poster-info`,a.innerHTML=`
    <div class="poster-title">${J(e.title)}</div>
    <div class="poster-meta">
      <span>${e.year||`-`}</span>
      ${e.imdbScore?`<span class="imdb">⭐ ${e.imdbScore}</span>`:``}
      ${t.atmosCount>0?`<span class="atmos-count">🔊 ${t.atmosCount}</span>`:``}
    </div>
  `,n.appendChild(a),n}function V(e){e.innerHTML=`
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
  `;let t=document.getElementById(`home-search`);t.addEventListener(`keydown`,e=>{if(e.key===`Enter`){let e=t.value.trim();e&&(I(`search/${encodeURIComponent(e)}`),requestAnimationFrame(()=>{let e=document.getElementById(`search-input`);e&&(e.focus(),e.selectionStart=e.selectionEnd=e.value.length)}))}});let n=N.filter(e=>M(e).dvCount>0&&e.imdbScore).sort((e,t)=>parseFloat(t.imdbScore||0)-parseFloat(e.imdbScore||0)).slice(0,20),r=document.getElementById(`trending-carousel`);n.forEach(e=>r.appendChild(B(e)));let i=N.filter(e=>{let t=M(e);return t.dvCount>0&&t.atmosCount>0}).sort((e,t)=>parseFloat(t.imdbScore||0)-parseFloat(e.imdbScore||0)).slice(0,24),a=document.getElementById(`dv-atmos-grid`);i.forEach(e=>a.appendChild(B(e)))}function H(e,t){let n=decodeURIComponent(t),r=g(n,N);e.innerHTML=`
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" id="search-input" value="${J(n)}" placeholder="Search movies..." autocomplete="off" />
    </div>
    <h2 class="section-title" id="search-count">${r.length} results for "${J(n)}"</h2>
    <div class="poster-grid" id="search-grid"></div>
  `;let i=document.getElementById(`search-input`),a;function o(){let e=i.value.trim();if(e.length<2)return;let t=g(e,N),n=`#/search/${encodeURIComponent(e)}`;history.replaceState(null,``,n);let r=document.getElementById(`search-count`);r&&(r.textContent=`${t.length} results for "${e}"`);let a=document.getElementById(`search-grid`);a&&(a.innerHTML=``,t.forEach(e=>a.appendChild(B(e))))}i.addEventListener(`input`,()=>{clearTimeout(a),a=setTimeout(o,400)}),i.addEventListener(`keydown`,e=>{e.key===`Enter`&&(clearTimeout(a),o())}),requestAnimationFrame(()=>{i.focus(),i.selectionStart=i.selectionEnd=i.value.length});let s=document.getElementById(`search-grid`);r.forEach(e=>s.appendChild(B(e)))}function U(e,t){let n=N.find(e=>e.id===parseInt(t));if(!n){e.innerHTML=`<p>Movie not found</p>`;return}let r=M(n),i=P.includes(n.id);if(e.innerHTML=`
    <div class="back-btn" id="back-btn">← Back</div>
    <div class="movie-detail">
      <div class="movie-hero">
        <div class="movie-hero-poster" id="hero-poster">
          <div class="poster-no-image" style="aspect-ratio:2/3;font-size:4rem">🎬</div>
        </div>
        <div class="movie-hero-info">
          <h1 class="movie-title-main">${J(n.title)}</h1>
          ${n.titleJP?`<p style="color:var(--text-secondary);font-size:0.95rem">${J(n.titleJP)}</p>`:``}
          <div class="movie-scores">
            <div class="score-pill"><span class="label">Year</span> ${n.year||`-`}</div>
            ${n.imdbScore?`<div class="score-pill"><span class="label">IMDB</span> ⭐ ${n.imdbScore}</div>`:``}
            ${n.rottenScore?`<div class="score-pill"><span class="label">Rotten</span> 🍅 ${n.rottenScore}%</div>`:``}
            <div class="score-pill"><span class="label">Atmos</span> 🔊 ${r.atmosCount} countries</div>
            <div class="score-pill"><span class="label">DV</span> ${r.dvCount} countries</div>
          </div>
          <div class="movie-actions">
            <button class="btn ${i?`btn-active`:`btn-primary`}" id="watchlist-btn">
              ${i?`✓ In Watchlist`:`+ Add to Watchlist`}
            </button>
          </div>
        </div>
      </div>

      ${r.bestLabel?`
      <div class="best-quality-banner">
        <div class="best-quality-label">Best Quality Available</div>
        <div class="best-quality-value">${r.bestLabel}</div>
        <div class="flag-row" id="best-flags"></div>
      </div>
      `:``}

      <h2 class="section-title" style="margin-top:32px"><span class="emoji">🌍</span> Quality by Country</h2>
      <div id="quality-groups"></div>
    </div>
  `,document.getElementById(`back-btn`).onclick=()=>history.back(),T(n.title,n.year,`w500`).then(e=>{let t=document.getElementById(`hero-poster`);e&&(t.innerHTML=`<img src="${e}" alt="${J(n.title)}" style="width:100%;aspect-ratio:2/3;object-fit:cover" />`)}),r.bestCountries.length>0){let e=document.getElementById(`best-flags`);r.bestCountries.forEach(t=>{e.appendChild(a(t,!0,n.title))})}let o=document.getElementById(`quality-groups`);r.groups.forEach(e=>{let t=document.createElement(`div`);t.className=`quality-group`,t.innerHTML=`<div class="quality-group-label">${e.label} <span style="color:var(--text-muted);font-size:0.8rem">(${e.countries.length} countries)</span></div>`;let r=document.createElement(`div`);r.className=`flag-row`,e.countries.forEach(e=>{r.appendChild(a(e,!0,n.title))}),t.appendChild(r),o.appendChild(t)}),document.getElementById(`watchlist-btn`).onclick=()=>{q(n.id),U(e,t)}}function W(e){e.innerHTML=`
    <h1 class="section-title" style="font-size:1.8rem;margin-bottom:24px"><span class="emoji">🔎</span> Discover</h1>
    <div class="filter-chips" id="filter-chips">
      <button class="chip active" data-filter="dv-atmos">Dolby Vision + Atmos</button>
      <button class="chip" data-filter="dv">Dolby Vision</button>
      <button class="chip" data-filter="atmos">Atmos</button>
      <button class="chip" data-filter="4k">4K</button>
      <button class="chip" data-filter="jp-hd-abroad-4k">🇯🇵 HD / 🌍 4K</button>
      <button class="chip" data-filter="all">All Movies</button>
    </div>
    <div class="poster-grid" id="discover-grid"></div>
  `;function t(e){document.querySelectorAll(`.chip`).forEach(t=>t.classList.toggle(`active`,t.dataset.filter===e));let t=N.filter(t=>{let n=M(t);switch(e){case`dv-atmos`:return n.dvCount>0&&n.atmosCount>0;case`dv`:return n.dvCount>0;case`atmos`:return n.atmosCount>0;case`4k`:return n.fourKCount>0;case`jp-hd-abroad-4k`:let e=_(t.id),r=e.JP;if(r&&r.video&&r.video!==`SDR`&&r.video!==`-`)return!1;for(let[t,n]of Object.entries(e))if(t!==`JP`&&n.video&&n.video!==`SDR`&&n.video!==`-`)return!0;return!1;case`all`:return!0;default:return!0}}).sort((e,t)=>parseFloat(t.imdbScore||0)-parseFloat(e.imdbScore||0)).slice(0,1500),n=document.getElementById(`discover-grid`);n.innerHTML=``,t.forEach(e=>n.appendChild(B(e)))}document.querySelectorAll(`.chip`).forEach(e=>{e.onclick=()=>t(e.dataset.filter)}),t(`dv-atmos`)}function G(t){let i=0,a=0,o=0,s={},c={},l=Object.keys(e);l.forEach(e=>{s[e]=0,c[e]=0}),N.forEach(e=>{let t=M(e);t.atmosCount>0&&i++,t.dvCount>0&&a++,t.fourKCount>0&&o++;let n=_(e.id);for(let[e,t]of Object.entries(n))t.video&&t.video!==`-`&&(c[e]=(c[e]||0)+1,(t.audio===`Atmos`||t.audio===`Dolby Atmos`)&&(s[e]=(s[e]||0)+1))});let u=l.filter(e=>c[e]>0).map(e=>({code:e,name:r(e),atmosPct:c[e]>0?Math.round(s[e]/c[e]*100):0,atmosCount:s[e],total:c[e]})).sort((e,t)=>t.atmosPct-e.atmosPct||t.total-e.total);t.innerHTML=`
    <h1 class="section-title" style="font-size:1.8rem;margin-bottom:24px"><span class="emoji">📊</span> Analytics</h1>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">${N.length.toLocaleString()}</div><div class="stat-label">Total Movies</div></div>
      <div class="stat-card"><div class="stat-number">${o.toLocaleString()}</div><div class="stat-label">4K Titles</div></div>
      <div class="stat-card"><div class="stat-number">${a.toLocaleString()}</div><div class="stat-label">Dolby Vision</div></div>
      <div class="stat-card"><div class="stat-number">${i.toLocaleString()}</div><div class="stat-label">Dolby Atmos</div></div>
      <div class="stat-card"><div class="stat-number">${u.length}</div><div class="stat-label">Countries Tracked</div></div>
    </div>

    <h2 class="section-title"><span class="emoji">🏅</span> Country Atmos Ranking</h2>
    <div class="ranking-list" id="ranking-list"></div>
  `;let d=document.getElementById(`ranking-list`);u.forEach((e,t)=>{let r=document.createElement(`div`);r.className=`ranking-item`,r.innerHTML=`
      <div class="ranking-position ${t<3?`top-3`:``}">${t+1}</div>
      <img class="flag-img" src="${n(e.code,40)}" alt="${e.name}" />
      <div class="ranking-name">${e.name}</div>
      <div class="ranking-bar-wrap"><div class="ranking-bar" style="width:${e.atmosPct}%"></div></div>
      <div class="ranking-pct">${e.atmosPct}%</div>
    `,d.appendChild(r)})}function K(e){let t=N.filter(e=>P.includes(e.id)),n=0,r=0;if(t.forEach(e=>{let t=M(e);t.atmosCount>0&&n++,t.dvCount>0&&r++}),e.innerHTML=`
    <h1 class="section-title" style="font-size:1.8rem;margin-bottom:24px"><span class="emoji">❤️</span> Watchlist</h1>
    ${t.length>0?`
    <div class="stats-grid" style="margin-bottom:32px">
      <div class="stat-card"><div class="stat-number">${t.length}</div><div class="stat-label">Saved Movies</div></div>
      <div class="stat-card"><div class="stat-number">${n}</div><div class="stat-label">Atmos Movies</div></div>
      <div class="stat-card"><div class="stat-number">${r}</div><div class="stat-label">Dolby Vision</div></div>
    </div>
    <div class="poster-grid" id="watchlist-grid"></div>
    `:`
    <div class="watchlist-empty">
      <div class="icon">📋</div>
      <p>Your watchlist is empty</p>
      <p style="font-size:0.85rem;margin-top:8px">Browse movies and click "Add to Watchlist" to save them here</p>
    </div>
    `}
  `,t.length>0){let e=document.getElementById(`watchlist-grid`);t.forEach(t=>e.appendChild(B(t)))}}function q(e){let t=P.indexOf(e);t>=0?P.splice(t,1):P.push(e),localStorage.setItem(`watchlist`,JSON.stringify(P))}function J(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}async function Y(){window.addEventListener(`hashchange`,z);try{N=await h()}catch(e){console.error(`Failed to load movies:`,e)}z()}Y();