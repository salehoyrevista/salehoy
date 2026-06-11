// SaleHoy · app — routing (home / edición), día-noche, tweaks, reveal.
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroOverlay": 1,
  "heroTitle": 1,
  "gridGap": 28
}/*EDITMODE-END*/;

function parseRoute() {
  const h = window.location.hash.replace(/^#/, "");
  if (h.startsWith("ediciones")) return "edition";
  return "home";
}

function App() {
  const [route, setRoute] = useState(parseRoute());
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("sh-theme") || "light"; } catch (e) { return "light"; }
  });
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("sh-theme", theme); } catch (e) {}
  }, [theme]);

  // apply tweaks as CSS variables
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--hero-overlay", String(t.heroOverlay));
    r.setProperty("--hero-title-scale", String(t.heroTitle));
    r.setProperty("--grid-gap", t.gridGap + "px");
  }, [t.heroOverlay, t.heroTitle, t.gridGap]);

  // routing
  useEffect(() => {
    const onHash = () => { setRoute(parseRoute()); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useReveal(route);

  const go = (r, anchor) => {
    const targetHash = r === "edition" ? "ediciones/01" : "";
    if (parseRoute() !== r || (r === "home" && parseRoute() === "home")) {
      window.location.hash = targetHash;
    }
    // scroll behaviour
    requestAnimationFrame(() => {
      if (anchor) {
        const el = document.querySelector(anchor);
        if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" }); return; }
      }
      window.scrollTo({ top: 0, behavior: r !== parseRoute() ? "auto" : "smooth" });
    });
  };

  const toggleTheme = () => setTheme(p => p === "dark" ? "light" : "dark");

  // reset scroll on route change
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const forceMobile = /[?&]m=1/.test(window.location.search) || /(^|&)m=1/.test(window.location.hash);

  return (
    <div className={"app" + (forceMobile ? " is-mobile" : "")}>
      <Masthead route={route} go={go} theme={theme} onTheme={toggleTheme} />
      {route === "edition" ? (
        <main key="edition">
          <EditionCover />
          <EditorLetter />
          <EditionArticles />
          <Newsletter />
        </main>
      ) : (
        <main key="home">
          <Hero go={go} />
          <FeaturedGrid />
          <Sala go={go} />
          <Newsletter />
        </main>
      )}
      <Footer go={go} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Portada (hero)" />
        <TweakSlider label="Intensidad del velo" value={t.heroOverlay} min={0.2} max={1.6} step={0.05}
                     onChange={(v) => setTweak('heroOverlay', v)} />
        <TweakSlider label="Tamaño del título" value={t.heroTitle} min={0.8} max={1.35} step={0.01} unit="×"
                     onChange={(v) => setTweak('heroTitle', v)} />
        <TweakSection label="Grilla de artículos" />
        <TweakSlider label="Espaciado" value={t.gridGap} min={14} max={48} step={1} unit="px"
                     onChange={(v) => setTweak('gridGap', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
