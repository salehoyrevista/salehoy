import React from "react";

const { useState, useEffect, useRef } = React;

/* ───────── Trébol (3 leaves) — one up, two below rotated ───────── */
function Trebol({ size = 28, color = 'var(--leather)', stroke = 1.3 }){
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {/* Top lobe */}
        <ellipse cx="20" cy="9" rx="5.2" ry="7" />
        {/* Bottom-left lobe rotated -30° */}
        <ellipse cx="20" cy="9" rx="5.2" ry="7" transform="rotate(-130 20 22)" />
        {/* Bottom-right lobe rotated +30° */}
        <ellipse cx="20" cy="9" rx="5.2" ry="7" transform="rotate(130 20 22)" />
        {/* Stem with curve */}
        <path d="M20 22 Q 18 32 22 44" />
      </g>
    </svg>
  );
}

/* Tiny red trébol used as ornament */
function TrebolRed({ size = 16 }){
  return <Trebol size={size} color="#9B2226" stroke={1.4} />;
}

/* ───────── El Colgado — simple line figure inverted ───────── */
function ColgadoGlyph(){
  return (
    <svg viewBox="0 0 100 140" width="110" height="150" aria-hidden="true">
      <g fill="none" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Top beam */}
        <line x1="10" y1="14" x2="90" y2="14" />
        {/* Rope */}
        <line x1="50" y1="14" x2="50" y2="40" />
        {/* Inverted body — head at bottom */}
        <circle cx="50" cy="50" r="9" />
        {/* Torso */}
        <line x1="50" y1="59" x2="50" y2="92" />
        {/* Arms behind back (suggested by small marks at lower torso) */}
        <path d="M50 78 Q 42 80 40 86" />
        <path d="M50 78 Q 58 80 60 86" />
        {/* Legs forming a 4 — one straight, other crossed back */}
        <line x1="50" y1="92" x2="38" y2="112" />
        <path d="M50 92 Q 58 102 50 112 Q 46 116 50 122" />
        {/* Tied ankle to rope */}
        <line x1="50" y1="40" x2="38" y2="112" stroke="#1A1A1A" strokeDasharray="2 2" opacity="0.5" />
        {/* small red accent — the halo / mark at the head */}
        <circle cx="50" cy="50" r="13" stroke="#9B2226" strokeWidth="0.8" opacity="0.55" />
      </g>
    </svg>
  );
}

/* ───────── Send icon (simple arrow) ───────── */
function SendArrow(){
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 7 L12 7 M8 3 L12 7 L8 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ────────────────────────────────────────────────────
   ENTRY SCREEN
   ──────────────────────────────────────────────────── */
function EntryScreen({ onEnter }){
  return (
    <div className="entry">
      <div className="sitemark fade-in"><b>SaleHoy</b><span style={{margin:'0 8px', color:'var(--leather-soft)'}}>·</span>Revista de juego y azar</div>
      <div className="corner-date fade-in">Miércoles · 20 · Mayo · 2026</div>

      <div className="entry-inner">
        <div className="tag fade-in">SaleHoy<span className="dot"></span>La sala</div>
        <div className="fade-in d1"><Trebol size={36} /></div>
        <h1 className="fade-in d1">La Vichy</h1>
        <div className="sub fade-in d1">El portal de los números</div>

        <p className="escena fade-in d2">
          Cocina. Mediodía en Rosario. Mate, radio bajita, La Capital sobre la mesa.
          Un gato dormido encima del horóscopo.
        </p>

        <p className="nombre fade-in d3">
          En el barrio le dicen Doña. Pero ella prefiere que le digas Vichy.
        </p>

        <p className="prompt fade-in d3">
          Contale qué soñaste, qué número se te aparece, qué cosa rara te pasó esta semana.
        </p>

        <button className="timbre fade-in d4" onClick={onEnter}>
          Tocar el timbre
        </button>

        <p className="disclaimer fade-in d4">
          Vichy es un personaje editorial de SaleHoy. Su lectura es cultura, no consejo.
          Si jugás, jugá poco. Si jugás mucho, hablá con alguien.
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   CHAT SCREEN
   ──────────────────────────────────────────────────── */

/* Pre-loaded conversation */
const SEED = [
  { who:'vichy', text:'Pas\u00e1, sentate. Ven\u00ed que est\u00e1 el agua. \u00bfTe tir\u00e1s un mate?' },
  { who:'vichy', text:'Antes de que me cuentes nada\u2026 \u00bfc\u00f3mo te llaman?' }
];

function renderParts(parts){
  return parts.map((p, i) => {
    if (typeof p === 'string') return <React.Fragment key={i}>{p}</React.Fragment>;
    if (p.em)  return <em key={i}>{p.em}</em>;
    if (p.num) return <span key={i} className="num">{p.num}</span>;
    return null;
  });
}

function VichyBlock({ msg }){
  return (
    <div className="vichy fade-in">
      <p>{msg.parts ? renderParts(msg.parts) : msg.text}</p>
    </div>
  );
}

function UserBlock({ msg }){
  return (
    <div className="user fade-in">
      <div className="bubble">{msg.text}</div>
    </div>
  );
}

function TarotCard({ card }){
  return (
    <div className="tarot-wrap">
      <div className="tarot">
        <div className="roman">{card.roman}</div>
        <div className="glyph"><ColgadoGlyph /></div>
        <div className="name">{card.name}</div>
      </div>
    </div>
  );
}

function Thinking(){
  return (
    <div className="thinking fade-in">
      <span>vichy escribe</span>
      <span className="dots"><span className="d"/><span className="d"/><span className="d"/></span>
    </div>
  );
}

/* ───────── SaleHoy seal (card back) ───────── */
function SaleHoySeal(){
  return (
    <div className="iri-seal">
      <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
        <g fill="none" stroke="#C9A96E" strokeWidth="1">
          <circle cx="29" cy="29" r="26" />
          <circle cx="29" cy="29" r="22" strokeOpacity="0.55" />
        </g>
        <g fill="none" stroke="#E4C886" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(15 13) scale(0.7)">
          <ellipse cx="20" cy="9" rx="5.2" ry="7" />
          <ellipse cx="20" cy="9" rx="5.2" ry="7" transform="rotate(-130 20 22)" />
          <ellipse cx="20" cy="9" rx="5.2" ry="7" transform="rotate(130 20 22)" />
          <path d="M20 22 Q 18 32 22 44" />
        </g>
      </svg>
      <div className="seal-name">SaleHoy</div>
    </div>
  );
}

/* ───────── Iridescent tarot card ───────── */
/* ───────── Spanish-deck suit glyphs (line-drawn) ───────── */
function Suit({ palo }){
  const c = { fill:'none', stroke:'currentColor', strokeWidth:1.2, strokeLinecap:'round', strokeLinejoin:'round' };
  if (palo === 'espada') return (
    <svg viewBox="0 0 16 16" aria-hidden="true"><g {...c}>
      <line x1="8" y1="1.5" x2="8" y2="10" /><line x1="4" y1="10" x2="12" y2="10" />
      <line x1="8" y1="10" x2="8" y2="13.5" /><circle cx="8" cy="14" r="1" />
    </g></svg>
  );
  if (palo === 'oro') return (
    <svg viewBox="0 0 16 16" aria-hidden="true"><g {...c}>
      <circle cx="8" cy="8" r="6.2" /><circle cx="8" cy="8" r="3.4" />
    </g></svg>
  );
  if (palo === 'copa') return (
    <svg viewBox="0 0 16 16" aria-hidden="true"><g {...c}>
      <path d="M4 3.5 L12 3.5 Q11.4 8 8 8.4 Q4.6 8 4 3.5 Z" /><line x1="8" y1="8.4" x2="8" y2="12.5" /><line x1="5" y1="13" x2="11" y2="13" />
    </g></svg>
  );
  // basto — knotted baton
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true"><g {...c}>
      <line x1="8" y1="14" x2="8" y2="5.5" /><circle cx="8" cy="3.6" r="1.9" />
      <path d="M8 7 L5 4.4 M8 7 L11 4.6" />
    </g></svg>
  );
}

/* ───────── The 40-card deck (number · palo · bird · image) ───────── */
const PALOS = { espada:'espadas', oro:'oros', copa:'copas', basto:'bastos' };
const PALO_ORDER = ['espada','oro','copa','basto'];
const RANK_ORDER = [1,2,3,4,5,6,7,10,11,12];
const RANKS = { 1:'As', 2:'Dos', 3:'Tres', 4:'Cuatro', 5:'Cinco', 6:'Seis', 7:'Siete', 10:'Sota', 11:'Caballo', 12:'Rey' };
const BIRDS = {
  espada:{1:'Cóndor andino',2:'Aguilucho común',3:'Águila mora',4:'Halconcito colorado',5:'Lechucita de las vizcacheras',6:'Lechuza de campanario',7:'Halcón peregrino',10:'Gavilán',11:'Chimango',12:'Carancho'},
  oro:{1:'Jilguero dorado',2:'Naranjero',3:'Benteveo',4:'Cabecita negra',5:'Misto',6:'Pepitero de collar',7:'Tucán toco',10:'Sietecolores de laguna',11:'Tordo amarillo',12:'Boyero ala amarilla'},
  copa:{1:'Garza mora',2:'Cisne de cuello negro',3:'Flamenco austral',4:'Macá común',5:'Gallareta',6:'Pato barcino',7:'Biguá',10:'Cigüeña americana',11:'Espátula rosada',12:'Cauquén común'},
  basto:{1:'Hornero',2:'Carpintero campestre',3:'Cardenal copete rojo',4:'Chingolo',5:'Ratona',6:'Calandria grande',7:'Picaflor bronceado',10:'Zorzal colorado',11:'Loro barranquero',12:'Chajá'},
};
const FILES = null; // images now served from optimized /vichy/cartas/<palo>-<n>.jpg
function makeCard(n, palo){
  return { n, palo, rank:RANKS[n], paloName:PALOS[palo], bird:BIRDS[palo][n], img:'/vichy/cartas/'+palo+'-'+n+'.jpg' };
}
const DECK = [];
PALO_ORDER.forEach(p => RANK_ORDER.forEach(n => DECK.push(makeCard(n, p))));
function findCard(n, palo){ return DECK.find(c => c.n === n && c.palo === palo); }

/* ───────── Iridescent bird card ───────── */
function IridescentCard({ card, flipped, onToggle, tilt = 16, eager = false }){
  const tiltRef = useRef(null);
  // Swap the visible face at the flip midpoint so the right face shows
  // in real browsers AND flat renderers (no fragile CSS opacity transition).
  const [faceFront, setFaceFront] = useState(flipped);
  useEffect(() => {
    const id = setTimeout(() => setFaceFront(flipped), 400);
    return () => clearTimeout(id);
  }, [flipped]);
  function onMove(e){
    const el = tiltRef.current; if(!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', ((px - 0.5) * tilt).toFixed(2) + 'deg');
    el.style.setProperty('--rx', (-(py - 0.5) * tilt).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    el.style.setProperty('--shine', '1');
  }
  function onLeave(){
    const el = tiltRef.current; if(!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
    el.style.setProperty('--shine', '0');
  }
  return (
    <div className="iri-card">
      <div className="iri-scene">
        <div className="iri-tilt" ref={tiltRef} onMouseMove={onMove} onMouseLeave={onLeave}>
          <div className="iri-glow"></div>
          <button
            className={'iri-flip' + (flipped ? ' is-flipped' : '')}
            onClick={onToggle}
            aria-pressed={flipped}
            aria-label={flipped ? (card.rank + ' de ' + card.paloName + ' · ' + card.bird + '. Tocá para tapar.') : ('Carta tapada. Tocá para revelar el ' + card.rank + ' de ' + card.paloName + '.')}
          >
            {/* BACK — seal */}
            <div className="iri-face iri-back" style={{ opacity: faceFront ? 0 : 1 }}>
              <div className="iri-noise"></div>
              <div className="iri-irid"></div>
              <div className="iri-shine"></div>
              <SaleHoySeal />
            </div>
            {/* FRONT — the bird */}
            <div className="iri-face iri-front" style={{ opacity: faceFront ? 1 : 0 }}>
              <img className="iri-img" src={card.img} alt={card.bird} loading={eager ? 'eager' : 'lazy'} draggable="false" />
              <div className="iri-noise"></div>
              <div className="iri-irid"></div>
              <div className="iri-shine"></div>
              <div className="iri-num"><span className="n">{card.n}</span><Suit palo={card.palo} /></div>
            </div>
          </button>
        </div>
      </div>
      <div className="iri-plate">
        <div className="plate-suit"><Suit palo={card.palo} /></div>
        <div className="plate-rank">{card.rank} · {card.paloName}</div>
        <div className="plate-bird">{card.bird}</div>
      </div>
    </div>
  );
}

const TIRADA_LABELS = ['Lo que cruzó', 'Lo que está', 'Lo que viene'];
const TIRADA_DEFAULT = [ findCard(1,'espada'), findCard(1,'basto'), findCard(7,'basto') ];

/* Iridescence hue sets (jewel tones — no rainbow) + base midnight gradients */
const IRID_SETS = {
  'Joya':   { h:[268,190,45,330], glow:268 },
  'Aurora': { h:[150,185,270,210], glow:165 },
  'Brasa':  { h:[40,340,285,20],  glow:32 },
  'Marea':  { h:[190,225,268,300], glow:200 },
};

function iridStyle(tw){
  const set = IRID_SETS[tw.iridSet] || IRID_SETS['Joya'];
  return {
    '--cw': tw.cardW + 'px',
    '--radius': tw.radius + 'px',
    '--edge': tw.edge + 'px',
    '--shine-max': tw.shine,
    '--glow': tw.glow,
    '--irid-base': tw.iridBase,
    '--irid-react': tw.iridReact,
    '--noise-op': tw.noise,
    '--filet': tw.filet,
    '--persp': tw.persp + 'px',
    '--h1': set.h[0], '--h2': set.h[1], '--h3': set.h[2], '--h4': set.h[3],
    '--glow-tint': set.glow,
    '--card-a': tw.base[0], '--card-b': tw.base[1], '--card-c': tw.base[2],
  };
}

function TiradaSection({ tw }){
  const [cards, setCards] = useState(TIRADA_DEFAULT);
  const [flipped, setFlipped] = useState([true, true, true]);
  const toggle = (i) => setFlipped(f => f.map((v, j) => j === i ? !v : v));
  const revealAll = () => {
    [0,1,2].forEach((i) => setTimeout(() => {
      setFlipped(f => { const n = [...f]; n[i] = true; return n; });
    }, i * 240));
  };
  const gatherAll = () => {
    [0,1,2].forEach((i) => setTimeout(() => {
      setFlipped(f => { const n = [...f]; n[2 - i] = false; return n; });
    }, i * 200));
  };
  const dealNew = () => {
    const pool = [...DECK]; const pick = [];
    for (let k = 0; k < 3; k++) pick.push(pool.splice(Math.floor(Math.random()*pool.length), 1)[0]);
    setFlipped([false, false, false]);
    setCards(pick);
    pick.forEach((_, i) => setTimeout(() => {
      setFlipped(f => { const n = [...f]; n[i] = true; return n; });
    }, 360 + i * 240));
  };
  return (
    <section className="tirada" aria-label="La tirada de tres" style={iridStyle(tw)}>
      <div className="tirada-inner">
        <div className="tirada-head">
          <div className="orn-trebol"><TrebolRed /></div>
          <h2>La tirada de tres</h2>
          <p className="tirada-sub">Pasado, presente y porvenir — dadas vuelta sobre el hule de la mesa. Pasá el dedo para que tomen luz; tocá una para taparla.</p>
        </div>
        <div className="tirada-cards">
          {cards.map((c, i) => (
            <div className="tirada-slot" key={c.palo + c.n + '-' + i}>
              <div className="slot-label">{TIRADA_LABELS[i]}</div>
              <IridescentCard card={c} flipped={flipped[i]} onToggle={() => toggle(i)} tilt={tw.tilt} eager={true} />
            </div>
          ))}
        </div>
        <div className="tirada-actions">
          <button onClick={dealNew}>Tirar de nuevo</button>
          <button className="ghost" onClick={revealAll}>Dar vuelta</button>
          <button className="ghost" onClick={gatherAll}>Recoger</button>
        </div>
      </div>
    </section>
  );
}

function MazoSection({ tw }){
  const [flipped, setFlipped] = useState({});
  const toggle = (key) => setFlipped(f => ({ ...f, [key]: !f[key] }));
  // mazo shows the birds by default at a compact grid size
  const isDown = (key) => key in flipped ? flipped[key] : false;
  const style = { ...iridStyle(tw), '--cw': '150px' };
  return (
    <section className="mazo" aria-label="El mazo completo" style={style}>
      <div className="mazo-inner">
        <div className="tirada-head" style={{ textAlign:'center' }}>
          <div className="orn-trebol"><TrebolRed /></div>
          <h2>El mazo completo</h2>
          <p className="tirada-sub">Cuarenta cartas, cuarenta pájaros. Cada palo, su gente: espadas las rapaces, oros las doradas, copas las de agua, bastos las del monte.</p>
        </div>
        {PALO_ORDER.map((p) => (
          <div className="palo-group" key={p}>
            <div className="palo-head"><Suit palo={p} /><span>{PALOS[p]}</span></div>
            <div className="mazo-grid">
              {DECK.filter(c => c.palo === p).map((c) => {
                const key = c.palo + c.n;
                return <IridescentCard key={key} card={c} flipped={!isDown(key)} onToggle={() => toggle(key)} tilt={tw.tilt} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChatScreen({ onBack, tw }){
  const [msgs, setMsgs] = useState(SEED);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('name');
  const [name, setName] = useState('');

  function send(){
    const t = input.trim();
    if (!t || busy) return;
    setInput('');
    setMsgs(m => [...m, { who:'user', text:t }]);
    setBusy(true);
    VICHY_PROVIDER(t, { step, name }).then(r => {
      setMsgs(m => [...m, ...r.msgs]);
      setStep(r.step); setName(r.name);
      setBusy(false);
    });
  }

  // gentle auto-scroll without scrollIntoView
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [msgs.length, busy]);

  return (
    <div className="app">
      {/* topbar */}
      <div className="topbar">
        <div className="brand">
          <span className="brand-name">La Vichy</span>
          <span className="brand-sub">El portal de los números</span>
        </div>
        <div className="site"><b>SaleHoy</b><span style={{margin:'0 8px', color:'var(--leather-soft)'}}>·</span>La sala</div>
        <button className="back" onClick={onBack}>← Salir de la cocina</button>
      </div>

      <div className="layout">
        {/* Left — Escenario */}
        <aside className="escenario">
          <div className="trebol-top"><Trebol size={22} /></div>
          <div className="ttl">La cocina</div>
          <div className="lines">
            <div className="row"><span className="k">Hora</span><span className="v">Mediodía en Rosario</span></div>
            <div className="row"><span className="k">Hoy</span><span className="v">miércoles 20 de mayo</span></div>
            <div className="row"><span className="k">Santo</span><span className="v">San Bernardino</span></div>
            <div className="row"><span className="k">En el horno</span><span className="v">tarta de zapallo</span></div>
            <div className="row"><span className="k">En la radio</span><span className="v">LT8, bajita</span></div>
            <div className="row"><span className="k">En la mesa</span><span className="v">mate amargo, segundo</span></div>
          </div>
          <div className="divider"></div>
          <p className="quote">
            Mirá, yo no soy de las que te dicen "jugá al 4 y te ganás un palo". Yo te leo. Después vos hacés.
          </p>
        </aside>

        {/* Center — Conversación */}
        <section className="conv">
          <div className="conv-head">
            <h2>La consulta</h2>
            <div className="with">CON VICHY</div>
          </div>

          {msgs.map((m, i) => {
            if (m.who === 'vichy') return <VichyBlock key={i} msg={m} />;
            if (m.who === 'user')  return <UserBlock  key={i} msg={m} />;
            if (m.who === 'tarot') return (
              <React.Fragment key={i}>
                <div className="orn-trebol"><TrebolRed /></div>
                <TarotCard card={m.card} />
              </React.Fragment>
            );
            if (m.who === 'card') return (
              <React.Fragment key={i}>
                <div className="orn-trebol"><TrebolRed /></div>
                <div style={{...iridStyle(tw), '--cw':'186px', display:'flex', justifyContent:'center', margin:'22px 0'}}>
                  <IridescentCard card={findCard(m.card.n, m.card.palo)} flipped={true} onToggle={()=>{}} tilt={tw.tilt} eager={true} />
                </div>
              </React.Fragment>
            );
            if (m.who === 'closure') return (
              <React.Fragment key={i}>
                <div className="orn-trebol"><TrebolRed /></div>
                <div className="close-row">
                  <a href="#" onClick={(e)=>{e.preventDefault(); window.location.reload();}}>Otra consulta</a>
                  <a href="#" onClick={(e)=>e.preventDefault()}>Compartir esta lectura</a>
                </div>
              </React.Fragment>
            );
            return null;
          })}

          {busy && <Thinking />}
        </section>

        {/* Right — Aire */}
        <aside className="aire">
          <div className="aire-mark">aire · margen · respirar</div>
        </aside>
      </div>

      {/* Dock */}
      <div className="dock" role="region" aria-label="Escribir a Vichy">
        <div className="dock-inner">
          <div className="col-left"></div>
          <div className="col-center">
            <div className="input-shell">
              <input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter') send(); }}
                placeholder="Respondé a Vichy…"
                aria-label="Mensaje para Vichy"
              />
              <button className="send" onClick={send} disabled={busy || !input.trim()} aria-label="Enviar">
                <SendArrow />
              </button>
            </div>
          </div>
        </div>
        <div className="helpline">
          ¿Te preocupa cómo jugás? Línea gratuita Sedronar 141.
        </div>
      </div>
    </div>
  );
}

/* ===================== CEREBRO GUIONADO (sin IA) =====================
   Secuencia guiada interactiva. Para IA futura: reemplazá VICHY_PROVIDER por
   una función async que pegue a una API y devuelva { msgs, step, name }.
   ==================================================================== */
const VICHY_MAZO = {
  "_meta": {
    "nombre": "La tabla de Vichy",
    "descripcion": "Mazo de 40 cartas de truco (baraja española), cada una con un pájaro argentino. Vichy lee TRES capas: la carta (palo + valor), el número de quiniela con su figura de la tabla de los sueños, y el ave con su símbolo. NO es un soplo ni un número candidato: es lectura cultural, saber popular, juego. Los números son la cuenta de la casa, no una promesa de ganar.",
    "familias": {
      "espada": "Rapaces. El fierro: el corte, la pelea, la verdad que duele, lo que defiende.",
      "oro": "Aves doradas. La plata: el sol del mazo, la suerte, lo que se reparte.",
      "copa": "Aves de agua. El amor: el cuerpo, la casa, el agua, lo que se brinda.",
      "basto": "Aves del monte. El laburo: el campo, la fuerza, lo que se construye a pulso."
    },
    "logica_aves": "Palo = familia de ave. Número = majestuosidad: cuanto más alto el rango en el truco, más regia el ave. Los 4 matadores se llevan las aves más imponentes; el 4 de copa (última carta) es la más humilde.",
    "matadores": ["1-espada (cóndor)", "1-basto (hornero)", "7-espada (halcón)", "7-oro (tucán)"],
    "estilo_visual": "Lámina ornitológica antigua: un ave centrada en perfil tres cuartos, línea dorada tipo grabado, plumaje con iridiscencia joya (violeta, verdeazul, oro viejo, rosa), fondo azul medianoche #0b1230, marco art-nouveau botánico, paleta de papel envejecido. Formato 2:3.",
    "assets": "public/vichy/cartas/{id}.png  (ej. 7-oro.png) · dorso: public/vichy/cartas/dorso.png",
    "valores": { "1": "as", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis", "7": "siete", "10": "sota", "11": "caballo", "12": "rey" },
    "total": 40
  },
  "cartas": [
    { "id": "1-espada", "palo": "espada", "valor": 1, "nombre": "As de espada", "apodo": "el macho · 1.º del mazo", "ave": "Cóndor andino", "simbolo": "el que vuela más alto y desde ahí ve todo; el rey del cielo", "numero": "07", "figura": "el revólver", "lectura": "Vino el as de espada, el macho, la carta más brava del mazo. Y mirá quién la cuida: el cóndor, el que vuela más alto que nadie y desde arriba ve todo. Siete, el revólver: el fierro mayor. Hoy te toca decidir desde lo alto, con la cabeza fría del que domina el cielo. Animate, pero con la mano firme." },
    { "id": "7-espada", "palo": "espada", "valor": 7, "nombre": "Siete de espada", "apodo": "3.º del mazo", "ave": "Halcón peregrino", "simbolo": "precisión y velocidad; el golpe exacto en el momento justo", "numero": "27", "figura": "el peine", "lectura": "El siete de espada, la carta de la guapeza, tercero entre los bravos. Lo lleva el halcón peregrino, el bicho más rápido del cielo: no falla porque elige el momento. Veintisiete, el peine: desenredá antes de tirarte en picada. Tenés un asunto enmarañado; primero apuntás, después cortás." },
    { "id": "3-espada", "palo": "espada", "valor": 3, "nombre": "Tres de espada", "ave": "Águila mora", "simbolo": "nobleza y porte; el que no agacha la cabeza ante nadie", "numero": "13", "figura": "la yeta", "lectura": "Tres de espada, la que en el truco vale oro. La custodia el águila mora, de pie, noble, sin agachar la cabeza ante nadie. Trece, la yeta… pero dada vuelta, que a vos te juega a favor. Lo que parecía mufa se te endereza si te plantás con ese porte." },
    { "id": "2-espada", "palo": "espada", "valor": 2, "nombre": "Dos de espada", "ave": "Aguilucho común", "simbolo": "estar alerta al borde del camino; la oportunidad que pasa", "numero": "17", "figura": "la desgracia", "lectura": "Dos de espada, carta chica que corta igual. El aguilucho la vigila desde el poste, ojo al camino, atento a lo que pasa. Diecisiete, la desgracia dicha al revés es aviso: mirá bien dónde pisás esta semana, como mira él, y la esquivás." },
    { "id": "12-espada", "palo": "espada", "valor": 12, "nombre": "Rey de espada", "ave": "Carancho", "simbolo": "el patrón que se las arregla con lo que hay; autoridad rapaz", "numero": "33", "figura": "los años de Cristo", "lectura": "Rey de espada, el que manda con el fierro. Su ave es el carancho, cara descubierta, el patrón del campo que no le esquiva a nada y aprovecha todo. Treinta y tres, los años de Cristo: número de respeto. Te toca decidir como rey esta semana, pero acordate que el que manda también rinde cuentas." },
    { "id": "11-espada", "palo": "espada", "valor": 11, "nombre": "Caballo de espada", "ave": "Chimango", "simbolo": "el rebusque y la picardía; sobrevivir con viento en contra", "numero": "24", "figura": "el caballo", "lectura": "Caballo de espada, naturalmente, y lo monta el chimango: las plumas revueltas por el viento pero siempre atento, el rey del rebusque. Veinticuatro, el caballo: viene movimiento, viene viaje. No te quedes sentado; como el chimango, hacé de lo que haya." },
    { "id": "10-espada", "palo": "espada", "valor": 10, "nombre": "Sota de espada", "ave": "Gavilán", "simbolo": "la paciencia que acecha; esperar el momento sin apurarse", "numero": "12", "figura": "el soldado", "lectura": "Sota de espada, la que cuida la puerta. Es el gavilán, flaco y alerta, esperando el momento sin apurarse. Doce, el soldado: alguien te guarda la espalda y vos ni enterado. Agradecelo, que el que vigila en silencio también se cansa." },
    { "id": "6-espada", "palo": "espada", "valor": 6, "nombre": "Seis de espada", "ave": "Lechuza de campanario", "simbolo": "ver en la oscuridad lo que otros no ven; sabiduría nocturna", "numero": "16", "figura": "el anillo", "lectura": "Seis de espada. La trae la lechuza del campanario, la que ve clarito en la oscuridad donde los demás van a tientas. Dieciséis, el anillo: una promesa que aprieta. Mirala con ojos de lechuza, de noche, y vas a ver si la hiciste vos o te la pusieron." },
    { "id": "5-espada", "palo": "espada", "valor": 5, "nombre": "Cinco de espada", "ave": "Lechucita de las vizcacheras", "simbolo": "la centinela chica en la boca de la cueva; los pies en la tierra", "numero": "38", "figura": "las piedras", "lectura": "Cinco de espada. La lechucita de las vizcacheras, parada en la boca de la cueva, chiquita pero centinela, con los pies bien en la tierra. Treinta y ocho, las piedras: el camino se puso duro. Una a una se sacan, mi vida, sin moverse de la guardia. Paciencia de hormiga." },
    { "id": "4-espada", "palo": "espada", "valor": 4, "nombre": "Cuatro de espada", "ave": "Halconcito colorado", "simbolo": "chico pero con garras; no subestimar lo pequeño", "numero": "18", "figura": "la sangre", "lectura": "Cuatro de espada. El halconcito colorado, el más chico de los cazadores pero con las garras igual de filosas. Dieciocho, la sangre: algo de los tuyos te toca de cerca. No es para asustarse; es para estar, chiquito y firme como él. Ese llamado pendiente, hacelo." },

    { "id": "7-oro", "palo": "oro", "valor": 7, "nombre": "Siete de oro", "apodo": "4.º del mazo", "ave": "Tucán toco", "simbolo": "la abundancia que se muestra; el pico de oro que no se esconde", "numero": "77", "figura": "las dos banderas", "lectura": "¡El siete de oro! La joya del mazo, cuarto entre los bravos. Su ave es el tucán, con ese pico dorado enorme que no puede esconder: la abundancia a la vista. Setenta y siete, las dos banderas: doble señal. Cuando la vida te repite el aviso dos veces y encima brilla, no es casualidad. Hacele caso." },
    { "id": "3-oro", "palo": "oro", "valor": 3, "nombre": "Tres de oro", "ave": "Benteveo", "simbolo": "'bien te veo': el que ve todo y lo canta; el que avisa", "numero": "30", "figura": "Santa Rosa", "lectura": "Tres de oro. El benteveo, el que grita su propio nombre —'bien-te-veo'—, el que ve todo y lo canta. Treinta, Santa Rosa: después de la tormenta, sale. Si venís de días feos, el benteveo ya te avisa que despeja. Prestá atención a lo que se dice a tu alrededor." },
    { "id": "2-oro", "palo": "oro", "valor": 2, "nombre": "Dos de oro", "ave": "Naranjero", "simbolo": "color y alegría a la vista; la fiesta hecha pluma", "numero": "20", "figura": "la fiesta", "lectura": "Dos de oro. El naranjero, todo color, la alegría hecha pluma. Veinte, la fiesta: la plata que se comparte rinde el doble. Viene junta, viene mesa larga. No vayas con la billetera cerrada ni con el corazón cerrado; ponete naranjero." },
    { "id": "1-oro", "palo": "oro", "valor": 1, "nombre": "As de oro", "apodo": "ancho falso", "ave": "Jilguero dorado", "simbolo": "el oro que además canta; fortuna con voz", "numero": "10", "figura": "la fortuna", "lectura": "¡El as de oro, el ancho falso, el sol del mazo! Y lo viste el jilguero dorado, el oro que además canta. Diez, la fortuna en la mano. No te prometo nada, que Vichy no vende humo, pero cuando cae el as de oro con el jilguero, algo se acomoda. Andá con los ojos abiertos y el oído atento." },
    { "id": "12-oro", "palo": "oro", "valor": 12, "nombre": "Rey de oro", "ave": "Boyero ala amarilla", "simbolo": "el oro escondido bajo lo negro; la riqueza que no se ve de entrada", "numero": "00", "figura": "los huevos", "lectura": "Rey de oro, el patrón. Su ave es el boyero, negro entero pero con el ala de oro escondida, la riqueza que recién se ve cuando abre las alas. Cero, cero, los huevos: de la nada nace todo, el número redondo. Hay algo grande para empezar desde abajo, y vos tenés el oro guardado aunque no se note. Animate." },
    { "id": "11-oro", "palo": "oro", "valor": 11, "nombre": "Caballo de oro", "ave": "Tordo amarillo", "simbolo": "el tesoro raro; lo que hay que cuidar porque escasea", "numero": "88", "figura": "los anteojos", "lectura": "Caballo de oro. El tordo amarillo, ese de capucha dorada que ya casi no se ve, un tesoro raro. Ochenta y ocho, los anteojos: mirá fino, que ahí hay algo y es de lo que no abunda. Una oportunidad chiquita y rara; ponete los anteojos y no la dejes pasar borrosa." },
    { "id": "10-oro", "palo": "oro", "valor": 10, "nombre": "Sota de oro", "ave": "Sietecolores de laguna", "simbolo": "la joyita; muchos dones en un cuerpito, pintado de a poco", "numero": "23", "figura": "el cocinero", "lectura": "Sota de oro. El sietecolores, la joya de los juncos, siete colores en un pajarito que parece pintado a mano. Veintitrés, el cocinero: lo que se cocina despacio sale mejor, y de a poquito va tomando todos sus colores. Tenés un proyecto en la olla; no le subas el fuego por ansioso." },
    { "id": "6-oro", "palo": "oro", "valor": 6, "nombre": "Seis de oro", "ave": "Pepitero de collar", "simbolo": "cuerpo sencillo, pico de oro; lo valioso está en la voz, no en la pinta", "numero": "06", "figura": "el perro", "lectura": "Seis de oro. El pepitero, gris y sin alarde, pero con el pico dorado: lo que vale lo lleva en la voz, no en la pinta. Seis, el perro: la lealtad, el que no te suelta. Pensá quién es tu pepitero, ese sencillo que siempre te dice la verdad. Llamalo." },
    { "id": "5-oro", "palo": "oro", "valor": 5, "nombre": "Cinco de oro", "ave": "Misto", "simbolo": "el cantorcito humilde del pasto; la alegría chica de cada día", "numero": "55", "figura": "la música", "lectura": "Cinco de oro. El misto, el cantorcito del pasto, amarillo humilde que canta igual aunque nadie lo escuche. Cincuenta y cinco, la música: la plata que suena, la alegría que entra por el oído. Poné una que te guste y cantala como el misto, en el pasto, para vos. Eso también es suerte." },
    { "id": "4-oro", "palo": "oro", "valor": 4, "nombre": "Cuatro de oro", "ave": "Cabecita negra", "simbolo": "el que canta aunque lo enjaulen; la voz que no se rinde", "numero": "50", "figura": "el pan", "lectura": "Cuatro de oro. La cabecita negra, ese amarillo de capucha que canta hasta en la jaula. Cincuenta, el pan: lo justo, pero en la mesa. No es para hacerse rico; es para no faltar, y aun con lo justo, cantar como la cabecita. Tener el pan ya es tener mucho, mi vida." },

    { "id": "3-copa", "palo": "copa", "valor": 3, "nombre": "Tres de copa", "ave": "Flamenco austral", "simbolo": "elegancia y equilibrio; lo rosa que florece sostenido en una pata", "numero": "31", "figura": "las flores", "lectura": "Tres de copa. El flamenco, parado en una pata, todo equilibrio y elegancia rosa. Treinta y uno, las flores: un brindis chico, algo que florece después de mucho cuidarlo. Sostené el equilibrio como él, y date flores vos misma si nadie te las trae, que te las merecés." },
    { "id": "2-copa", "palo": "copa", "valor": 2, "nombre": "Dos de copa", "ave": "Cisne de cuello negro", "simbolo": "la pareja y la fidelidad; los dos que nadan juntos", "numero": "21", "figura": "la mujer", "lectura": "Dos de copa, la carta del amor de a dos. El cisne de cuello negro, que va siempre en pareja, fiel, deslizándose sin ruido. Veintiuno, la mujer: alguien te está pensando ahora mismo. Hay quien no se anima a escribirte; si sentís quién es, hacé como el cisne y acercate. La copa es de a dos." },
    { "id": "1-copa", "palo": "copa", "valor": 1, "nombre": "As de copa", "apodo": "ancho falso", "ave": "Garza mora", "simbolo": "la paciencia; quedarse quieto hasta que el agua trae lo suyo", "numero": "11", "figura": "las cariñosas", "lectura": "As de copa, el ancho falso, la carta del corazón abierto. La custodia la garza mora, alta y quieta, esperando sin desesperar a que el agua le traiga lo suyo. Once, las cariñosas: el amor que toca la puerta. Tené la paciencia de la garza; lo que es para vos llega solo si te quedás abierto." },
    { "id": "12-copa", "palo": "copa", "valor": 12, "nombre": "Rey de copa", "ave": "Cauquén común", "simbolo": "el buen padre de pecho erguido; el que cuida la bandada", "numero": "49", "figura": "el muerto que habla", "lectura": "Rey de copa, el rey bonachón, el del corazón grande. Su ave es el cauquén, de pecho erguido, el buen padre que cuida la bandada. Cuarenta y nueve, el muerto que habla: el pasado tiene algo para decirte, capaz un padre, un abuelo, alguien que ya no está. No es para asustarse; es para hacer las paces y seguir cuidando a los tuyos." },
    { "id": "11-copa", "palo": "copa", "valor": 11, "nombre": "Caballo de copa", "ave": "Espátula rosada", "simbolo": "filtrar; separar lo que sirve de lo que no y dejar fluir", "numero": "09", "figura": "el arroyo", "lectura": "Caballo de copa. La espátula rosada, con ese pico de cuchara que pasa el agua y se queda con lo que sirve. Nueve, el arroyo: las cosas fluyen, dejá correr. No remes contra la corriente; filtrá como la espátula, quedate con lo bueno y que el resto siga su camino al río." },
    { "id": "10-copa", "palo": "copa", "valor": 10, "nombre": "Sota de copa", "ave": "Cigüeña americana", "simbolo": "la mensajera; la que trae y anuncia", "numero": "45", "figura": "el vino", "lectura": "Sota de copa. La cigüeña, de patas largas y rojas, la que siempre anda trayendo algo, la mensajera. Cuarenta y cinco, el vino: la mesa, los amigos, la sobremesa que no querés que termine. La cigüeña te anuncia una junta linda; hacele lugar. La plata va y viene, la sobremesa no se recupera." },
    { "id": "7-copa", "palo": "copa", "valor": 7, "nombre": "Siete de copa", "ave": "Biguá", "simbolo": "el que se zambulle hondo; busca abajo lo que no se ve", "numero": "19", "figura": "el pescado", "lectura": "Siete de copa. El biguá, el que se zambulle hondo y saca del fondo lo que nadie ve, después abre las alas al sol. Diecinueve, el pescado: algo escurridizo que se te escapa entre los dedos. Buscalo hondo como el biguá, con maña, o aprendé a soltarlo. El pescado no se atrapa apretando." },
    { "id": "6-copa", "palo": "copa", "valor": 6, "nombre": "Seis de copa", "ave": "Pato barcino", "simbolo": "la ternura de todos los días; el patito común a la orilla", "numero": "26", "figura": "el beso", "lectura": "Seis de copa. El pato barcino, el patito de siempre, hociqueando tranquilo a la orilla, sin pretensiones. Veintiséis, el beso: viene cariño, viene reconciliación. Hay alguien con quien quedaste áspero y el corazón ya lo perdonó. Acercate simple, como el barcino al agua, sin hacer ruido." },
    { "id": "5-copa", "palo": "copa", "valor": 5, "nombre": "Cinco de copa", "ave": "Gallareta", "simbolo": "defender el propio rincón en el agua; la casa, lo de uno", "numero": "05", "figura": "el gato", "lectura": "Cinco de copa. La gallareta, con su escudito en la frente, que defiende su pedacito de laguna como quien defiende su casa. Cinco, el gato: la suerte que entra sola y se acomoda como si fuera la dueña. No la espantes con desconfianza; dejala quedarse en tu rincón, que la gallareta sabe que lo bueno se cuida sin pelearlo." },
    { "id": "4-copa", "palo": "copa", "valor": 4, "nombre": "Cuatro de copa", "apodo": "última del mazo · la más humilde", "ave": "Macá común", "simbolo": "la humildad que igual flota; la suerte chica que no se hunde", "numero": "14", "figura": "el borracho", "lectura": "Cuatro de copa, la última del mazo, la más humilde. El macá, ese grebcito que va bajito en el agua y aun así nunca se hunde. Catorce, el borracho: cuidado con la copa de más, mi vida, no solo el vino. Andá bajito como el macá esta semana, sin pasarte de rosca, y vas a flotar igual. Todo con medida." },

    { "id": "1-basto", "palo": "basto", "valor": 1, "nombre": "As de basto", "apodo": "la hembra · 2.º del mazo", "ave": "Hornero", "simbolo": "el que construye su casa a pulso; el laburo humilde y noble, el hogar", "numero": "01", "figura": "el agua", "lectura": "As de basto, la hembra, segunda entre los bravos. Y no podía ser otro que el hornero, el que se hace la casa de barro a puro pico, humilde y orgulloso. Uno, el agua: todo empieza de nuevo. Como el hornero, ladrillo por ladrillo, arrancá de cero sin drama. Lo que arrastrabas, dejalo correr; vos sabés construir." },
    { "id": "3-basto", "palo": "basto", "valor": 3, "nombre": "Tres de basto", "ave": "Cardenal copete rojo", "simbolo": "la fe; el copete rojo como una velita prendida", "numero": "03", "figura": "San Cono", "lectura": "Tres de basto. El cardenal de copete rojo, con esa cresta encendida como una velita prendida. Tres, San Cono, el santo de los que sueñan números, mi devoción. Cuando cae San Cono con el cardenal, es para pedir con fe pero moviéndote, que el santo ayuda al que camina. Prendele una velita." },
    { "id": "2-basto", "palo": "basto", "valor": 2, "nombre": "Dos de basto", "ave": "Carpintero campestre", "simbolo": "insistir; golpear hasta abrir, la constancia que perfora", "numero": "22", "figura": "el loco", "lectura": "Dos de basto. El carpintero, golpeando el poste sin cansarse hasta abrir el agujero, puro aguante. Veintidós, el loco: el que se anima cuando los demás miran de afuera. Esa idea que tenés guardada por miedo al papelón, golpeala como el carpintero, una y otra vez. El loco no hace papelón, hace historia." },
    { "id": "12-basto", "palo": "basto", "valor": 12, "nombre": "Rey de basto", "ave": "Chajá", "simbolo": "el centinela que grita y avisa el peligro; el guardián", "numero": "40", "figura": "el cura", "lectura": "Rey de basto. El chajá, el centinela del bañado, ese que pega el grito y avisa a todos cuando algo anda mal. Cuarenta, el cura: autoridad, palabra que pesa, conciencia. Te toca poner orden o pegar el grito por algo, como el chajá. Avisar a tiempo también es de valientes, mi amor." },
    { "id": "11-basto", "palo": "basto", "valor": 11, "nombre": "Caballo de basto", "ave": "Loro barranquero", "simbolo": "la comunidad y la barra; los viejos que hablan y saben", "numero": "90", "figura": "el viejo", "lectura": "Caballo de basto. El loro barranquero, que vive en colonia y habla todo el día con los suyos, la barra que se cuenta las cosas. Noventa, el viejo, el abuelo: la experiencia que tira del carro. Hay un consejo de alguien grande que venís esquivando. Sentate con la barra a escuchar, que el loro viejo ya pasó por donde vos estás." },
    { "id": "10-basto", "palo": "basto", "valor": 10, "nombre": "Sota de basto", "ave": "Zorzal colorado", "simbolo": "el buen cantor del monte; la belleza simple en medio del trabajo", "numero": "15", "figura": "la niña bonita", "lectura": "Sota de basto. El zorzal colorado, de panza tibia, uno de los mejores cantores del monte sin hacer alarde. Quince, la niña bonita, mi número para alegrar. Algo lindo en medio de tanto laburo: un gesto, una tarde, una voz. Pará la oreja como para escuchar al zorzal y no lo dejes pasar." },
    { "id": "7-basto", "palo": "basto", "valor": 7, "nombre": "Siete de basto", "ave": "Picaflor bronceado", "simbolo": "el laburador incansable; dulzura ganada a puro aletear", "numero": "44", "figura": "la cárcel", "lectura": "Siete de basto, el siete laburador. Su ave es el picaflor, que no para de aletear ni un segundo y aun así brilla iridiscente: el trabajo hecho luz. Cuarenta y cuatro, la cárcel: una deuda que te tiene encerrado. La llave la tenés vos; aleteá como el picaflor, pagá lo que debés y salís liviano a buscar tu flor." },
    { "id": "6-basto", "palo": "basto", "valor": 6, "nombre": "Seis de basto", "ave": "Calandria grande", "simbolo": "la voz y la noticia; la que canta canciones ajenas, el mensaje", "numero": "60", "figura": "la bonanza", "lectura": "Seis de basto. La calandria, la mejor voz del monte, la que imita y repite todos los cantos como quien trae noticias. Sesenta, la bonanza: el laburo empieza a rendir, despacito. La calandria ya canta que viene lo bueno; bancátela un poco más, que la cosecha de lo que plantaste está por sonar." },
    { "id": "5-basto", "palo": "basto", "valor": 5, "nombre": "Cinco de basto", "ave": "Ratona", "simbolo": "chiquita y alegre, la colita parada; la que llega con la nueva", "numero": "35", "figura": "el pajarito", "lectura": "Cinco de basto. La ratona, chiquitita, la colita parada, vivaracha, metiéndose por todos lados. Treinta y cinco, el pajarito: una noticia que llega volando, de las buenas. Es ella misma la que te la trae al oído. Prestá atención a lo que te cuenten al pasar esta semana, que el pajarito no se repite." },
    { "id": "4-basto", "palo": "basto", "valor": 4, "nombre": "Cuatro de basto", "ave": "Chingolo", "simbolo": "el pajarito de todos; el más común y querido, el que siempre está", "numero": "04", "figura": "la cama", "lectura": "Cuatro de basto. El chingolo, el pajarito de todos los días, el copetudo humilde que canta en cualquier patio. Cuatro, la cama: descansá la mano, nene, no fuerces. Hacé como el chingolo, que está siempre y no se agita; no es vagancia, es estrategia. El que descansa también juega." }
  ]
};
const VICHY_DIALOGO = {
  "_meta": {
    "nombre": "Memoria de diálogo de Doña Vichy",
    "descripcion": "Banco de respuestas automatizadas (chatbot sin IA). El motor clasifica la intención del usuario por palabras clave y elige una respuesta al azar del array correspondiente. Si nada matchea, usa 'fallback'. Las respuestas que terminan en {tirada} le indican al motor que conviene ofrecer/disparar una tirada de carta.",
    "persona": "Doña Vichy de Rosario. Pitonisa de barrio, mística con los pies en la tierra. Mate en la mano, una gata en la falda, la radio bajita. Habla en rioplatense, tutea y trata de 'mi amor', 'nene', 'mi vida'. Cálida, pícara, nunca solemne. Cree en los números como lengua del pueblo, no como cábala de casino. NUNCA promete ganar, NUNCA da un soplo, NUNCA empuja a apostar. Si la cosa se pone densa, baja un cambio y manda a jugar con cabeza."
  },

  "saludos": {
    "_uso": "Primer mensaje cuando el visitante toca el timbre.",
    "respuestas": [
      "¡Pasá, pasá, no te quedes en la puerta! Dejá que cebo un mate. Soy Vichy. ¿Te tiro las cartas o venías a charlar nomás?",
      "Ay, llegaste justo, recién corté el mazo. Sentate, mi amor. ¿Querés que te lea una carta?",
      "Tocaste el timbre, y mirá que yo a esta hora no le abro a cualquiera. Pasá. Vichy te va a leer los números, si querés.",
      "Bienvenido a lo de Vichy. Acá no se vende suerte, se lee. Es distinto. ¿Arrancamos con una tirada?"
    ]
  },

  "aperturas_tirada": {
    "_uso": "Frase corta ANTES de revelar la carta (mientras se da vuelta). El motor la concatena con la lectura de la carta.",
    "respuestas": [
      "A ver, a ver… corto, mezclo, y que el mazo hable.",
      "Cerrá los ojos un segundo y pensá en lo tuyo. Listo. Doy vuelta…",
      "Pedile permiso a los naipes, que son orgullosos. Ahí va…",
      "Soplá la carta, como hacía mi abuela. Ahora sí, mirá lo que salió:",
      "El mazo ya sabe. Yo solo lo traduzco. Acá tenés:"
    ]
  },

  "remates": {
    "_uso": "Cierre corto DESPUÉS de la lectura de la carta. Rotativo, para que no se repita.",
    "respuestas": [
      "¿Querés que tire otra, o con esta te alcanza por hoy?",
      "Quedátela en el bolsillo y que te acompañe la semana.",
      "Eso dijo el naipe. Después me contás cómo te fue.",
      "Y si la jugás, jugala de cariño, poca plata y con cabeza. Esto es un juego, no un milagro.",
      "Vichy ya cumplió. Lo que hagas con el número es cosa tuya, mi amor."
    ]
  },

  "pedir_numero": {
    "_uso": "Usuario pide directamente 'un número', 'la suerte', 'qué juego'. Se redirige a una tirada (nunca un soplo).",
    "respuestas": [
      "Pará, pará, que Vichy no reparte números como caramelos. Acá se tira la carta y el número viene con ella. ¿Doy vuelta una? {tirada}",
      "Yo no te doy 'el número ganador', mi amor, eso es para los chantas. Yo te leo el que sale en el naipe y vos verás. ¿Tiramos? {tirada}",
      "Número sin carta es chamuyo. Dejame dar vuelta una y te leo lo que diga. {tirada}",
      "Ojo, que esto no es un soplo ni una promesa. Es un juego con los naipes. Si te cabe así, te tiro una carta ya. {tirada}"
    ]
  },

  "como_funciona": {
    "_uso": "Usuario pregunta cómo funciona, qué es esto, cómo lee.",
    "respuestas": [
      "Sencillo: doy vuelta una carta del mazo de truco, y cada carta tiene su número y su figura en la tabla de los sueños. Yo te leo qué dice. No adivino el futuro, lo charlo con vos.",
      "Mirá, esto viene de lejos: el pueblo siempre leyó los naipes y los sueños en clave de números. Yo sigo esa costumbre. Tiro una carta, sale un número, y te cuento qué cuenta esa carta.",
      "Cada palo es un mundo: la espada es el fierro, el basto el laburo, el oro la plata, la copa el amor. Le sumo el número de la tabla y ahí tenés la lectura. ¿Probamos con una? {tirada}"
    ]
  },

  "contar_sueno": {
    "_uso": "Usuario cuenta un sueño ('soñé con...'). El motor primero busca la palabra en vichy-suenos.json; si encuentra, responde con ese número. Estas son las frases envoltorio (prefijo/sufijo). {sueno} = cosa soñada, {numero} = número, {figura} = figura.",
    "encontrado": [
      "¿Soñaste con {sueno}? Pará que busco en la tabla… ahí está: {numero}, {figura}. El sueño te dejó el número en la almohada, mi amor.",
      "Mirá vos. {sueno} en la tabla de los sueños es {numero}, {figura}. Anotalo antes de que se te borre, que los sueños se evaporan con el mate.",
      "{sueno}… eso es {numero}, {figura}, como manda la tabla. No es casualidad que lo soñaras justo ahora."
    ],
    "no_encontrado": [
      "Mmm, ese sueño no lo tengo en la tabla, mi vida. Pero contame más detalles, o mejor: dejame tirarte una carta y vemos qué dice. {tirada}",
      "Qué sueño raro, ni mi abuela lo tenía anotado. No te sé el número de eso. ¿Querés que tire una carta en su lugar? {tirada}",
      "De eso la tabla no dice nada, y yo no te voy a inventar un número, que no soy de las que tiran fruta. Pero te leo una carta si querés. {tirada}"
    ]
  },

  "ganar_apostar": {
    "_uso": "Usuario pregunta si va a ganar, cuánto apostar, si es seguro. GUARDA DE MARCA: bajar expectativa, juego responsable, nunca empujar.",
    "respuestas": [
      "No, mi amor, yo no te puedo decir si vas a ganar. Nadie puede, y el que te dice que sí, te está mintiendo. Esto es un juego, una linda costumbre. Jugá de a poco y solo lo que te sobra.",
      "¿Cuánto poner? Lo que no te duela perder, ni un peso más. La quiniela es para soñar un rato, no para resolver la vida. Eso te lo dice Vichy de corazón.",
      "Pará ahí. Si estás jugando para zafar de una deuda, mejor guardá la plata. La suerte no paga cuentas. Y si sentís que no podés parar, hablalo con alguien; la línea del juego responsable es la 141, gratis."
    ]
  },

  "quien_es_vichy": {
    "_uso": "Usuario pregunta quién es Vichy, de dónde es, su historia.",
    "respuestas": [
      "Doña Vichy, de Rosario, para servirte. Toda la vida leyendo cartas en la cocina, primero a las vecinas, ahora a vos. Mi abuela me enseñó la tabla de los sueños y yo no la dejé caer.",
      "Soy Vichy, la del barrio. Mística, sí, pero con los pies en la tierra y la pava al fuego. No soy bruja ni adivina de feria: soy la que te escucha y te lee los naipes con cariño.",
      "Vichy a secas. La pitonisa de la casa. Donde otros ven azar, yo veo una conversación. Sentate que seguimos."
    ]
  },

  "agradecimiento": {
    "_uso": "Usuario agradece.",
    "respuestas": [
      "De nada, mi amor. Andá tranquilo y volvé cuando quieras, la puerta de Vichy siempre está.",
      "Para eso estoy, nene. Cuidate y jugá con cabeza.",
      "No es nada. Llevate el número y dejame la sonrisa, que con eso me pagás."
    ]
  },

  "despedida": {
    "_uso": "Usuario se despide.",
    "respuestas": [
      "Chau, mi vida. Que los números te traten bien. Y acordate: esto es un juego, no le pongas más peso del que tiene.",
      "Andá con Dios y con San Cono. Volvé cuando el mazo te llame.",
      "Cerrá despacito que no se me despierte la gata. Cuidate, mi amor. Vichy te espera."
    ]
  },

  "fallback": {
    "_uso": "Nada matcheó. Reconducir con calidez hacia una tirada o una charla.",
    "respuestas": [
      "Mirá, no te entendí del todo, y eso que tengo buen oído. ¿Querés que te tire una carta y vemos qué sale? {tirada}",
      "Andá más despacio que soy grande, mi amor. Pero si querés, dejame dar vuelta un naipe y de ahí arrancamos. {tirada}",
      "Eso se me escapó. Pero los naipes nunca fallan: ¿tiramos una y vemos? {tirada}",
      "No sé responderte eso, no te voy a chamuyar. Lo que sí sé hacer es leerte una carta. ¿Va? {tirada}"
    ]
  }
};
const VICHY_SUENOS = {
  "_meta": {
    "nombre": "La tabla de los sueños de Vichy",
    "descripcion": "Diccionario para el intent 'contar un sueño'. El motor normaliza el texto del usuario (minúsculas, sin tildes) y busca cualquiera de los 'sinonimos' como palabra. Devuelve numero + figura. Es saber popular, con variantes según el almanaque; esta es la versión de la casa. No es un soplo: es juego. Aparte, soñar con un pájaro del mazo revela esa carta (ver vichy-brain).",
    "match": "palabra completa para claves de una sola palabra; subcadena para claves con espacios."
  },
  "tabla": [
    { "figura": "los huevos", "numero": "00", "sinonimos": ["huevo", "huevos"] },
    { "figura": "el agua", "numero": "01", "sinonimos": ["agua", "rio", "mar", "lluvia mansa", "canilla"] },
    { "figura": "el niño", "numero": "02", "sinonimos": ["niño", "nene", "bebe", "guagua", "criatura", "chico"] },
    { "figura": "San Cono", "numero": "03", "sinonimos": ["san cono", "cono", "santo", "iglesia", "velita"] },
    { "figura": "la cama", "numero": "04", "sinonimos": ["cama", "colchon", "dormir", "sabanas", "almohada"] },
    { "figura": "el gato", "numero": "05", "sinonimos": ["gato", "gata", "michi", "minino"] },
    { "figura": "el perro", "numero": "06", "sinonimos": ["perro", "perra", "cachorro", "can"] },
    { "figura": "el revólver", "numero": "07", "sinonimos": ["revolver", "pistola", "arma", "tiro", "fierro", "balazo"] },
    { "figura": "el incendio", "numero": "08", "sinonimos": ["incendio", "fuego", "llamas", "quemado", "fogata"] },
    { "figura": "el arroyo", "numero": "09", "sinonimos": ["arroyo", "corriente", "cascada", "vertiente"] },
    { "figura": "la fortuna", "numero": "10", "sinonimos": ["fortuna", "suerte", "premio", "loteria"] },
    { "figura": "las cariñosas", "numero": "11", "sinonimos": ["cariñosas", "abrazo", "cariño", "amor", "novia", "novio"] },
    { "figura": "el soldado", "numero": "12", "sinonimos": ["soldado", "militar", "cuartel", "ejercito", "uniforme"] },
    { "figura": "la yeta", "numero": "13", "sinonimos": ["yeta", "mufa", "mala suerte", "trece"] },
    { "figura": "el borracho", "numero": "14", "sinonimos": ["borracho", "ebrio", "curda", "mamado", "vino de mas"] },
    { "figura": "la niña bonita", "numero": "15", "sinonimos": ["niña bonita", "nena", "chica linda", "muchacha"] },
    { "figura": "el anillo", "numero": "16", "sinonimos": ["anillo", "casamiento", "boda", "alianza", "compromiso"] },
    { "figura": "la desgracia", "numero": "17", "sinonimos": ["desgracia", "accidente", "caida fea", "tragedia"] },
    { "figura": "la sangre", "numero": "18", "sinonimos": ["sangre", "herida", "corte", "sangrar"] },
    { "figura": "el pescado", "numero": "19", "sinonimos": ["pescado", "pez", "pescar", "peces", "pesca"] },
    { "figura": "la fiesta", "numero": "20", "sinonimos": ["fiesta", "festejo", "baile", "cumpleaños", "joda", "celebracion"] },
    { "figura": "la mujer", "numero": "21", "sinonimos": ["mujer", "señora", "dama", "doña", "femenina"] },
    { "figura": "el loco", "numero": "22", "sinonimos": ["loco", "locura", "manicomio", "delirio", "chiflado"] },
    { "figura": "el cocinero", "numero": "23", "sinonimos": ["cocinero", "cocina", "olla", "guiso", "comida", "cocinar"] },
    { "figura": "el caballo", "numero": "24", "sinonimos": ["caballo", "yegua", "potro", "equino", "jinete"] },
    { "figura": "la gallina", "numero": "25", "sinonimos": ["gallina", "pollo", "gallinero", "cacarear"] },
    { "figura": "el beso", "numero": "26", "sinonimos": ["beso", "besar", "besos"] },
    { "figura": "el peine", "numero": "27", "sinonimos": ["peine", "peinar", "pelo enredado", "cabello"] },
    { "figura": "el cerro", "numero": "28", "sinonimos": ["cerro", "montaña", "subida", "loma", "sierra"] },
    { "figura": "San Pedro", "numero": "29", "sinonimos": ["san pedro", "llaves del cielo", "puerta del cielo"] },
    { "figura": "Santa Rosa", "numero": "30", "sinonimos": ["santa rosa", "tormenta", "temporal", "viento fuerte"] },
    { "figura": "las flores", "numero": "31", "sinonimos": ["flor", "flores", "ramo", "jardin", "rosas"] },
    { "figura": "el dinero", "numero": "32", "sinonimos": ["dinero", "plata", "billetes", "guita", "pesos", "monedas"] },
    { "figura": "los años de Cristo", "numero": "33", "sinonimos": ["cristo", "jesus", "cruz", "crucifijo"] },
    { "figura": "la cabeza", "numero": "34", "sinonimos": ["cabeza", "cerebro", "craneo", "frente"] },
    { "figura": "el pajarito", "numero": "35", "sinonimos": ["pajaro", "pajarito", "ave", "gorrion", "jilguero", "volar"] },
    { "figura": "el toro", "numero": "36", "sinonimos": ["toro", "vaca brava", "cornudo", "embestida"] },
    { "figura": "la muela", "numero": "37", "sinonimos": ["muela", "diente", "dientes", "dentista", "dolor de muela"] },
    { "figura": "las piedras", "numero": "38", "sinonimos": ["piedra", "piedras", "roca", "pedregullo", "canto rodado"] },
    { "figura": "la lluvia", "numero": "39", "sinonimos": ["lluvia", "tormenta de agua", "diluvio", "paraguas", "mojado"] },
    { "figura": "el cura", "numero": "40", "sinonimos": ["cura", "sacerdote", "padre de la iglesia", "sotana", "misa"] },
    { "figura": "el cuchillo", "numero": "41", "sinonimos": ["cuchillo", "facon", "navaja", "puñal"] },
    { "figura": "los zapatos", "numero": "42", "sinonimos": ["zapato", "zapatos", "calzado", "zapatilla", "botas"] },
    { "figura": "el balcón", "numero": "43", "sinonimos": ["balcon", "ventana", "baranda", "terraza"] },
    { "figura": "la cárcel", "numero": "44", "sinonimos": ["carcel", "preso", "rejas", "calabozo", "prision", "encerrado"] },
    { "figura": "el vino", "numero": "45", "sinonimos": ["vino", "copa de vino", "tinto", "bodega"] },
    { "figura": "el tomate", "numero": "46", "sinonimos": ["tomate", "tomates", "salsa", "huerta"] },
    { "figura": "el muerto", "numero": "47", "sinonimos": ["muerto", "muerta", "muerte", "morir", "murio", "difunto", "cadaver", "velorio", "cementerio", "tumba"] },
    { "figura": "el muerto que habla", "numero": "49", "sinonimos": ["muerto que habla", "fantasma", "aparecido", "alma", "espiritu", "voz del mas alla"] },
    { "figura": "el pan", "numero": "50", "sinonimos": ["pan", "panaderia", "harina", "facturas", "horno"] },
    { "figura": "la madre", "numero": "52", "sinonimos": ["madre", "mama", "vieja", "mamá", "abuela"] },
    { "figura": "el barco", "numero": "53", "sinonimos": ["barco", "lancha", "buque", "navegar", "puerto"] },
    { "figura": "la vaca", "numero": "54", "sinonimos": ["vaca", "ternero", "ganado", "campo con vacas"] },
    { "figura": "la música", "numero": "55", "sinonimos": ["musica", "cancion", "guitarra", "bailar", "orquesta", "canto"] },
    { "figura": "la caída", "numero": "56", "sinonimos": ["caer", "caida", "tropezar", "resbalar", "caigo"] },
    { "figura": "la inundación", "numero": "62", "sinonimos": ["inundacion", "creciente", "desborde", "agua por todos lados"] },
    { "figura": "el llanto", "numero": "64", "sinonimos": ["llanto", "llorar", "lagrimas", "llorona", "lloro"] },
    { "figura": "el hospital", "numero": "73", "sinonimos": ["hospital", "medico", "doctor", "enfermo", "ambulancia", "internado"] },
    { "figura": "las banderas", "numero": "77", "sinonimos": ["bandera", "banderas", "patria", "celeste y blanco"] },
    { "figura": "los anteojos", "numero": "88", "sinonimos": ["anteojos", "lentes", "gafas", "ver borroso"] },
    { "figura": "el viejo", "numero": "90", "sinonimos": ["viejo", "abuelo", "anciano", "el miedo", "miedo"] }
  ]
};

/* ============================================================================
   La Vichy — cerebro guionado (sin IA). Vanilla JS, sin dependencias.
   Reproduce la SECUENCIA del diseño, pero interactiva:
     saludo -> nombre -> signo -> equipo -> consulta -> (tira UNA carta y la lee)
   Mensajes en el formato del diseño:
     {who:'vichy', text} · {who:'vichy', parts:[...]} · {who:'card', card:{n,palo}}
   COSTURA IA: el chat llama a VICHY_PROVIDER(text, ctx) -> Promise<{msgs,step,name}>.
   Hoy = guionado; mañana = un provider async que pega a una API con la misma firma.
   ========================================================================== */
function makeVichyBrain(MAZO, DIALOGO, SUENOS){
  const byId = {};
  MAZO.cartas.forEach(c => { const [n,palo]=c.id.split('-'); byId[palo+'-'+n]=Object.assign({},c,{n:parseInt(n,10),palo}); });

  const norm = (s) => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const pick = (a) => a[Math.floor(Math.random()*a.length)];
  const hasWord = (txt,keys) => { const w=new Set(txt.split(' ')); return keys.some(k=> k.includes(' ')?txt.includes(k):w.has(k)); };

  const AVE_KEY = {
    'condor':'espada-1','aguilucho':'espada-2','aguila':'espada-3','halconcito':'espada-4','lechucita':'espada-5','lechuza':'espada-6','halcon':'espada-7','gavilan':'espada-10','chimango':'espada-11','carancho':'espada-12',
    'jilguero':'oro-1','naranjero':'oro-2','benteveo':'oro-3','cabecita':'oro-4','misto':'oro-5','pepitero':'oro-6','tucan':'oro-7','sietecolores':'oro-10','tordo':'oro-11','boyero':'oro-12',
    'garza':'copa-1','cisne':'copa-2','flamenco':'copa-3','maca':'copa-4','gallareta':'copa-5','barcino':'copa-6','bigua':'copa-7','ciguena':'copa-10','espatula':'copa-11','cauquen':'copa-12',
    'hornero':'basto-1','carpintero':'basto-2','cardenal':'basto-3','chingolo':'basto-4','ratona':'basto-5','calandria':'basto-6','picaflor':'basto-7','colibri':'basto-7','zorzal':'basto-10','loro':'basto-11','chaja':'basto-12'
  };
  const buscarAve = (txt) => { const w=new Set(txt.split(' ')); for(const k in AVE_KEY) if(w.has(k)) return byId[AVE_KEY[k]]; return null; };

  let bag=[], lastId=null;
  const refill=()=>{ bag=MAZO.cartas.map(c=>c.id); for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];} };
  function drawCard(){ if(!bag.length) refill(); let id=bag.pop(); if(id===lastId&&bag.length){bag.unshift(id);id=bag.pop();} lastId=id; const [n,palo]=id.split('-'); return byId[palo+'-'+n]; }

  const buscarSueno=(txt)=>{ const w=new Set(txt.split(' ')); for(const e of SUENOS.tabla){ const s=e.sinonimos.map(norm); if(s.some(x=>x.includes(' ')?txt.includes(x):w.has(x))) return e; } return null; };

  function lecturaParts(card){
    return ['Salió ', {em:card.nombre.toLowerCase()}, ' — ', {em:card.ave}, '. El número: ', {num:card.numero}, ', ', card.figura, '. ', card.lectura];
  }

  // ---- bancos de la secuencia ----
  const NAME_LINES = ['Lindo nombre.', 'Me gusta.', 'Anotado.', 'Buen nombre, de los que duran.'];
  const SIGNOS = {
    aries:'Aries. Fuego del que arranca primero, mijo.', tauro:'Tauro. Terco y de buen comer, te conozco.',
    geminis:'Géminis. Dos en uno, nunca sé con cuál hablo.', cancer:'Cáncer. Caparazón duro, adentro pura agua.',
    leo:'Leo. Te gusta el sol y que te miren, ¿o no?', virgo:'Virgo. Todo en su lugar, hasta los nervios.',
    libra:'Libra. Pesás todo antes de decidir, balanza.', escorpio:'Escorpio. Aguijón guardado, pero memoria larga.',
    sagitario:'Sagitario. Flecha al horizonte, siempre con un viaje en la cabeza.', capricornio:'Capricornio. Cabra de monte, Saturno te enseña con tiempo.',
    acuario:'Acuario. Rarito y adelantado, de los que ven lo que no se ve.', piscis:'Piscis. Dos peces, soñador hasta dormido.'
  };
  function signoQuip(text){ const t=norm(text); for(const k in SIGNOS) if(t.includes(k)) return SIGNOS[k]; return 'Mirá vos. Algo de eso se te nota.'; }
  const APERTURAS = ['Dejá que el mazo hable. Esperá que tiro una carta…','Cerrá los ojos un segundo y pensá en lo tuyo. Doy vuelta…','Pedile permiso a los naipes, que son orgullosos. Ahí va…','Soplá, como hacía mi abuela. Mirá lo que salió:'];
  const CIERRES = (name)=>['¿Querés que tire otra, o lo dejamos acá, '+name+'?','Quedátela en el bolsillo, '+name+'. Y si jugás, jugá de cariño.','Eso dijo el naipe. Contame si sale.','¿Seguimos con otra, '+name+'?'];

  function limpiarNombre(text){
    const w=(text||'').trim().split(/\s+/)[0]||'';
    const c=w.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'');
    if(!c) return 'mijo';
    return c.charAt(0).toUpperCase()+c.slice(1).toLowerCase();
  }
  function clasificar(txt){
    if(hasWord(txt,['chau','adios','me voy','nos vemos','hasta luego'])) return 'despedida';
    if(hasWord(txt,['gracias','genia','crack','grosa'])) return 'gracias';
    if(hasWord(txt,['gano','ganar','es seguro','apuesto','apostar','cuanto pongo','cuanto apuesto','es estafa','plata facil'])) return 'ganar';
    if(hasWord(txt,['quien sos','quien es vichy','de donde sos','tu historia','quien eres'])) return 'quien';
    if(hasWord(txt,['como funciona','que es esto','como lees','como sabes','como se juega'])) return 'como';
    return 'consulta';
  }

  // una consulta SIEMPRE puede terminar en una carta (salvo charla aparte)
  function consulta(text, name){
    const txt=norm(text);
    const intent=clasificar(txt);
    if(intent==='ganar')    return [{who:'vichy', text: pick(DIALOGO.ganar_apostar.respuestas)}];
    if(intent==='quien')    return [{who:'vichy', text: pick(DIALOGO.quien_es_vichy.respuestas)}];
    if(intent==='como')     return [{who:'vichy', text: pick(DIALOGO.como_funciona.respuestas).replace('{tirada}','').trim()}];
    if(intent==='gracias')  return [{who:'vichy', text: pick(DIALOGO.agradecimiento.respuestas)}];
    if(intent==='despedida')return [{who:'vichy', text: pick(DIALOGO.despedida.respuestas)}];
    const ave=buscarAve(txt), sue=buscarSueno(txt);
    const card=ave||drawCard();
    const msgs=[{who:'vichy', text:'Mirá vos. '+pick(APERTURAS)}, {who:'card', card:{n:card.n,palo:card.palo}}, {who:'vichy', parts: lecturaParts(card)}];
    if(sue) msgs.push({who:'vichy', parts:['Y lo que me contaste, '+name+', deja el ', {num:sue.numero}, ', ', sue.figura, '. Pensá qué te está diciendo.']});
    msgs.push({who:'vichy', text: pick(CIERRES(name))});
    return msgs;
  }

  // máquina de estados de la secuencia
  function guided(text, ctx){
    const step=(ctx&&ctx.step)||'name';
    let name=(ctx&&ctx.name)||'';
    if(step==='name'){
      name=limpiarNombre(text);
      return { step:'sign', name, msgs:[{who:'vichy', text: name+'. '+pick(NAME_LINES)+' Decime, ¿de qué signo sos? La edad redonda nomás, no me importa el día.'}] };
    }
    if(step==='sign'){
      return { step:'team', name, msgs:[{who:'vichy', text: signoQuip(text)+' Una más y arrancamos: ¿sos hincha de algún equipo? Te pregunto, no es por nada.'}] };
    }
    if(step==='team'){
      return { step:'consulta', name, msgs:[
        {who:'vichy', text:'Bueno, '+name+'. Sentate cómodo.'},
        {who:'vichy', text:'Ahora sí: contame qué te trajo. ¿Soñaste algo, se te aparece un número, te pasó algo raro esta semana?'}
      ] };
    }
    return { step:'consulta', name, msgs: consulta(text, name||'mijo') };
  }

  function provider(text, ctx){ return new Promise(res=>setTimeout(()=>res(guided(text,ctx)), 1100)); }
  return { provider, guided, consulta, drawCard, byId, _clasificar:clasificar, _norm:norm, _limpiarNombre:limpiarNombre };
}

const VICHY_BRAIN = makeVichyBrain(VICHY_MAZO, VICHY_DIALOGO, VICHY_SUENOS);
const VICHY_PROVIDER = (texto, ctx) => VICHY_BRAIN.provider(texto, ctx);

/* ───────── Root ───────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardW": 232,
  "radius": 16,
  "edge": 6,
  "persp": 1100,
  "tilt": 16,
  "shine": 0.55,
  "glow": 0.55,
  "iridBase": 0.12,
  "iridReact": 0.3,
  "noise": 0.1,
  "filet": 0.85,
  "iridSet": "Joya",
  "base": [
    "#243a78",
    "#16245a",
    "#0b1230"
  ]
}/*EDITMODE-END*/;

const BASE_OPTIONS = [
  ["#243a78", "#16245a", "#0b1230"], // Medianoche
  ["#1f3a3a", "#122827", "#08140f"], // Verde noche
  ["#34204a", "#221432", "#100a18"], // Ciruela
  ["#3a2a18", "#26190e", "#140c06"], // Cuero
];


function App(){
  const t = TWEAK_DEFAULTS;
  const [screen, setScreen] = useState('entry');
  useEffect(() => {
    const saved = (typeof localStorage!=='undefined') && localStorage.getItem('lavichy-screen');
    if (saved === 'chat') setScreen('chat');
  }, []);
  useEffect(() => { if (typeof localStorage!=='undefined') localStorage.setItem('lavichy-screen', screen); }, [screen]);
  return (
    <React.Fragment>
      {screen === 'entry'
        ? <EntryScreen onEnter={() => setScreen('chat')} />
        : <ChatScreen onBack={() => setScreen('entry')} tw={t} />}
    </React.Fragment>
  );
}
export default App;
