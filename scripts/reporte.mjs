// Reporte semanal de medición (ver MEDICION.md y CLAUDE.md).
//
//   node scripts/reporte.mjs fechas [AAAA-SS]   -> fechas de la semana ISO (lunes a domingo);
//                                                  sin argumento, la última semana completa
//   node scripts/reporte.mjs generar AAAA-SS    -> lee REPORTES/datos/AAAA-SS.json y escribe REPORTES/AAAA-SS.md
//
// El JSON de datos tiene dos claves, "sesiones" y "eventos", con lo que devuelve
// Supermetrics (propiedad de Google Analytics "Salehoy"): o la tabla compacta de
// texto tal cual, o una lista de objetos. Columnas:
//   sesiones: date, city, deviceCategory, sessionDefaultChannelGrouping, sessionSource,
//             sessions, engagedSessions, userEngagementDuration
//   eventos:  eventName, city, deviceCategory, sessionDefaultChannelGrouping, eventCount
//
// Todo se calcula desde totales; ningún porcentaje se promedia.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MINIMO_PARA_CONCLUIR = 30;      // sesiones reales
const SEGUNDOS_SESION_MIA = 20;       // promedio por sesión con interacción, para contarla como de Pedro

// Eventos propios del sitio (public/visita.js), en el orden en que se informan.
const EVENTOS = [
  ["regalar_toque", "toque en «regalar»"],
  ["regalo_llegada", "llegada a la página de regalo"],
  ["direccion_copiada", "copia de la dirección"],
  ["regalo_billetera_abierta", "abrió la billetera desde el botón"],
  ["regalo_enviado", "regalo enviado desde el botón"],
  ["ya_regale", "tocó «ya regalé»"],
  ["estela_generada", "abrió «mi estela»"],
  ["estela_guardada", "guardó su estela (imagen o video)"],
  ["estela_compartida", "compartió su estela (enlace o archivo)"],
  ["estela_vista", "visita por el enlace de una estela"],
  ["sonido_activado", "activó el sonido"],
  ["estrella_vista", "visita a la página de una estrella"],
  ["estrella_enlace_copiado", "copió el enlace de una estrella"]
];

// ---------- semanas ISO ----------
function lunesDeSemana(anio, semana) {
  const cuatroEnero = new Date(Date.UTC(anio, 0, 4));           // siempre cae en la semana 1
  const dia = cuatroEnero.getUTCDay() || 7;
  const lunes1 = new Date(cuatroEnero); lunes1.setUTCDate(cuatroEnero.getUTCDate() - dia + 1);
  const lunes = new Date(lunes1); lunes.setUTCDate(lunes1.getUTCDate() + (semana - 1) * 7);
  return lunes;
}
function semanaDe(fecha) {
  const f = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  const dia = f.getUTCDay() || 7;
  f.setUTCDate(f.getUTCDate() + 4 - dia);                        // jueves de esa semana
  const inicio = new Date(Date.UTC(f.getUTCFullYear(), 0, 1));
  return { anio: f.getUTCFullYear(), semana: Math.ceil(((f - inicio) / 86400000 + 1) / 7) };
}
const iso = (f) => f.toISOString().slice(0, 10);
const clave = (s) => s.anio + "-" + String(s.semana).padStart(2, "0");
function rango(id) {
  const m = /^(\d{4})-(\d{1,2})$/.exec(id || "");
  if (!m) throw new Error("La semana se escribe AAAA-SS, por ejemplo 2026-45.");
  const lunes = lunesDeSemana(+m[1], +m[2]);
  const domingo = new Date(lunes); domingo.setUTCDate(lunes.getUTCDate() + 6);
  return { id: m[1] + "-" + m[2].padStart(2, "0"), desde: iso(lunes), hasta: iso(domingo) };
}
function ultimaCompleta() {
  const hoy = new Date();
  const atras = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7));
  return clave(semanaDe(atras));
}

// ---------- lectura de datos ----------
function partirLinea(linea) {
  const celdas = []; let actual = ""; let entre = false;
  for (const c of linea) {
    if (c === '"') entre = !entre;
    else if (c === "," && !entre) { celdas.push(actual); actual = ""; }
    else actual += c;
  }
  celdas.push(actual);
  return celdas;
}
function filas(dato) {
  if (Array.isArray(dato)) return dato;
  if (typeof dato !== "string" || !dato.trim()) return [];
  const lineas = dato.split(/\r?\n/).filter((l) => l.trim());
  const cab = /\{([^}]*)\}/.exec(lineas[0]);
  if (!cab) throw new Error("No reconozco el formato de la tabla: " + lineas[0].slice(0, 60));
  const columnas = cab[1].split(",").map((c) => c.trim());
  return lineas.slice(1).map((l) => {
    const celdas = partirLinea(l.trim());
    return Object.fromEntries(columnas.map((c, i) => [c, celdas[i] ?? ""]));
  });
}
const num = (v) => Number(v) || 0;
const sinTilde = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Fila "de Pedro": Córdoba, escritorio, entrada directa. La duración se mira aparte.
function filaDePedro(f) {
  return sinTilde(f.city) === "cordoba" && f.deviceCategory === "desktop" && f.sessionDefaultChannelGrouping === "Direct";
}
const plural = (n, uno, muchos) => n + " " + (n === 1 ? uno : muchos);
const ses = (n) => plural(n, "sesión", "sesiones");

// ---------- reporte ----------
function generar(id) {
  const r = rango(id);
  const archivo = path.join(RAIZ, "REPORTES", "datos", r.id + ".json");
  if (!fs.existsSync(archivo)) throw new Error("Falta " + path.relative(RAIZ, archivo) + " (ver .claude/commands/reporte-semanal.md).");
  const datos = JSON.parse(fs.readFileSync(archivo, "utf8"));
  const sesiones = filas(datos.sesiones);
  const eventos = filas(datos.eventos);

  let total = 0, bots = 0, mias = 0, segundosMios = 0;
  const reales = new Map();   // origen -> { sesiones, segundos }
  for (const f of sesiones) {
    const n = num(f.sessions), conInteraccion = Math.min(num(f.engagedSessions), n), seg = num(f.userEngagementDuration);
    total += n;
    bots += n - conInteraccion;
    if (!conInteraccion) continue;
    if (filaDePedro(f) && seg / conInteraccion >= SEGUNDOS_SESION_MIA) { mias += conInteraccion; segundosMios += seg; continue; }
    const origen = [f.sessionDefaultChannelGrouping || "(sin canal)", f.sessionSource || "(sin fuente)", f.city || "(sin ciudad)", f.deviceCategory || "?"].join(" · ");
    const o = reales.get(origen) || { sesiones: 0, segundos: 0 };
    o.sesiones += conInteraccion; o.segundos += seg;
    reales.set(origen, o);
  }
  const totalReales = [...reales.values()].reduce((a, o) => a + o.sesiones, 0);

  const cuenta = new Map(EVENTOS.map(([e]) => [e, { resto: 0, pedro: 0 }]));
  for (const f of eventos) {
    const c = cuenta.get(f.eventName);
    if (!c) continue;
    if (filaDePedro(f)) c.pedro += num(f.eventCount); else c.resto += num(f.eventCount);
  }
  const totalEventos = [...cuenta.values()].reduce((a, c) => a + c.resto, 0);
  const eventosPedro = [...cuenta.values()].reduce((a, c) => a + c.pedro, 0);

  const enCurso = iso(new Date()) <= r.hasta;
  const L = [];
  L.push("# Semana " + r.id + " · " + r.desde + " a " + r.hasta + (enCurso ? " (en curso: datos parciales)" : ""));
  L.push("");

  if (totalReales === 0 && totalEventos === 0) {
    L.push("Sin cambios relevantes esta semana (" + ses(total) + " en total: " + bots + " probablemente de bots, " + mias + " probablemente mías, 0 reales; 0 eventos de visitantes).");
  } else {
    L.push("Fuente: Google Analytics, propiedad «Salehoy», por Supermetrics. Hora de Argentina.");
    L.push("");
    L.push("## Sesiones");
    L.push("");
    L.push("| | sesiones | de un total de |");
    L.push("|---|---:|---:|");
    L.push("| Total | " + total + " | " + total + " |");
    L.push("| Probablemente bots (sin interacción) | " + bots + " | " + total + " |");
    L.push("| Probablemente mías (Córdoba, escritorio, directo, largas) | " + mias + " | " + total + " |");
    L.push("| **Reales** | **" + totalReales + "** | " + total + " |");
    L.push("");
    if (mias) L.push("Las probablemente mías sumaron " + segundosMios + " s de uso en " + ses(mias) + ".");
    if (totalReales) {
      L.push("");
      L.push("### Sesiones reales, por origen");
      L.push("");
      L.push("| canal · fuente · ciudad · dispositivo | sesiones | segundos de uso |");
      L.push("|---|---:|---:|");
      for (const [origen, o] of [...reales].sort((a, b) => b[1].sesiones - a[1].sesiones)) L.push("| " + origen + " | " + o.sesiones + " | " + o.segundos + " |");
    }
    L.push("");
    L.push("## Eventos (sin los de mis sesiones)");
    L.push("");
    if (totalEventos === 0) {
      L.push("Ninguno de los eventos medidos ocurrió en sesiones de visitantes" + (eventosPedro ? " (" + eventosPedro + " en las mías, no contados)." : "."));
    } else {
      L.push("| evento | qué es | veces | sesiones reales de la semana |");
      L.push("|---|---|---:|---:|");
      for (const [e, que] of EVENTOS) { const c = cuenta.get(e); if (c.resto) L.push("| `" + e + "` | " + que + " | " + c.resto + " | " + totalReales + " |"); }
      const ceros = EVENTOS.filter(([e]) => !cuenta.get(e).resto).map(([e]) => "`" + e + "`");
      if (ceros.length) { L.push(""); L.push("En cero: " + ceros.join(", ") + "."); }
      if (eventosPedro) { L.push(""); L.push("En mis sesiones hubo " + eventosPedro + " eventos más, no contados."); }
      L.push("");
      L.push("«Veces» cuenta eventos, no sesiones: una misma sesión puede sumar más de una.");
    }
    L.push("");
    L.push("## Lectura");
    L.push("");
    if (totalReales < MINIMO_PARA_CONCLUIR) {
      L.push("Con " + ses(totalReales).replace("sesión", "sesión real").replace("sesiones", "sesiones reales") + " (menos de " + MINIMO_PARA_CONCLUIR + ") no se saca ninguna conclusión: esto solo describe lo que pasó.");
    } else {
      const toques = cuenta.get("regalar_toque").resto;
      L.push("Toques en «regalar»: " + toques + " en " + totalReales + " sesiones reales (" + (100 * toques / totalReales).toFixed(1) + "%). Comparar contra las metas de `MEDICION.md`.");
    }
  }
  L.push("");
  L.push("<!-- Cómo se clasifica: MEDICION.md. Bots = sesiones sin interacción según Google Analytics (menos de 10 s, una sola página y ningún evento clave). Mías = Córdoba + escritorio + directo con " + SEGUNDOS_SESION_MIA + " s o más de promedio. Es una aproximación sobre filas agregadas, no sesión por sesión. -->");
  L.push("");

  const salida = path.join(RAIZ, "REPORTES", r.id + ".md");
  fs.writeFileSync(salida, L.join("\n"));
  console.log("Escrito " + path.relative(RAIZ, salida));
  console.log(L.join("\n"));
}

const [orden, arg] = process.argv.slice(2);
try {
  if (orden === "fechas") console.log(JSON.stringify(rango(arg || ultimaCompleta())));
  else if (orden === "generar") generar(arg);
  else { console.log("Uso: node scripts/reporte.mjs fechas [AAAA-SS] | generar AAAA-SS"); process.exit(1); }
} catch (e) { console.error(e.message); process.exit(1); }
