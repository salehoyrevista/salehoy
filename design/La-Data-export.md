# La Data — Export de código fuente

Estado exacto del proyecto al 10/06/2026. Copiado verbatim, sin modificaciones.

## Nota sobre los datos

No existen archivos `2026-05.datos.json` ni `2026-05.textos.json`. Los datos y textos de mayo 2026 viven **inline dentro de los componentes**:

- **Series del gráfico** (top 10 por zona a 2/3/4 cifras, períodos, sorteos): `DIGIT_DATA`, `CHART_PERIODS`, `CHART_SORTEOS` en `LineChart.jsx`.
- **Datos y prosa de Buenos Aires y Córdoba** (top5, bottom5, décadas, vs promedio, aperturas, temas editoriales, cajas doradas, cierres): objeto `ZONA_DATA` en `ZonaInterior.jsx`.
- **Datos y prosa de Nacional**: inline en `Nacional.jsx`.
- **Titular, ticker y meta de portada**: inline en `Portada.jsx`.
- **Tablas cruzadas comparativas** (top5 paralelos, promedios a primera, desviación por década) y cierre editorial: inline en `Comparativa.jsx`.

## Dependencias incluidas (además de los cinco pedidos)

- `Nacional.jsx` — ZonaInterior.jsx usa `ControlGroup` y `CornerOrnament`, definidos y exportados a `window` aquí.
- `index.html` — router por estado, orden de carga de los scripts Babel y wiring de zonas.
- `colors_and_type.css` — tokens de color/tipografía (`var(--*)`) que consumen todos los componentes.

---

===== Components.jsx =====

```jsx
// SaleHoy · La Sala · La Data — shared components
// Estética: terminal financiera editorial. Bloomberg filtrado por Spectral.
// Autor de la sección: Tomás Vera (El Matemático).

const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   PALETAS POR ZONA — definidas como constantes, no como tokens.
   La regla "un acento por pantalla" del DS se mantiene a nivel
   de zona: cada zona reemplaza el acento global con el suyo.
   ============================================================ */
const ZONES = {
  nacional: {
    id: "nacional",
    label: "QUINIELA NACIONAL",
    sub: "Ver el balance del mes",
    bg: "#0F1730",            // azul profundo (más sobrio que #1A1A2E)
    bgDeep: "#070C1C",
    fg: "#E8E2D1",            // crema sobre azul
    fgMuted: "#8892AE",
    accent: "#5BD37A",        // verde terminal AA (no fluor lurido)
    accentDim: "#2E7A47",
  },
  bsas: {
    id: "bsas",
    label: "QUINIELA DE BUENOS AIRES",
    sub: "Análisis bonaerense",
    bg: "#2A1A0E",            // marrón profundo porteño
    bgDeep: "#1A0F08",
    fg: "#F0E4CB",
    fgMuted: "#A6896C",
    accent: "#D4A574",        // ámbar
    accentDim: "#8A6B45",
  },
  cordoba: {
    id: "cordoba",
    label: "QUINIELA DE CÓRDOBA",
    sub: "Mirada del interior",
    bg: "#162922",            // verde oscuro sierras
    bgDeep: "#0C1A14",
    fg: "#E4E0D0",
    fgMuted: "#7A9088",
    accent: "#7FB8C9",        // celeste técnico
    accentDim: "#4A7E8C",
  },
  comparativa: {
    id: "comparativa",
    label: "LAS TRES COMPARADAS",
    sub: "El cruce del mes",
    bg: "#F5F1E8",            // blanco hueso
    bgDeep: "#ECE6D5",
    fg: "#1A1A1A",
    fgMuted: "#6B6358",
    accent: null,             // sin acento único: usa los tres
    accentDim: null,
  },
};

/* ============================================================
   Frame del dispositivo — coherente con La Vichy pero más ancho
   y con la marquesina como banda superior.
   ============================================================ */
function DataDeviceFrame({ children, edition = "Edición #02" }) {
  return (
    <article style={{
      background: "var(--paper-warmer)",
      border: "1px solid var(--ink)",
      maxWidth: 1180,
      margin: "20px auto 56px",
      position: "relative",
    }}>
      <header style={{
        padding: "10px 22px",
        borderBottom: "1px solid var(--rule)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16,
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cuero)",
        }}>
          <img src="../assets/logo-ladata-pizarra.png" alt="La Data"
            style={{ height: 26, width: "auto", display: "block", mixBlendMode: "multiply" }} />
          <span style={{ width: 1, height: 16, background: "var(--rule)", display: "inline-block" }}></span>
          La sala · dispositivo
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)",
          letterSpacing: "0.02em",
        }}>{edition} · Tomás Vera</span>
      </header>
      {children}
    </article>
  );
}

/* ============================================================
   Breadcrumb
   ============================================================ */
function Breadcrumb({ trail }) {
  // trail: array of strings. Last item is current (no link styling).
  return (
    <nav aria-label="Ubicación" style={{
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: "var(--cuero)", padding: "16px 28px 0",
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
    }}>
      <span style={{ color: "var(--cuero)" }}>★</span>
      {trail.map((item, i) => (
        <React.Fragment key={i}>
          <span style={{
            color: i === trail.length - 1 ? "var(--ink)" : "var(--cuero)",
            fontWeight: i === trail.length - 1 ? 600 : 500,
          }}>{item}</span>
          {i < trail.length - 1 && (
            <span style={{ color: "var(--ink-line)" }}>›</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ============================================================
   Marquesina terminal — banda oscura con monoespaciado + cursor
   ============================================================ */
function MarqueeTerminal({ text }) {
  return (
    <div style={{
      background: "#0F1730",
      color: "#E8E2D1",
      padding: "10px 22px",
      borderTop: "1px solid var(--ink)",
      borderBottom: "1px solid var(--ink)",
      fontFamily: "var(--font-mono)", fontSize: 13,
      letterSpacing: "0.04em",
      display: "flex", alignItems: "center", gap: 12,
      overflow: "hidden",
      whiteSpace: "nowrap",
    }}>
      <span style={{ color: "#5BD37A", fontSize: 11 }}>●</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
      <span className="ld-cursor" style={{
        display: "inline-block", width: 9, height: 16,
        background: "#5BD37A", verticalAlign: "middle",
      }}></span>
    </div>
  );
}

/* ============================================================
   Display del titular del mes — caja crema con número rojo
   ============================================================ */
function TitularDelMes({ leading, highlight, trailing, delta, caption }) {
  return (
    <div style={{
      border: "1px solid var(--cuero)",
      background: "var(--paper-warmer)",
      padding: "26px 28px",
      display: "flex", flexDirection: "column", gap: 14,
      position: "relative",
    }}>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--cuero)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ width: 18, height: 1, background: "var(--cuero)" }}></span>
        Titular del mes · mayo 2026 · adelanto
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 24, lineHeight: 1.22,
        fontWeight: 500, color: "var(--ink)", letterSpacing: "0.01em",
      }}>
        {leading}
        {" "}
        <span style={{ color: "var(--rojo)", fontWeight: 600 }}>{highlight}</span>
        {" "}
        {trailing}
      </div>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 14,
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: "var(--ink-muted)",
      }}>
        <span style={{
          color: "#1F8550", fontWeight: 600, letterSpacing: "0.04em",
        }}>{delta}</span>
        <span>{caption || "respecto del promedio teórico"}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Zone button — 4 variantes con paleta propia
   ============================================================ */
function ZoneButton({ zone, onClick, icon, large = false }) {
  const z = ZONES[zone];
  const [hover, setHover] = useState(false);

  // Comparativa is special: blanco hueso w/ tres colores borde
  const isComparativa = zone === "comparativa";

  const borderColor = isComparativa
    ? "transparent"
    : hover ? z.accent : "transparent";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: z.bg,
        color: z.fg,
        border: `1px solid ${isComparativa ? "var(--ink)" : z.bgDeep}`,
        outline: `1px solid ${borderColor}`,
        outlineOffset: "-3px",
        padding: large ? "32px 28px 24px" : "24px 22px 20px",
        minHeight: large ? 200 : 160,
        cursor: "pointer",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        textAlign: "left",
        transition: "outline-color var(--dur-fast) var(--ease-editorial), transform var(--dur-fast) var(--ease-editorial)",
        position: "relative",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Esquina top right: ticker decoration */}
      <div style={{
        position: "absolute", top: 14, right: 18,
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: isComparativa ? "var(--ink-muted)" : z.fgMuted,
        letterSpacing: "0.06em",
      }}>
        {isComparativa ? "/ X3" : `/ ${String(zone).substring(0, 3).toUpperCase()}`}
      </div>

      {/* Icon */}
      <div style={{
        color: isComparativa ? "var(--cuero)" : z.accent,
        marginBottom: 18, height: 44, display: "flex", alignItems: "flex-end",
      }}>
        {icon}
      </div>

      {/* Bottom area: label + sub */}
      <div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: large ? 16 : 14,
          fontWeight: 600,
          color: isComparativa ? "var(--ink)" : z.fg,
          letterSpacing: "0.04em",
          marginBottom: 6,
        }}>{z.label}</div>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 13,
          color: isComparativa ? "var(--ink-muted)" : z.fgMuted,
          letterSpacing: "0.01em",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 12,
        }}>
          <span>{z.sub}</span>
          <span style={{
            color: isComparativa ? "var(--ink)" : z.accent,
            fontFamily: "var(--font-mono)", fontSize: 14,
          }}>→</span>
        </div>

        {/* Comparativa special: three accent bars */}
        {isComparativa && (
          <div style={{
            display: "flex", gap: 0, marginTop: 14, height: 4,
          }}>
            <div style={{ flex: 1, background: ZONES.nacional.accent }}></div>
            <div style={{ flex: 1, background: ZONES.bsas.accent }}></div>
            <div style={{ flex: 1, background: ZONES.cordoba.accent }}></div>
          </div>
        )}
      </div>
    </button>
  );
}

/* ============================================================
   Iconos a línea — minimalistas, una sola línea de stroke
   ============================================================ */
const ZoneIcons = {
  nacional: ( // sol con rayos (bandera)
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <circle cx="22" cy="22" r="6.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(d => {
        const r1 = 10, r2 = 16;
        const rad = (d * Math.PI) / 180;
        return <line key={d} x1={22 + r1 * Math.cos(rad)} y1={22 + r1 * Math.sin(rad)} x2={22 + r2 * Math.cos(rad)} y2={22 + r2 * Math.sin(rad)} />;
      })}
    </svg>
  ),
  bsas: ( // obelisco
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <line x1="22" y1="4" x2="18" y2="36" />
      <line x1="22" y1="4" x2="26" y2="36" />
      <line x1="18" y1="36" x2="26" y2="36" />
      <line x1="14" y1="40" x2="30" y2="40" />
      <line x1="20" y1="20" x2="24" y2="20" />
    </svg>
  ),
  cordoba: ( // sierras
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 4 34 L 12 22 L 18 28 L 24 18 L 30 26 L 36 16 L 40 22 L 40 34 Z" />
      <line x1="4" y1="38" x2="40" y2="38" />
    </svg>
  ),
  comparativa: ( // tres barras
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <line x1="10" y1="32" x2="10" y2="20" />
      <line x1="22" y1="32" x2="22" y2="10" />
      <line x1="34" y1="32" x2="34" y2="24" />
      <line x1="4" y1="36" x2="40" y2="36" />
    </svg>
  ),
};

/* ============================================================
   Ticker horizontal animado
   ============================================================ */
function Ticker({ items }) {
  // items: [{ num, count, delta }]
  const stream = items.concat(items).concat(items); // triplicate for seamless loop
  return (
    <div style={{
      background: "#0A1020",
      border: "1px solid var(--ink)",
      overflow: "hidden",
      position: "relative",
      height: 48,
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 110, background: "linear-gradient(90deg, #0A1020 60%, transparent)",
        zIndex: 2, display: "flex", alignItems: "center", padding: "0 16px",
        pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.14em", color: "#5BD37A",
        }}>● LIVE</span>
      </div>
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: 80, background: "linear-gradient(270deg, #0A1020 60%, transparent)",
        zIndex: 2, pointerEvents: "none",
      }}></div>
      <div className="ld-ticker-track" style={{
        position: "absolute", top: 0, left: 0,
        height: "100%", display: "flex", alignItems: "center",
        whiteSpace: "nowrap",
      }}>
        {stream.map((it, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)", fontSize: 14,
            color: "#E8E2D1", padding: "0 22px",
            display: "inline-flex", alignItems: "baseline", gap: 8,
          }}>
            <span style={{ color: "#E8E2D1", fontWeight: 500 }}>{it.num}</span>
            <span style={{ color: "#5BD37A", fontSize: 12 }}>{it.delta}</span>
            <span style={{ color: "#8892AE", fontSize: 11 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Firma del autor — pie editorial
   ============================================================ */
function SignatureFoot({ edition = "Edición #02" }) {
  return (
    <div style={{
      padding: "20px 28px 26px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderTop: "1px solid var(--rule)",
      gap: 16, flexWrap: "wrap",
    }}>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 12,
        color: "var(--cuero)", letterSpacing: "0.04em",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <img src="../assets/ornamento-barras.svg" alt="" width="14" height="14" />
        <span>Por <span style={{ color: "var(--ink)", fontWeight: 600 }}>Tomás Vera</span> · El Matemático · {edition}</span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--ink-muted)", letterSpacing: "0.02em",
      }}>
        cierre · 23 may 2026 · 21:30 ART
      </div>
    </div>
  );
}

/* ============================================================
   Pie permanente — aviso Sedronar
   ============================================================ */
function SedronarNote() {
  return (
    <div style={{
      borderTop: "1px solid var(--ink-line)",
      padding: "10px 28px",
      textAlign: "center",
      fontFamily: "var(--font-sans)", fontSize: 11,
      color: "var(--cuero)", letterSpacing: "0.02em",
      background: "var(--paper-warm)",
    }}>
      La Data es análisis cultural, no soplo. Si te preocupa cómo jugás, hablá con alguien. Línea Sedronar 141.
    </div>
  );
}

/* ============================================================
   Zone header — banda full-bleed con paleta de la zona
   ============================================================ */
function ZoneHeader({ zone, period = "MAYO 2026", chips, sub }) {
  const z = ZONES[zone];
  return (
    <header style={{
      background: z.bg,
      color: z.fg,
      padding: "22px 28px",
      borderTop: "1px solid var(--ink)",
      borderBottom: "1px solid var(--ink)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 24, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ color: z.accent, fontSize: 12 }}>●</span>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600,
            letterSpacing: "0.04em", color: z.fg,
          }}>{z.label.replace(/ DE /g, " · ").replace(/QUINIELA /, "QUINIELA ")} · {period}</div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 11,
            color: z.fgMuted, letterSpacing: "0.1em",
            textTransform: "uppercase", marginTop: 4,
          }}>{sub || "Adelanto · 5 días · 25 sorteos · 500 extracciones"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(chips || []).map((c, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            background: "transparent",
            color: z.accent,
            padding: "5px 12px",
            border: `1px solid ${z.accent}`,
            letterSpacing: "0.04em",
          }}>{c}</span>
        ))}
      </div>
    </header>
  );
}

/* ============================================================
   Stat card — tarjeta de dato genérica
   ============================================================ */
function StatCard({ title, subtitle, accent = "var(--rojo)", children }) {
  return (
    <div style={{
      background: "var(--paper-warmer)",
      border: "1px solid var(--ink-line)",
      padding: "20px 22px 22px",
      display: "flex", flexDirection: "column", gap: 16,
      minHeight: 220,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 12,
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--cuero)",
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13,
              color: "var(--ink-muted)", marginTop: 4,
            }}>{subtitle}</div>
          )}
        </div>
        <span style={{
          width: 6, height: 6, borderRadius: 1, background: accent,
          flexShrink: 0, marginTop: 6,
        }}></span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

/* Ranked list (Top 5, Bottom 5) */
function RankedList({ items, accent = "var(--rojo)", direction = "down" }) {
  // items: [{ num, count }]
  return (
    <ol style={{
      listStyle: "none", padding: 0, margin: 0,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {items.map((it, i) => (
        <li key={i} style={{
          display: "flex", alignItems: "baseline", gap: 12,
          paddingBottom: 6,
          borderBottom: i === items.length - 1 ? "none" : "1px dotted var(--ink-line)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-muted)", width: 18,
            letterSpacing: "0.04em",
          }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600,
            color: "var(--ink)", letterSpacing: "-0.01em",
            flex: 1,
          }}>{it.num}</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: accent,
            letterSpacing: "0.02em",
          }}>{direction === "down" ? "▲" : "▼"} {it.count}</span>
        </li>
      ))}
    </ol>
  );
}

/* Mini bar chart for decade distribution */
function DecadeBars({ data, accent = "var(--rojo)" }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, height: "100%", justifyContent: "center" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-muted)", width: 40,
            letterSpacing: "0.02em",
          }}>{d.label}</span>
          <div style={{ flex: 1, height: 8, background: "var(--paper-darker)", position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${(d.value / max) * 100}%`,
              background: i === d.peak ? accent : "var(--cuero)",
              transition: "width var(--dur-base) var(--ease-editorial)",
            }}></div>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink)", width: 24, textAlign: "right",
            fontWeight: 500,
          }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

/* VS Promedio — arrows up/down for select numbers */
function VsPromedio({ items, accent = "var(--rojo)" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11, justifyContent: "center", height: "100%" }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          paddingBottom: 7,
          borderBottom: i === items.length - 1 ? "none" : "1px dotted var(--ink-line)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600,
            color: "var(--ink)",
          }}>{it.num}</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: it.dir === "up" ? "#1F8550" : "var(--rojo)",
            letterSpacing: "0.02em",
            display: "inline-flex", alignItems: "baseline", gap: 6,
          }}>
            <span style={{ fontSize: 11 }}>{it.dir === "up" ? "▲" : "▼"}</span>
            {it.delta}
          </span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  ZONES, DataDeviceFrame, Breadcrumb, MarqueeTerminal, TitularDelMes,
  ZoneButton, ZoneIcons, Ticker, SignatureFoot, SedronarNote,
  ZoneHeader, StatCard, RankedList, DecadeBars, VsPromedio,
});
```

===== Portada.jsx =====

```jsx
// SaleHoy · La Data · Portada
// Cover screen: marquesina, título, bajada, titular del mes, grilla 2x2 de zonas, ticker, firma.

const { useEffect: useEffectP } = React;

function Portada({ onOpenZone }) {
  return (
    <DataDeviceFrame>
      <Breadcrumb trail={["LA SALA", "LA DATA"]} />

      {/* Marquesina debajo del breadcrumb, dentro del frame */}
      <div style={{ marginTop: 14 }}>
        <MarqueeTerminal text="LA DATA · INFORME MENSUAL DE LA QUINIELA · MAYO 2026 · ADELANTO 30 ABR → 23 MAY · POR TOMÁS VERA" />
      </div>

      <div style={{
        padding: "44px 56px 36px",
        display: "grid",
        gridTemplateColumns: "1.05fr 1fr",
        gap: 56,
        alignItems: "start",
      }}
      className="ld-portada-head">
        {/* Izquierda — identidad del dispositivo + bajada */}
        <div>
          <span className="sh-section-label" style={{ color: "var(--cuero)" }}>
            Dispositivo de La Sala · 02
          </span>
          <img className="ld-pizarra" src="../assets/logo-ladata-pizarra.png"
            alt="SaleHoy · La Data"
            style={{
              display: "block", width: "100%", maxWidth: 440, height: "auto",
              margin: "14px 0 18px", mixBlendMode: "multiply",
            }} />
          <p style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: 22, lineHeight: 1.3,
            color: "var(--ink-soft)", margin: "0 0 26px",
            maxWidth: "20ch",
          }}>Informe mensual de la Quiniela argentina.</p>
          <div style={{
            width: 56, height: 1, background: "var(--ink)", marginBottom: 22,
          }}></div>
          <p style={{
            fontFamily: "var(--font-serif)", fontSize: 18,
            lineHeight: 1.55, color: "var(--ink-soft)",
            margin: 0, maxWidth: "36ch",
          }}>
            Análisis estadístico mes a mes. Nacional, Buenos Aires, Córdoba y la
            comparación entre las tres. No damos picks. Mostramos qué pasó, en números.
          </p>
        </div>

        {/* Derecha — titular del mes en una caja terminal */}
        <div style={{ paddingTop: 18 }}>
          <TitularDelMes
            leading="LAS TRES QUINIELAS NO COINCIDIERON EN"
            highlight="NINGÚN"
            trailing="NÚMERO DEL TOP 10 ESTE MES"
            delta="0 / 30"
            caption="coincidencias entre Nacional, BA y Córdoba"
          />

          {/* Mini meta debajo */}
          <div style={{
            marginTop: 14, padding: "14px 4px 0",
            borderTop: "1px dotted var(--ink-line)",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14, fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-muted)",
          }}>
            <div>
              <div style={{ color: "var(--cuero)", fontSize: 9, letterSpacing: "0.12em", marginBottom: 2 }}>SORTEOS</div>
              <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 500 }}>297</div>
            </div>
            <div>
              <div style={{ color: "var(--cuero)", fontSize: 9, letterSpacing: "0.12em", marginBottom: 2 }}>EXTRACCIONES</div>
              <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 500 }}>~5 940</div>
            </div>
            <div>
              <div style={{ color: "var(--cuero)", fontSize: 9, letterSpacing: "0.12em", marginBottom: 2 }}>ZONAS</div>
              <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 500 }}>04</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divisor editorial */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "0 56px 26px", gap: 18,
      }}>
        <span style={{ flex: 1, height: 1, background: "var(--ink-line)" }}></span>
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--cuero)",
        }}>Cuatro zonas · una mesa</span>
        <span style={{ flex: 1, height: 1, background: "var(--ink-line)" }}></span>
      </div>

      {/* Grilla 2x2 de zone buttons */}
      <div className="ld-zone-grid" style={{
        padding: "0 56px 36px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}>
        <ZoneButton zone="nacional"    icon={ZoneIcons.nacional}    onClick={() => onOpenZone("nacional")} />
        <ZoneButton zone="bsas"        icon={ZoneIcons.bsas}        onClick={() => onOpenZone("bsas")} />
        <ZoneButton zone="cordoba"     icon={ZoneIcons.cordoba}     onClick={() => onOpenZone("cordoba")} />
        <ZoneButton zone="comparativa" icon={ZoneIcons.comparativa} onClick={() => onOpenZone("comparativa")} />
      </div>

      {/* Ticker */}
      <div style={{ padding: "0 56px 18px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 10,
        }}>
          <span className="sh-section-label">Calientes por zona · adelanto de mayo</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-muted)", letterSpacing: "0.06em",
          }}>ACTUALIZADO 23/05/26 21:30 ART</span>
        </div>
        <Ticker items={[
          { num: "NAC · 47", delta: "+67%" },
          { num: "BA · 89",  delta: "+82%" },
          { num: "CBA · 80", delta: "+62%" },
          { num: "BA · 91",  delta: "+77%" },
          { num: "CBA · 04", delta: "+46%" },
          { num: "NAC · 11", delta: "+46%" },
        ]} />
      </div>

      {/* Footnote editorial — small italic about what La Data is and isn't */}
      <div style={{
        padding: "10px 56px 20px",
        fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13,
        color: "var(--ink-muted)", textAlign: "center",
        maxWidth: 720, margin: "0 auto",
      }}>
        La Data es un dispositivo de lectura. No publicamos predicciones, ni recomendaciones.
        Si querés mirar lo que pasó, entrá a cualquiera de las cuatro zonas.
      </div>

      <SignatureFoot />
      <SedronarNote />
    </DataDeviceFrame>
  );
}

window.Portada = Portada;
```

===== ZonaInterior.jsx =====

```jsx
// SaleHoy · La Data · Zona interior genérica (Buenos Aires y Córdoba)
// Reusa el layout de Nacional pero alimentado por un objeto de configuración por zona.
// Demuestra que el frame escala: misma estructura, distinta paleta y distintos datos.

const { useState: useStateZ } = React;

/* Mono inline helper — número en JetBrains Mono dentro de prosa Spectral */
function Mono({ children, color = "var(--ink)" }) {
  return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color }}>{children}</span>;
}

/* ============================================================
   Configuración de datos por zona — mayo 2026 (adelanto 30/4 → 23/5)
   ============================================================ */
const ZONA_DATA = {
  bsas: {
    breadcrumb: "BUENOS AIRES",
    marquee: "ZONA BUENOS AIRES · MAYO 2026 · ADELANTO 30 ABR → 23 MAY · 99 SORTEOS · ~1 980 EXTRACCIONES · ÚLTIMA ACT. 23/05/26 21:30",
    period: "MAYO 2026 · ADELANTO",
    headerSub: "99 sorteos · ~1 980 extracciones · 5 horarios",
    chips: ["PRE", "1RA", "MAT", "VES", "NOC"],
    aperturaTitle: "En Buenos Aires, la década del 80 se puso a trabajar.",
    apertura: [
      <>En Buenos Aires pasa algo distinto. La década del 80 está caliente: <Mono>234</Mono> apariciones
      contra las <Mono>171</Mono> de la década 00–09. Casi 40% de diferencia. Y cuatro de los cinco
      números más salidos del mes pertenecen a esa zona: el <Mono>89</Mono>, el <Mono>91</Mono>,
      el <Mono>78</Mono>, el <Mono>81</Mono>.</>,
      <>Eso ya no es estadística pareja: es algo que el azar decidió hacer. ¿Significa que conviene
      jugar al 89 el viernes que viene? No. La estadística no funciona así. Lo que pasó pasó; lo que
      viene es independiente.</>,
      <>Pero a tres cifras aparece un dato más fino: el <Mono>989</Mono> salió ocho veces. Está cerca
      del 89 caliente, comparte estructura. ¿Coincidencia? Probablemente. Pero los patrones, cuando se
      ven, hay que nombrarlos.</>,
    ],
    resumen: [
      ["Sorteos procesados", "99"],
      ["Extracciones", "~1 980"],
      ["Más salido", "89 · 36× (+82%)"],
      ["Menos salido", "86 · 9×"],
      ["Década caliente", "80–89 (234)"],
      ["Década fría", "00–09 (171)"],
      ["Caliente a 3 cifras", "989 (8×)"],
    ],
    top5: [
      { num: "89", count: 36 },
      { num: "91", count: 35 },
      { num: "78", count: 35 },
      { num: "81", count: 34 },
      { num: "84", count: 32 },
    ],
    bottom5: [
      { num: "86", count: 9  },
      { num: "16", count: 10 },
      { num: "72", count: 10 },
      { num: "63", count: 11 },
      { num: "53", count: 11 },
    ],
    bottomSub: "El más frío apenas nueve apariciones en 24 días",
    decade: [
      { label: "00–09", value: 171, peak: false, low: true },
      { label: "10–19", value: 194, peak: false },
      { label: "20–29", value: 211, peak: false },
      { label: "30–39", value: 188, peak: false },
      { label: "40–49", value: 181, peak: false },
      { label: "50–59", value: 198, peak: false },
      { label: "60–69", value: 203, peak: false },
      { label: "70–79", value: 203, peak: false },
      { label: "80–89", value: 234, peak: true },
      { label: "90–99", value: 197, peak: false },
    ],
    decadeSub: "La del 80 caliente (234), la del 00 fría (171): 37% de diferencia",
    vsPromedio: [
      { num: "89", dir: "up",   delta: "+82%" },
      { num: "91", dir: "up",   delta: "+77%" },
      { num: "78", dir: "up",   delta: "+77%" },
      { num: "86", dir: "down", delta: "−55%" },
      { num: "16", dir: "down", delta: "−49%" },
    ],
    vsPromSub: "Variación respecto a 19,8 apariciones por número",
    chartTitle: "Frecuencia acumulada · top 10 bonaerense",
    temaTitle: "La década del 80, o cuando el azar dibuja un barrio.",
    temaDrop: "H",
    tema: [
      <>ay una tentación, cuando uno mira estos números, de contar una historia. La década del 80
      domina Buenos Aires este mes: <Mono>234</Mono> apariciones, contra las 171 de la década más
      floja. Treinta y siete por ciento de diferencia — la brecha más grande de las tres quinielas.
      Y los cuatro números más calientes del mes —el 89, el 91, el 78, el 81— viven todos ahí.</>,
      <>El cerebro humano está cableado para ver patrones. Cuatro números calientes en la misma
      década parece un mensaje. No lo es. La distribución uniforme, cortada a 24 días, produce estos
      racimos con total naturalidad. Si tirás cien dados, algunos números van a salir juntos. No se
      pusieron de acuerdo.</>,
      <>Lo que sí es legítimo señalar es la magnitud. Un 37% de brecha entre décadas es alto. En la
      Nacional, esa misma brecha fue del 16%. ¿Por qué Buenos Aires se desvía más? Probablemente
      nada. Probablemente la muestra. Pero es de las cosas que, mes a mes, vale la pena seguir.</>,
      "div",
      <>A tres cifras, el dato bonito: el <Mono>989</Mono> salió ocho veces. Comparte estructura con
      el 89 caliente —termina en 89, empieza en 9— y eso invita a fantasear con una conexión. No la
      hay, o no la podemos probar. Pero los patrones, cuando se ven, hay que nombrarlos. Nombrarlos
      no es creerles.</>,
      <>Buenos Aires también confirma algo que ya vimos: el rango 4000–5999 a primera está
      sobrerrepresentado. Esta vez con <Mono>26%</Mono>, contra el 20% esperado. No es para apostar.
      Es para mirar.</>,
    ],
    cifras: [
      {
        label: "989 · tres cifras",
        big: "8", bigSub: "× en el mes",
        prose: <>El <Mono color="var(--ink)">989</Mono> salió ocho veces sobre un universo de mil
        números. Comparte estructura con el 89, el más caliente a dos cifras. La coincidencia es
        elegante y casi seguramente vacía: el azar no lee los números, no sabe que el 989 «contiene»
        al 89. Pero el ojo sí lo ve, y por eso lo anotamos.</>,
      },
      {
        label: "4000–5999 a primera",
        big: "26%", bigSub: " / 20% teórico",
        prose: <>De los 99 números a primera, 26 cayeron entre 4000 y 5999. El teórico esperado es
        20%. Seis puntos por encima. En la Nacional este rango dio exacto (20%); en Córdoba, apenas
        por debajo (19%). Buenos Aires es la única de las tres con anomalía positiva clara. Para
        seguir, no para jugar.</>,
      },
    ],
    closeProse: <>Esta fue Buenos Aires de mayo: la quiniela con más carácter del mes. Si querés ver
    cómo se comportó Córdoba —que suma un sexto sorteo— o el cruce de las tres, seguí por ahí.</>,
  },

  cordoba: {
    breadcrumb: "CÓRDOBA",
    marquee: "ZONA CÓRDOBA · MAYO 2026 · ADELANTO 30 ABR → 23 MAY · 99 SORTEOS + 17 TURISTA · ÚLTIMA ACT. 23/05/26 22:30",
    period: "MAYO 2026 · ADELANTO",
    headerSub: "99 sorteos + 17 turista (22:15) · 6 horarios",
    chips: ["PRE", "1RA", "MAT", "VES", "NOC", "TUR"],
    aperturaTitle: "Córdoba juega un sorteo de más, y se nota.",
    apertura: [
      <>Córdoba tiene una particularidad operativa: además de los cinco sorteos que comparte con las
      otras dos, suma un sorteo turista a las 22:15. Eso le da una extracción más por día y, en este
      período, <Mono>17</Mono> sorteos turista para mirar aparte.</>,
      <>El <Mono>80</Mono> fue el caliente del mes en Córdoba: 32 apariciones. La década del 80, otra
      vez, aparece arriba. Pero la coincidencia con Buenos Aires se rompe rápido: en Córdoba, el 80
      viene acompañado por el <Mono>04</Mono>, el <Mono>94</Mono>, el <Mono>19</Mono>. Una mezcla
      rara.</>,
      <>En el top 10 cordobés hay ocho números que no aparecen en el top 10 de las otras dos. Cada
      quiniela, su universo.</>,
    ],
    resumen: [
      ["Sorteos procesados", "99 + 17 TUR"],
      ["Más salido", "80 · 32× (+62%)"],
      ["Acompañan al 80", "04 · 94 · 19"],
      ["Década caliente", "90–99 (215)"],
      ["Década fría", "60–69 (177)"],
      ["Caliente a 3 cifras", "540 · 665 (7×)"],
      ["Turista a primera", "4111 (anomalía)"],
    ],
    top5: [
      { num: "80", count: 32 },
      { num: "04", count: 29 },
      { num: "94", count: 28 },
      { num: "19", count: 27 },
      { num: "73", count: 27 },
    ],
    bottom5: [
      { num: "60", count: 11 },
      { num: "38", count: 12 },
      { num: "51", count: 12 },
      { num: "67", count: 13 },
      { num: "26", count: 13 },
    ],
    bottomSub: "Cola plausible — el recorte cordobés reparte parejo abajo",
    decade: [
      { label: "00–09", value: 202, peak: false },
      { label: "10–19", value: 194, peak: false },
      { label: "20–29", value: 198, peak: false },
      { label: "30–39", value: 194, peak: false },
      { label: "40–49", value: 184, peak: false },
      { label: "50–59", value: 198, peak: false },
      { label: "60–69", value: 177, peak: false, low: true },
      { label: "70–79", value: 210, peak: false },
      { label: "80–89", value: 208, peak: false },
      { label: "90–99", value: 215, peak: true },
    ],
    decadeSub: "La del 90 caliente (215), la del 60 fría (177): 21% de diferencia",
    vsPromedio: [
      { num: "80", dir: "up",   delta: "+62%" },
      { num: "04", dir: "up",   delta: "+46%" },
      { num: "94", dir: "up",   delta: "+41%" },
      { num: "60", dir: "down", delta: "−44%" },
      { num: "38", dir: "down", delta: "−39%" },
    ],
    vsPromSub: "Variación respecto al promedio teórico de la zona",
    chartTitle: "Frecuencia acumulada · top 10 cordobés",
    temaTitle: "El sexto sorteo, y por qué tira más bajo.",
    temaDrop: "C",
    tema: [
      <>órdoba es la única de las tres con un sorteo de más. El turista de las 22:15 suma una
      extracción diaria que las otras dos no tienen, y en este recorte deja <Mono>17</Mono> sorteos
      para analizar por separado. Esa diferencia operativa es justo el tipo de cosa que La Data
      existe para mirar.</>,
      <>El <Mono>80</Mono> lideró con 32 apariciones. La década del 80 vuelve a aparecer arriba —como
      en Buenos Aires— pero la coincidencia termina ahí. Mientras BA acompaña al 80 con el 89, el 91
      y el 78, Córdoba lo rodea de <Mono>04</Mono>, <Mono>94</Mono> y <Mono>19</Mono>. Una mezcla sin
      lógica aparente, que es exactamente lo que el azar produce.</>,
      <>La década más caliente acá fue la del 90 (<Mono>215</Mono>), la más fría la del 60
      (<Mono>177</Mono>): 21% de brecha. Más que la Nacional, menos que Buenos Aires. Tres quinielas,
      tres temperaturas distintas.</>,
      "div",
      <>Lo más raro está en el turista. El promedio del número a primera en ese sorteo fue
      <Mono>4111</Mono>, casi 900 puntos por debajo de los otros sorteos, donde ronda los 4800–4900.
      Es una muestra chica —17 sorteos en este recorte— y no se puede afirmar nada todavía. Capaz es
      el horario, capaz es la cantidad de apuestas, capaz es nada.</>,
      <>Pero mes a mes vamos a verlo. Si el turista insiste en tirar bajo, en algún momento dejará de
      ser anécdota y pasará a ser dato.</>,
    ],
    cifras: [
      {
        label: "Sorteo turista · 22:15",
        big: "4111", bigSub: " / 5000 teórico",
        prose: <>El promedio del número a primera en el turista fue <Mono color="var(--ink)">4111</Mono>,
        contra los ~4800 de los otros sorteos cordobeses. Casi 900 puntos de diferencia. El top 5 del
        turista —72, 22, 80, 30, 97— tampoco se parece al del resto del día. Diecisiete sorteos no
        alcanzan para concluir. Alcanzan para empezar a mirar.</>,
      },
      {
        label: "540 y 665 · tres cifras",
        big: "7", bigSub: "× cada uno",
        prose: <>A tres cifras lideran el <Mono color="var(--ink)">540</Mono> y el
        <Mono color="var(--ink)"> 665</Mono>, con siete apariciones cada uno. Detrás, el 675, el 829 y
        el 909 con seis. Ninguno coincide con los calientes de Nacional (261, 244) ni de Buenos Aires
        (989). El patrón de las tres quinielas: no comparten nada.</>,
      },
    ],
    closeProse: <>Esta fue Córdoba de mayo, sorteo turista incluido. Tres quinielas vistas por
    separado. Ahora, lo que más llama la atención del mes: cruzarlas. Entrá a la comparativa.</>,
  },
};

/* ============================================================
   Componente genérico de zona interior
   ============================================================ */
function ZonaInterior({ zoneId, onBack, onOpenZone }) {
  const [period, setPeriod] = useStateZ("Este mes");
  const [sorteo, setSorteo] = useStateZ("Todos");
  const [digits, setDigits] = useStateZ("2");

  const Z = ZONES[zoneId];
  const D = ZONA_DATA[zoneId];
  const greenUp = "#1F8550";

  // décadas: marcar peak index para DecadeBars
  const decadeData = D.decade.map((d, i) => ({
    label: d.label, value: d.value, peak: d.peak ? i : -1,
  }));

  const sorteoOptions = zoneId === "cordoba"
    ? ["Previa", "Primera", "Matutina", "Vespertina", "Nocturna", "Turista", "Todos"]
    : ["Previa", "Primera", "Matutina", "Vespertina", "Nocturna", "Todos"];

  return (
    <DataDeviceFrame>
      <Breadcrumb trail={["LA SALA", "LA DATA", D.breadcrumb]} />

      <div style={{ marginTop: 14 }}>
        <MarqueeTerminal text={D.marquee} />
      </div>

      <ZoneHeader
        zone={zoneId}
        period={D.period}
        sub={D.headerSub}
        chips={D.chips}
      />

      {/* Apertura editorial */}
      <section style={{ background: "var(--paper-warm)", padding: "44px 56px 36px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: 56, alignItems: "start",
        }} className="ld-nacional-apertura">
          <div>
            <span className="sh-section-label">Apertura</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 500,
              fontSize: 38, lineHeight: 1.08,
              margin: "8px 0 24px", letterSpacing: "-0.015em",
              color: "var(--ink)", maxWidth: "22ch",
            }}>{D.aperturaTitle}</h2>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 18,
              lineHeight: 1.6, color: "var(--ink-soft)", maxWidth: "44ch",
            }}>
              {D.apertura.map((p, i) => (
                <p key={i} style={{ margin: i === D.apertura.length - 1 ? 0 : "0 0 16px", textIndent: i === 0 ? 0 : "1.25em" }}>{p}</p>
              ))}
            </div>
          </div>

          <aside style={{
            background: "var(--paper-warmer)",
            border: "1px solid var(--ink-line)",
            padding: 22, fontFamily: "var(--font-mono)",
          }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--cuero)", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 6, height: 6, background: Z.accent }}></span>
              Resumen ejecutivo · adelanto del mes
            </div>
            {D.resumen.map(([k, v], i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "9px 0",
                borderBottom: i === arr.length - 1 ? "none" : "1px dotted var(--ink-line)",
                fontSize: 12,
              }}>
                <span style={{ color: "var(--ink-muted)", letterSpacing: "0.02em" }}>{k}</span>
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* Vista general — 4 stat cards */}
      <section style={{ padding: "10px 56px 30px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--ink)",
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: 0, whiteSpace: "nowrap" }}>Vista general</h3>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cuero)", letterSpacing: "0.06em",
          }}>4 LECTURAS · 2 CIFRAS · MAYO 2026 · ADELANTO</span>
        </div>

        <div className="ld-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <StatCard title="Top 5 · Más salidos" subtitle="Los cinco números que más veces aparecieron" accent={Z.accent}>
            <RankedList accent={greenUp} items={D.top5} direction="down" />
          </StatCard>

          <StatCard title="Bottom 5 · Menos salidos" subtitle={D.bottomSub} accent="var(--rojo)">
            <RankedList accent="var(--rojo)" items={D.bottom5} direction="up" />
          </StatCard>

          <StatCard title="Distribución por década" subtitle={D.decadeSub} accent="var(--cuero)">
            <DecadeBars accent={Z.accent} data={decadeData} />
          </StatCard>

          <StatCard title="VS promedio teórico" subtitle={D.vsPromSub} accent={Z.accent}>
            <VsPromedio items={D.vsPromedio} />
          </StatCard>
        </div>
      </section>

      {/* Gráfico principal */}
      <section style={{ padding: "0 56px 30px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--ink)",
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: 0, whiteSpace: "nowrap" }}>Movimiento del mes</h3>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cuero)", letterSpacing: "0.06em",
          }}>SERIE TEMPORAL · ACUMULADA</span>
        </div>

        <div className="ld-chart-controls" style={{
          display: "flex", flexWrap: "wrap", gap: 24,
          marginBottom: 16, paddingBottom: 14, borderBottom: "1px dotted var(--ink-line)",
        }}>
          <ControlGroup label="Período" options={["Este mes", "Últimos 3", "Últimos 6", "Año"]} value={period} onChange={setPeriod} />
          <ControlGroup label="Sorteo" options={sorteoOptions} value={sorteo} onChange={setSorteo} />
          <ControlGroup label="Cifras" options={["2", "3", "4"]} value={digits} onChange={setDigits} />
        </div>

        <LineChart zone={zoneId} activePeriod={period} activeSorteo={sorteo} activeDigits={digits} />
      </section>

      {/* Tema editorial del mes */}
      <section style={{ background: "var(--paper-warm)", padding: "44px 56px 36px", borderTop: "1px solid var(--ink-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <span className="sh-section-label">Tema editorial del mes</span>
          <span style={{ flex: 1, height: 1, background: "var(--ink-line)" }}></span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cuero)", letterSpacing: "0.06em" }}>LECTURA · 4 MIN</span>
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 42, lineHeight: 1.1,
          margin: "0 0 22px", letterSpacing: "-0.02em", maxWidth: "22ch", color: "var(--ink)",
        }}>{D.temaTitle}</h2>

        <div className="ld-tema-prose" style={{
          fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.62,
          color: "var(--ink-soft)", maxWidth: "62ch",
        }}>
          {D.tema.map((p, i) => {
            if (p === "div") {
              return <div key={i} style={{ textAlign: "center", margin: "26px 0", color: "var(--cuero)", letterSpacing: "0.6em", fontSize: 16 }}>* * *</div>;
            }
            const isFirst = i === 0;
            return (
              <p key={i} style={{ margin: "0 0 18px", textIndent: isFirst ? 0 : "1.25em" }}>
                {isFirst && (
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 600,
                    fontSize: "3.6em", lineHeight: 0.86, color: Z.bg,
                    float: "left", padding: "0.08em 0.1em 0 0", margin: "0.05em 0 0",
                  }}>{D.temaDrop}</span>
                )}
                {p}
              </p>
            );
          })}
        </div>
      </section>

      {/* Lo que vimos a tres y cuatro cifras — caja dorada */}
      <section style={{ padding: "10px 56px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span className="sh-section-label" style={{ color: "var(--dorado-deep)" }}>Lo que vimos más fino</span>
          <span style={{ flex: 1, height: 1, background: "var(--dorado)" }}></span>
        </div>

        <div style={{ border: "1px solid var(--dorado)", background: "var(--paper-warmer)", padding: "28px 32px", position: "relative" }}>
          <CornerOrnament />
          <div className="ld-cifras-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
            {D.cifras.map((c, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                  color: "var(--dorado-deep)", letterSpacing: "0.12em",
                  marginBottom: 10, textTransform: "uppercase",
                }}>{c.label}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 600,
                  color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1, marginBottom: 14,
                }}>
                  {c.big}<span style={{ color: "var(--ink-muted)", fontSize: 18, fontWeight: 400 }}>{c.bigSub}</span>
                </div>
                <p style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15,
                  lineHeight: 1.5, color: "var(--ink-soft)", margin: 0, maxWidth: "38ch",
                }}>{c.prose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre de zona */}
      <section style={{ padding: "32px 56px 28px", textAlign: "center", borderTop: "1px solid var(--ink-line)" }}>
        <div style={{ color: "var(--cuero)", letterSpacing: "0.6em", fontSize: 14, marginBottom: 18 }}>* * *</div>
        <p style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18,
          color: "var(--ink-soft)", margin: "0 0 22px", maxWidth: "52ch",
          marginLeft: "auto", marginRight: "auto", lineHeight: 1.5,
        }}>{D.closeProse}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <ZoneNavButton label="← Volver a La Data" onClick={onBack} />
          {onOpenZone && (
            <ZoneNavButton label="Ver la comparativa →" onClick={() => onOpenZone("comparativa")} filled />
          )}
        </div>
      </section>

      <SignatureFoot />
      <SedronarNote />
    </DataDeviceFrame>
  );
}

/* Botón de navegación de zona — outline o filled */
function ZoneNavButton({ label, onClick, filled = false }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
      padding: "10px 20px",
      background: filled ? "var(--ink)" : "transparent",
      color: filled ? "var(--paper-warm)" : "var(--ink)",
      border: "1px solid var(--ink)", borderRadius: 2, cursor: "pointer",
      letterSpacing: "0.02em",
      transition: "background var(--dur-fast) var(--ease-editorial), color var(--dur-fast) var(--ease-editorial)",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--paper-warm)"; }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = filled ? "var(--ink)" : "transparent";
      e.currentTarget.style.color = filled ? "var(--paper-warm)" : "var(--ink)";
    }}>{label}</button>
  );
}

window.ZonaInterior = ZonaInterior;
window.ZoneNavButton = ZoneNavButton;
```

===== Comparativa.jsx =====

```jsx
// SaleHoy · La Data · Zona Comparativa
// La pieza fuerte del informe. Paleta neutra (blanco hueso), con los tres acentos
// conviviendo. Tres tablas cruzadas: top 5, promedios a primera, desviación por década.

const { useState: useStateC } = React;

const ACC = {
  nacional: "#1A6B43",   // verde editorial profundo (legible sobre hueso)
  bsas:     "#9A6B2E",   // ámbar oscurecido para AA sobre hueso
  cordoba:  "#3C7C8C",   // celeste técnico oscurecido
};
const ACC_LABEL = {
  nacional: "NACIONAL",
  bsas: "BUENOS AIRES",
  cordoba: "CÓRDOBA",
};

function Comparativa({ onBack }) {
  return (
    <DataDeviceFrame>
      <Breadcrumb trail={["LA SALA", "LA DATA", "COMPARATIVA"]} />

      <div style={{ marginTop: 14 }}>
        <MarqueeTerminal text="LAS TRES COMPARADAS · MAYO 2026 · 297 SORTEOS · ~5 940 EXTRACCIONES · 0 NÚMEROS EN COMÚN EN EL TOP 10" />
      </div>

      {/* Header comparativa — fondo hueso con los tres acentos */}
      <header style={{
        background: "#F5F1E8",
        color: "var(--ink)",
        padding: "22px 28px",
        borderTop: "1px solid var(--ink)",
        borderBottom: "1px solid var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", gap: 0, width: 30, height: 12 }}>
            <span style={{ flex: 1, background: ACC.nacional }}></span>
            <span style={{ flex: 1, background: ACC.bsas }}></span>
            <span style={{ flex: 1, background: ACC.cordoba }}></span>
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600,
              letterSpacing: "0.04em", color: "var(--ink)",
            }}>LAS TRES COMPARADAS · MAYO 2026</div>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--cuero)",
              letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4,
            }}>297 sorteos · ~5 940 extracciones · 3 quinielas</div>
          </div>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)",
          padding: "5px 12px", border: "1px solid var(--ink)", letterSpacing: "0.04em",
        }}>EL CRUCE DEL MES</span>
      </header>

      {/* Apertura editorial — el hallazgo principal */}
      <section style={{ background: "var(--paper-warm)", padding: "44px 56px 34px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
          gap: 56, alignItems: "start",
        }} className="ld-nacional-apertura">
          <div>
            <span className="sh-section-label">El hallazgo del mes</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 44, lineHeight: 1.06,
              margin: "8px 0 24px", letterSpacing: "-0.02em", color: "var(--ink)", maxWidth: "18ch",
            }}>Ninguna coincidió con las otras.</h2>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.6,
              color: "var(--ink-soft)", maxWidth: "44ch",
            }}>
              <p style={{ margin: "0 0 16px" }}>
                Lo más llamativo de mayo no fue ningún número. Fue lo que <em>no</em> pasó: ninguno de
                los números calientes del top 10 coincide entre las tres quinielas. Cero. Cada quiniela
                tiene su universo propio.
              </p>
              <p style={{ margin: 0, textIndent: "1.25em" }}>
                Es contraintuitivo. Tres ruedas honestas, el mismo período, los mismos 100 números
                posibles — y sin embargo cada una se calienta por su cuenta. No significa nada
                predictivo. Significa algo sobre el azar: parece pulir cada quiniela por separado.
              </p>
            </div>
          </div>

          <aside style={{
            background: "var(--paper-warmer)", border: "1px solid var(--ink-line)", padding: 22,
          }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cuero)", marginBottom: 16,
            }}>El cruce en una cifra</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 64, fontWeight: 600,
              color: "var(--rojo)", lineHeight: 0.9, letterSpacing: "-0.02em",
            }}>0</div>
            <div style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15,
              color: "var(--ink-soft)", margin: "10px 0 18px", lineHeight: 1.45,
            }}>números compartidos entre los tres top 10.</div>
            <div style={{ borderTop: "1px dotted var(--ink-line)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Nacional", "47", ACC.nacional],
                ["Buenos Aires", "89", ACC.bsas],
                ["Córdoba", "80", ACC.cordoba],
              ].map(([zone, num, color], i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--cuero)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 7, height: 7, background: color }}></span>{zone}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, color: "var(--ink)" }}>{num}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* TABLA 1 — Top 5 en columnas paralelas */}
      <section style={{ padding: "10px 56px 34px" }}>
        <CompSectionHead n="01" title="Top 5 a dos cifras" note="SIN UNA SOLA COINCIDENCIA" />
        <CrossTable
          colKeys={["nacional", "bsas", "cordoba"]}
          rowLabel="Pos."
          rows={[
            ["1°", ["47", "33×"], ["89", "36×"], ["80", "32×"]],
            ["2°", ["11", "29×"], ["91", "35×"], ["04", "29×"]],
            ["3°", ["43", "29×"], ["78", "35×"], ["94", "28×"]],
            ["4°", ["88", "29×"], ["81", "34×"], ["19", "27×"]],
            ["5°", ["53", "29×"], ["84", "32×"], ["73", "27×"]],
          ]}
          renderCell={(cell, key) => (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>{cell[0]}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: ACC[key] }}>{cell[1]}</span>
            </div>
          )}
        />
        <CompCaption>Quince números distintos en quince casilleros. La probabilidad de que tres top 5 independientes no compartan nada no es despreciable — pero verla en limpio impresiona igual.</CompCaption>
      </section>

      {/* TABLA 2 — Promedios a primera */}
      <section style={{ padding: "0 56px 34px" }}>
        <CompSectionHead n="02" title="Promedio del número a primera" note="TEÓRICO ESPERADO ≈ 5000" />
        <AvgTable
          rows={[
            { zone: "nacional", label: "Nacional",       avg: 4898, pct: "20%", tag: "exacto",   dir: "ok" },
            { zone: "bsas",     label: "Buenos Aires",   avg: 4880, pct: "26%", tag: "sobre",    dir: "up" },
            { zone: "cordoba",  label: "Córdoba",        avg: 4798, pct: "19%", tag: "exacto",   dir: "ok" },
            { zone: "cordoba",  label: "Córdoba turista",avg: 4111, pct: "—",   tag: "anomalía", dir: "down", sub: true },
          ]}
        />
        <CompCaption>El promedio a primera ronda los 5000 teóricos en casi todos los casos. La excepción es el sorteo turista de Córdoba: <strong style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>4111</strong>, casi 900 puntos abajo. Muestra chica (17 sorteos). Para seguir.</CompCaption>
      </section>

      {/* TABLA 3 — Desviación por década */}
      <section style={{ padding: "0 56px 34px" }}>
        <CompSectionHead n="03" title="Desviación por década" note="CALIENTE − FRÍA, EN APARICIONES" />
        <DeviationTable
          rows={[
            { zone: "nacional", label: "Nacional",     hot: "00–09 (215)", cold: "70–79 (185)", diff: 16 },
            { zone: "bsas",     label: "Buenos Aires", hot: "80–89 (234)", cold: "00–09 (171)", diff: 37 },
            { zone: "cordoba",  label: "Córdoba",      hot: "90–99 (215)", cold: "60–69 (177)", diff: 21 },
          ]}
        />
        <CompCaption>Buenos Aires es la quiniela con más carácter del mes: 37% de brecha entre su década más caliente y la más fría, contra el 16% casi inerte de la Nacional. Tres ruedas, tres temperamentos.</CompCaption>
      </section>

      {/* Cierre editorial */}
      <section style={{ background: "var(--paper-warm)", padding: "40px 56px 36px", borderTop: "1px solid var(--ink-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <span className="sh-section-label">Cierre · La Data de mayo</span>
          <span style={{ flex: 1, height: 1, background: "var(--ink-line)" }}></span>
        </div>
        <div className="ld-tema-prose" style={{
          fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.62,
          color: "var(--ink-soft)", maxWidth: "62ch",
        }}>
          <p style={{ margin: "0 0 18px" }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "3.6em", lineHeight: 0.86,
              color: "var(--rojo)", float: "left", padding: "0.08em 0.1em 0 0", margin: "0.05em 0 0",
            }}>E</span>
            sto fue La Data de mayo. Tres quinielas, <strong style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>297</strong> sorteos,
            casi seis mil números extraídos. Lo que más llama la atención: las tres se comportaron
            distinto entre sí, y ninguna coincidió con las otras en sus números calientes. Eso no
            significa nada predictivo. Significa algo sobre el azar: parece pulir cada quiniela por separado.
          </p>
          <p style={{ margin: "0 0 18px", textIndent: "1.25em" }}>
            Estos datos no son para apostar. Son para pensar. La quiniela funciona, hace lo que tiene
            que hacer, y todavía nos deja preguntas: ¿por qué la década del 80 se calienta más en BA?
            ¿Por qué el sorteo turista de Córdoba tira a primera más bajo? Capaz nada. Capaz algo. Mes
            a mes vamos a verlo.
          </p>
          <p style={{ margin: 0, textIndent: "1.25em", color: "var(--cuero)", fontStyle: "italic" }}>
            Si jugás, jugá poco. Si jugás mucho, hablá con alguien. Sedronar 141.
          </p>
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <div style={{ color: "var(--cuero)", letterSpacing: "0.6em", fontSize: 14, marginBottom: 20 }}>* * *</div>
          <ZoneNavButton label="← Volver a La Data" onClick={onBack} />
        </div>
      </section>

      <SignatureFoot />
      <SedronarNote />
    </DataDeviceFrame>
  );
}

/* Section head para cada tabla */
function CompSectionHead({ n, title, note }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      gap: 16, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--ink)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cuero)", fontWeight: 600 }}>{n}</span>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{title}</h3>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cuero)", letterSpacing: "0.06em", textAlign: "right" }}>{note}</span>
    </div>
  );
}

function CompCaption({ children }) {
  return (
    <p style={{
      fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14,
      color: "var(--ink-muted)", lineHeight: 1.5, margin: "14px 0 0", maxWidth: "70ch",
    }}>{children}</p>
  );
}

/* Tabla cruzada genérica — encabezados de quiniela con su acento */
function CrossTable({ colKeys, rows, rowLabel, renderCell }) {
  return (
    <div style={{ overflowX: "auto" }}>
    <div style={{ border: "1px solid var(--ink-line)", overflow: "hidden", minWidth: 560 }} className="ld-comp-table">
      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr 1fr", background: "var(--paper-warmer)", borderBottom: "1px solid var(--ink)" }}>
        <div style={{ padding: "12px 16px", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cuero)" }}>{rowLabel}</div>
        {colKeys.map((k) => (
          <div key={k} style={{
            padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.06em", color: ACC[k], borderLeft: "1px solid var(--ink-line)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 8, height: 8, background: ACC[k] }}></span>{ACC_LABEL[k]}
          </div>
        ))}
      </div>
      {/* Body rows */}
      {rows.map((row, ri) => (
        <div key={ri} style={{
          display: "grid", gridTemplateColumns: "84px 1fr 1fr 1fr",
          borderBottom: ri === rows.length - 1 ? "none" : "1px solid var(--ink-line)",
          background: ri % 2 === 1 ? "var(--paper-warm)" : "transparent",
        }}>
          <div style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center" }}>{row[0]}</div>
          {colKeys.map((k, ci) => (
            <div key={k} style={{ padding: "12px 16px", borderLeft: "1px solid var(--ink-line)", display: "flex", alignItems: "center" }}>
              {renderCell(row[ci + 1], k)}
            </div>
          ))}
        </div>
      ))}
    </div>
    </div>
  );
}

/* Tabla de promedios a primera con barra horizontal */
function AvgTable({ rows }) {
  const MIN = 3800, MAX = 5200;
  const pos = (v) => ((v - MIN) / (MAX - MIN)) * 100;
  const theoretical = pos(5000);
  return (
    <div style={{ overflowX: "auto" }}>
    <div style={{ border: "1px solid var(--ink-line)", minWidth: 560 }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "160px 90px 1fr 120px", alignItems: "center", gap: 16,
          padding: "16px 20px",
          borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--ink-line)",
          background: r.sub ? "var(--paper-warm)" : "transparent",
        }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: r.sub ? 12 : 13, fontWeight: 600,
            letterSpacing: "0.04em", color: r.sub ? "var(--cuero)" : "var(--ink)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 8, height: 8, background: ACC[r.zone], opacity: r.sub ? 0.6 : 1 }}></span>
            {r.label}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>{r.avg}</span>
          {/* Bar track w/ theoretical marker */}
          <div style={{ position: "relative", height: 24 }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--ink-line)" }}></div>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${theoretical}%`, width: 1, background: "var(--cuero)" }}></div>
            <div style={{
              position: "absolute", top: "50%", transform: "translateY(-50%)",
              left: `${Math.min(pos(r.avg), theoretical)}%`,
              width: `${Math.abs(pos(r.avg) - theoretical)}%`, height: 4,
              background: ACC[r.zone],
            }}></div>
            <div style={{
              position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
              left: `${pos(r.avg)}%`, width: 9, height: 9, borderRadius: "50%",
              background: ACC[r.zone], border: "2px solid var(--paper-warmer)",
            }}></div>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 12, textAlign: "right",
            color: r.dir === "up" ? "#9A6B2E" : r.dir === "down" ? "var(--rojo)" : "var(--ink-muted)",
          }}>{r.pct} · {r.tag}</span>
        </div>
      ))}
      <div style={{
        padding: "8px 20px", borderTop: "1px dotted var(--ink-line)",
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cuero)", letterSpacing: "0.06em",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 1, height: 12, background: "var(--cuero)", display: "inline-block" }}></span>
        LÍNEA VERTICAL = TEÓRICO ESPERADO (5000) · COLUMNA % = NÚMEROS A PRIMERA ENTRE 4000–5999
      </div>
    </div>
    </div>
  );
}

/* Tabla de desviación por década con barra de diferencia */
function DeviationTable({ rows }) {
  const maxDiff = 40;
  return (
    <div style={{ overflowX: "auto" }}>
    <div style={{ border: "1px solid var(--ink-line)", minWidth: 640 }}>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr 130px", background: "var(--paper-warmer)", borderBottom: "1px solid var(--ink)" }}>
        {["Quiniela", "Década caliente", "Década fría", "Diferencia", ""].map((h, i) => (
          <div key={i} style={{
            padding: "12px 16px", fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cuero)",
            borderLeft: i === 0 ? "none" : "1px solid var(--ink-line)",
          }}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr 130px", alignItems: "center",
          borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--ink-line)",
          background: i % 2 === 1 ? "var(--paper-warm)" : "transparent",
        }}>
          <span style={{ padding: "14px 16px", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, background: ACC[r.zone] }}></span>{r.label}
          </span>
          <span style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink)", borderLeft: "1px solid var(--ink-line)" }}>{r.hot}</span>
          <span style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink-muted)", borderLeft: "1px solid var(--ink-line)" }}>{r.cold}</span>
          <span style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, color: ACC[r.zone], borderLeft: "1px solid var(--ink-line)" }}>{r.diff}%</span>
          <div style={{ padding: "14px 16px", borderLeft: "1px solid var(--ink-line)" }}>
            <div style={{ height: 6, background: "var(--paper-darker)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(r.diff / maxDiff) * 100}%`, background: ACC[r.zone] }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}

window.Comparativa = Comparativa;
```

===== LineChart.jsx =====

```jsx
// SaleHoy · La Data · LineChart
// Estilo TradingView pero sobrio: líneas finas, paleta limitada, sin grilla pesada.

const { useState: useStateLC, useMemo: useMemoLC } = React;

/* ============================================================
   Datos por zona y por cantidad de cifras (2 / 3 / 4).
   Los top reales de mayo; la cola se completa con valores plausibles.
   "Este mes" es la base; los períodos más largos escalan los totales.
   ============================================================ */
const DIGIT_DATA = {
  nacional: {
    palette: ["#0F1730", "#5BD37A", "#6B4423"],
    2: { order: [47, 11, 43, 88, 53, 22, 36, 96, 65, 4],
         finals: { 47: 33, 11: 29, 43: 29, 88: 29, 53: 29, 22: 24, 36: 22, 96: 20, 65: 18, 4: 17 },
         annot: { at: 12, fromFrac: 0.6, toFrac: 0.92, text: "MITAD DE MES · EL 47 SE DESPEGA" } },
    3: { order: [261, 244, 847, 759, 297, 503, 118, 672, 940, 381],
         finals: { 261: 8, 244: 8, 847: 7, 759: 6, 297: 6, 503: 5, 118: 5, 672: 4, 940: 4, 381: 4 },
         annot: { at: 16, fromFrac: 0.55, toFrac: 0.95, text: "261 Y 244 EMPATAN ARRIBA" } },
    4: { order: [4761, 2618, 8472, 1190, 5903, 7044, 3325, 6650, 9182, 1537],
         finals: { 4761: 3, 2618: 3, 8472: 2, 1190: 2, 5903: 2, 7044: 2, 3325: 2, 6650: 2, 9182: 2, 1537: 2 },
         annot: null },
  },
  bsas: {
    palette: ["#2A1A0E", "#D4A574", "#6B4423"],
    2: { order: [89, 91, 78, 81, 84, 80, 88, 24, 21, 18],
         finals: { 89: 36, 91: 35, 78: 35, 81: 34, 84: 32, 80: 27, 88: 25, 24: 22, 21: 20, 18: 18 },
         annot: { at: 11, fromFrac: 0.6, toFrac: 0.9, text: "DÉCADA DEL 80 · CUATRO EN EL TOP 5" } },
    3: { order: [989, 124, 181, 484, 621, 330, 705, 212, 876, 457],
         finals: { 989: 8, 124: 7, 181: 7, 484: 7, 621: 6, 330: 5, 705: 5, 212: 4, 876: 4, 457: 4 },
         annot: { at: 15, fromFrac: 0.55, toFrac: 0.95, text: "989 ARRIBA · CERCA DEL 89" } },
    4: { order: [8941, 9178, 7813, 8126, 1894, 4405, 6627, 3309, 5571, 2048],
         finals: { 8941: 3, 9178: 2, 7813: 2, 8126: 2, 1894: 2, 4405: 2, 6627: 2, 3309: 2, 5571: 2, 2048: 2 },
         annot: null },
  },
  cordoba: {
    palette: ["#162922", "#7FB8C9", "#6B4423"],
    2: { order: [80, 4, 94, 19, 73, 72, 22, 30, 97, 9],
         finals: { 80: 32, 4: 29, 94: 28, 19: 27, 73: 27, 72: 23, 22: 21, 30: 19, 97: 17, 9: 16 },
         annot: { at: 13, fromFrac: 0.6, toFrac: 0.9, text: "EL 80 LIDERA · MEZCLA RARA DETRÁS" } },
    3: { order: [540, 665, 675, 829, 909, 412, 338, 701, 194, 560],
         finals: { 540: 7, 665: 7, 675: 6, 829: 6, 909: 6, 412: 5, 338: 5, 701: 4, 194: 4, 560: 4 },
         annot: { at: 15, fromFrac: 0.55, toFrac: 0.95, text: "540 Y 665 EMPATAN" } },
    4: { order: [8095, 4094, 1948, 7330, 5402, 6651, 2297, 9073, 3380, 1175],
         finals: { 8095: 3, 4094: 2, 1948: 2, 7330: 2, 5402: 2, 6651: 2, 2297: 2, 9073: 2, 3380: 2, 1175: 2 },
         annot: null },
  },
};

/* Períodos: multiplican los totales y cambian el eje X. */
const CHART_PERIODS = {
  "Este mes":   { mult: 1,  days: 24,  xTicks: [1, 5, 10, 15, 20, 24], xLabel: "DÍA · 30 ABR → 23 MAY 2026" },
  "Últimos 3":  { mult: 3,  days: 90,  xTicks: [1, 30, 60, 90],         xLabel: "DÍA · MAR → MAY 2026" },
  "Últimos 6":  { mult: 6,  days: 180, xTicks: [1, 60, 120, 180],       xLabel: "DÍA · DIC 2025 → MAY 2026" },
  "Año":        { mult: 12, days: 360, xTicks: [1, 90, 180, 270, 360],  xLabel: "DÍA · JUN 2025 → MAY 2026" },
};

/* Sorteos: cada horario aporta ~1/N del mes y tiene su propia "personalidad".
   share = fracción del total que pasa por ese sorteo.
   skew = sesgo que reordena el ranking (números que se calientan en ese horario).
   En "Todos" se ve el agregado. La Previa y el Turista son los más chicos. */
const CHART_SORTEOS = {
  "Todos":      { share: 1.0,  skew: 0,    note: null },
  "Previa":     { share: 0.18, skew: 0.30, note: "PREVIA · 10:15 · MUESTRA CHICA" },
  "Primera":    { share: 0.21, skew: 0.12, note: "PRIMERA · 12:00" },
  "Matutina":   { share: 0.20, skew: 0.22, note: "MATUTINA · 15:00 · TIRA BAJO" },
  "Vespertina": { share: 0.20, skew: 0.26, note: "VESPERTINA · 18:00 · TIRA ALTO" },
  "Nocturna":   { share: 0.21, skew: 0.16, note: "NOCTURNA · 21:00" },
  "Turista":    { share: 0.15, skew: 0.40, note: "TURISTA · 22:15 · SOLO CÓRDOBA" },
};

function niceMax(v) {
  if (v <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  let nice;
  if (n <= 1) nice = 1; else if (n <= 2) nice = 2; else if (n <= 4) nice = 4;
  else if (n <= 5) nice = 5; else nice = 10;
  return nice * pow;
}

/* Datos sintéticos de frecuencia acumulada según zona, período, cifras y sorteo. */
function generateSeries(zoneId, periodKey, digitsKey, sorteoKey) {
  const zd = DIGIT_DATA[zoneId] || DIGIT_DATA.nacional;
  const dd = zd[digitsKey] || zd["2"];
  const per = CHART_PERIODS[periodKey] || CHART_PERIODS["Este mes"];
  const sor = CHART_SORTEOS[sorteoKey] || CHART_SORTEOS["Todos"];
  const DAYS = per.days;
  const isAll = sor.share >= 1;

  // Total efectivo por número: total del mes × período × fracción del sorteo,
  // con un sesgo determinista que reordena el ranking en sorteos individuales.
  const raw = dd.order.map((n, idx) => {
    const monthly = dd.finals[n];
    // sesgo: cada número responde distinto a cada horario (pseudoaleatorio estable)
    const wob = isAll ? 1 : 1 + sor.skew * (((n * 31 + idx * 17) % 11) / 11 - 0.5) * 2;
    const final = Math.max(1, Math.round(monthly * per.mult * sor.share * wob));
    return { num: n, final };
  });
  // Reordenar por total efectivo para que el top 3 (líneas en color) refleje el sorteo
  raw.sort((a, b) => b.final - a.final);

  const series = raw.map(({ num, final }) => {
    const points = [];
    let acc = 0;
    const seed = num * 7 + 3;
    for (let d = 1; d <= DAYS; d++) {
      const expected = (d / DAYS) * final;
      const r = ((seed * d * 13) % 7) / 7;
      const noise = Math.max(0.6, per.mult * sor.share * 0.8);
      const target = Math.round(expected + (r - 0.4) * 1.4 * noise);
      acc = Math.max(acc, Math.min(target, final));
      if (d === DAYS) acc = final;
      points.push({ d, v: acc });
    }
    return { num, points, final };
  });
  const maxFinal = Math.max(...series.map((s) => s.final));
  const yMax = niceMax(maxFinal * 1.12);
  // La anotación editorial sólo tiene sentido en la vista agregada del mes
  const annot = (isAll && periodKey === "Este mes") ? dd.annot : null;
  return { series, yMax, days: DAYS, per, sor, annot, palette: zd.palette };
}

function LineChart({ zone = "nacional", activePeriod = "Este mes", activeSorteo = "Todos", activeDigits = "2" }) {
  const data = useMemoLC(
    () => generateSeries(zone, activePeriod, activeDigits, activeSorteo),
    [zone, activePeriod, activeDigits, activeSorteo]
  );
  const { series, yMax, days, per, sor, annot } = data;
  const CHART_PALETTE = data.palette;
  const [hovered, setHovered] = useStateLC(null); // number that's hovered

  // El hover se limpia cuando cambian los datos (evita resaltado fantasma)
  React.useEffect(() => { setHovered(null); }, [zone, activePeriod, activeDigits, activeSorteo]);

  // Geometry
  const W = 880, H = 360;
  const pad = { top: 28, right: 110, bottom: 38, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const xMax = days;

  const x = (d) => pad.left + (d / xMax) * innerW;
  const y = (v) => pad.top + innerH - (v / yMax) * innerH;

  const fmt = (num) => String(num).padStart(Number(activeDigits), "0");

  // Highlighted indices — first 3 always colored, rest muted unless hovered
  const highlightOf = (i, num) => {
    if (hovered !== null) return num === hovered;
    return i < 3;
  };

  const isMuted = (i, num) => {
    if (hovered !== null) return num !== hovered;
    return i >= 3;
  };

  // Posiciones Y de las etiquetas finales con anti-colisión:
  // las líneas destacadas (top 3, o la que está en hover) no deben pisarse.
  const labelY = (() => {
    const idxs = series.map((s, i) => ({ s, i })).filter(({ s, i }) => highlightOf(i, s.num));
    const sorted = idxs.map(({ s }) => ({ num: s.num, base: y(s.final) }))
      .sort((a, b) => a.base - b.base);
    const MIN_GAP = 14;
    for (let k = 1; k < sorted.length; k++) {
      if (sorted[k].base - sorted[k - 1].base < MIN_GAP) {
        sorted[k].base = sorted[k - 1].base + MIN_GAP;
      }
    }
    const map = {};
    sorted.forEach((o) => { map[o.num] = o.base; });
    return map;
  })();

  // X axis ticks según período
  const xTicks = per.xTicks;
  const dayLabels = [];
  // Y axis ticks — cuatro divisiones derivadas de yMax
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map((v) => Math.round(v));

  return (
    <div style={{
      background: "var(--paper-warmer)",
      border: "1px solid var(--ink-line)",
      padding: 24,
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Caption row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 14, gap: 14, flexWrap: "wrap",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--cuero)",
          }}>Gráfico principal</div>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22,
            color: "var(--ink)", margin: "4px 0 0", letterSpacing: "-0.005em",
          }}>Frecuencia acumulada · {activeDigits} cifras</h3>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--ink-muted)", letterSpacing: "0.02em",
          textAlign: "right",
        }}>
          {activePeriod.toUpperCase()} · {activeSorteo.toUpperCase()} · {activeDigits} CIFRAS
          {sor && sor.note && (
            <div style={{ color: "var(--cuero)", fontSize: 10, marginTop: 3, letterSpacing: "0.06em" }}>
              {sor.note}
            </div>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* Background — paper warmer to keep transparent */}
        {/* Y axis baseline */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH}
          stroke="var(--ink-line)" strokeWidth="1" />
        <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH}
          stroke="var(--ink-line)" strokeWidth="1" />

        {/* Subtle horizontal guide lines */}
        {yTicks.slice(1).map(t => (
          <line key={`gy-${t}`} x1={pad.left} y1={y(t)} x2={pad.left + innerW} y2={y(t)}
            stroke="var(--ink-line)" strokeWidth="0.5" strokeDasharray="1 4" opacity="0.5" />
        ))}

        {/* X axis ticks + labels */}
        {xTicks.map(t => (
          <g key={`x-${t}`}>
            <line x1={x(t)} y1={pad.top + innerH} x2={x(t)} y2={pad.top + innerH + 4}
              stroke="var(--ink-line)" strokeWidth="1" />
            <text x={x(t)} y={pad.top + innerH + 18}
              textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-muted)" letterSpacing="0.02em">
              {String(t).padStart(2, "0")}
            </text>
          </g>
        ))}

        {/* Día boundary markers (vertical dotted) + day labels above */}
        {dayLabels.map(d => (
          <text key={`day-${d.at}"`} x={x(d.at)} y={pad.top - 14}
            textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9" fill="var(--cuero)"
            letterSpacing="0.14em">
            {d.label}
          </text>
        ))}

        {/* X axis label */}
        <text x={pad.left + innerW / 2} y={H - 6}
          textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize="9" fill="var(--cuero)"
          letterSpacing="0.14em">
          {per.xLabel}
        </text>

        {/* Y axis ticks + labels */}
        {yTicks.map(t => (
          <g key={`y-${t}`}>
            <text x={pad.left - 10} y={y(t) + 4}
              textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-muted)">
              {String(t).padStart(2, "0")}
            </text>
          </g>
        ))}
        <text x={pad.left - 30} y={pad.top - 8}
          textAnchor="start"
          fontFamily="var(--font-mono)" fontSize="9" fill="var(--cuero)"
          letterSpacing="0.14em">
          APARICIONES
        </text>

        {/* Muted lines first (so they sit behind highlighted) */}
        {series.map((s, i) => {
          if (!isMuted(i, s.num)) return null;
          const path = s.points.map((p, j) => `${j === 0 ? "M" : "L"} ${x(p.d)} ${y(p.v)}`).join(" ");
          return (
            <path key={`m-${s.num}`}
              d={path}
              stroke="var(--ink-line)"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
              onMouseEnter={() => setHovered(s.num)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* Highlighted lines on top */}
        {series.map((s, i) => {
          if (!highlightOf(i, s.num)) return null;
          const color = hovered !== null
            ? "var(--rojo)"
            : CHART_PALETTE[i % CHART_PALETTE.length];
          const path = s.points.map((p, j) => `${j === 0 ? "M" : "L"} ${x(p.d)} ${y(p.v)}`).join(" ");
          return (
            <g key={`h-${s.num}`}>
              <path
                d={path}
                stroke={color}
                strokeWidth="1.6"
                fill="none"
                onMouseEnter={() => setHovered(s.num)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              />
              {/* End point dot */}
              <circle
                cx={x(xMax)} cy={y(s.final)}
                r="3"
                fill={color}
              />
              {/* End label — y con anti-colisión */}
              <text
                x={x(xMax) + 8}
                y={(labelY[s.num] ?? y(s.final)) + 4}
                fontFamily="var(--font-mono)" fontSize="11" fontWeight="600"
                fill={color}
                letterSpacing="0.02em"
              >
                {fmt(s.num)} · {s.final}
              </text>
            </g>
          );
        })}

        {/* Annotation: hito de la zona — solo en la vista base (este mes, 2 cifras, todos) */}
        {hovered === null && annot && activePeriod === "Este mes" && (
          <g>
            <line x1={x(annot.at)} y1={y(yMax * annot.fromFrac)} x2={x(annot.at)} y2={y(yMax * annot.toFrac)}
              stroke="var(--cuero)" strokeWidth="0.6" strokeDasharray="2 3" />
            <text x={x(annot.at) - 4} y={y(yMax * annot.toFrac) - 6}
              textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="9"
              fill="var(--cuero)" letterSpacing="0.06em">
              {annot.text}
            </text>
          </g>
        )}

        {/* Nota del sorteo filtrado se muestra en el encabezado, no en el SVG */}
      </svg>

      {/* Legend / hover hint */}
      <div style={{
        marginTop: 8, padding: "10px 0 0",
        borderTop: "1px dotted var(--ink-line)",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13,
          color: "var(--ink-muted)",
        }}>
          {hovered !== null
            ? <>Resaltado: <strong style={{ color: "var(--rojo)", fontFamily: "var(--font-mono)", fontStyle: "normal" }}>el {fmt(hovered)}</strong>. Pasá el mouse por las líneas grises para ver el resto.</>
            : <>Líneas en color: top 3 a {activeDigits} cifras. Las demás están atenuadas — pasales el mouse para destacarlas.</>}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--cuero)", letterSpacing: "0.06em",
        }}>
          FUENTE: PLANILLAS OFICIALES · LA DATA
        </div>
      </div>
    </div>
  );
}

window.LineChart = LineChart;
```

===== Nacional.jsx =====

```jsx
// SaleHoy · La Data · Zona Nacional
// Interior de la zona: header azul, prosa Spectral, 4 stat cards, gráfico con controles,
// editorial larga con drop cap, caja "tres y cuatro cifras" con borde dorado, cierre.

const { useState: useStateN } = React;

function Nacional({ onBack }) {
  const [period, setPeriod] = useStateN("Este mes");
  const [sorteo, setSorteo] = useStateN("Todos");
  const [digits, setDigits] = useStateN("2");

  const NACIONAL = ZONES.nacional;

  return (
    <DataDeviceFrame>
      <Breadcrumb trail={["LA SALA", "LA DATA", "NACIONAL"]} />

      <div style={{ marginTop: 14 }}>
        <MarqueeTerminal text="ZONA NACIONAL · MAYO 2026 · ADELANTO 30 ABR → 23 MAY · 99 SORTEOS · ~1 980 EXTRACCIONES · ÚLTIMA ACT. 23/05/26 21:30" />
      </div>

      <ZoneHeader
        zone="nacional"
        period="MAYO 2026 · ADELANTO"
        sub="99 sorteos · ~1 980 extracciones · 5 horarios"
        chips={["PRE", "1RA", "MAT", "VES", "NOC"]}
      />

      {/* Apertura editorial — prosa Spectral sobre paper-warm */}
      <section style={{
        background: "var(--paper-warm)",
        padding: "44px 56px 36px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: 56, alignItems: "start",
        }}
        className="ld-nacional-apertura">
          <div>
            <span className="sh-section-label">Apertura</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 500,
              fontSize: 38, lineHeight: 1.08,
              margin: "8px 0 24px", letterSpacing: "-0.015em",
              color: "var(--ink)", maxWidth: "22ch",
            }}>Veinticuatro días, distribución pareja, y un 47 que insiste.</h2>

            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 18,
              lineHeight: 1.6, color: "var(--ink-soft)",
              maxWidth: "44ch",
            }}>
              <p style={{ margin: "0 0 16px" }}>
                Empecemos por la Nacional. Veinte días de quiniela, casi dos mil números
                extraídos, distribución prácticamente uniforme entre las décadas: ninguna
                pasa los 215, ninguna baja de 185. Eso es lo que la estadística llamaría
                comportamiento aburrido, y para nuestros fines es buena noticia: la quiniela
                está haciendo lo que se espera de ella.
              </p>
              <p style={{ margin: "0 0 16px", textIndent: "1.25em" }}>
                Pero hay un dato que llama la atención: el <strong style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>47</strong> lideró
                con 33 apariciones, un 67% más que el promedio. No es muchísimo, pero es persistente.
                Y mientras tanto, el <strong style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>63</strong> apenas tuvo nueve. Eso es lo que
                pasa con muestras chicas: los extremos parecen narrativos.
              </p>
              <p style={{ margin: 0, textIndent: "1.25em" }}>
                Lo interesante en serio aparece cuando uno mira a tres cifras. El
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}> 261</span> y el
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}> 244</span> salieron ocho veces cada uno en el mes.
                En un universo de mil números, eso ya es algo. No predicción. Curiosidad estadística.
              </p>
            </div>
          </div>

          {/* Datos de cabecera — pequeño panel mono */}
          <aside style={{
            background: "var(--paper-warmer)",
            border: "1px solid var(--ink-line)",
            padding: 22,
            fontFamily: "var(--font-mono)",
          }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--cuero)", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 6, height: 6, background: NACIONAL.accent }}></span>
              Resumen ejecutivo · adelanto del mes
            </div>
            {[
              ["Sorteos procesados", "99"],
              ["Extracciones", "~1 980"],
              ["Más salido", "47 · 33× (+67%)"],
              ["Menos salido", "63 · 9× (−55%)"],
              ["Distribución por década", "pareja (185–215)"],
              ["Caliente a 3 cifras", "261 · 244 (8×)"],
              ["4000–5999 a primera", "20/99 · teórico 20%"],
            ].map(([k, v], i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline",
                padding: "9px 0",
                borderBottom: i === arr.length - 1 ? "none" : "1px dotted var(--ink-line)",
                fontSize: 12,
              }}>
                <span style={{
                  color: "var(--ink-muted)",
                  letterSpacing: "0.02em",
                }}>{k}</span>
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* VISTA GENERAL — 4 stat cards 2x2 */}
      <section style={{ padding: "10px 56px 30px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "baseline", marginBottom: 16,
          paddingBottom: 10, borderBottom: "1px solid var(--ink)",
        }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22,
            margin: 0, letterSpacing: "-0.005em", whiteSpace: "nowrap",
          }}>Vista general</h3>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--cuero)", letterSpacing: "0.06em",
          }}>4 LECTURAS · 2 CIFRAS · MAYO 2026 · ADELANTO 30/4 → 23/5</span>
        </div>

        <div className="ld-stats-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          <StatCard title="Top 5 · Más salidos"
            subtitle="Los cinco números que más veces aparecieron"
            accent={NACIONAL.accent}>
            <RankedList
              accent="#1F8550"
              items={[
                { num: "47", count: 33 },
                { num: "11", count: 29 },
                { num: "43", count: 29 },
                { num: "88", count: 29 },
                { num: "53", count: 29 },
              ]}
              direction="down"
            />
          </StatCard>

          <StatCard title="Bottom 5 · Menos salidos"
            subtitle="Ninguno quedó en cero — todos aparecieron al menos nueve veces"
            accent="var(--rojo)">
            <RankedList
              accent="var(--rojo)"
              items={[
                { num: "63", count: 9  },
                { num: "73", count: 10 },
                { num: "79", count: 10 },
                { num: "72", count: 12 },
                { num: "60", count: 13 },
              ]}
              direction="up"
            />
          </StatCard>

          <StatCard title="Distribución por década"
            subtitle="Pareja — ninguna pasa los 215 ni baja de 185"
            accent="var(--cuero)">
            <DecadeBars
              accent={NACIONAL.accent}
              data={[
                { label: "00–09", value: 215, peak: true  },
                { label: "10–19", value: 214, peak: false },
                { label: "20–29", value: 204, peak: false },
                { label: "30–39", value: 188, peak: false },
                { label: "40–49", value: 199, peak: false },
                { label: "50–59", value: 200, peak: false },
                { label: "60–69", value: 191, peak: false },
                { label: "70–79", value: 185, peak: false },
                { label: "80–89", value: 196, peak: false },
                { label: "90–99", value: 188, peak: false },
              ].map(d => ({ ...d, peak: d.peak ? d.label : null }))
              .map((d, i, arr) => ({ ...d, peak: d.peak ? i : -1 }))}
            />
          </StatCard>

          <StatCard title="VS promedio teórico"
            subtitle="Variación respecto a 19,8 apariciones por número (± teórico)"
            accent={NACIONAL.accent}>
            <VsPromedio
              items={[
                { num: "47", dir: "up",   delta: "+67%" },
                { num: "11", dir: "up",   delta: "+46%" },
                { num: "43", dir: "up",   delta: "+46%" },
                { num: "63", dir: "down", delta: "−55%" },
                { num: "73", dir: "down", delta: "−49%" },
              ]}
            />
          </StatCard>
        </div>
      </section>

      {/* GRÁFICO PRINCIPAL — con controles arriba */}
      <section style={{ padding: "0 56px 30px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "baseline", marginBottom: 14,
          paddingBottom: 10, borderBottom: "1px solid var(--ink)",
        }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22,
            margin: 0, whiteSpace: "nowrap",
          }}>Movimiento del mes</h3>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--cuero)", letterSpacing: "0.06em",
          }}>SERIE TEMPORAL · ACUMULADA</span>
        </div>

        {/* Controles */}
        <div className="ld-chart-controls" style={{
          display: "flex", flexWrap: "wrap", gap: 24,
          marginBottom: 16, paddingBottom: 14,
          borderBottom: "1px dotted var(--ink-line)",
        }}>
          <ControlGroup label="Período"
            options={["Este mes", "Últimos 3", "Últimos 6", "Año"]}
            value={period} onChange={setPeriod} />
          <ControlGroup label="Sorteo"
            options={["Previa", "Primera", "Matutina", "Vespertina", "Nocturna", "Todos"]}
            value={sorteo} onChange={setSorteo} />
          <ControlGroup label="Cifras"
            options={["2", "3", "4"]}
            value={digits} onChange={setDigits} />
        </div>

        <LineChart
          zone="nacional"
          activePeriod={period}
          activeSorteo={sorteo}
          activeDigits={digits}
        />
      </section>

      {/* TEMA EDITORIAL DEL MES — prosa larga con drop cap */}
      <section style={{
        background: "var(--paper-warm)",
        padding: "44px 56px 36px",
        borderTop: "1px solid var(--ink-line)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <span className="sh-section-label">Tema editorial del mes</span>
          <span style={{ flex: 1, height: 1, background: "var(--ink-line)" }}></span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--cuero)", letterSpacing: "0.06em",
          }}>LECTURA · 4 MIN</span>
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 500,
          fontSize: 42, lineHeight: 1.1,
          margin: "0 0 22px", letterSpacing: "-0.02em",
          maxWidth: "22ch", color: "var(--ink)",
        }}>Una rueda que aburre bien, y un par de números que insisten.</h2>

        <div className="ld-tema-prose" style={{
          fontFamily: "var(--font-serif)", fontSize: 18,
          lineHeight: 1.62, color: "var(--ink-soft)",
          maxWidth: "62ch",
        }}>
          <p style={{ margin: "0 0 18px" }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: "3.6em", lineHeight: 0.86,
              color: NACIONAL.bg,
              float: "left",
              padding: "0.08em 0.1em 0 0", margin: "0.05em 0 0",
            }}>L</span>
            o primero que hay que decir de la Nacional este mes es que la rueda no tiene
            personalidad. Las diez décadas se reparten entre <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>185</span> y
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}> 215</span> apariciones. Un techo
            estrecho. La diferencia entre la década más caliente y la más fría es del 16%, que en
            estadística de quiniela es un valor casi aburrido. Y aburrida, en este contexto, quiere
            decir: cumple. La rueda gira como tiene que girar.
          </p>
          <p style={{ margin: "0 0 18px", textIndent: "1.25em" }}>
            Pero adentro de esa uniformidad aparece un dato fino: el <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>47</span> salió
            33 veces. El promedio te&oacute;rico sobre 1980 extracciones está cerca de 19,8 por número.
            33 contra 19,8 es un 67% por encima. No es escandaloso, pero es claro. Mientras tanto,
            el <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>63</span> apenas tuvo nueve. Veintitrés días no son suficientes para confirmar nada.
            Pero sí para anotar.
          </p>
          <p style={{ margin: "0 0 18px", textIndent: "1.25em" }}>
            Lo interesante en serio aparece a tres cifras. El{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>261</span> y el{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>244</span> salieron ocho veces cada uno. En un universo de mil números,
            con menos de dos mil extracciones, lo esperado por número anda en 1,98. Ocho es cuatro
            veces más. Eso ya merece una mirada. No predicción. Curiosidad estadística.
          </p>
          <div style={{
            textAlign: "center", margin: "26px 0",
            color: "var(--cuero)", letterSpacing: "0.6em",
            fontSize: 16,
          }}>* * *</div>
          <p style={{ margin: "0 0 18px" }}>
            A cuatro cifras la película cambia poco. El milar{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>5000–5999</span> tuvo 223 apariciones; el{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>2000–2999</span>, 176. La diferencia es notable pero está dentro de lo
            que la distribución uniforme admite cuando uno corta a 24 días. Lo más significativo no es
            ningún número en particular: es que el promedio del número a primera fue{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ink)" }}>4898</span>, casi exactamente el teórico de 5000. La rueda está limpia.
          </p>
          <p style={{ margin: 0, textIndent: "1.25em" }}>
            Si jugás, jugá poco. Y si querés mirar, mirá a tres cifras: ahí está lo más raro del mes.
          </p>
        </div>
      </section>

      {/* TRES Y CUATRO CIFRAS — caja borde dorado */}
      <section style={{ padding: "10px 56px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span className="sh-section-label" style={{ color: "var(--dorado-deep)" }}>
            Lo que vimos a tres y cuatro cifras
          </span>
          <span style={{ flex: 1, height: 1, background: "var(--dorado)" }}></span>
        </div>

        <div style={{
          border: "1px solid var(--dorado)",
          background: "var(--paper-warmer)",
          padding: "28px 32px",
          position: "relative",
        }}>
          {/* Esquinas decorativas pequeñas */}
          <CornerOrnament />

          <div className="ld-cifras-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 36,
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                color: "var(--dorado-deep)", letterSpacing: "0.12em",
                marginBottom: 10, textTransform: "uppercase",
              }}>261 y 244 · tres cifras</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 600,
                color: "var(--ink)", letterSpacing: "-0.01em",
                lineHeight: 1, marginBottom: 14,
              }}>
                8<span style={{ color: "var(--ink-muted)", fontSize: 18, fontWeight: 400 }}>× cada uno</span>
              </div>
              <p style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15,
                lineHeight: 1.5, color: "var(--ink-soft)", margin: 0,
                maxWidth: "38ch",
              }}>
                En un universo de mil números, lo esperado por número anda en menos de dos en 24 días.
                El <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal", color: "var(--ink)" }}>261</span> y el <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal", color: "var(--ink)" }}>244</span> aparecieron ocho. El <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal", color: "var(--ink)" }}>847</span> siete.
                El resto del top a tres cifras anda entre cinco y seis. La cola larga del azar es ancha:
                lo que parece patrón puede ser pura forma de la curva.
              </p>
            </div>

            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                color: "var(--dorado-deep)", letterSpacing: "0.12em",
                marginBottom: 10, textTransform: "uppercase",
              }}>Promedio a primera · 99 sorteos</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 600,
                color: "var(--ink)", letterSpacing: "-0.01em",
                lineHeight: 1, marginBottom: 14,
              }}>
                4898<span style={{ color: "var(--ink-muted)", fontSize: 18, fontWeight: 400 }}> / 5000 teórico</span>
              </div>
              <p style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15,
                lineHeight: 1.5, color: "var(--ink-soft)", margin: 0,
                maxWidth: "38ch",
              }}>
                El número promedio salido en primera estuvo a un dos por ciento del teórico esperado.
                Entre 4000 y 5999 cayeron 20 de los 99 — exactamente el 20% que dice la ecuación.
                La Nacional este mes hizo lo que tiene que hacer. Sin sobresaltos.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13,
          color: "var(--ink-muted)", textAlign: "center",
          marginTop: 14,
        }}>
          La caja dorada es la única en La Data. La usamos para lo que no se cuenta con un número solo.
        </div>
      </section>

      {/* CIERRE DE ZONA */}
      <section style={{
        padding: "32px 56px 28px",
        textAlign: "center",
        borderTop: "1px solid var(--ink-line)",
      }}>
        <div style={{
          color: "var(--cuero)", letterSpacing: "0.6em",
          fontSize: 14, marginBottom: 18,
        }}>* * *</div>
        <p style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18,
          color: "var(--ink-soft)", margin: "0 0 22px",
          maxWidth: "52ch", marginLeft: "auto", marginRight: "auto",
          lineHeight: 1.5,
        }}>
          Esta fue la Nacional de mayo. Las otras dos quinielas se comportaron distinto.
          Si te interesa cómo, entrá a Buenos Aires, a Córdoba, o directamente a la comparativa.
        </p>
        <button onClick={onBack} style={{
          fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
          padding: "10px 20px",
          background: "transparent",
          color: "var(--ink)",
          border: "1px solid var(--ink)",
          borderRadius: 2,
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "background var(--dur-fast) var(--ease-editorial), color var(--dur-fast) var(--ease-editorial)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--paper-warm)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink)"; }}
        >← Volver a La Data</button>
      </section>

      <SignatureFoot />
      <SedronarNote />
    </DataDeviceFrame>
  );
}

/* Control group — sober segmented selector */
function ControlGroup({ label, options, value, onChange }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--cuero)", marginBottom: 8,
      }}>{label}</div>
      <div style={{
        display: "flex", border: "1px solid var(--ink-line)",
      }}>
        {options.map((opt, i) => {
          const active = value === opt;
          return (
            <button key={opt}
              onClick={() => onChange(opt)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                padding: "7px 12px",
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper-warm)" : "var(--ink-muted)",
                border: 0,
                borderLeft: i === 0 ? "none" : "1px solid var(--ink-line)",
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "background var(--dur-fast) var(--ease-editorial)",
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CornerOrnament() {
  const corner = (pos) => ({
    position: "absolute", width: 12, height: 12, ...pos,
  });
  return (
    <>
      <span style={{ ...corner({ top: -1, left: -1 }), borderTop: "2px solid var(--dorado)", borderLeft: "2px solid var(--dorado)" }}></span>
      <span style={{ ...corner({ top: -1, right: -1 }), borderTop: "2px solid var(--dorado)", borderRight: "2px solid var(--dorado)" }}></span>
      <span style={{ ...corner({ bottom: -1, left: -1 }), borderBottom: "2px solid var(--dorado)", borderLeft: "2px solid var(--dorado)" }}></span>
      <span style={{ ...corner({ bottom: -1, right: -1 }), borderBottom: "2px solid var(--dorado)", borderRight: "2px solid var(--dorado)" }}></span>
    </>
  );
}

window.Nacional = Nacional;
window.ControlGroup = ControlGroup;
window.CornerOrnament = CornerOrnament;
```

===== index.html =====

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>SaleHoy · La Sala · La Data</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="../colors_and_type.css">
  <style>
    html, body { margin: 0; background: var(--paper-warm); }

    /* Topbar — mismo lenguaje que La Sala / La Vichy */
    .ld-topbar {
      max-width: 1180px;
      margin: 0 auto;
      padding: 16px 32px 12px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--ink);
      gap: 16px;
    }
    /* Logo general (marquesina con bombillas) en el header */
    .ld-logo-mark {
      height: 46px; width: auto; display: block; cursor: pointer;
      mix-blend-mode: multiply;
    }
    .ld-room {
      font-family: var(--font-serif);
      font-variant-caps: all-small-caps;
      font-feature-settings: "smcp","c2sc";
      letter-spacing: .14em; font-size: 14px; color: var(--ink);
    }
    .ld-edition {
      font-family: var(--font-sans); font-size: 11; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase; color: var(--cuero);
    }

    /* Cursor parpadeante de la marquesina */
    @keyframes ld-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    .ld-cursor { animation: ld-blink 1.05s steps(1, end) infinite; }

    /* Ticker — scroll horizontal continuo */
    @keyframes ld-ticker-scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-33.333%); }
    }
    .ld-ticker-track { animation: ld-ticker-scroll 38s linear infinite; }

    /* Sin entrada animada: priorizamos que cargue parejo en cualquier render.
       El movimiento queda para el cursor parpadeante y el ticker. */
    .ld-fade { opacity: 1; }

    /* Hover sutil en botones de zona — transform 1px */
    button:hover { transform: none; }

    /* Reduced motion — desactivar animaciones decorativas */
    @media (prefers-reduced-motion: reduce) {
      .ld-cursor, .ld-ticker-track { animation: none !important; }
      .ld-cursor { opacity: 1; }
    }

    /* ============================================================
       Responsive — mobile breakpoints
       ============================================================ */
    @media (max-width: 820px) {
      .ld-topbar { padding: 14px 20px 10px; flex-wrap: wrap; gap: 8px; }
      .ld-room { display: none; }
      .ld-logo-mark { height: 36px; }
      .ld-pizarra { max-width: 100% !important; }

      .ld-portada-head {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
        padding: 28px 22px 22px !important;
      }
      .ld-portada-head h1 { font-size: 64px !important; }
      .ld-zone-grid {
        grid-template-columns: 1fr !important;
        padding: 0 22px 28px !important;
      }
      .ld-nacional-apertura {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
      }
      .ld-stats-grid {
        grid-template-columns: 1fr !important;
      }
      .ld-cifras-grid {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
      }
      /* generic section padding */
      section { padding-left: 22px !important; padding-right: 22px !important; }
      .ld-chart-controls { gap: 14px !important; }
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <script type="text/babel" src="./Components.jsx"></script>
  <script type="text/babel" src="./LineChart.jsx"></script>
  <script type="text/babel" src="./Portada.jsx"></script>
  <script type="text/babel" src="./Nacional.jsx"></script>
  <script type="text/babel" src="./ZonaInterior.jsx"></script>
  <script type="text/babel" src="./Comparativa.jsx"></script>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      const [route, setRoute] = useState("portada"); // portada | nacional | bsas | cordoba | comparativa
      // Persist position across reload so the user doesn't lose context
      useEffect(() => {
        const saved = sessionStorage.getItem("la-data-route");
        if (saved) setRoute(saved);
      }, []);
      useEffect(() => {
        sessionStorage.setItem("la-data-route", route);
        window.scrollTo({ top: 0, behavior: "instant" });
      }, [route]);

      const labelFor = (r) => ({
        portada: "La Data",
        nacional: "La Data · Nacional",
        bsas: "La Data · Buenos Aires",
        cordoba: "La Data · Córdoba",
        comparativa: "La Data · Comparativa",
      })[r] || "La Data";

      return (
        <>
          <div className="ld-topbar">
            <img className="ld-logo-mark" src="../assets/logo-general-marquesina.png"
                 alt="SaleHoy · Revista cultural del juego y el azar"
                 onClick={() => setRoute("portada")} />
            <span className="ld-room">La sala · {labelFor(route)} · martes 9 de junio, 2026</span>
            <span className="ld-edition">Edición XII</span>
          </div>

          <div className="ld-fade" key={route}>
            {route === "portada"     && <Portada onOpenZone={setRoute} />}
            {route === "nacional"    && <Nacional onBack={() => setRoute("portada")} onOpenZone={setRoute} />}
            {route === "bsas"        && <ZonaInterior zoneId="bsas"    onBack={() => setRoute("portada")} onOpenZone={setRoute} />}
            {route === "cordoba"     && <ZonaInterior zoneId="cordoba" onBack={() => setRoute("portada")} onOpenZone={setRoute} />}
            {route === "comparativa" && <Comparativa onBack={() => setRoute("portada")} />}
          </div>
        </>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

===== colors_and_type.css =====

```css
/* ============================================================
   SaleHoy · Design Tokens
   Revista cultural del juego y el azar
   ============================================================ */

/* Webfonts via Google Fonts — see fonts/README.md for substitution notes */
@import url("https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=VT323&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

:root {
  /* ---------- Paleta ---------- */
  /* Papeles — fondos cálidos, gradación sutil */
  --paper-warm:        #F4ECDC;  /* fondo principal del producto */
  --paper-warmer:      #FAF3E2;  /* tarjetas, contraste suave */
  --paper-darker:      #E8DCC0;  /* burbujas del usuario, hover sutil */
  --paper-edge:        #DCCFAF;  /* hairlines secundarios sobre papel */

  /* Tinta — texto */
  --ink:               #1A1A1A;  /* texto principal */
  --ink-soft:          #2F2A24;  /* texto sobre papel cálido, menos contraste */
  --ink-muted:         #6B6358;  /* texto secundario neutro */
  --ink-line:          #B8A98A;  /* hairlines, divisores */

  /* Acentos */
  --rojo:              #9B2226;  /* rojo profundo: números, ornamentos activos */
  --rojo-deep:         #7A1C1F;  /* hover / pressed sobre rojo */
  --cuero:             #6B4423;  /* marrón cuero: metadatos, contexto */
  --cuero-soft:        #8A5E37;  /* metadatos secundarios */
  --dorado:            #C9A96E;  /* dorado: jackpot, destacados — uso esporádico */
  --dorado-deep:       #A8884E;  /* dorado oscurecido para hover */

  /* Acentos por narrador — usar SOLO dentro de contenido firmado por el narrador.
     No romper la regla "un acento por pantalla" en contextos generales. */
  --acento-vichy:      #9B2226;  /* La Vichy — rojo profundo */
  --acento-paulo:      #6B4423;  /* Paulo Castillo — cuero, voz de radio cordobesa */
  --acento-anibal:     #4A2818;  /* Aníbal Belmonte — sepia denso, pluma de archivo */
  --acento-maria:      #C9A96E;  /* María Lange — dorado contenido (excepción a la regla "dorado jackpot-only") */
  --acento-maria-deep: #A8884E;  /* María — variante text-safe sobre papel cálido */
  --acento-tomas:      #2D6043;  /* Tomás Vera — verde editorial, no fluorescente */

  /* Semántica */
  --bg:                var(--paper-warm);
  --bg-elev:           var(--paper-warmer);
  --bg-sunk:           var(--paper-darker);
  --fg:                var(--ink);
  --fg-soft:           var(--ink-soft);
  --fg-muted:          var(--ink-muted);
  --fg-meta:           var(--cuero);          /* metadata editorial */
  --accent:            var(--rojo);
  --accent-deep:       var(--rojo-deep);
  --highlight:         var(--dorado);
  --rule:              var(--ink-line);

  /* ---------- Tipografía ---------- */
  --font-display:      "Spectral", "Source Serif Pro", Georgia, serif;
  --font-serif:        "Spectral", "Source Serif Pro", Georgia, serif;
  --font-sans:         "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono:         "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  --font-arcade-crt:   "VT323", "Courier New", monospace;            /* La Sala / pantallas CRT */
  --font-arcade-pixel: "Press Start 2P", "VT323", monospace;          /* uso restringido — jackpot, marquees */

  /* Escala tipográfica (modular ~1.2, ajustada editorial) */
  --fs-12: 0.75rem;     /* 12 — metadata muy pequeña */
  --fs-13: 0.8125rem;   /* 13 — small caps de sección */
  --fs-14: 0.875rem;    /* 14 — chrome digital */
  --fs-16: 1rem;        /* 16 — cuerpo base */
  --fs-18: 1.125rem;    /* 18 — cuerpo editorial */
  --fs-20: 1.25rem;     /* 20 — bajada */
  --fs-24: 1.5rem;      /* 24 — h4 / título de tarjeta */
  --fs-30: 1.875rem;    /* 30 — h3 */
  --fs-36: 2.25rem;     /* 36 — h2 */
  --fs-48: 3rem;        /* 48 — h1 */
  --fs-64: 4rem;        /* 64 — display */
  --fs-96: 6rem;        /* 96 — masthead / portadas */

  /* Pesos */
  --fw-light:    300;
  --fw-regular:  400;
  --fw-medium:   500;
  --fw-semibold: 600;
  --fw-bold:     700;
  --fw-black:    800;

  /* Line-heights */
  --lh-tight:   1.05;   /* display */
  --lh-snug:    1.18;   /* títulos */
  --lh-normal:  1.45;   /* UI */
  --lh-prose:   1.65;   /* prosa editorial Spectral */
  --lh-loose:   1.85;   /* citas en bastardilla */

  /* Tracking — sustantivos importantes */
  --tr-tight:        -0.02em;  /* titulares grandes */
  --tr-snug:         -0.01em;  /* títulos */
  --tr-normal:        0em;
  --tr-wide:          0.04em;  /* metadata Inter */
  --tr-section:       0.12em;  /* SMALL CAPS de sección */
  --tr-mono-wide:     0.02em;  /* mono datos técnicos */

  /* ---------- Espaciado ---------- */
  --s-0:   0;
  --s-1:   2px;
  --s-2:   4px;
  --s-3:   8px;
  --s-4:   12px;
  --s-5:   16px;
  --s-6:   20px;
  --s-7:   24px;
  --s-8:   32px;
  --s-9:   40px;
  --s-10:  48px;
  --s-11:  64px;
  --s-12:  80px;
  --s-13:  96px;
  --s-14:  120px;

  /* Anchos de columna editorial */
  --col-narrow:   38ch;   /* sidebar */
  --col-prose:    62ch;   /* columna de lectura ideal */
  --col-wide:     78ch;   /* prosa amplia */

  /* ---------- Bordes y radios ---------- */
  --radius-0:   0px;       /* default editorial */
  --radius-1:   2px;       /* sello, chip */
  --radius-2:   4px;       /* botón pequeño, input */
  --radius-3:   6px;       /* tarjeta digital */
  --radius-4:   8px;       /* tarjeta grande */
  --radius-5:   12px;      /* MÁXIMO permitido */

  --bw-hair:    1px;
  --bw-rule:    1.5px;
  --bw-bold:    2px;
  --bw-frame:   3px;       /* doble borde tarot */

  /* ---------- Sombras (mínimas, nunca agresivas) ---------- */
  --shadow-none: none;
  --shadow-paper: 0 1px 0 rgba(26,26,26,0.04);
  --shadow-soft:  0 1px 2px rgba(26,26,26,0.05), 0 1px 1px rgba(26,26,26,0.04);
  --shadow-lift:  0 2px 6px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.05);
  /* shadow-lift es el techo; no usar mayor profundidad */

  /* ---------- Animación ---------- */
  --ease-editorial:  cubic-bezier(0.2, 0.0, 0.0, 1.0);  /* salida elegante */
  --ease-in-out:     cubic-bezier(0.4, 0.0, 0.2, 1.0);
  --dur-fast:        120ms;
  --dur-base:        200ms;
  --dur-slow:        360ms;
}

/* ============================================================
   Semantic element styles — drop into a project and prose works
   ============================================================ */

html, body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--fs-16);
  line-height: var(--lh-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Display titles — masthead, opening titles */
.sh-masthead {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-96);
  line-height: var(--lh-tight);
  letter-spacing: var(--tr-tight);
  color: var(--ink);
}

h1, .sh-h1 {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-48);
  line-height: var(--lh-snug);
  letter-spacing: var(--tr-snug);
  margin: 0 0 var(--s-5);
  text-wrap: pretty;
}

h2, .sh-h2 {
  font-family: var(--font-display);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-36);
  line-height: var(--lh-snug);
  letter-spacing: var(--tr-snug);
  margin: var(--s-9) 0 var(--s-5);
  text-wrap: pretty;
}

h3, .sh-h3 {
  font-family: var(--font-display);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-30);
  line-height: var(--lh-snug);
  margin: var(--s-8) 0 var(--s-4);
}

h4, .sh-h4 {
  font-family: var(--font-display);
  font-weight: var(--fw-medium);
  font-size: var(--fs-24);
  line-height: var(--lh-snug);
  margin: var(--s-7) 0 var(--s-3);
}

/* Section eyebrow — SMALL CAPS in cuero */
.sh-eyebrow,
.sh-section-label {
  font-family: var(--font-serif);
  font-variant-caps: all-small-caps;
  font-feature-settings: "smcp", "c2sc";
  font-weight: var(--fw-medium);
  font-size: var(--fs-13);
  letter-spacing: var(--tr-section);
  color: var(--cuero);
  display: inline-block;
}

/* Prosa editorial — el cuerpo largo del artículo */
.sh-prose {
  font-family: var(--font-serif);
  font-weight: var(--fw-regular);
  font-size: var(--fs-18);
  line-height: var(--lh-prose);
  color: var(--ink-soft);
  max-width: var(--col-prose);
  text-wrap: pretty;
  hyphens: auto;
}
.sh-prose p { margin: 0 0 var(--s-5); }
.sh-prose p + p { text-indent: 1.25em; margin-top: 0; } /* sangría editorial */
.sh-prose p:first-of-type { text-indent: 0; }

/* Drop cap opcional — capitular roja */
.sh-prose .sh-dropcap::first-letter,
.sh-prose.sh-has-dropcap > p:first-of-type::first-letter {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  color: var(--rojo);
  float: left;
  font-size: 4.2em;
  line-height: 0.86;
  padding: 0.08em 0.08em 0 0;
  margin-right: 0.05em;
}

/* Bajada / standfirst */
.sh-deck,
.sh-standfirst {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: var(--fw-regular);
  font-size: var(--fs-20);
  line-height: var(--lh-prose);
  color: var(--ink-soft);
  max-width: var(--col-prose);
}

/* Body sans — UI, chat, formularios */
p, .sh-body {
  font-family: var(--font-sans);
  font-size: var(--fs-16);
  line-height: var(--lh-normal);
  color: var(--fg);
}

/* Metadata — cuero, sans, ancho */
.sh-meta {
  font-family: var(--font-sans);
  font-weight: var(--fw-medium);
  font-size: var(--fs-12);
  letter-spacing: var(--tr-wide);
  text-transform: uppercase;
  color: var(--cuero);
}

/* Cita bloque */
blockquote, .sh-pullquote {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: var(--fw-regular);
  font-size: var(--fs-24);
  line-height: var(--lh-loose);
  color: var(--ink);
  border: 0;
  margin: var(--s-8) 0;
  padding: 0 0 0 var(--s-5);
  border-left: var(--bw-bold) solid var(--rojo);
  max-width: var(--col-prose);
}
.sh-pullquote cite {
  display: block;
  font-style: normal;
  font-size: var(--fs-13);
  letter-spacing: var(--tr-section);
  text-transform: uppercase;
  color: var(--cuero);
  margin-top: var(--s-4);
}

/* Mono datos técnicos */
code, kbd, samp, .sh-mono {
  font-family: var(--font-mono);
  font-size: 0.92em;
  letter-spacing: var(--tr-mono-wide);
}
.sh-chip-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-13);
  background: var(--paper-darker);
  color: var(--ink);
  padding: 2px 8px;
  border-radius: var(--radius-1);
  border: 1px solid var(--ink-line);
}

/* Pantalla CRT / arcade — restringido a La Sala */
.sh-crt {
  font-family: var(--font-arcade-crt);
  font-size: 1.5em;
  letter-spacing: 0.02em;
  line-height: 1.1;
}
.sh-pixel {
  font-family: var(--font-arcade-pixel);
  font-size: var(--fs-12);
  letter-spacing: 0.04em;
  line-height: 1.4;
}

/* Hairlines */
hr, .sh-rule {
  border: 0;
  height: 1px;
  background: var(--rule);
  margin: var(--s-8) 0;
}
.sh-rule-bold { background: var(--ink); height: var(--bw-bold); }
.sh-rule-double {
  height: 5px;
  background: none;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--ink);
}

/* Enlaces editoriales */
a, .sh-link {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--rojo);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: color var(--dur-fast) var(--ease-editorial);
}
a:hover { color: var(--rojo); }
```

