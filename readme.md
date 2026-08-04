<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WatchVerse — README</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0b0e14;
    --bg-elev:#12161f;
    --bg-elev-2:#191f2c;
    --line:#262d3d;
    --marquee:#e8b84b;
    --marquee-dim:#8a6f2e;
    --teal:#3ec6b6;
    --cream:#edeae0;
    --muted:#8a93a6;
    --danger:#e85d4b;
    --radius:14px;
    --display: "Anton", "Arial Narrow", sans-serif;
    --body: "Inter", -apple-system, sans-serif;
    --mono: "JetBrains Mono", monospace;
  }

  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto;}
    *{animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important;}
  }

  body{
    margin:0;
    background:var(--bg);
    color:var(--cream);
    font-family:var(--body);
    line-height:1.55;
    -webkit-font-smoothing:antialiased;
  }

  a{color:var(--teal);}
  button{font-family:inherit;}
  :focus-visible{outline:2px solid var(--marquee); outline-offset:3px;}

  /* ---------- marquee borders ---------- */
  .marquee-border{
    display:flex;
    gap:14px;
    padding:14px 20px;
    background:var(--bg-elev);
    overflow:hidden;
    justify-content:center;
    flex-wrap:wrap;
  }
  .marquee-border .dot{
    width:7px;height:7px;border-radius:50%;
    background:var(--marquee-dim);
    box-shadow:0 0 0 rgba(232,184,74,0);
    animation:bulb 2.6s infinite ease-in-out;
  }
  @keyframes bulb{
    0%,100%{background:var(--marquee-dim); box-shadow:0 0 0 rgba(232,184,74,0);}
    50%{background:var(--marquee); box-shadow:0 0 10px rgba(232,184,74,0.9);}
  }

  /* ---------- hero ---------- */
  .hero{
    text-align:center;
    padding:72px 20px 56px;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(62,198,182,0.10), transparent 55%),
      radial-gradient(ellipse at 50% 100%, rgba(232,184,74,0.08), transparent 60%),
      var(--bg);
    position:relative;
  }
  .hero-badge{
    display:inline-block;
    font-family:var(--mono);
    font-size:0.72rem;
    letter-spacing:0.22em;
    color:var(--teal);
    border:1px solid var(--line);
    padding:6px 14px;
    border-radius:999px;
    background:var(--bg-elev);
  }
  .hero-title{
    font-family:var(--display);
    font-weight:400;
    font-size:clamp(3rem, 11vw, 7.5rem);
    letter-spacing:0.02em;
    margin:20px 0 6px;
    color:var(--cream);
    text-shadow:0 0 26px rgba(232,184,74,0.25);
  }
  .hero-title span{color:var(--marquee);}
  .hero-tagline{
    max-width:560px;
    margin:0 auto;
    color:var(--muted);
    font-size:1.05rem;
  }
  .hero-pills{
    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    gap:9px;
    margin:28px auto 8px;
    max-width:640px;
  }
  .pill{
    font-family:var(--mono);
    font-size:0.74rem;
    color:var(--cream);
    background:var(--bg-elev-2);
    border:1px solid var(--line);
    padding:6px 12px;
    border-radius:999px;
    white-space:nowrap;
  }
  .scroll-cue{
    display:inline-block;
    margin-top:34px;
    font-family:var(--mono);
    font-size:0.78rem;
    letter-spacing:0.1em;
    color:var(--muted);
    text-decoration:none;
    border-bottom:1px dashed var(--line);
    padding-bottom:3px;
    transition:color 0.2s ease, border-color 0.2s ease;
  }
  .scroll-cue:hover{color:var(--marquee); border-color:var(--marquee);}

  /* ---------- shared section chrome ---------- */
  section{padding:84px 20px; max-width:1080px; margin:0 auto;}
  .section-head{max-width:620px; margin:0 auto 44px; text-align:center;}
  .eyebrow{
    display:block;
    font-family:var(--mono);
    font-size:0.72rem;
    letter-spacing:0.24em;
    color:var(--marquee);
    margin-bottom:10px;
  }
  .section-head h2{
    font-family:var(--display);
    font-weight:400;
    font-size:clamp(1.9rem, 4vw, 2.6rem);
    margin:0 0 12px;
    letter-spacing:0.01em;
  }
  .section-head p{color:var(--muted); margin:0; font-size:0.98rem;}

  /* ---------- swipe demo ---------- */
  .swipe-stage{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:22px;
  }
  .swipe-deck{
    position:relative;
    width:min(300px, 84vw);
    height:420px;
  }
  .swipe-card{
    position:absolute;
    inset:0;
    border-radius:18px;
    border:1px solid var(--line);
    background:var(--bg-elev);
    overflow:hidden;
    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    cursor:grab;
    user-select:none;
    touch-action:none;
    box-shadow:0 20px 40px rgba(0,0,0,0.45);
    transition:transform 0.35s cubic-bezier(.2,.8,.3,1), opacity 0.35s ease;
    will-change:transform;
  }
  .swipe-card:active{cursor:grabbing;}
  .swipe-card .poster{
    position:absolute; inset:0;
    background: var(--art);
  }
  .swipe-card .shade{
    position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(11,14,20,0) 30%, rgba(11,14,20,0.92) 88%);
  }
  .swipe-card .flip-note{
    position:absolute; inset:0;
    background:var(--bg-elev-2);
    padding:22px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    gap:10px;
    opacity:0;
    pointer-events:none;
    transition:opacity 0.25s ease;
  }
  .swipe-card.flipped .flip-note{opacity:1; pointer-events:auto;}
  .swipe-card.flipped .poster,
  .swipe-card.flipped .shade,
  .swipe-card.flipped .card-body{opacity:0;}
  .flip-note h4{margin:0 0 4px; font-family:var(--display); font-weight:400; font-size:1.4rem; letter-spacing:0.01em;}
  .flip-note p{margin:0; color:var(--muted); font-size:0.9rem;}
  .flip-note .back-hint{font-family:var(--mono); font-size:0.68rem; color:var(--teal); letter-spacing:0.08em; margin-top:8px;}
  .card-body{
    position:relative;
    padding:20px;
    transition:opacity 0.2s ease;
  }
  .card-body .cyear{font-family:var(--mono); font-size:0.72rem; color:var(--teal); letter-spacing:0.06em;}
  .card-body h3{margin:6px 0 6px; font-family:var(--display); font-weight:400; font-size:1.65rem; letter-spacing:0.01em;}
  .card-body .genres{display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;}
  .card-body .genres span{
    font-family:var(--mono); font-size:0.66rem; letter-spacing:0.04em;
    border:1px solid rgba(237,234,224,0.25); padding:2px 8px; border-radius:999px; color:var(--cream);
  }
  .card-body .stars{color:var(--marquee); font-size:0.9rem; letter-spacing:2px;}
  .stamp{
    position:absolute; top:16px; right:16px;
    font-family:var(--mono); font-weight:700; font-size:0.95rem; letter-spacing:0.06em;
    padding:8px 14px; border-radius:8px; border:2px solid;
    transform:rotate(8deg);
    opacity:0; transition:opacity 0.15s ease;
  }
  .stamp.like{color:var(--teal); border-color:var(--teal); transform:rotate(-8deg);}
  .stamp.skip{color:var(--danger); border-color:var(--danger);}

  .swipe-controls{display:flex; gap:18px; align-items:center;}
  .swipe-controls button{
    width:56px; height:56px; border-radius:50%;
    border:1px solid var(--line);
    background:var(--bg-elev);
    color:var(--cream);
    font-size:1.3rem;
    cursor:pointer;
    transition:transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .swipe-controls button:hover{transform:translateY(-3px);}
  #skipBtn:hover{border-color:var(--danger); color:var(--danger);}
  #likeBtn:hover{border-color:var(--teal); color:var(--teal);}
  #infoBtn{width:44px; height:44px; font-family:var(--mono); font-style:italic; align-self:center;}
  .swipe-status{font-family:var(--mono); font-size:0.76rem; color:var(--muted); letter-spacing:0.05em; min-height:1.2em;}

  /* ---------- channel guide ---------- */
  .channel-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));
    gap:14px;
  }
  .channel-card{
    background:var(--bg-elev);
    border:1px solid var(--line);
    border-radius:var(--radius);
    padding:18px;
    cursor:pointer;
    transition:border-color 0.2s ease;
  }
  .channel-card:hover{border-color:var(--marquee-dim);}
  .channel-card .ch-top{display:flex; justify-content:space-between; align-items:center; gap:10px;}
  .channel-card .ch-num{font-family:var(--mono); font-size:0.7rem; color:var(--marquee); letter-spacing:0.08em;}
  .channel-card .ch-icon{font-size:1.3rem;}
  .channel-card h3{
    font-family:var(--display); font-weight:400; letter-spacing:0.01em;
    font-size:1.2rem; margin:10px 0 6px;
  }
  .channel-card .ch-desc{color:var(--muted); font-size:0.86rem; margin:0;}
  .channel-card .ch-detail{
    max-height:0; overflow:hidden; opacity:0;
    transition:max-height 0.3s ease, opacity 0.25s ease, margin-top 0.3s ease;
  }
  .channel-card.open .ch-detail{max-height:260px; opacity:1; margin-top:12px;}
  .channel-card .ch-detail ul{margin:0; padding-left:18px; color:var(--cream); font-size:0.85rem;}
  .channel-card .ch-detail li{margin-bottom:4px;}
  .channel-card .ch-toggle{
    font-family:var(--mono); font-size:0.7rem; color:var(--teal); margin-top:10px; display:inline-block;
  }

  /* ---------- stack tabs ---------- */
  .stack-tabs{display:flex; justify-content:center; gap:8px; margin-bottom:26px; flex-wrap:wrap;}
  .stack-tabs .tab{
    background:transparent; border:1px solid var(--line); color:var(--muted);
    padding:9px 18px; border-radius:999px; font-size:0.85rem; cursor:pointer;
    transition:all 0.2s ease;
  }
  .stack-tabs .tab.active{background:var(--marquee); border-color:var(--marquee); color:#1a1204; font-weight:600;}
  .stack-panels .panel{display:none; flex-wrap:wrap; gap:9px; justify-content:center;}
  .stack-panels .panel.active{display:flex;}
  .stack-panels .pill{background:var(--bg-elev); }

  /* ---------- file tree ---------- */
  .tree{
    background:var(--bg-elev);
    border:1px solid var(--line);
    border-radius:var(--radius);
    padding:22px 26px;
    font-family:var(--mono);
    font-size:0.86rem;
    max-width:640px;
    margin:0 auto;
  }
  .tree details{margin:2px 0;}
  .tree summary{
    cursor:pointer; list-style:none; color:var(--marquee); padding:3px 0;
  }
  .tree summary::-webkit-details-marker{display:none;}
  .tree summary::before{content:"▸ "; color:var(--muted);}
  .tree details[open] > summary::before{content:"▾ ";}
  .tree .indent{padding-left:20px; border-left:1px dashed var(--line); margin-left:5px;}
  .tree .file{color:var(--cream); padding:2px 0; opacity:0.85;}
  .tree .file::before{content:"— "; color:var(--muted);}

  footer{
    text-align:center;
    padding:50px 20px 60px;
    color:var(--muted);
    font-size:0.85rem;
    border-top:1px solid var(--line);
  }
  footer strong{color:var(--marquee); font-family:var(--mono);}

  @media (max-width:600px){
    section{padding:60px 18px;}
    .swipe-deck{height:380px;}
  }
</style>
</head>
<body>

<div class="marquee-border top" id="topDots"></div>

<header class="hero">
  <span class="hero-badge">MERN · TMDB · SPOTIFY · GEMINI</span>
  <h1 class="hero-title">WATCH<span>VERSE</span></h1>
  <p class="hero-tagline">A full-stack media discovery platform — find what to watch, rate it, swipe through it, chat about it, and hear it too.</p>
  <div class="hero-pills">
    <span class="pill">React + Vite</span>
    <span class="pill">Node / Express</span>
    <span class="pill">MongoDB</span>
    <span class="pill">Passport.js</span>
    <span class="pill">Gemini AI Chat</span>
    <span class="pill">Spotify API</span>
  </div>
  <a class="scroll-cue" href="#demo">▾ step up to the box office</a>
</header>

<div class="marquee-border bottom" id="bottomDots"></div>

<section id="demo" class="swipe-section">
  <div class="section-head">
    <span class="eyebrow">NOW SHOWING</span>
    <h2>Swipe to discover</h2>
    <p>This is the actual interaction pattern from WatchVerse's Swipe-Based Discovery feature. Drag a card, or use the buttons — tap a card to flip it for the synopsis.</p>
  </div>
  <div class="swipe-stage">
    <div class="swipe-deck" id="deck"></div>
    <div class="swipe-controls">
      <button id="skipBtn" aria-label="Skip this title">✕</button>
      <button id="infoBtn" aria-label="Flip card for details">i</button>
      <button id="likeBtn" aria-label="Add to watchlist">♥</button>
    </div>
    <div class="swipe-status" id="swipeStatus"></div>
  </div>
</section>

<section class="channels-section">
  <div class="section-head">
    <span class="eyebrow">CHANNEL GUIDE</span>
    <h2>Everything on the platform</h2>
    <p>Tap a channel to tune in for the full feature list.</p>
  </div>
  <div class="channel-grid" id="channelGrid"></div>
</section>

<section class="stack-section">
  <div class="section-head">
    <span class="eyebrow">BEHIND THE SCREEN</span>
    <h2>The stack</h2>
    <p>What's actually running the show.</p>
  </div>
  <div class="stack-tabs" role="tablist">
    <button class="tab active" data-tab="frontend">Frontend</button>
    <button class="tab" data-tab="backend">Backend</button>
    <button class="tab" data-tab="apis">External APIs</button>
  </div>
  <div class="stack-panels">
    <div class="panel active" data-panel="frontend">
      <span class="pill">React</span><span class="pill">Vite</span><span class="pill">React Router</span>
      <span class="pill">Axios</span><span class="pill">Tailwind CSS</span><span class="pill">Framer Motion</span>
    </div>
    <div class="panel" data-panel="backend">
      <span class="pill">Node.js</span><span class="pill">Express.js</span><span class="pill">MongoDB</span>
      <span class="pill">Mongoose</span><span class="pill">Passport.js</span><span class="pill">Express Session</span>
      <span class="pill">connect-mongo</span><span class="pill">bcrypt</span><span class="pill">NodeCache</span>
      <span class="pill">retry-axios</span>
    </div>
    <div class="panel" data-panel="apis">
      <span class="pill">TMDB</span><span class="pill">Spotify API</span><span class="pill">Gemini API</span>
    </div>
  </div>
</section>

<section class="structure-section">
  <div class="section-head">
    <span class="eyebrow">THE REEL</span>
    <h2>Project structure</h2>
    <p>Click to unfold each directory.</p>
  </div>
  <div class="tree" id="tree">
    <details open><summary>WatchVerse/</summary>
      <div class="indent">
        <details><summary>Frontend/src/</summary>
          <div class="indent">
            <details><summary>components/</summary>
              <div class="indent">
                <div class="file">AnimatedOrb.jsx</div>
                <div class="file">MediaAssistantChatbot.jsx</div>
                <div class="file">Navbar.jsx</div>
                <div class="file">ProgressBar.jsx</div>
                <div class="file">ReviewComments.jsx</div>
                <div class="file">SwipeCard.jsx</div>
                <div class="file">SwipeStack.jsx</div>
              </div>
            </details>
            <details><summary>pages/</summary>
              <div class="indent">
                <div class="file">Home.jsx</div>
                <div class="file">Browser.jsx</div>
                <div class="file">Detail.jsx</div>
                <div class="file">Register.jsx</div>
                <div class="file">onBoarding.jsx</div>
              </div>
            </details>
            <div class="file">App.jsx</div>
            <div class="file">index.css</div>
          </div>
        </details>
        <details><summary>Backend/</summary>
          <div class="indent">
            <details><summary>Models/</summary>
              <div class="indent">
                <div class="file">Comment.js</div>
                <div class="file">Review.js</div>
                <div class="file">User.js</div>
                <div class="file">UserPreference.js</div>
                <div class="file">reviewContent.js</div>
              </div>
            </details>
            <details><summary>controllers/</summary>
              <div class="indent"><div class="file">chat.controller.js</div></div>
            </details>
            <details><summary>routes/</summary>
              <div class="indent">
                <div class="file">auth.route.js</div>
                <div class="file">chat.route.js</div>
                <div class="file">comments.route.js</div>
                <div class="file">home.route.js</div>
                <div class="file">onboarding.route.js</div>
                <div class="file">watchlist.route.js</div>
                <div class="file">index.js</div>
              </div>
            </details>
            <details><summary>services/</summary>
              <div class="indent">
                <div class="file">gemini.service.js</div>
                <div class="file">home.service.js</div>
                <div class="file">intent.service.js</div>
                <div class="file">mediaClassifier.service.js</div>
                <div class="file">prompt.service.js</div>
                <div class="file">spotify.service.js</div>
                <div class="file">tmdb.service.js</div>
              </div>
            </details>
            <div class="file">config/</div>
            <div class="file">lib/</div>
            <div class="file">server.js</div>
          </div>
        </details>
        <div class="file">package.json</div>
        <div class="file">package-lock.json</div>
        <div class="file">README.md</div>
      </div>
    </details>
  </div>
</section>

<footer>
  <p>WatchVerse — built on the <strong>MERN</strong> stack, powered by <strong>TMDB</strong>, <strong>Spotify</strong> &amp; <strong>Gemini</strong>.</p>
</footer>

<script>
  // ---------- marquee light strips ----------
  function fillDots(el, count){
    for(let i=0;i<count;i++){
      const d = document.createElement('span');
      d.className = 'dot';
      d.style.animationDelay = (Math.random()*2.6).toFixed(2)+'s';
      el.appendChild(d);
    }
  }
  fillDots(document.getElementById('topDots'), 26);
  fillDots(document.getElementById('bottomDots'), 26);

  // ---------- swipe deck ----------
  const titles = [
    {t:"Nocturne Drive", y:2024, genres:["Thriller","Neo-Noir"], rating:4.5,
     art:"linear-gradient(160deg,#1c2a4a,#0b0e14 70%)",
     blurb:"A getaway driver who never speaks takes one job too many in a city that never sleeps."},
    {t:"Paper Constellations", y:2023, genres:["Drama","Romance"], rating:4,
     art:"linear-gradient(160deg,#4a2438,#0b0e14 70%)",
     blurb:"Two astronomy students trade letters across a semester abroad, and slowly rewrite each other's futures."},
    {t:"The Last Reservation", y:2025, genres:["Sci-Fi","Mystery"], rating:5,
     art:"linear-gradient(160deg,#1f4a3f,#0b0e14 70%)",
     blurb:"A hotel that exists outside of time keeps checking in guests who died decades ago."},
    {t:"Static & Salt", y:2022, genres:["Comedy","Slice of Life"], rating:3.5,
     art:"linear-gradient(160deg,#4a3a1c,#0b0e14 70%)",
     blurb:"A washed-up radio host and a teenage intern try to save a dying coastal station, one bad segment at a time."},
    {t:"Iron Ledger", y:2024, genres:["Crime","Drama"], rating:4,
     art:"linear-gradient(160deg,#2a2a2a,#0b0e14 70%)",
     blurb:"An accountant for a crime family discovers the real ledger — and it has her name in it."}
  ];

  const deck = document.getElementById('deck');
  const statusEl = document.getElementById('swipeStatus');
  let order = titles.map((_,i)=>i);
  let pointer = 0;

  function stars(n){
    const full = Math.floor(n);
    const half = n % 1 !== 0;
    return "★".repeat(full) + (half?"½":"");
  }

  function renderDeck(){
    deck.innerHTML = "";
    const visible = [];
    for(let k=0;k<3;k++){
      const idx = order[(pointer+k) % order.length];
      visible.push(idx);
    }
    // back to front so front card is last child (topmost)
    visible.slice().reverse().forEach((idx, revI) => {
      const depth = visible.length - 1 - revI; // 0 = front
      const m = titles[idx];
      const card = document.createElement('div');
      card.className = 'swipe-card';
      card.style.setProperty('--art', m.art);
      card.style.zIndex = 10 - depth;
      card.style.transform = `translateY(${depth*10}px) scale(${1 - depth*0.045})`;
      card.style.opacity = depth === 2 ? '0.5' : '1';
      card.dataset.depth = depth;
      card.innerHTML = `
        <div class="poster"></div>
        <div class="shade"></div>
        <div class="stamp like">WANT TO WATCH</div>
        <div class="stamp skip">SKIP</div>
        <div class="card-body">
          <span class="cyear">${m.y}</span>
          <h3>${m.t}</h3>
          <div class="genres">${m.genres.map(g=>`<span>${g}</span>`).join('')}</div>
          <div class="stars">${stars(m.rating)}</div>
        </div>
        <div class="flip-note">
          <h4>${m.t}</h4>
          <p>${m.blurb}</p>
          <span class="back-hint">tap to flip back</span>
        </div>
      `;
      if(depth === 0){
        attachDrag(card);
        card.addEventListener('click', (e)=>{
          if(card.dataset.dragged === 'true'){ card.dataset.dragged = 'false'; return; }
          card.classList.toggle('flipped');
        });
      }
      deck.appendChild(card);
    });
    statusEl.textContent = `${order.length} titles queued · showing "${titles[order[pointer % order.length]].t}"`;
  }

  function advance(direction){
    const front = deck.querySelector('.swipe-card[data-depth="0"]');
    if(!front) return;
    front.style.transition = 'transform 0.4s cubic-bezier(.2,.8,.3,1), opacity 0.4s ease';
    front.style.transform = `translate(${direction*520}px, -30px) rotate(${direction*24}deg)`;
    front.style.opacity = '0';
    pointer = (pointer + 1) % order.length;
    setTimeout(renderDeck, 220);
  }

  function attachDrag(card){
    let startX=0, startY=0, dx=0, dy=0, dragging=false;
    const likeStamp = card.querySelector('.stamp.like');
    const skipStamp = card.querySelector('.stamp.skip');

    function onDown(e){
      dragging = true;
      card.dataset.dragged = 'false';
      startX = (e.touches? e.touches[0].clientX : e.clientX);
      startY = (e.touches? e.touches[0].clientY : e.clientY);
      card.style.transition = 'none';
    }
    function onMove(e){
      if(!dragging) return;
      const x = (e.touches? e.touches[0].clientX : e.clientX);
      const y = (e.touches? e.touches[0].clientY : e.clientY);
      dx = x - startX; dy = y - startY;
      if(Math.abs(dx) > 6) card.dataset.dragged = 'true';
      card.style.transform = `translate(${dx}px, ${dy*0.4}px) rotate(${dx/18}deg)`;
      likeStamp.style.opacity = dx > 30 ? Math.min(1,(dx-30)/60) : 0;
      skipStamp.style.opacity = dx < -30 ? Math.min(1,(-dx-30)/60) : 0;
    }
    function onUp(){
      if(!dragging) return;
      dragging = false;
      card.style.transition = 'transform 0.35s cubic-bezier(.2,.8,.3,1), opacity 0.35s ease';
      if(dx > 110){ advance(1); }
      else if(dx < -110){ advance(-1); }
      else { card.style.transform = 'translate(0,0) rotate(0)'; likeStamp.style.opacity=0; skipStamp.style.opacity=0; }
      dx = 0; dy = 0;
    }
    card.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  document.getElementById('likeBtn').addEventListener('click', ()=>advance(1));
  document.getElementById('skipBtn').addEventListener('click', ()=>advance(-1));
  document.getElementById('infoBtn').addEventListener('click', ()=>{
    const front = deck.querySelector('.swipe-card[data-depth="0"]');
    if(front) front.classList.toggle('flipped');
  });

  renderDeck();

  // ---------- channel guide ----------
  const channels = [
    {icon:"🏠", title:"Home Page", desc:"Curated rows, streaming-style.", items:["Featured movie banner","Trending movies","Popular movies & TV series","Top-rated movies & TV series","Curated content sections"]},
    {icon:"🔍", title:"Browse & Search", desc:"Find exactly what you're after.", items:["Search by title, actor, or creator","Filter by genre & media type","Discover by trend or genre","Duplicate result removal","Infinite scrolling"]},
    {icon:"🎬", title:"Content Detail", desc:"Everything about a title, one page.", items:["Poster & backdrop, description, genres","Runtime or seasons, director/creator, cast","Community rating & review count","Watchlist button"]},
    {icon:"⭐", title:"Reviews & Ratings", desc:"The community's take.", items:["1–5 star ratings","One review per user per title","Cached community average","Reverse-chronological feed","Comments on reviews"]},
    {icon:"📋", title:"Personal Watchlist", desc:"Track what you're into.", items:["Want to Watch / Watching / Watched","Add, update, or remove titles","View all saved titles in one place"]},
    {icon:"🃏", title:"Swipe Discovery", desc:"Tinder-style, for movies.", items:["Interactive swipe cards","Quick like / skip decisions","Smooth card animations","Personalized ordering"]},
    {icon:"🤖", title:"AI Chatbot", desc:"Ask, in plain language.", items:["\"What should I watch if I liked Interstellar?\"","Gemini-powered recommendations","Conversational discovery"]},
    {icon:"💬", title:"Chat Rooms", desc:"Talk it out with other users.", items:["Join entertainment discussions","Share recommendations","Exchange opinions in real time"]},
    {icon:"🎵", title:"Music Discovery", desc:"Beyond movies & TV.", items:["Songs, artists, albums via Spotify","Music recommendations","One platform, more media"]},
    {icon:"🧠", title:"Preferences", desc:"The platform learns your taste.", items:["Genre & interest preferences","Feeds personalized discovery","Powers recommendation features"]}
  ];

  const grid = document.getElementById('channelGrid');
  channels.forEach((c, i)=>{
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.tabIndex = 0;
    card.setAttribute('role','button');
    card.setAttribute('aria-expanded','false');
    const num = String(i+1).padStart(2,'0');
    card.innerHTML = `
      <div class="ch-top">
        <span class="ch-num">CH ${num}</span>
        <span class="ch-icon">${c.icon}</span>
      </div>
      <h3>${c.title}</h3>
      <p class="ch-desc">${c.desc}</p>
      <div class="ch-detail"><ul>${c.items.map(it=>`<li>${it}</li>`).join('')}</ul></div>
      <span class="ch-toggle">tap to tune in ▾</span>
    `;
    function toggle(){
      const open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', open ? 'true':'false');
      card.querySelector('.ch-toggle').textContent = open ? 'tap to change channel ▴' : 'tap to tune in ▾';
    }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } });
    grid.appendChild(card);
  });

  // ---------- stack tabs ----------
  document.querySelectorAll('.stack-tabs .tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('.stack-tabs .tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.stack-panels .panel').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });
</script>
</body>
</html>
