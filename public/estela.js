/* Sin motivo — estela.js
 * Permite al visitante llevarse su estela: imagen PNG, video vertical 9:16 y enlace propio.
 * Privacidad: solo el recorrido (x, y, t) en memoria. Nada se envía a ningún lado.
 * Script clásico, sin dependencias. Expone window.SaleHoyEstela.
 *
 * Toda exportación parte SIEMPRE de la forma canónica de la estela (semilla + hasta 160 pares
 * de un byte, la misma que viaja en la URL): así un enlace muestra exactamente la misma pieza.
 */
(function () {
  'use strict';

  // ───────────────────────── constantes ─────────────────────────
  var MAX_PUNTOS = 3000;
  var MIN_PUNTOS = 12;            // con menos, la estela nace de la semilla
  var MAX_PARES = 160;            // pares (x, y) de la forma canónica, cortes incluidos
  var MAX_TRAZOS = 24;
  var VERSION_FORMATO = 1;
  var ANCHO = 1080, ALTO = 1920;  // lienzo de diseño: todo se compone en estas unidades
  var TINTA = '#0e0d12';
  var CREMA = '#f2e9d8';
  var BERMELLON = '#e2553a';
  var TAU = Math.PI * 2;
  var MARGEN = 96;
  // zona donde se acomoda la estela (deja aire abajo para el texto)
  var ZONA = { x: 132, y: 190, w: 816, h: 960 };
  var DURACION = 6200;            // ms de video
  var TIPOS_VIDEO = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  var ESCALA_LUZ = 5;             // el resplandor se pinta a 1/5 y se amplía: desenfoque gratis
  // pasadas del resplandor: [factor del grosor, suma fija, luminosidad]
  var PASADAS_LUZ = [[14, 70, 0.028], [9, 44, 0.055], [5.5, 24, 0.095], [3.2, 10, 0.165], [1.9, 3, 0.28]];
  var NIVELES = 16;
  var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  // ───────────────────────── recorrido ─────────────────────────
  var rx = new Float32Array(MAX_PUNTOS);   // x normalizada 0..1
  var ry = new Float32Array(MAX_PUNTOS);   // y normalizada 0..1
  var rt = new Float64Array(MAX_PUNTOS);   // tiempo (ms)
  var rc = new Uint8Array(MAX_PUNTOS);     // 1 = el trazo se corta después de este punto
  var total = 0;
  var version = 0;                         // cambia con cada punto: invalida la forma canónica
  var anchoV = 0, altoV = 0;

  var semillaIniciada = null;              // fijada con iniciar(segundos)
  var semillaVista = 1;                    // respaldo: la última semilla que llegó en textos
  var cargada = null;                      // estela traída de una URL: { semilla, pares }

  function medirVentana() {
    anchoV = window.innerWidth || document.documentElement.clientWidth || 1;
    altoV = window.innerHeight || document.documentElement.clientHeight || 1;
  }

  function registrar(x, y, t, corte) {
    var nx, ny, dx, dy;
    if (typeof x !== 'number' || typeof y !== 'number' || x !== x || y !== y) {
      // sin coordenadas válidas: solo vale como corte
      if (corte && total > 0 && !rc[total - 1]) { rc[total - 1] = 1; version++; }
      return;
    }
    if (!(anchoV > 0)) medirVentana();
    nx = x / anchoV; ny = y / altoV;
    if (total > 0 && !rc[total - 1]) {
      dx = nx - rx[total - 1]; dy = ny - ry[total - 1];
      if (dx * dx + dy * dy < 2e-7) {      // no se movió: no gastar lugar
        if (corte) { rc[total - 1] = 1; version++; }
        return;
      }
    }
    if (total >= MAX_PUNTOS) decimar();
    rx[total] = nx; ry[total] = ny;
    rt[total] = (typeof t === 'number' && t === t) ? t : (total ? rt[total - 1] + 16 : 0);
    rc[total] = corte ? 1 : 0;
    total++; version++;
  }

  // Lleno: de los dos tercios más viejos queda uno de cada dos (cortes y comienzos se conservan).
  function decimar() {
    var limite = (MAX_PUNTOS * 2 / 3) | 0, w = 0, enTrazo = 0, i, guardar, quita;
    for (i = 0; i < total; i++) {
      guardar = i >= limite || rc[i] === 1 || (enTrazo % 2) === 0;
      if (i < limite) enTrazo = rc[i] ? 0 : enTrazo + 1;
      if (guardar) { rx[w] = rx[i]; ry[w] = ry[i]; rt[w] = rt[i]; rc[w] = rc[i]; w++; }
    }
    total = w;
    if (total > MAX_PUNTOS - 64) {         // caso raro (casi todo cortes): soltar lo más viejo
      quita = MAX_PUNTOS >> 2;
      for (i = quita; i < total; i++) {
        rx[i - quita] = rx[i]; ry[i - quita] = ry[i]; rt[i - quita] = rt[i]; rc[i - quita] = rc[i];
      }
      total -= quita;
    }
  }

  function ventana(ancho, alto) {
    if (ancho > 0 && alto > 0 && (ancho !== anchoV || alto !== altoV)) {
      anchoV = ancho; altoV = alto; version++;
    }
  }

  function cantidad() { return total; }

  // ───────────────────────── utilidades ─────────────────────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Cualquier número a entero sin signo de 32 bits (si parece milisegundos, pasa a segundos).
  function aUint32(s) {
    s = +s;
    if (!(s === s) || !isFinite(s)) return 1;
    s = Math.floor(Math.abs(s));
    if (s > 4294967295) s = Math.floor(s / 1000);
    return s >>> 0;
  }

  function limitar(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function suave(v) { v = limitar(v); return v * v * (3 - 2 * v); }
  function seno(v) { return Math.sin(limitar(v) * Math.PI / 2); }
  function entraSale(v) { v = limitar(v); return v < 0.5 ? 2 * v * v : 1 - (2 - 2 * v) * (2 - 2 * v) / 2; }
  function distancia(ax, ay, bx, by) { var dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); }

  function lienzo(w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  }
  function soltar(c) { if (c) { c.width = 0; c.height = 0; } }

  function catmull(p0, p1, p2, p3, u) {
    var u2 = u * u, u3 = u2 * u;
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
  }

  // paletas precalculadas: no se arman cadenas de color por segmento
  var PALETA_NUCLEO = [], PALETA_LUZ = [];
  (function () {
    var i, a;
    for (i = 0; i < NIVELES; i++) {
      a = 0.72 + 0.28 * i / (NIVELES - 1);       // menos tinta = crema algo más apagado
      PALETA_NUCLEO.push('rgb(' + Math.round(14 + (242 - 14) * a) + ',' + Math.round(13 + (233 - 13) * a) + ',' + Math.round(18 + (216 - 18) * a) + ')');
    }
    for (i = 0; i < PASADAS_LUZ.length; i++) {
      a = PASADAS_LUZ[i][2];
      PALETA_LUZ.push('rgb(' + Math.round(242 * a) + ',' + Math.round(233 * a) + ',' + Math.round(216 * a) + ')');
    }
  })();

  // ───────────────────────── forma canónica (la que viaja en la URL) ─────────────────────────
  // Trazos reales, en px de pantalla (con el aspecto actual de la ventana).
  function trazosReales() {
    if (!(anchoV > 0)) medirVentana();
    var lista = [], act = null, i, x, y, diag = Math.sqrt(anchoV * anchoV + altoV * altoV), m;
    for (i = 0; i < total; i++) {
      x = rx[i] * anchoV; y = ry[i] * altoV;
      if (act) {
        m = act.x.length - 1;
        // pausa larga + salto grande: el puntero salió y volvió sin avisar
        if (rt[i] - act.t > 700 && distancia(act.x[m], act.y[m], x, y) > diag * 0.18) act = null;
      }
      if (!act) { act = { x: [], y: [], t: 0 }; lista.push(act); }
      act.x.push(x); act.y.push(y); act.t = rt[i];
      if (rc[i]) act = null;
    }
    return lista;
  }

  // Sin recorrido suficiente: un gesto caligráfico único que sale de la semilla.
  function trazosDeSemilla(semilla) {
    var azar = mulberry32(semilla ^ 0x2545f491);
    var m = 150, i, u, tr = { x: [], y: [] };
    var f1 = 0.55 + azar() * 0.7, f2 = 1.4 + azar() * 1.3, f3 = 0.7 + azar() * 1.1;
    var p1 = azar(), p2 = azar(), p3 = azar();
    var a2 = 70 + azar() * 90, inclin = (azar() - 0.5) * 300;
    for (i = 0; i < m; i++) {
      u = i / (m - 1);
      tr.x.push(500 + 340 * Math.sin(TAU * (f1 * u + p1)) * (0.55 + 0.45 * Math.sin(Math.PI * u)) +
        a2 * Math.sin(TAU * (f2 * u + p2)) + inclin * (u - 0.5));
      tr.y.push(1250 * u + 150 * Math.sin(TAU * (f3 * u + p3)));
    }
    return [tr];
  }

  // Remuestrea parejo por longitud de arco a ≤160 pares (cortes incluidos) y cuantiza a bytes.
  // Las posiciones se normalizan con escala UNIFORME (se conserva la proporción del gesto),
  // centradas en el cuadrado 0..254. El par 255,255 separa trazos.
  function aPares(trazos) {
    var lista = [], i, j, tr, m, L, acum, d, k, presupuesto, largoTotal = 0, suma, mayor, n;
    for (i = 0; i < trazos.length; i++) {
      tr = trazos[i]; m = tr.x.length;
      if (!m) continue;
      acum = [0]; L = 0;
      for (j = 1; j < m; j++) { L += distancia(tr.x[j - 1], tr.y[j - 1], tr.x[j], tr.y[j]); acum.push(L); }
      lista.push({ x: tr.x, y: tr.y, acum: acum, L: L, orden: lista.length, n: 0 });
    }
    if (!lista.length) return new Uint8Array(0);
    if (lista.length > MAX_TRAZOS) {               // demasiados trazos: quedan los más largos, en su orden
      lista.sort(function (a, b) { return (b.L - a.L) || (a.orden - b.orden); });
      lista.length = MAX_TRAZOS;
      lista.sort(function (a, b) { return a.orden - b.orden; });
    }
    k = lista.length; presupuesto = MAX_PARES - (k - 1);
    for (i = 0; i < k; i++) largoTotal += lista[i].L;
    suma = 0;
    for (i = 0; i < k; i++) {
      tr = lista[i]; tr.min = tr.L > 0 ? 2 : 1;
      tr.n = tr.L > 0 ? Math.max(2, Math.floor(presupuesto * tr.L / largoTotal)) : 1;
      suma += tr.n;
    }
    while (suma > presupuesto) {                   // recortar de a uno al trazo con más puntos
      mayor = -1;
      for (i = 0; i < k; i++) if (lista[i].n > lista[i].min && (mayor < 0 || lista[i].n > lista[mayor].n)) mayor = i;
      if (mayor < 0) break;
      lista[mayor].n--; suma--;
    }
    // remuestreo
    var px = [], py = [], cortes = [], s, seg, u, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, x, y;
    for (i = 0; i < k; i++) {
      tr = lista[i]; n = tr.n; seg = 1; m = tr.x.length;
      for (j = 0; j < n; j++) {
        if (n === 1) { x = tr.x[0]; y = tr.y[0]; }
        else {
          s = tr.L * j / (n - 1);
          while (seg < m - 1 && tr.acum[seg] < s) seg++;
          d = tr.acum[seg] - tr.acum[seg - 1];
          u = d > 0 ? (s - tr.acum[seg - 1]) / d : 0;
          x = tr.x[seg - 1] + (tr.x[seg] - tr.x[seg - 1]) * u;
          y = tr.y[seg - 1] + (tr.y[seg] - tr.y[seg - 1]) * u;
        }
        px.push(x); py.push(y); cortes.push(j === n - 1 && i < k - 1 ? 1 : 0);
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    var lado = Math.max(x1 - x0, y1 - y0, 1e-6), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, sal = [], q;
    for (i = 0; i < px.length; i++) {
      q = Math.round(127 + (px[i] - cx) / lado * 254); sal.push(q < 0 ? 0 : (q > 254 ? 254 : q));
      q = Math.round(127 + (py[i] - cy) / lado * 254); sal.push(q < 0 ? 0 : (q > 254 ? 254 : q));
      if (cortes[i]) { sal.push(255); sal.push(255); }
    }
    return new Uint8Array(sal);
  }

  function semillaPropia(textos) {
    if (semillaIniciada !== null) return semillaIniciada;
    if (textos && typeof textos.semilla === 'number' && textos.semilla === textos.semilla) semillaVista = aUint32(textos.semilla);
    return semillaVista;
  }

  var canonica = null;   // { version, semilla, pares }
  function estelaPropia(textos) {
    var semilla = semillaPropia(textos);
    if (canonica && canonica.version === version && canonica.semilla === semilla) return canonica;
    canonica = {
      version: version, semilla: semilla,
      pares: aPares(total >= MIN_PUNTOS ? trazosReales() : trazosDeSemilla(semilla))
    };
    return canonica;
  }

  // La estela activa: la cargada de una URL si la hay; si no, la del visitante.
  function activa(textos) { return cargada || estelaPropia(textos); }

  function iniciar(semillaSegundos) {
    semillaIniciada = aUint32(semillaSegundos);
  }

  function propia() { return !cargada; }

  // Vuelve a la estela del visitante después de un cargar().
  function volver() { cargada = null; }

  function aBase64url(b) {
    var s = '', i, n, resto = b.length % 3;
    for (i = 0; i + 2 < b.length; i += 3) {
      n = (b[i] << 16) | (b[i + 1] << 8) | b[i + 2];
      s += ALFABETO.charAt(n >> 18) + ALFABETO.charAt((n >> 12) & 63) + ALFABETO.charAt((n >> 6) & 63) + ALFABETO.charAt(n & 63);
    }
    if (resto === 1) { n = b[i] << 16; s += ALFABETO.charAt(n >> 18) + ALFABETO.charAt((n >> 12) & 63); }
    else if (resto === 2) { n = (b[i] << 16) | (b[i + 1] << 8); s += ALFABETO.charAt(n >> 18) + ALFABETO.charAt((n >> 12) & 63) + ALFABETO.charAt((n >> 6) & 63); }
    return s;
  }

  function deBase64url(s) {
    var largo = Math.floor(s.length * 3 / 4), b = new Uint8Array(largo), i, j = 0, n = 0, bits = 0, v;
    for (i = 0; i < s.length; i++) {
      v = ALFABETO.indexOf(s.charAt(i));
      if (v < 0) return null;
      n = (n << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; b[j++] = (n >> bits) & 255; n &= (1 << bits) - 1; }
    }
    return b;
  }

  function empaquetar(est) {
    var p = est.pares, b = new Uint8Array(5 + p.length), s = est.semilla >>> 0, i;
    b[0] = VERSION_FORMATO;
    b[1] = (s >>> 24) & 255; b[2] = (s >>> 16) & 255; b[3] = (s >>> 8) & 255; b[4] = s & 255;
    for (i = 0; i < p.length; i++) b[5 + i] = p[i];
    return aBase64url(b);
  }

  // La estela activa en formato compacto para la URL (o null si no hay nada que codificar).
  function codificar() {
    try {
      var est = activa(null);
      if (!est.pares.length) return null;
      return empaquetar(est);
    } catch (e) { return null; }
  }

  // Decodifica una estela de URL y la deja activa. Validación estricta: si falla, no cambia nada.
  function cargar(cadena) {
    var b, pares, i, x, y, nPares, previoCorte = true, est;
    if (typeof cadena !== 'string' || cadena.length < 10 || cadena.length > 436) return false;
    if (!/^[A-Za-z0-9_-]+$/.test(cadena) || cadena.length % 4 === 1) return false;
    b = deBase64url(cadena);
    if (!b || b.length < 7 || b[0] !== VERSION_FORMATO || ((b.length - 5) % 2) !== 0) return false;
    nPares = (b.length - 5) / 2;
    if (nPares < 1 || nPares > MAX_PARES) return false;
    pares = new Uint8Array(b.length - 5);
    for (i = 0; i < nPares; i++) {
      x = b[5 + i * 2]; y = b[6 + i * 2];
      if (x === 255 || y === 255) {
        // el corte es exactamente 255,255; nunca al principio, al final ni dos seguidos
        if (x !== 255 || y !== 255 || previoCorte || i === nPares - 1) return false;
        previoCorte = true;
      } else previoCorte = false;
      pares[i * 2] = x; pares[i * 2 + 1] = y;
    }
    est = { semilla: ((b[1] << 24) | (b[2] << 16) | (b[3] << 8) | b[4]) >>> 0, pares: pares };
    if (empaquetar(est) !== cadena) return false;   // solo la escritura canónica (sin bits sueltos)
    cargada = est;
    return true;
  }

  // ───────────────────────── geometría del trazo ─────────────────────────
  // Función pura de (semilla, pares): misma entrada → misma pieza, acá o desde un enlace.
  function construirGeometria(semilla, pares) {
    var azar = mulberry32(semilla ^ 0x7f4a7c15);
    var trazos = [], act = null, i, j, k, tr, m, x, y, tmp;
    for (i = 0; i + 1 < pares.length; i += 2) {
      if (pares[i] === 255) { act = null; continue; }
      if (!act) { act = { x: [], y: [] }; trazos.push(act); }
      act.x.push(pares[i]); act.y.push(pares[i + 1]);
    }

    // caja y, si es apaisado, giro de 90° (el sentido lo decide la semilla)
    var caja = medirCaja(trazos);
    var sentido = azar() < 0.5 ? 1 : -1;
    if (caja.w > caja.h * 1.2) {
      for (i = 0; i < trazos.length; i++) {
        tr = trazos[i];
        for (j = 0; j < tr.x.length; j++) { x = tr.x[j]; y = tr.y[j]; tr.x[j] = -sentido * y; tr.y[j] = sentido * x; }
      }
      caja = medirCaja(trazos);
    }

    // escala uniforme + ubicación asimétrica dentro de la zona
    var esc = Math.min(ZONA.w / caja.w, ZONA.h / caja.h);
    var ox = ZONA.x + (ZONA.w - caja.w * esc) * (0.5 + (azar() - 0.5) * 0.5) - caja.x * esc;
    var oy = ZONA.y + (ZONA.h - caja.h * esc) * (0.3 + azar() * 0.2) - caja.y * esc;
    var frecuencia = 2 + azar() * 3, fase = azar();

    // pasar a unidades de diseño, alisar el escalón de la cuantización y medir la curvatura.
    // La URL no lleva tiempos: la "velocidad" se lee de la forma (recta = rápido y fino,
    // curva cerrada = lento y cargado de tinta) más una respiración que sale de la semilla.
    var largoTotal = 0, curvas = [], qx, qy, qc, d1, d2, a, cuenta = 0;
    for (i = 0; i < trazos.length; i++) {
      tr = trazos[i]; qx = []; qy = [];
      for (j = 0; j < tr.x.length; j++) {
        x = tr.x[j] * esc + ox; y = tr.y[j] * esc + oy;
        m = qx.length;
        if (m && distancia(qx[m - 1], qy[m - 1], x, y) < 2.5) continue;
        qx.push(x); qy.push(y);
      }
      m = qx.length;
      if (m > 2) {
        tmp = qx.slice(); for (j = 1; j < m - 1; j++) qx[j] = (tmp[j - 1] + 2 * tmp[j] + tmp[j + 1]) / 4;
        tmp = qy.slice(); for (j = 1; j < m - 1; j++) qy[j] = (tmp[j - 1] + 2 * tmp[j] + tmp[j + 1]) / 4;
      }
      qc = [];
      for (j = 0; j < m; j++) {
        if (j > 0) largoTotal += distancia(qx[j - 1], qy[j - 1], qx[j], qy[j]);
        if (j === 0 || j === m - 1) { qc.push(0); continue; }
        d1 = distancia(qx[j - 1], qy[j - 1], qx[j], qy[j]); d2 = distancia(qx[j], qy[j], qx[j + 1], qy[j + 1]);
        a = Math.atan2(qy[j + 1] - qy[j], qx[j + 1] - qx[j]) - Math.atan2(qy[j] - qy[j - 1], qx[j] - qx[j - 1]);
        while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU;
        qc.push(Math.abs(a) / Math.max(1, (d1 + d2) / 2));
      }
      if (m > 2) { qc[0] = qc[1]; qc[m - 1] = qc[m - 2]; }
      for (k = 0; k < 3; k++) {                      // suavizado [1,2,1]
        tmp = qc.slice();
        for (j = 0; j < m; j++) qc[j] = (tmp[j > 0 ? j - 1 : 0] + 2 * tmp[j] + tmp[j < m - 1 ? j + 1 : m - 1]) / 4;
      }
      if (m > 1) for (j = 0; j < m; j++) curvas.push(qc[j]);
      tr.qx = qx; tr.qy = qy; tr.qc = qc;
      cuenta += m;
    }

    // la curvatura se mide contra el propio gesto: cada estela usa todo el rango de tinta
    curvas.sort(function (p, q) { return p - q; });
    var cBaja = curvas.length ? curvas[Math.floor((curvas.length - 1) * 0.12)] : 0;
    var cAlta = curvas.length ? curvas[Math.floor((curvas.length - 1) * 0.88)] : 1;
    var rango = cAlta - cBaja;

    // subdividir con Catmull-Rom a paso parejo (el índice de muestra ≈ longitud recorrida)
    var paso = Math.max(3, largoTotal / 7000);
    var X = [], Y = [], G = [], T = [], I = [];
    var ini, pasos, i0, i3, u, c0, c1, carga, s, largo, la, lb, acum, visto = 0;
    for (i = 0; i < trazos.length; i++) {
      tr = trazos[i]; qx = tr.qx; qy = tr.qy; qc = tr.qc; m = qx.length;
      if (!m) continue;
      ini = X.length;
      if (m === 1) { X.push(qx[0]); Y.push(qy[0]); G.push(5.5); T.push(0.7); I.push(1); visto++; continue; }
      for (j = 0; j < m; j++) {                      // carga de tinta 0..1
        carga = rango > 1e-9 ? suave((qc[j] - cBaja) / rango) : 0.5;
        qc[j] = limitar(0.72 * carga + 0.28 * (0.5 + 0.5 * Math.sin(TAU * (frecuencia * (visto + j) / Math.max(1, cuenta) + fase))));
      }
      visto += m;
      for (j = 0; j < m - 1; j++) {
        i0 = j > 0 ? j - 1 : 0; i3 = j + 2 < m ? j + 2 : m - 1;
        pasos = Math.max(1, Math.ceil(distancia(qx[j], qy[j], qx[j + 1], qy[j + 1]) / paso));
        c0 = qc[j]; c1 = qc[j + 1];
        for (k = 0; k < pasos; k++) {
          u = k / pasos; carga = c0 + (c1 - c0) * u;
          X.push(catmull(qx[i0], qx[j], qx[j + 1], qx[i3], u));
          Y.push(catmull(qy[i0], qy[j], qy[j + 1], qy[i3], u));
          G.push(2.6 + Math.pow(carga, 1.25) * 8.4); T.push(carga); I.push(0);
        }
      }
      X.push(qx[m - 1]); Y.push(qy[m - 1]); G.push(2.6 + Math.pow(qc[m - 1], 1.25) * 8.4); T.push(qc[m - 1]); I.push(0);
      I[ini] = 1;
      // extremos que se afinan: ataque corto y firme, salida larga y fina
      largo = 0; acum = [0];
      for (j = ini + 1; j < X.length; j++) { largo += distancia(X[j - 1], Y[j - 1], X[j], Y[j]); acum.push(largo); }
      la = Math.min(60, largo * 0.2); lb = Math.min(150, largo * 0.4);
      for (j = ini; j < X.length; j++) {
        s = acum[j - ini];
        G[j] *= (0.3 + 0.7 * seno(la > 0 ? s / la : 1)) * (0.14 + 0.86 * seno(lb > 0 ? (largo - s) / lb : 1));
      }
    }

    var N = X.length, geo = {
      N: N,
      X: new Float32Array(X), Y: new Float32Array(Y), G: new Float32Array(G),
      T: new Uint8Array(N), I: new Uint8Array(I),
      cx: caja.x * esc + ox + caja.w * esc / 2,
      cy: caja.y * esc + oy + caja.h * esc / 2
    };
    for (i = 0; i < N; i++) geo.T[i] = Math.round(limitar(T[i]) * (NIVELES - 1));
    return geo;
  }

  function medirCaja(trazos) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, i, j, tr;
    for (i = 0; i < trazos.length; i++) {
      tr = trazos[i];
      for (j = 0; j < tr.x.length; j++) {
        if (tr.x[j] < x0) x0 = tr.x[j]; if (tr.x[j] > x1) x1 = tr.x[j];
        if (tr.y[j] < y0) y0 = tr.y[j]; if (tr.y[j] > y1) y1 = tr.y[j];
      }
    }
    if (!(x1 >= x0)) { x0 = y0 = 0; x1 = y1 = 1; }
    return { x: x0, y: y0, w: Math.max(x1 - x0, 1), h: Math.max(y1 - y0, 1) };
  }

  var geoGuardada = null;
  function geometria(est) {
    var g = geoGuardada;
    if (g && g.pares === est.pares && g.semilla === est.semilla) return g.geo;
    geoGuardada = { pares: est.pares, semilla: est.semilla, geo: construirGeometria(est.semilla, est.pares) };
    return geoGuardada.geo;
  }

  // ───────────────────────── grano y fondo ─────────────────────────
  var granoGuardado = null;
  function baldosaDeGrano(semilla) {
    if (granoGuardado && granoGuardado.semilla === semilla) return granoGuardado.lienzo;
    var lado = 256, c = lienzo(lado, lado), x = c.getContext('2d');
    var img = x.createImageData(lado, lado), d = img.data, azar = mulberry32(semilla ^ 0x9e3779b9), i, r;
    for (i = 0; i < d.length; i += 4) {
      r = azar();
      if (r < 0.5) { d[i] = 242; d[i + 1] = 233; d[i + 2] = 216; d[i + 3] = (0.5 - r) * 2 * 16; }   // fibra clara
      else { d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = (r - 0.5) * 2 * 24; }                 // poro oscuro
    }
    x.putImageData(img, 0, 0);
    if (granoGuardado) soltar(granoGuardado.lienzo);
    granoGuardado = { semilla: semilla, lienzo: c };
    return c;
  }

  // Fondo completo (tinta + claridad tenue + manchas de papel + polvo + grano): se arma una sola vez.
  function crearFondo(W, H, k, ox, oy, geo, semilla) {
    var c = lienzo(W, H), x = c.getContext('2d'), azar = mulberry32(semilla ^ 0x51ed270b);
    var g, i, m, mx, img, d, r, cx = ox + geo.cx * k, cy = oy + geo.cy * k;
    x.fillStyle = TINTA; x.fillRect(0, 0, W, H);
    g = x.createRadialGradient(cx, cy, 0, cx, cy, 980 * k);
    g.addColorStop(0, 'rgba(242,233,216,0.05)'); g.addColorStop(1, 'rgba(242,233,216,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // manchas grandes y blandas: ruido chico ampliado
    m = lienzo(27, 48); mx = m.getContext('2d'); img = mx.createImageData(27, 48); d = img.data;
    for (i = 0; i < d.length; i += 4) {
      r = azar();
      if (r < 0.5) { d[i] = 242; d[i + 1] = 233; d[i + 2] = 216; } else { d[i] = d[i + 1] = d[i + 2] = 0; }
      d[i + 3] = Math.abs(r - 0.5) * 2 * 255;
    }
    mx.putImageData(img, 0, 0);
    x.imageSmoothingEnabled = true; x.globalAlpha = 0.035; x.drawImage(m, 0, 0, W, H); x.globalAlpha = 1;
    soltar(m);
    // polvo: unas pocas motas lejanas, solo en la parte alta
    x.fillStyle = CREMA;
    for (i = 0; i < 42; i++) {
      x.globalAlpha = 0.05 + azar() * 0.17;
      x.beginPath();
      x.arc(ox + azar() * ANCHO * k, oy + azar() * 1250 * k, (0.6 + azar() * 1.1) * k, 0, TAU);
      x.fill();
    }
    x.globalAlpha = 1;
    x.fillStyle = x.createPattern(baldosaDeGrano(semilla), 'repeat'); x.fillRect(0, 0, W, H);
    return c;
  }

  // ───────────────────────── pintor (capas incrementales) ─────────────────────────
  // núcleo: el trazo a resolución plena. luz: el resplandor a 1/5 sobre negro, se suma con 'lighter'.
  // Las dos capas usan 'lighten' (queda el máximo): los segmentos se pisan sin dejar cuentas.
  function crearPintor(W, H, geo, semilla) {
    var k = Math.min(W / ANCHO, H / ALTO), ox = (W - ANCHO * k) / 2, oy = (H - ALTO * k) / 2;
    var P = {
      W: W, H: H, k: k, ox: ox, oy: oy, geo: geo, semilla: semilla, hecho: 0,
      fondo: crearFondo(W, H, k, ox, oy, geo, semilla),
      nucleo: lienzo(W, H),
      luz: lienzo(Math.ceil(W / ESCALA_LUZ), Math.ceil(H / ESCALA_LUZ)),
      patron: null, patronDe: null
    };
    var fx = P.luz.width / W, fy = P.luz.height / H;
    P.cN = P.nucleo.getContext('2d');
    P.cN.setTransform(k, 0, 0, k, ox, oy);
    P.cN.lineCap = 'round'; P.cN.globalCompositeOperation = 'lighten';
    P.cL = P.luz.getContext('2d');
    P.cL.fillStyle = '#000'; P.cL.fillRect(0, 0, P.luz.width, P.luz.height);
    P.cL.setTransform(k * fx, 0, 0, k * fy, ox * fx, oy * fy);
    P.cL.lineCap = 'round'; P.cL.globalCompositeOperation = 'lighten';
    return P;
  }

  function reiniciarPintor(P) {
    P.cN.save(); P.cN.setTransform(1, 0, 0, 1, 0, 0); P.cN.clearRect(0, 0, P.W, P.H); P.cN.restore();
    P.cL.save(); P.cL.setTransform(1, 0, 0, 1, 0, 0); P.cL.globalCompositeOperation = 'source-over';
    P.cL.fillStyle = '#000'; P.cL.fillRect(0, 0, P.luz.width, P.luz.height); P.cL.restore();
    P.hecho = 0;
  }

  function liberarPintor(P) {
    if (!P) return;
    soltar(P.fondo); soltar(P.nucleo); soltar(P.luz);
    P.fondo = P.nucleo = P.luz = P.cN = P.cL = P.patron = P.patronDe = null;
  }

  // Dibuja solo las muestras nuevas [hecho, hasta).
  function avanzar(P, hasta) {
    var g = P.geo, X = g.X, Y = g.Y, G = g.G, T = g.T, I = g.I, cN = P.cN, cL = P.cL;
    var i, j, x, y, w, np = PASADAS_LUZ.length;
    if (hasta > g.N) hasta = g.N;
    for (i = P.hecho; i < hasta; i++) {
      x = X[i]; y = Y[i];
      if (I[i]) {                                   // comienzo de trazo (o toque suelto): un punto
        w = G[i];
        for (j = 0; j < np; j++) {
          cL.fillStyle = PALETA_LUZ[j];
          cL.beginPath(); cL.arc(x, y, (w * PASADAS_LUZ[j][0] + PASADAS_LUZ[j][1]) / 2, 0, TAU); cL.fill();
        }
        cN.fillStyle = PALETA_NUCLEO[T[i]];
        cN.beginPath(); cN.arc(x, y, w / 2, 0, TAU); cN.fill();
      } else {
        w = (G[i] + G[i - 1]) / 2;
        cL.beginPath(); cL.moveTo(X[i - 1], Y[i - 1]); cL.lineTo(x, y);
        for (j = 0; j < np; j++) {
          cL.strokeStyle = PALETA_LUZ[j];
          cL.lineWidth = w * PASADAS_LUZ[j][0] + PASADAS_LUZ[j][1];
          cL.stroke();
        }
        cN.strokeStyle = PALETA_NUCLEO[T[i]];
        cN.lineWidth = w;
        cN.beginPath(); cN.moveTo(X[i - 1], Y[i - 1]); cN.lineTo(x, y); cN.stroke();
      }
    }
    P.hecho = hasta;
  }

  // ───────────────────────── tipografía y maqueta ─────────────────────────
  function serif(tam, cursiva) {
    return (cursiva ? 'italic ' : '') + '400 ' + tam + 'px "Instrument Serif", "Cormorant Garamond", Georgia, "Times New Roman", serif';
  }
  function mono(tam, peso) {
    return peso + ' ' + tam + 'px "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace';
  }

  function normalizarTextos(t) {
    t = t || {};
    return {
      titulo: t.titulo != null ? String(t.titulo) : 'Sin motivo',
      frase: t.frase != null ? String(t.frase) : '',
      momento: t.momento != null ? String(t.momento) : '',
      marca: t.marca != null ? String(t.marca) : 'salehoy.com.ar',
      firma: t.firma != null ? String(t.firma) : 'Solzimer'
    };
  }

  // Las fuentes ya están en la página, pero el canvas solo las usa si terminaron de cargar.
  var fuentesVistas = {}, generacionFuentes = 0;
  function claveDeTextos(tx) { return [tx.titulo, tx.frase, tx.momento, tx.marca, tx.firma].join('\u0001'); }
  function asegurarFuentes(textos) {
    var tx = normalizarTextos(textos), clave = claveDeTextos(tx);
    return new Promise(function (resolver) {
      var hecho = false;
      function listo() {
        if (hecho) return; hecho = true;
        if (fuentesVistas[clave] !== 2) { fuentesVistas[clave] = 2; generacionFuentes++; }
        resolver();
      }
      if (fuentesVistas[clave] === 2 || !document.fonts || !document.fonts.load) { listo(); return; }
      fuentesVistas[clave] = 1;
      setTimeout(listo, 2500);                      // nunca trabar la exportación por una fuente
      try {
        Promise.all([
          document.fonts.load(serif(78, false), tx.frase || 'a'),
          document.fonts.load(serif(78, true), tx.frase || 'a'),
          document.fonts.load(mono(26, 400), tx.momento || 'a'),
          document.fonts.load(mono(29, 500), tx.titulo + tx.firma + tx.marca + ' —·')
        ]).then(listo, listo);
      } catch (e) { listo(); }
    });
  }

  // Parte la frase en palabras; si tiene dos o más oraciones, la última va en itálica y en renglón propio.
  function piezasDeFrase(frase) {
    var oraciones = [], bruto = frase.match(/[^.!?…]+[.!?…]*["”»')\]]*\s*/g) || [frase], i, s, normal, cursiva = '', piezas = [], pal;
    for (i = 0; i < bruto.length; i++) { s = bruto[i].replace(/^\s+|\s+$/g, ''); if (s) oraciones.push(s); }
    if (oraciones.length >= 2) { cursiva = oraciones.pop(); normal = oraciones.join(' '); }
    else normal = frase.replace(/^\s+|\s+$/g, '');
    pal = normal ? normal.split(/\s+/) : [];
    for (i = 0; i < pal.length; i++) piezas.push({ txt: pal[i], cursiva: false, salto: false });
    pal = cursiva ? cursiva.split(/\s+/) : [];
    for (i = 0; i < pal.length; i++) piezas.push({ txt: pal[i], cursiva: true, salto: i === 0 });
    return piezas;
  }

  function partirFrase(ctx, piezas, tam, anchoMax) {
    var lineas = [], linea = [], x = 0, i, p, w, espacio, desborda = false, j, tramos, t;
    ctx.font = serif(tam, false);
    espacio = ctx.measureText(' ').width || tam * 0.22;
    for (i = 0; i < piezas.length; i++) {
      p = piezas[i];
      ctx.font = serif(tam, p.cursiva);
      w = ctx.measureText(p.txt).width;
      if (w > anchoMax) desborda = true;
      if (linea.length && (p.salto || x + espacio + w > anchoMax)) { lineas.push(linea); linea = []; x = 0; }
      if (linea.length) x += espacio;
      linea.push({ txt: p.txt, cursiva: p.cursiva });
      x += w;
    }
    if (linea.length) lineas.push(linea);
    // juntar palabras seguidas del mismo estilo en tramos (menos fillText, mejor interletrado)
    for (i = 0; i < lineas.length; i++) {
      tramos = []; x = 0;
      for (j = 0; j < lineas[i].length; j++) {
        p = lineas[i][j]; t = tramos[tramos.length - 1];
        if (t && t.cursiva === p.cursiva) t.txt += ' ' + p.txt;
        else tramos.push({ txt: p.txt, cursiva: p.cursiva, x: 0 });
      }
      for (j = 0; j < tramos.length; j++) {
        ctx.font = serif(tam, tramos[j].cursiva);
        tramos[j].x = x; x += ctx.measureText(tramos[j].txt).width + espacio;
      }
      lineas[i] = tramos;
    }
    lineas.desborda = desborda;
    return lineas;
  }

  function partirSimple(ctx, texto, anchoMax, maxLineas) {
    var pal = texto.replace(/^\s+|\s+$/g, '').split(/\s+/), lineas = [], act = '', i, prueba;
    if (!pal[0]) return lineas;
    for (i = 0; i < pal.length; i++) {
      prueba = act ? act + ' ' + pal[i] : pal[i];
      if (act && ctx.measureText(prueba).width > anchoMax && lineas.length < maxLineas - 1) { lineas.push(act); act = pal[i]; }
      else act = prueba;
    }
    if (act) lineas.push(act);
    return lineas;
  }

  var maqueta = null;
  function maquetar(ctx, textos) {
    var tx = normalizarTextos(textos), clave = claveDeTextos(tx) + '\u0001' + generacionFuentes;
    if (maqueta && maqueta.clave === clave) return maqueta;
    var M = { clave: clave }, anchoUtil = ANCHO - MARGEN * 2, y, i, tam, lineas, piezas;

    // pie: ✱ + "Sin motivo — Solzimer · " + URL (la URL a pleno, lo demás un poco atrás)
    M.yPie = 1812; M.xPie = MARGEN + 46;
    M.pieA = (tx.titulo ? tx.titulo : '') + (tx.titulo && tx.firma ? ' — ' : '') + (tx.firma ? tx.firma : '') +
      ((tx.titulo || tx.firma) && tx.marca ? ' · ' : '');
    M.pieB = tx.marca;
    M.tamPie = 29;
    for (;;) {
      ctx.font = mono(M.tamPie, 500);
      M.anchoPieA = ctx.measureText(M.pieA).width;
      if (M.xPie + M.anchoPieA + ctx.measureText(M.pieB).width <= ANCHO - MARGEN || M.tamPie <= 18) break;
      M.tamPie--;
    }

    // momento
    ctx.font = mono(26, 400);
    M.momento = partirSimple(ctx, tx.momento, anchoUtil, 3);
    M.yMomento = [];
    y = M.yPie - 104 - (M.momento.length - 1) * 38;
    for (i = 0; i < M.momento.length; i++) M.yMomento.push(y + i * 38);

    // frase: achicar hasta que entre en cuatro renglones
    piezas = piezasDeFrase(tx.frase); tam = 78;
    for (;;) {
      lineas = partirFrase(ctx, piezas, tam, 840);
      if ((lineas.length <= 4 && !lineas.desborda) || tam <= 44) break;
      tam = Math.round(tam * 0.9);
    }
    M.tamFrase = tam; M.frase = lineas; M.yFrase = [];
    y = (M.momento.length ? M.yMomento[0] - 66 : M.yPie - 150) - (lineas.length - 1) * tam * 1.13;
    for (i = 0; i < lineas.length; i++) M.yFrase.push(y + i * tam * 1.13);
    maqueta = M;
    return M;
  }

  // El ✱ del sitio: tres líneas que se cruzan (seis puntas, la vertical incluida), trazo redondeado.
  function asterisco(ctx, cx, cy, radio, grosor) {
    var i, a;
    ctx.strokeStyle = BERMELLON; ctx.lineWidth = grosor; ctx.lineCap = 'round';
    ctx.beginPath();
    for (i = 0; i < 3; i++) {
      a = Math.PI / 2 + i * Math.PI / 3;
      ctx.moveTo(cx - Math.cos(a) * radio, cy - Math.sin(a) * radio);
      ctx.lineTo(cx + Math.cos(a) * radio, cy + Math.sin(a) * radio);
    }
    ctx.stroke();
  }

  // Textos en unidades de diseño. Cada bloque tiene su alfa (y sube unos px al aparecer).
  function dibujarTextos(ctx, M, aFrase, aMomento, aPie) {
    var i, j, t, sube;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = CREMA;
    if (aFrase > 0.003) {
      sube = (1 - aFrase) * 12; ctx.globalAlpha = aFrase;
      for (i = 0; i < M.frase.length; i++) {
        for (j = 0; j < M.frase[i].length; j++) {
          t = M.frase[i][j];
          ctx.font = serif(M.tamFrase, t.cursiva);
          ctx.fillText(t.txt, MARGEN + t.x, M.yFrase[i] + sube);
        }
      }
    }
    if (aMomento > 0.003 && M.momento.length) {
      sube = (1 - aMomento) * 10; ctx.globalAlpha = 0.55 * aMomento; ctx.font = mono(26, 400);
      for (i = 0; i < M.momento.length; i++) ctx.fillText(M.momento[i], MARGEN, M.yMomento[i] + sube);
    }
    if (aPie > 0.003) {
      sube = (1 - aPie) * 8;
      ctx.globalAlpha = aPie;
      asterisco(ctx, MARGEN + 15, M.yPie - 10 + sube, 15, 3.6);
      ctx.fillStyle = CREMA; ctx.font = mono(M.tamPie, 500);
      ctx.globalAlpha = 0.68 * aPie; ctx.fillText(M.pieA, M.xPie, M.yPie + sube);
      ctx.globalAlpha = aPie; ctx.fillText(M.pieB, M.xPie + M.anchoPieA, M.yPie + sube);
    }
    ctx.globalAlpha = 1;
  }

  // ───────────────────────── composición de un cuadro ─────────────────────────
  // e = { p, pulso, punta, aPunto, aFrase, aMomento, aPie }
  function componer(P, ctx, textos, e) {
    var g = P.geo, W = P.W, H = P.H, k = P.k, hasta = Math.round(limitar(e.p) * g.N), u, x, y, grad;
    if (hasta < P.hecho) reiniciarPintor(P);
    if (hasta > P.hecho) avanzar(P, hasta);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(P.fondo, 0, 0);
    if (hasta > 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.74 + 0.26 * e.pulso;
      ctx.drawImage(P.luz, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.drawImage(P.nucleo, 0, 0);
      if (e.pulso > 0.01) {                          // respiración: el propio trazo se enciende un poco
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3 * e.pulso;
        ctx.drawImage(P.nucleo, 0, 0);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }
    }

    ctx.setTransform(k, 0, 0, k, P.ox, P.oy);
    if (e.punta && hasta > 0 && hasta < g.N) {       // la punta viva mientras se dibuja
      x = g.X[hasta - 1]; y = g.Y[hasta - 1];
      grad = ctx.createRadialGradient(x, y, 0, x, y, 46);
      grad.addColorStop(0, 'rgba(242,233,216,0.55)'); grad.addColorStop(0.25, 'rgba(242,233,216,0.16)'); grad.addColorStop(1, 'rgba(242,233,216,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = grad;
      ctx.fillRect(x - 46, y - 46, 92, 92);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (e.aPunto > 0.003 && g.N > 0) {               // punto final en bermellón
      x = g.X[g.N - 1]; y = g.Y[g.N - 1]; u = e.aPunto;
      grad = ctx.createRadialGradient(x, y, 0, x, y, 34);
      grad.addColorStop(0, 'rgba(226,85,58,0.32)'); grad.addColorStop(1, 'rgba(226,85,58,0)');
      ctx.globalAlpha = u; ctx.fillStyle = grad; ctx.fillRect(x - 34, y - 34, 68, 68);
      ctx.fillStyle = BERMELLON; ctx.beginPath(); ctx.arc(x, y, 7.5 * (0.6 + 0.4 * u), 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (e.aFrase > 0.003 || e.aMomento > 0.003 || e.aPie > 0.003) {
      dibujarTextos(ctx, maquetar(ctx, textos), e.aFrase, e.aMomento, e.aPie);
    }

    // grano de papel sobre todo (también sobre la tinta)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (P.patronDe !== ctx) { P.patron = ctx.createPattern(baldosaDeGrano(P.semilla), 'repeat'); P.patronDe = ctx; }
    if (P.patron) { ctx.globalAlpha = 0.6; ctx.fillStyle = P.patron; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }

  // ───────────────────────── vista previa e imagen ─────────────────────────
  var vista = null;      // pintor de la vista previa: se reutiliza entre llamadas (progreso creciente = incremental)
  var estadoVista = { p: 1, pulso: 0, punta: false, aPunto: 1, aFrase: 1, aMomento: 1, aPie: 1 };

  function dibujar(canvas, textos, progreso) {
    if (!canvas || !canvas.getContext || !canvas.width || !canvas.height) return;
    var est = activa(textos), geo = geometria(est), tx = normalizarTextos(textos), p, a, e = estadoVista;
    if (!vista || !vista.fondo || vista.W !== canvas.width || vista.H !== canvas.height || vista.geo !== geo || vista.semilla !== est.semilla) {
      liberarPintor(vista);
      vista = crearPintor(canvas.width, canvas.height, geo, est.semilla);
    }
    if (!fuentesVistas[claveDeTextos(tx)]) asegurarFuentes(textos);
    p = (typeof progreso === 'number' && progreso === progreso) ? limitar(progreso) : 1;
    a = suave((p - 0.86) / 0.14);
    e.p = p; e.punta = p < 1; e.aPunto = limitar((p - 0.96) / 0.04);
    e.aFrase = a; e.aMomento = a; e.aPie = a;
    componer(vista, canvas.getContext('2d'), textos, e);
  }

  function aBlob(c, tipo) {
    return new Promise(function (resolver, rechazar) {
      var datos, bin, bytes, i;
      try {
        if (c.toBlob) {
          c.toBlob(function (b) { if (b) resolver(b); else rechazar(new Error('No se pudo generar la imagen.')); }, tipo, 0.92);
        } else {
          datos = c.toDataURL(tipo, 0.92).split(','); bin = atob(datos[1]); bytes = new Uint8Array(bin.length);
          for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          resolver(new Blob([bytes], { type: tipo }));
        }
      } catch (err) { rechazar(new Error('No se pudo generar la imagen: ' + (err && err.message ? err.message : err))); }
    });
  }

  function imagen(textos) {
    return asegurarFuentes(textos).then(function () {
      var est = activa(textos), c = lienzo(ANCHO, ALTO), P = null;
      function limpiar() { liberarPintor(P); soltar(c); }
      try {
        P = crearPintor(ANCHO, ALTO, geometria(est), est.semilla);
        componer(P, c.getContext('2d'), textos, { p: 1, pulso: 0, punta: false, aPunto: 1, aFrase: 1, aMomento: 1, aPie: 1 });
      } catch (err) {
        limpiar();
        throw new Error('No se pudo componer la imagen: ' + (err && err.message ? err.message : err));
      }
      // JPEG: con el grano, un PNG de 1080x1920 pesa más de 4 MB y tarda en
      // codificarse; así queda en unos cientos de KB, que es lo que se comparte.
      return aBlob(c, 'image/jpeg').then(function (b) {
        limpiar();
        try { b.extension = 'jpg'; } catch (e) {}
        return b;
      }, function (err) { limpiar(); throw err; });
    });
  }

  // ───────────────────────── video ─────────────────────────
  function tiposSoportados() {
    var lista = [], i;
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return lista;
    for (i = 0; i < TIPOS_VIDEO.length; i++) {
      try { if (MediaRecorder.isTypeSupported(TIPOS_VIDEO[i])) lista.push(TIPOS_VIDEO[i]); } catch (e) {}
    }
    return lista;
  }

  function soportaVideo() {
    try {
      return typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement !== 'undefined' &&
        typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
        typeof Promise !== 'undefined' && tiposSoportados().length > 0;
    } catch (e) { return false; }
  }

  function esDebil() {
    var n = navigator;
    return (typeof n.hardwareConcurrency === 'number' && n.hardwareConcurrency <= 4) ||
           (typeof n.deviceMemory === 'number' && n.deviceMemory <= 4);
  }

  // Guion: estado del cuadro en el milisegundo ms.
  function guion(ms, e) {
    var s = ms / 1000, u;
    e.p = s < 0.4 ? 0 : (s < 3.8 ? entraSale((s - 0.4) / 3.4) : 1);
    e.punta = s >= 0.4 && s < 3.8;
    e.aPunto = suave((s - 3.7) / 0.4);
    e.pulso = (s > 3.8 && s < 4.6) ? Math.sin(Math.PI * (s - 3.8) / 0.8) : 0;
    u = (s - 4.6) / 0.8;
    e.aFrase = suave(u * 1.8); e.aMomento = suave(u * 1.8 - 0.4); e.aPie = suave(u * 1.8 - 0.8);
    return e;
  }

  var grabando = false;

  function grabar(textos, alProgreso, tipo, est) {
    return new Promise(function (resolver, rechazar) {
      var debil = esDebil(), W = debil ? 720 : 1080, H = debil ? 1280 : 1920;
      var c = null, ctx = null, P = null, flujo = null, grabador = null, trozos = [];
      var idCuadro = 0, idTiempo = 0, idGuardia = 0, idFin = 0, t0 = 0, ultimo = -1000, cerrado = false, terminando = false;
      var e = { p: 0, pulso: 0, punta: false, aPunto: 0, aFrase: 0, aMomento: 0, aPie: 0 };

      function limpiar() {
        var pistas, i;
        if (idCuadro && window.cancelAnimationFrame) cancelAnimationFrame(idCuadro);
        clearTimeout(idTiempo); clearTimeout(idGuardia); clearTimeout(idFin);
        if (grabador) { grabador.ondataavailable = grabador.onerror = grabador.onstop = null; }
        if (flujo) {
          pistas = flujo.getTracks();
          for (i = 0; i < pistas.length; i++) { try { pistas[i].stop(); } catch (err) {} }
        }
        if (c && c.parentNode) c.parentNode.removeChild(c);
        liberarPintor(P); soltar(c);
        P = null; c = null; ctx = null; flujo = null;
      }
      function fallar(msg, err) {
        if (cerrado) return; cerrado = true;
        try { if (grabador && grabador.state !== 'inactive') { grabador.onstop = null; grabador.stop(); } } catch (x) {}
        limpiar();
        rechazar(new Error(msg + (err && err.message ? ' (' + err.message + ')' : '')));
      }
      function avisar(v) { if (typeof alProgreso === 'function') { try { alProgreso(v); } catch (x) {} } }

      function programar() {
        if (cerrado || terminando) return;
        if (window.requestAnimationFrame) idCuadro = requestAnimationFrame(tic);
        idTiempo = setTimeout(tic, 90);              // respaldo: rAF se detiene si la pestaña pierde el foco
      }
      function tic() {
        var ahora, ms;
        if (cerrado || terminando) return;
        if (idCuadro && window.cancelAnimationFrame) cancelAnimationFrame(idCuadro);
        clearTimeout(idTiempo); idCuadro = 0;
        ahora = performance.now();
        if (ahora - ultimo < 30) { programar(); return; }   // ~30 cuadros por segundo alcanzan
        ultimo = ahora; ms = ahora - t0;
        try { componer(P, ctx, textos, guion(Math.min(ms, DURACION), e)); }
        catch (err) { fallar('No se pudo dibujar el video', err); return; }
        avisar(Math.min(1, ms / DURACION));
        if (ms >= DURACION) {
          terminando = true;
          // un respiro para que el último cuadro entre en la grabación
          idFin = setTimeout(function () {
            try { grabador.stop(); } catch (err) { fallar('No se pudo cerrar la grabación', err); }
          }, 160);
        } else programar();
      }

      try {
        c = lienzo(W, H);
        // algunos navegadores solo capturan bien un canvas que está en el documento
        c.setAttribute('aria-hidden', 'true');
        c.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1';
        (document.body || document.documentElement).appendChild(c);
        try { ctx = c.getContext('2d', { alpha: false }); } catch (x) { ctx = null; }
        if (!ctx) ctx = c.getContext('2d');
        P = crearPintor(W, H, geometria(est), est.semilla);
        maquetar(ctx, textos);
        componer(P, ctx, textos, guion(0, e));       // primer cuadro antes de empezar a grabar
        flujo = c.captureStream(30);
        grabador = new MediaRecorder(flujo, { mimeType: tipo, videoBitsPerSecond: debil ? 3500000 : 6000000 });
      } catch (err) { fallar('No se pudo preparar la grabación en ' + tipo, err); return; }

      grabador.ondataavailable = function (ev) { if (ev.data && ev.data.size) trozos.push(ev.data); };
      grabador.onerror = function (ev) { fallar('El grabador de video falló', ev && ev.error); };
      grabador.onstop = function () {
        var real, base, blob;
        if (cerrado) return;
        real = grabador.mimeType || tipo; base = real.split(';')[0] || 'video/webm';
        try { blob = new Blob(trozos, { type: base }); } catch (err) { fallar('No se pudo armar el video', err); return; }
        if (!blob.size) { fallar('El video salió vacío con ' + tipo); return; }
        cerrado = true;
        try { blob.extension = base.indexOf('mp4') >= 0 ? 'mp4' : 'webm'; blob.tipoCompleto = real; } catch (x) {}
        limpiar();
        avisar(1);
        resolver(blob);
      };

      try { grabador.start(); } catch (err) { fallar('No se pudo iniciar la grabación en ' + tipo, err); return; }
      t0 = performance.now();
      idGuardia = setTimeout(function () { fallar('La grabación tardó demasiado y se canceló'); }, DURACION + 12000);
      programar();
    });
  }

  function video(textos, alProgreso) {
    if (!soportaVideo()) return Promise.reject(new Error('Este navegador no puede grabar video desde un canvas.'));
    if (grabando) return Promise.reject(new Error('Ya hay un video en preparación.'));
    grabando = true;
    var tipos = tiposSoportados(), est = null;
    function intentar(i) {
      return grabar(textos, alProgreso, tipos[i], est).then(null, function (err) {
        if (i + 1 < tipos.length && i < 2) return intentar(i + 1);   // a lo sumo tres intentos
        throw err;
      });
    }
    return asegurarFuentes(textos).then(function () {
      est = activa(textos);                          // la estela queda fija durante toda la grabación
      return intentar(0);
    }).then(
      function (blob) { grabando = false; return blob; },
      function (err) { grabando = false; throw (err instanceof Error ? err : new Error(String(err))); }
    );
  }

  // ───────────────────────── compartir ─────────────────────────
  function descargar(blob, nombre) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nombre; a.rel = 'noopener'; a.style.display = 'none';
    (document.body || document.documentElement).appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 20000);
  }

  function compartir(blob, nombreArchivo, textoParaCompartir, url) {
    return new Promise(function (resolver, rechazar) {
      var tipo, nombre, archivo = null, puede = false, datos;
      if (!blob) { rechazar(new Error('No hay nada para compartir.')); return; }
      tipo = (blob.type || '').split(';')[0] || 'application/octet-stream';
      nombre = nombreArchivo || ('sin-motivo-estela.' + (blob.extension || (tipo.indexOf('png') >= 0 ? 'png' : 'bin')));
      function bajar() {
        try { descargar(blob, nombre); resolver('descargado'); }
        catch (err) { rechazar(new Error('No se pudo compartir ni descargar: ' + (err && err.message ? err.message : err))); }
      }
      try { archivo = new File([blob], nombre, { type: tipo }); } catch (e) { archivo = null; }
      if (archivo && navigator.share && navigator.canShare) {
        try { puede = !!navigator.canShare({ files: [archivo] }); } catch (e2) { puede = false; }
      }
      if (!puede) { bajar(); return; }
      datos = { files: [archivo], title: 'Sin motivo' };
      if (textoParaCompartir) datos.text = String(textoParaCompartir);
      if (url) datos.url = String(url);
      try {
        navigator.share(datos).then(
          function () { resolver('compartido'); },
          function (err) {
            if (err && err.name === 'AbortError') resolver('cancelado');
            else bajar();                            // p. ej. NotAllowedError: se perdió el gesto del usuario
          }
        );
      } catch (err) { bajar(); }
    });
  }

  // ───────────────────────── API ─────────────────────────
  window.SaleHoyEstela = {
    iniciar: iniciar,
    registrar: registrar,
    ventana: ventana,
    cantidad: cantidad,
    codificar: codificar,
    cargar: cargar,
    propia: propia,
    volver: volver,
    dibujar: dibujar,
    imagen: imagen,
    soportaVideo: soportaVideo,
    video: video,
    compartir: compartir
  };
})();
