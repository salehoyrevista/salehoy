// SaleHoy · components — masthead, hero, cards, la sala, footer, edition.
const { useState, useEffect, useRef } = React;

/* reveal-on-scroll: play entry animation, then lock a stable resting class */
function showReveal(el) {
  if (el.dataset.shown) return;
  el.dataset.shown = "1";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.classList.add("done"); return; }
  el.classList.add("in");
  const lock = () => el.classList.add("done");
  el.addEventListener("animationend", lock, { once: true });
  setTimeout(lock, 720); // fallback if animationend doesn't fire
}
function useReveal(dep) {
  useEffect(() => {
    const scan = () => {
      const trigger = window.innerHeight * 0.94;
      document.querySelectorAll(".reveal:not([data-shown])").forEach(el => {
        if (el.getBoundingClientRect().top < trigger) showReveal(el);
      });
    };
    scan();
    window.addEventListener("scroll", scan, { passive: true });
    window.addEventListener("resize", scan);
    // permanent low-cost poll: catches programmatic scrolls / capture tools
    // that don't emit scroll events (querySelector no-ops once all shown)
    const poll = setInterval(scan, 220);
    return () => {
      clearInterval(poll);
      window.removeEventListener("scroll", scan);
      window.removeEventListener("resize", scan);
    };
  }, [dep]);
}

function Trebol({ size = 16 }) {
  return <img src="assets/trebol-tres.svg" width={size} height={size} alt="" style={{ verticalAlign: "middle" }} />;
}

function DayNight({ theme, onToggle }) {
  return (
    <button className="daynight" onClick={onToggle} aria-label="Cambiar entre día y noche" title="Día / Noche">
      <span className="d-day" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2"/>
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>
        </svg>
      </span>
      <span className="d-night" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>
        </svg>
      </span>
    </button>
  );
}

function Masthead({ route, go, theme, onTheme }) {
  return (
    <header className="mast">
      <div className="shell">
        <div className="mast-row">
          <a className="wordmark" onClick={() => go("home")}>Sale<span className="hoy">Hoy</span></a>
          <nav className="mast-nav">
            <button className={"mast-link" + (route === "edition" ? " is-active" : "")} onClick={() => go("edition")}>Ediciones</button>
            <button className="mast-link nav-hideable" onClick={() => go("home", "#sala")}>La sala</button>
            <button className="mast-link nav-hideable" onClick={() => go("home", "#sobre")}>Sobre</button>
          </nav>
          <div className="mast-right">
            <button className="mast-cta nav-hideable" onClick={() => go("home", "#newsletter")}>Newsletter</button>
            <DayNight theme={theme} onToggle={onTheme} />
          </div>
        </div>
        {route === "home" && (
          <div className="mast-sub">
            <span>Edición #01 · La quiniela al diván</span>
            <span>Editor · Juan Boas</span>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- Home hero — horizontal cover (vertical on mobile) ---------- */
function Hero({ go }) {
  return (
    <section className="hero hero-desktop">
      <img className="hero-img show-desktop" src="images/portada-01-horizontal.png" alt="Portada de la edición #01 de SaleHoy: un bodegón de objetos del juego argentino." />
      <img className="hero-img show-mobile"  src="images/portada-01-vertical.png"  alt="Portada de la edición #01 de SaleHoy." />
      <div className="hero-scrim-top"></div>
      <div className="hero-scrim-bot"></div>
      <div className="hero-content">
        <div className="hero-wordmark">Sale<span className="hoy">Hoy</span></div>
        <div className="hero-foot">
          <span className="hero-eyebrow"><span>Última edición</span> · <span className="tag-num">#01</span> · La quiniela al diván</span>
          <a className="btn-enter" onClick={() => go("edition")}>Entrar a la edición <span className="arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Article card ---------- */
function ArticleCard({ a, feature }) {
  const n = window.SH.NARR[a.narr];
  return (
    <article className={"card reveal" + (feature ? " card-feature" : "")}>
      <div className="card-illo">
        <div className="illo-ground"></div>
        <img className="orn" src={n.orn} alt="" style={{ position: "relative" }} />
      </div>
      <span className="card-eyebrow" style={{ color: n.accent }}>{a.eyebrow}</span>
      <h3 className="card-title">{a.title}</h3>
      <p className="card-deck">{a.deck}</p>
      <span className="card-byline" style={{ color: n.accent }}>
        <span className="dot" style={{ background: n.accent }}></span>
        {n.name} · <span style={{ color: "var(--cuero)" }}>{n.role}</span>
      </span>
    </article>
  );
}

function FeaturedGrid() {
  const arts = window.SH.ARTICLES;
  return (
    <section className="section" id="sumario">
      <div className="shell">
        <div className="section-head reveal">
          <div className="lhs">
            <span className="eyebrow">El sumario · edición #01</span>
            <h2 className="section-h">Cinco maneras de mirar un número</h2>
          </div>
          <p className="section-sub" style={{ maxWidth: "30ch" }}>Cinco oficios alrededor de la misma mesa. No se ponen de acuerdo.</p>
        </div>
        <div className="grid-feat">
          {arts.map((a, i) => <ArticleCard key={a.id} a={a} feature={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- La sala ---------- */
function Sala({ go }) {
  return (
    <section className="section sala" id="sala">
      <div className="shell">
        <div className="sala-head reveal">
          <div className="lhs" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="eyebrow">La sala · zona viva</span>
            <h2 className="section-h">Pasá a la sala</h2>
            <p className="section-sub">Cuatro dispositivos que responden. Atrás del vidrio, un poco de arcade.</p>
          </div>
          <button className="btn-ink" onClick={() => go("home", "#sala")}>Entrar a La sala <span className="arrow">→</span></button>
        </div>
        <div className="sala-grid">
          {window.SH.SALA.map((s, i) => (
            <article key={s.id} className="sala-card reveal" style={{ transitionDelay: (i * 60) + "ms" }}>
              <span className="crt">{s.crt}</span>
              <span className="num">Nº 0{i + 1}</span>
              <h3 className="sala-name">{s.name}</h3>
              <p className="sala-what">{s.what}</p>
              <span className="sala-go">Probar →</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Newsletter ---------- */
function Newsletter() {
  const [sent, setSent] = useState(false);
  return (
    <section className="section news" id="newsletter">
      <div className="shell" style={{ maxWidth: 720 }}>
        <div className="reveal">
          <span className="eyebrow">Suscripción quincenal</span>
          <h2 className="section-h" style={{ margin: "12px auto 0", maxWidth: "18ch" }}>Te llega cada quince días, un sábado a la tarde.</h2>
          <p className="section-sub" style={{ margin: "12px auto 0", maxWidth: "44ch" }}>Nunca publicidad. Nunca el correo a terceros. Una sola lista, un solo editor.</p>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input placeholder="lector@salehoy.ar" aria-label="Tu correo" />
            <button type="submit" className="btn-ink">{sent ? "Anotado ✓" : "Suscribirme"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer({ go }) {
  const cols = [
    { h: "Editorial", l: ["La portada", "Ediciones", "Los narradores", "El archivo"] },
    { h: "La sala", l: ["La Data", "El Anecdotario", "Máquina de Frases", "La Ruleta"] },
    { h: "Info", l: ["Sobre la revista", "Línea editorial", "Si necesitás ayuda", "Contacto"] },
  ];
  return (
    <footer className="foot" id="sobre">
      <div className="shell">
        <div className="foot-grid">
          <div>
            <div className="wordmark" style={{ fontSize: 28 }}>Sale<span className="hoy">Hoy</span></div>
            <p className="foot-tag">Revista cultural del juego y el azar. Editorial quincenal.</p>
            <p className="foot-license">CC BY-NC-SA 4.0 · Editor: Juan Boas</p>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <h4>{c.h}</h4>
              <ul>{c.l.map(i => <li key={i} onClick={() => i === "Ediciones" ? go("edition") : null}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ---------- Edition page ---------- */
function EditionCover() {
  return (
    <section className="ed-cover">
      <img className="hero-img show-desktop" src="images/portada-01-horizontal.png" alt="Portada de la edición #01 de SaleHoy." />
      <img className="hero-img show-mobile"  src="images/portada-01-vertical.png"  alt="Portada de la edición #01 de SaleHoy." />
      <div className="hero-scrim-top"></div>
      <div className="hero-scrim-bot"></div>
      <div className="ed-content">
        <div className="hero-wordmark" style={{ fontSize: 22 }}>Sale<span className="hoy">Hoy</span></div>
        <div>
          <span className="hero-eyebrow" style={{ marginBottom: 16, display: "inline-flex" }}>Edición <span className="tag-num">#01</span> · Mayo 2026</span>
          <h1 className="ed-title">La quiniela al diván</h1>
          <p className="ed-deck">El número que se sueña, se anota y se cobra — y lo que ese gesto dice de un país que aprendió a conversar con el azar.</p>
          <div className="ed-scroll-hint"><span>Seguí leyendo</span> <span>↓</span></div>
        </div>
      </div>
    </section>
  );
}

function EditorLetter() {
  return (
    <section className="section" style={{ borderTop: "none" }}>
      <div className="shell letter">
        <div className="reveal" style={{ textAlign: "center", marginBottom: 30 }}>
          <span className="provisional">Texto provisional</span>
          <div><span className="eyebrow">Carta del editor</span></div>
          <h2 className="section-h" style={{ margin: "10px 0 0" }}>Pasen, la cocina está abierta</h2>
        </div>
        <div className="orn-rule reveal"><img src="assets/ornament-rule.svg" alt="" /></div>
        <div className="sh-prose sh-has-dropcap reveal">
          {window.SH.EDITOR_LETTER.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="letter-sign reveal">
          Juan Boas
          <span className="role">Editor · SaleHoy</span>
        </div>
      </div>
    </section>
  );
}

function EditionArticles() {
  const arts = window.SH.ARTICLES;
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head reveal">
          <div className="lhs">
            <span className="eyebrow">Las cinco notas</span>
            <h2 className="section-h">En esta edición</h2>
          </div>
        </div>
        <div className="grid-feat">
          {arts.map((a, i) => <ArticleCard key={a.id} a={a} feature={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  useReveal, Trebol, DayNight, Masthead,
  Hero, ArticleCard, FeaturedGrid, Sala, Newsletter, Footer,
  EditionCover, EditorLetter, EditionArticles,
});
