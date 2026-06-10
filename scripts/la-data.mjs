#!/usr/bin/env node
// La Data — motor de análisis de la Quiniela (SaleHoy)
// Lee los HTML crudos de Rutas1000 de un mes, computa todas las métricas
// y escribe el JSON que consume el componente. NO calcula prosa: eso es
// editorial (vive en el archivo .textos.json, que este script nunca pisa).
//
// Uso:  node scripts/la-data.mjs 2026-05
// Lee:  data/quinielas/*.html   (todos los exports juntos; se deduplican y se filtra el mes pedido)
// Escribe: src/data/la-data/2026-05.datos.json
//          src/data/la-data/2026-05.textos.json   (solo si no existe; esqueleto a completar)

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mes = process.argv[2];
if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
  console.error('Uso: node scripts/la-data.mjs YYYY-MM   (ej. 2026-05)');
  process.exit(1);
}

const DIA_RE = /^([A-Za-zÁÉÍÓÚáéíóúñ]+?)(\d{2}\/\d{2}\/\d{4})(\d{2}:\d{2})$/;
// Reconoce SOLO las tres quinielas de La Data por su nombre. Cualquier otra
// (Ciudad/CABA, Santa Fe, Montevideo, etc.) devuelve '_ignorar_' y se descarta:
// así un export equivocado nunca contamina en silencio.
const ZONA_DE_MARCADOR = (t) => {
  const s = t.toLowerCase();
  if (!s.startsWith('quiniela')) return null;           // no es un marcador de zona
  if (s.includes('córdoba') || s.includes('cordoba')) return 'cordoba';
  if (s.includes('ciudad') || s.includes('nacional')) return 'nacional'; // "Quiniela de la Ciudad" = la ex-Nacional
  if (s.includes('buenos aires')) return 'buenosAires';
  return '_ignorar_';                                   // cualquier otra quiniela (Santa Fe, etc.)
};
const ignorados = new Set(); // marcadores de quinielas que se descartaron (para avisar)

const pad = (n, w) => String(n).padStart(w, '0');
const iso = (ddmmyyyy) => { const [d, m, y] = ddmmyyyy.split('/'); return `${y}-${m}-${d}`; };

// Decisión editorial: en un "top 5", si varios números empatan en el corte,
// se muestran TODOS (el top puede traer más de 5). Nada de elegir uno arbitrario.
function topConEmpates(ranking, n = 5) { // ranking ordenado desc por cantidad
  if (ranking.length <= n) return ranking.slice();
  const corte = ranking[n - 1][1];
  return ranking.filter((e) => e[1] >= corte);
}
function bottomConEmpates(ranking, n = 5) { // mismo criterio para el fondo
  const asc = [...ranking].reverse();
  if (asc.length <= n) return asc.slice();
  const corte = asc[n - 1][1];
  return asc.filter((e) => e[1] <= corte);
}

// ---------- parseo de un archivo HTML ----------
function parseHTML(html) {
  const $ = cheerio.load(html);
  const sorteos = [];
  let zona = 'nacional'; // el primer bloque no tiene marcador
  $('tr').each((_, tr) => {
    const celdas = $(tr).find('td').map((__, td) => $(td).text().trim()).get();
    if (!celdas.some(Boolean)) return;
    const f0 = celdas[0];
    const z = ZONA_DE_MARCADOR(f0);
    if (z !== null) {
      if (z === '_ignorar_') ignorados.add(f0.split('Resultados')[0].trim());
      zona = z;
      return;
    }
    if (f0 === 'Fecha') return;
    const m = DIA_RE.exec(f0);
    if (!m) return;
    if (zona === '_ignorar_') return; // bloque de una quiniela que no es de La Data
    const [, dia, fecha, hora] = m;
    const numeros = celdas.slice(1, 21).filter((s) => s !== '').map((s) => parseInt(s, 10));
    if (numeros.length === 0) return;
    sorteos.push({ zona, dia, fecha, hora, numeros });
  });
  return sorteos;
}

// ---------- carga + dedupe de TODOS los HTML, luego filtro por mes ----------
const dirCrudos = join(ROOT, 'data', 'quinielas');
if (!existsSync(dirCrudos)) { console.error(`No existe la carpeta ${dirCrudos}`); process.exit(1); }
const archivos = readdirSync(dirCrudos).filter((f) => f.toLowerCase().endsWith('.html'));
if (archivos.length === 0) { console.error(`No hay .html en ${dirCrudos}`); process.exit(1); }

const vistos = new Set();
const crudos = [];
for (const f of archivos) {
  for (const s of parseHTML(readFileSync(join(dirCrudos, f), 'utf-8'))) {
    const k = `${s.zona}|${s.fecha}|${s.hora}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    crudos.push(s);
  }
}
// Los exports de Rutas1000 ("últimas 100 jugadas") pueden cruzar meses.
// Nos quedamos solo con los sorteos del mes pedido.
const todos = crudos.filter((s) => iso(s.fecha).startsWith(`${mes}-`));
if (todos.length === 0) { console.error(`No hay sorteos de ${mes} en ${dirCrudos}`); process.exit(1); }

if (ignorados.size) {
  console.warn(`\n  ⚠ Ignoré bloques que NO son de La Data: ${[...ignorados].join(', ')}`);
  console.warn(`    (La Data solo usa Nacional, Buenos Aires y Córdoba. Revisá que bajaste el export correcto.)`);
}

// ---------- métricas ----------
function analizarZona(sorteos) {
  const dos = new Map(), tres = new Map(), cuatro = new Map();
  const decada = Array(10).fill(0), milar = Array(10).fill(0), term = Array(10).fill(0);
  let extracciones = 0;
  const primeras = [];
  for (const s of sorteos) {
    primeras.push(s.numeros[0]); // número "a primera" (1º)
    for (const v of s.numeros) {
      extracciones++;
      const d2 = v % 100, d3 = v % 1000;
      dos.set(d2, (dos.get(d2) || 0) + 1);
      tres.set(d3, (tres.get(d3) || 0) + 1);
      cuatro.set(v, (cuatro.get(v) || 0) + 1);
      decada[Math.floor(d2 / 10)]++;
      milar[Math.floor(v / 1000)]++;
      term[v % 10]++;
    }
  }
  const esperado2 = extracciones / 100;
  const ranking = [...dos.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const fmt = (e) => ({ numero: pad(e[0], 2), apariciones: e[1], vsPromedio: e[1] / esperado2 - 1 });
  const top = topConEmpates(ranking, 5).map(fmt);
  const bottom = bottomConEmpates(ranking, 5).map(fmt);

  const ranking3 = [...tres.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const top3cifras = topConEmpates(ranking3, 5).map((e) => ({ numero: pad(e[0], 3), apariciones: e[1] }));

  const cnt = (map) => [...map.values()];
  const prom = primeras.reduce((a, b) => a + b, 0) / primeras.length;
  const en4a5999 = primeras.filter((v) => v >= 4000 && v <= 5999).length;

  return {
    sorteos: sorteos.length,
    extracciones,
    dosCifras: {
      esperadoPorNumero: +esperado2.toFixed(2),
      top, bottom,
      porDecada: decada.map((c, i) => ({ rango: `${pad(i * 10, 2)}-${pad(i * 10 + 9, 2)}`, apariciones: c })),
    },
    terminaciones: term.map((c, i) => ({ digito: String(i), apariciones: c, pct: c / extracciones })),
    tresCifras: {
      unicos: tres.size,
      repetidos2omas: cnt(tres).filter((c) => c >= 2).length,
      top: top3cifras,
    },
    cuatroCifras: {
      unicos: cuatro.size,
      repetidos2omas: cnt(cuatro).filter((c) => c >= 2).length,
    },
    porMilar: milar.map((c, i) => ({ rango: `${pad(i * 1000, 4)}-${pad(i * 1000 + 999, 4)}`, apariciones: c })),
    aPrimera: {
      promedio: Math.round(prom),
      pct4000a5999: en4a5999 / primeras.length,
      esperado4000a5999: 0.20,
    },
  };
}

const porZona = { nacional: [], buenosAires: [], cordoba: [] };
for (const s of todos) porZona[s.zona].push(s);
for (const z of ['nacional', 'buenosAires', 'cordoba']) {
  if (porZona[z].length === 0) console.warn(`  ⚠ ${z}: 0 sorteos en ${mes} — falta el export de esa quiniela.`);
}
// El sorteo de las 22:15 (turista) es EXCLUSIVO de Córdoba. Si aparece en otra zona,
// es porque el bloque de Córdoba vino sin título y se mezcló. Cortamos antes de ensuciar nada.
if (todos.some((s) => s.hora === '22:15' && s.zona !== 'cordoba')) {
  console.error('\n  ✖ Hay sorteos de las 22:15 (turista, exclusivo de Córdoba) fuera de Córdoba.');
  console.error('    Probablemente el bloque de Córdoba vino sin título y se mezcló con otra quiniela.');
  console.error('    Revisá el export (o bajá Córdoba en un archivo aparte). No genero nada así.');
  process.exit(1);
}

const zonas = {
  nacional: { nombre: 'Nacional', ...analizarZona(porZona.nacional) },
  buenosAires: { nombre: 'Buenos Aires', ...analizarZona(porZona.buenosAires) },
  cordoba: { nombre: 'Córdoba', ...analizarZona(porZona.cordoba) },
};
// sub-vista turista (solo Córdoba, sorteo 22:15)
const turista = porZona.cordoba.filter((s) => s.hora === '22:15');
if (turista.length) {
  const a = analizarZona(turista);
  zonas.cordoba.turista = {
    sorteos: turista.length,
    top: a.dosCifras.top,
    aPrimera: a.aPrimera,
  };
}

// ---------- comparativa ----------
function rankingDos(sorteos) {
  const dos = new Map();
  for (const s of sorteos) for (const v of s.numeros) { const d = v % 100; dos.set(d, (dos.get(d) || 0) + 1); }
  return [...dos.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map((e) => pad(e[0], 2));
}
const rk = {
  nacional: rankingDos(porZona.nacional),
  buenosAires: rankingDos(porZona.buenosAires),
  cordoba: rankingDos(porZona.cordoba),
};
const interseccion = (n) => rk.nacional.slice(0, n)
  .filter((x) => rk.buenosAires.slice(0, n).includes(x) && rk.cordoba.slice(0, n).includes(x));

const decadaResumen = (z) => {
  const arr = zonas[z].dosCifras.porDecada;
  const max = arr.reduce((a, b) => b.apariciones > a.apariciones ? b : a);
  const min = arr.reduce((a, b) => b.apariciones < a.apariciones ? b : a);
  return {
    zona: zonas[z].nombre,
    masCaliente: { rango: max.rango, apariciones: max.apariciones },
    masFria: { rango: min.rango, apariciones: min.apariciones },
    difPct: max.apariciones / min.apariciones - 1,
  };
};

const comparativa = {
  topCruzado: {
    nacional: zonas.nacional.dosCifras.top,
    buenosAires: zonas.buenosAires.dosCifras.top,
    cordoba: zonas.cordoba.dosCifras.top,
  },
  coincidenciasTop10: interseccion(10),
  coincidenciasTop20: interseccion(20),
  promedioPrimera: ['nacional', 'buenosAires', 'cordoba'].map((z) => ({
    zona: zonas[z].nombre,
    promedio: zonas[z].aPrimera.promedio,
    pct4000a5999: zonas[z].aPrimera.pct4000a5999,
  })),
  decadas: ['nacional', 'buenosAires', 'cordoba'].map(decadaResumen),
};

// ---------- periodo / totales ----------
const fechas = todos.map((s) => iso(s.fecha)).sort();
const dias = new Set(fechas).size;
const datos = {
  periodo: { desde: fechas[0], hasta: fechas[fechas.length - 1], dias },
  totales: { sorteos: todos.length, extracciones: todos.reduce((a, s) => a + s.numeros.length, 0) },
  fuente: 'Rutas1000',
  generadoEl: new Date().toISOString(),
  zonas,
  comparativa,
};

// ---------- escritura ----------
const outDatos = join(ROOT, 'src', 'data', 'la-data', `${mes}.datos.json`);
writeFileSync(outDatos, JSON.stringify(datos, null, 2));

const outTextos = join(ROOT, 'src', 'data', 'la-data', `${mes}.textos.json`);
if (!existsSync(outTextos)) {
  const v = '';
  // Una zona editorial: títulos + prosa multipárrafo (separá párrafos con una
  // línea en blanco) + las cajas de dato que haga falta + cierre.
  // En la prosa, marcá los números a resaltar con backticks: `234`.
  const zonaTxt = () => ({
    aperturaTitle: v,   // título de apertura (h2)
    apertura: v,        // prosa de apertura
    temaTitle: v,       // título del tema
    tema: v,            // prosa del tema (el componente usa la 1ª letra como capitular)
    cajas: [            // una o más cajas de dato; sumá/sacá objetos según el mes
      { label: v, valor: v, valorNota: v, texto: v },
    ],
    cierre: v,          // bajada de cierre de la zona
  });
  const skeleton = {
    label: mes,         // el componente muestra "Mayo 2026", no este string
    headline: v,        // titular del mes (resaltá el número con backticks)
    subhead: v,
    ticker: v,
    zonas: {
      nacional: zonaTxt(),
      buenosAires: zonaTxt(),
      cordoba: zonaTxt(),
      comparativa: { apertura: v, cierre: v },
    },
    cierreInforme: v,
  };
  writeFileSync(outTextos, JSON.stringify(skeleton, null, 2));
}

// ---------- resumen en pantalla (para escribir la lectura de Tomás) ----------
const pct = (x) => (x * 100).toFixed(1) + '%';
const signo = (x) => (x >= 0 ? '+' : '') + Math.round(x * 100) + '%';
console.log(`\n  LA DATA · ${mes}  ·  ${datos.periodo.desde} → ${datos.periodo.hasta}  (${dias} días)`);
console.log(`  ${datos.totales.sorteos} sorteos · ${datos.totales.extracciones} extracciones\n`);
for (const z of ['nacional', 'buenosAires', 'cordoba']) {
  const Z = zonas[z];
  console.log(`  ${Z.nombre.toUpperCase()}  (${Z.sorteos} sorteos)`);
  console.log(`    Top (con empates):  ${Z.dosCifras.top.map((e) => `${e.numero}(${e.apariciones}, ${signo(e.vsPromedio)})`).join('  ')}`);
  const d = decadaResumen(z);
  console.log(`    Década caliente: ${d.masCaliente.rango} (${d.masCaliente.apariciones}) · fría: ${d.masFria.rango} (${d.masFria.apariciones}) · dif ${signo(d.difPct)}`);
  console.log(`    A primera: prom ${Z.aPrimera.promedio} · 4000-5999: ${pct(Z.aPrimera.pct4000a5999)}`);
}
if (zonas.cordoba.turista) {
  const t = zonas.cordoba.turista;
  console.log(`    CÓRDOBA TURISTA (${t.sorteos} sorteos): top ${t.top.map((e) => `${e.numero}(${e.apariciones})`).join(' ')} · prom a primera ${t.aPrimera.promedio}`);
}
console.log(`\n  COINCIDENCIAS top 10 entre las tres: ${comparativa.coincidenciasTop10.length ? comparativa.coincidenciasTop10.join(', ') : 'NINGUNA'}`);
console.log(`  COINCIDENCIAS top 20: ${comparativa.coincidenciasTop20.length ? comparativa.coincidenciasTop20.join(', ') : 'NINGUNA'}\n`);
console.log(`  Escrito: ${outDatos}`);
console.log(`  Textos:  ${outTextos} ${existsSync(outTextos) ? '(existe, no se tocó)' : ''}\n`);
