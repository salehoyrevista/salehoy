/* Sin motivo · cielo-gl.js
 * Capa de FONDO en WebGL, detrás del canvas 2D de los asteriscos.
 * Dibuja atmósfera, nunca estrellas: una nebulosa de tinta muy tenue y
 * polvo finísimo en suspensión, en tres capas de profundidad.
 *
 * Cómo está armado (todo pensado para celulares de gama media):
 *   1. La nebulosa se calcula en un framebuffer chico (1/3 del tamaño CSS o
 *      menos) y guarda solo densidades: R = nube, G = veta bermellón.
 *   2. Una pasada a pantalla completa la escala, le pone color, viñeta y un
 *      tramado mínimo contra el bandeado. Sale premultiplicada y transparente:
 *      el fondo tinta #0e0d12 lo pone la página.
 *   3. El polvo es un solo draw call de gl.POINTS; todo su movimiento vive en
 *      el vertex shader (el buffer no se reescribe nunca).
 *
 * Convenciones asumidas (se cambian en las constantes de abajo):
 *   - px/py e incX/incY vienen en coordenadas de pantalla: +y hacia abajo.
 *   - giro positivo = sentido horario en pantalla (como ctx.rotate en 2D).
 *
 * El tamaño CSS del canvas lo fija la página; acá solo se toca width/height.
 */
(function () {
  'use strict';

  // ---------- constantes ----------
  var SENTIDO_GIRO = -1;        // -1: giro positivo se ve horario (canvas 2D). +1 para invertir.
  var Y_ABAJO = 1;              // 1: py/incY crecen hacia abajo. -1 si crecen hacia arriba.

  var TOPE_NUBE = 0.10;         // alfa máximo de la nebulosa crema
  var TOPE_ROJO = 0.05;         // alfa máximo del bermellón
  var DURACION_FLOR = 2500;     // ms de la entrada
  var MAX_MOTAS = 3600;         // tamaño del buffer de polvo (se dibuja un prefijo)
  var LADO_RUIDO = 32;          // textura de ruido 32x32 (potencia de 2: admite REPEAT)
  var ZOOM_NEBULOSA = 1.3;      // celdas de ruido por unidad de mundo (octava base)
  var UMBRAL_LENTO = 22;        // ms promedio entre cuadros que disparan una baja de calidad
  var VENTANA_RITMO = 2000;     // ms que se promedian antes de decidir
  var PERIODO_T = 600;          // s; el tiempo del polvo se envuelve acá (ritmos enteros)
  var DOS_PI = Math.PI * 2;

  // Escalones de calidad. Solo se baja, nunca se vuelve a subir.
  //   div: divisor del framebuffer de la nebulosa (sobre px CSS)
  //   motas: fracción del polvo que se dibuja
  //   dpr: tope del dpr efectivo del canvas
  //   salto: la nebulosa se recalcula cuadro por medio
  //   congelada: la nebulosa queda fija en su textura; solo se anima el polvo
  var NIVELES = [
    { div: 3, motas: 1.00, dpr: 9.0, salto: false, congelada: false },
    { div: 4, motas: 0.70, dpr: 1.5, salto: false, congelada: false },
    { div: 6, motas: 0.45, dpr: 1.0, salto: true,  congelada: false },
    { div: 6, motas: 0.45, dpr: 1.0, salto: true,  congelada: true }
  ];

  // ---------- shaders ----------

  // Nebulosa: el vértice entrega la posición ya girada, en celdas de ruido.
  var VS_NEBULOSA = [
    'attribute vec2 a_pos;',
    'uniform vec2 u_escala;',   // mundo: el lado corto mide 2 (de -1 a 1)
    'uniform vec2 u_des;',      // paralaje (mundo)
    'uniform vec3 u_rot;',      // cos, sen, zoom
    'varying vec2 v_p;',
    'void main() {',
    '  vec2 w = a_pos * u_escala - u_des;',
    '  v_p = vec2(w.x * u_rot.x + w.y * u_rot.y, w.y * u_rot.x - w.x * u_rot.y) * u_rot.z;',
    '  gl_Position = vec4(a_pos, 0.0, 1.0);',
    '}'
  ].join('\n');

  // fbm de 3 octavas sobre una textura de ruido (una lectura por octava).
  // Leer de textura evita el clásico fract(sin()) que se rompe en mediump.
  var FS_NEBULOSA = [
    'precision mediump float;',
    'varying vec2 v_p;',
    'uniform sampler2D u_ruido;',
    'uniform vec2 u_d1;',
    'uniform vec2 u_d2;',
    'uniform vec2 u_d3;',
    'uniform vec3 u_foco;',     // xy: dónde se concentra (estación); z: respiración
    'vec4 ruido(vec2 x) {',
    '  vec2 i = floor(x);',
    '  vec2 f = x - i;',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return texture2D(u_ruido, (i + f + 0.5) * ' + (1 / LADO_RUIDO).toFixed(6) + ');',
    '}',
    'void main() {',
    '  vec4 a = ruido(v_p + u_d1);',
    '  vec2 torcer = (a.gb - 0.5) * 1.4;',   // la octava grande deforma a las chicas: tinta en agua
    '  vec4 b = ruido(v_p * 2.0 + torcer + u_d2);',
    '  vec4 c = ruido(v_p * 4.0 - torcer * 1.5 + u_d3);',
    '  float n = a.r * 0.56 + b.r * 0.29 + c.r * 0.15;',
    '  vec2 df = v_p - u_foco.xy;',
    '  float conc = 1.0 - min(dot(df, df) * 0.09, 1.0);',
    '  n += conc * 0.10 - 0.03 + u_foco.z;',
    '  float nube = smoothstep(0.38, 0.74, n);',
    '  float rojo = smoothstep(0.52, 0.80, a.a * 0.6 + b.g * 0.4) * nube;',
    '  gl_FragColor = vec4(nube, rojo, 0.0, 1.0);',
    '}'
  ].join('\n');

  // Composición: escala la nebulosa a pantalla, colorea y trama.
  var VS_COMPONER = [
    'attribute vec2 a_pos;',
    'uniform vec2 u_trama;',    // tamaño del canvas en celdas de la textura de ruido
    'varying vec2 v_uv;',
    'varying vec2 v_c;',
    'varying vec2 v_tr;',
    'void main() {',
    '  v_uv = a_pos * 0.5 + 0.5;',
    '  v_c = a_pos;',
    '  v_tr = v_uv * u_trama;',
    '  gl_Position = vec4(a_pos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FS_COMPONER = [
    'precision mediump float;',
    'varying vec2 v_uv;',
    'varying vec2 v_c;',
    'varying vec2 v_tr;',
    'uniform sampler2D u_neb;',
    'uniform sampler2D u_ruido;',
    'uniform vec3 u_crema;',    // crema ya teñida por la hora
    'uniform vec2 u_alfa;',     // alfa máximo de nube y de bermellón (incluye el fundido)
    'void main() {',
    '  vec4 t = texture2D(u_neb, v_uv);',
    '  float vin = 1.0 - 0.2 * dot(v_c, v_c);',
    '  float aC = t.r * (1.0 - 0.5 * t.g) * u_alfa.x * vin;',
    '  float aR = t.g * u_alfa.y * vin;',
    '  float a = aC + aR;',
    // tramado de medio nivel de 8 bits, solo donde hay nube
    '  float tr = (texture2D(u_ruido, v_tr).a - 0.5) * 0.0039 * min(1.0, a * 150.0);',
    '  gl_FragColor = max(vec4(u_crema * aC + vec3(0.886, 0.333, 0.227) * aR + tr, a + tr), 0.0);',
    '}'
  ].join('\n');

  // Polvo: todo el movimiento se resuelve acá.
  var VS_POLVO = [
    'precision highp float;',
    'attribute vec4 a_mota;',   // x, y (disco unitario), capa (0 lejos, 0.5, 1 cerca), semilla
    'attribute vec4 a_vida;',   // fase, ritmo x, ritmo y, tamaño relativo
    'uniform vec2 u_inv;',      // mundo -> clip
    'uniform float u_radio;',   // radio del disco de polvo (cubre la diagonal)
    'uniform vec3 u_ang;',      // ángulo de cada capa
    'uniform vec4 u_tiempo;',   // t envuelto (s), florecer 0..1, dpr efectivo, brillo general
    'uniform vec2 u_par;',      // paralaje de la capa cercana (mundo)
    'uniform vec4 u_punt;',     // xy puntero (mundo), z fuerza, w energía
    'varying float v_alfa;',
    'void main() {',
    '  float capa = a_mota.z;',
    '  float ang = capa < 0.25 ? u_ang.x : (capa < 0.75 ? u_ang.y : u_ang.z);',
    '  float co = cos(ang);',
    '  float se = sin(ang);',
    '  vec2 b = a_mota.xy * u_radio;',
    '  vec2 p = vec2(b.x * co - b.y * se, b.x * se + b.y * co);',
    // flotación propia, lenta y distinta en cada mota
    '  p += (0.02 + 0.03 * capa) * vec2(sin(u_tiempo.x * a_vida.y + a_vida.x), cos(u_tiempo.x * a_vida.z + a_vida.x * 1.7));',
    // entrada: las capas lejanas aparecen primero, todo se expande apenas
    '  float fl = clamp((u_tiempo.y - capa * 0.3) / 0.7, 0.0, 1.0);',
    '  fl = fl * fl * (3.0 - 2.0 * fl);',
    '  p *= 0.90 + 0.10 * fl;',
    // paralaje: lejos casi nada, cerca todo
    '  p += u_par * (0.12 + 0.88 * capa * capa);',
    // el polvo cercano al puntero se aparta y se arremolina apenas
    '  vec2 d = p - u_punt.xy;',
    '  float d2 = dot(d, d);',
    '  float cerca = u_punt.z * exp(-d2 * 9.0);',
    '  vec2 dir = d / sqrt(d2 + 0.0004);',
    '  p += (dir * 0.035 + vec2(-dir.y, dir.x) * 0.03 * u_punt.w) * cerca * (0.4 + 0.6 * capa);',
    // tamaño: núcleo visible de menos de 1,5 px CSS; el resto del sprite es borrón
    '  float tam = 0.5 + 0.3 * capa + a_vida.w * (0.3 + 0.05 * capa);',
    '  float diam = tam * u_tiempo.z * (1.6 + 0.8 * capa);',
    // velos: el polvo se junta en bancos suaves en vez de repartirse parejo
    '  float velo = 0.62 + 0.38 * sin(b.x * 2.3 + capa * 4.0) * sin(b.y * 1.9 + capa * 7.0);',
    '  float alfa = (0.08 + 0.10 * capa) + a_mota.w * (0.08 + 0.09 * capa);',
    '  alfa *= velo * fl * u_tiempo.w * (1.0 + 0.6 * u_punt.w * cerca);',
    '  alfa *= clamp(diam / 2.5, 0.35, 1.0);',
    '  v_alfa = min(alfa, 0.35);',
    '  gl_PointSize = max(diam, 2.5);',
    '  gl_Position = vec4(p * u_inv, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FS_POLVO = [
    'precision mediump float;',
    'varying float v_alfa;',
    'void main() {',
    '  vec2 c = gl_PointCoord - 0.5;',
    '  float f = max(0.0, 1.0 - dot(c, c) * 4.0);',
    '  float a = v_alfa * f * f;',
    '  gl_FragColor = vec4(vec3(0.949, 0.914, 0.847) * a, a);',
    '}'
  ].join('\n');

  // ---------- estado interno ----------
  var lienzo = null;
  var gl = null;
  var listo = false;       // recursos creados y válidos
  var perdido = false;     // contexto perdido
  var quieto = false;

  var progNeb = null, progComp = null, progPolvo = null;
  var uNeb = {}, uComp = {}, uPolvo = {};
  var bufCuadro = null, bufMotas = null;
  var texRuido = null, texNeb = null, fbo = null;
  var fboAncho = 0, fboAlto = 0;

  var ancho = 0, alto = 0, dprBase = 1, dprEf = 1;
  var escX = 1, escY = 1, radio = 1.5;
  var nMotas = 0;

  var nivel = 0;
  var sucio = true;          // hay que redibujar sí o sí (tamaño nuevo, contexto restaurado)
  var nebPendiente = true;   // hay que recalcular la nebulosa aunque esté congelada
  var cuadros = 0;

  var previo = -1;           // "ahora" del cuadro anterior
  var inicio = -1;           // "ahora" del primer cuadro (arranque de la entrada)
  var tiempo = 0;            // s acumulados (con saltos recortados)
  var ultimoQuieto = -1e9;

  // medición de ritmo
  var acumRitmo = 0, nRitmo = 0, graciaHasta = 0;

  // valores suavizados
  var sParX = 0, sParY = 0;          // objetivo de paralaje -1..1
  var sPunX = 0, sPunY = 0;          // puntero en pantalla -1..1
  var sPresencia = 0, sEnergia = 0;

  // ---------- utilidades ----------
  function num(v, defecto) {
    return (typeof v === 'number' && v === v && v !== Infinity && v !== -Infinity) ? v : defecto;
  }

  function limitar(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  // envuelve a [-L/2, L/2): la textura de ruido se repite cada L celdas
  function envolver(v) {
    return v - LADO_RUIDO * Math.floor(v / LADO_RUIDO) - LADO_RUIDO * 0.5;
  }

  // campana sobre el reloj de 24 h
  function campanaHora(hora, centro, anchoH) {
    var d = Math.abs(hora - centro);
    if (d > 12) { d = 24 - d; }
    return Math.exp(-(d * d) / (2 * anchoH * anchoH));
  }

  // azar determinista: tras restaurar el contexto el polvo queda idéntico
  var semilla = 1;
  function azar() {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296;
    return semilla / 4294967296;
  }

  function compilar(tipo, fuente) {
    var s = gl.createShader(tipo);
    if (!s) { return null; }
    gl.shaderSource(s, fuente);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function programa(vs, fs, atributos) {
    var v = compilar(gl.VERTEX_SHADER, vs);
    var f = compilar(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) { return null; }
    var p = gl.createProgram();
    if (!p) { return null; }
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    for (var i = 0; i < atributos.length; i++) {
      gl.bindAttribLocation(p, i, atributos[i]);
    }
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      gl.deleteProgram(p);
      return null;
    }
    return p;
  }

  function uniformes(p, nombres) {
    var o = {};
    for (var i = 0; i < nombres.length; i++) {
      o[nombres[i]] = gl.getUniformLocation(p, nombres[i]);
    }
    return o;
  }

  // ---------- recursos ----------
  function crearRecursos() {
    listo = false;
    fboAncho = 0;
    fboAlto = 0;

    progNeb = programa(VS_NEBULOSA, FS_NEBULOSA, ['a_pos']);
    progComp = programa(VS_COMPONER, FS_COMPONER, ['a_pos']);
    progPolvo = programa(VS_POLVO, FS_POLVO, ['a_mota', 'a_vida']);
    if (!progNeb || !progComp || !progPolvo) { return false; }

    uNeb = uniformes(progNeb, ['u_escala', 'u_des', 'u_rot', 'u_ruido', 'u_d1', 'u_d2', 'u_d3', 'u_foco']);
    uComp = uniformes(progComp, ['u_trama', 'u_neb', 'u_ruido', 'u_crema', 'u_alfa']);
    uPolvo = uniformes(progPolvo, ['u_inv', 'u_radio', 'u_ang', 'u_tiempo', 'u_par', 'u_punt']);

    // triángulos que cubren la pantalla
    bufCuadro = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCuadro);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    // polvo: 8 floats por mota, capas mezcladas (cualquier prefijo es una muestra pareja)
    var datos = new Float32Array(MAX_MOTAS * 8);
    var i, o, r, a, c;
    semilla = 20240229;
    for (i = 0; i < MAX_MOTAS; i++) {
      o = i * 8;
      r = Math.sqrt(azar());
      a = azar() * DOS_PI;
      c = azar();
      datos[o] = Math.cos(a) * r;
      datos[o + 1] = Math.sin(a) * r;
      datos[o + 2] = c < 0.5 ? 0 : (c < 0.83 ? 0.5 : 1);
      datos[o + 3] = azar();
      datos[o + 4] = azar() * DOS_PI;
      // ritmos múltiplos enteros de 2π/PERIODO_T: el tiempo puede envolverse sin salto
      datos[o + 5] = (azar() < 0.5 ? -1 : 1) * Math.floor(10 + azar() * 21) * DOS_PI / PERIODO_T;
      datos[o + 6] = (azar() < 0.5 ? -1 : 1) * Math.floor(10 + azar() * 21) * DOS_PI / PERIODO_T;
      datos[o + 7] = azar();
    }
    bufMotas = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufMotas);
    gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);

    // textura de ruido (cuatro canales independientes)
    var pix = new Uint8Array(LADO_RUIDO * LADO_RUIDO * 4);
    semilla = 7919;
    for (i = 0; i < pix.length; i++) { pix[i] = Math.floor(azar() * 256); }
    texRuido = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texRuido);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LADO_RUIDO, LADO_RUIDO, 0, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // textura y framebuffer de la nebulosa (tamaño real en ajustarTamano)
    texNeb = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texNeb);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texNeb, 0);
    var completo = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!completo) { return false; }

    // estado fijo
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DITHER);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplicado
    gl.clearColor(0, 0, 0, 0);
    gl.enableVertexAttribArray(0);

    // uniformes que no cambian
    gl.useProgram(progNeb);
    gl.uniform1i(uNeb.u_ruido, 1);
    gl.useProgram(progComp);
    gl.uniform1i(uComp.u_neb, 0);
    gl.uniform1i(uComp.u_ruido, 1);

    listo = true;
    sucio = true;
    nebPendiente = true;
    return true;
  }

  // Aplica tamaño de canvas, framebuffer y cantidad de motas según el nivel actual.
  function ajustarTamano() {
    if (!gl || !listo || perdido || ancho <= 0 || alto <= 0) { return; }
    var niv = NIVELES[nivel];

    dprEf = Math.min(dprBase, niv.dpr);
    var w = Math.max(1, Math.round(ancho * dprEf));
    var h = Math.max(1, Math.round(alto * dprEf));
    if (lienzo.width !== w) { lienzo.width = w; }
    if (lienzo.height !== h) { lienzo.height = h; }

    // framebuffer de la nebulosa: sobre px CSS (no depende del dpr), lado largo <= 512
    var fw = ancho / niv.div;
    var fh = alto / niv.div;
    var largo = Math.max(fw, fh);
    if (largo > 512) { fw *= 512 / largo; fh *= 512 / largo; }
    fw = Math.max(16, Math.round(fw));
    fh = Math.max(16, Math.round(fh));
    if (fw !== fboAncho || fh !== fboAlto) {
      fboAncho = fw;
      fboAlto = fh;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texNeb);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    // mundo: el lado corto va de -1 a 1
    var corto = Math.min(ancho, alto);
    escX = ancho / corto;
    escY = alto / corto;
    // el polvo vive en un disco que cubre la diagonal (gira sin dejar esquinas vacías)
    radio = Math.sqrt(escX * escX + escY * escY) * 1.12;

    // ~500 motas a la vista en pantallas chicas, ~1400 en grandes
    var area = ancho * alto;
    var visibles = limitar(500 + (area - 300000) / 1700000 * 900, 500, 1400);
    var total = visibles * (Math.PI * radio * radio) / (4 * escX * escY) * niv.motas;
    nMotas = Math.min(MAX_MOTAS, Math.round(total));

    sucio = true;
    nebPendiente = true;
  }

  function bajarCalidad(ahora) {
    if (nivel >= NIVELES.length - 1) { return; }
    nivel++;
    ajustarTamano();
    graciaHasta = ahora + 800;   // el cambio mismo cuesta un par de cuadros
  }

  // Promedia el tiempo entre cuadros y baja un escalón si viene lento.
  function medirRitmo(dt, ahora) {
    if (nivel >= NIVELES.length - 1) { return; }
    if (dt <= 0 || dt > 250 || ahora < graciaHasta) { return; }   // pestaña dormida o arranque
    acumRitmo += dt;
    nRitmo++;
    if (acumRitmo >= VENTANA_RITMO) {
      if (acumRitmo / nRitmo > UMBRAL_LENTO) { bajarCalidad(ahora); }
      acumRitmo = 0;
      nRitmo = 0;
    }
  }

  // ---------- contexto perdido / restaurado ----------
  function alPerder(ev) {
    if (ev && ev.preventDefault) { ev.preventDefault(); }   // sin esto no se restaura
    perdido = true;
    listo = false;
  }

  function alRestaurar() {
    perdido = false;
    try {
      if (crearRecursos()) {
        ajustarTamano();
        previo = -1;
      }
    } catch (e) {
      listo = false;
    }
  }

  // ---------- API ----------
  function iniciar(canvas, opciones) {
    try {
      if (!canvas || !canvas.getContext) { return false; }
      if (lienzo && lienzo.removeEventListener) {
        lienzo.removeEventListener('webglcontextlost', alPerder, false);
        lienzo.removeEventListener('webglcontextrestored', alRestaurar, false);
      }
      lienzo = null;
      gl = null;
      listo = false;

      var attrs = {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power'
      };
      var ctx = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
      if (!ctx) { return false; }

      lienzo = canvas;
      gl = ctx;
      quieto = !!(opciones && opciones.quieto);
      perdido = false;
      nivel = 0;
      previo = -1;
      inicio = -1;
      tiempo = 0;
      cuadros = 0;
      acumRitmo = 0;
      nRitmo = 0;
      graciaHasta = 0;
      ultimoQuieto = -1e9;
      sParX = sParY = sPunX = sPunY = sPresencia = sEnergia = 0;

      if (!crearRecursos()) {
        gl = null;
        lienzo = null;
        return false;
      }
      canvas.addEventListener('webglcontextlost', alPerder, false);
      canvas.addEventListener('webglcontextrestored', alRestaurar, false);
      ajustarTamano();   // por si medir() se llamó antes
      return true;
    } catch (e) {
      gl = null;
      lienzo = null;
      listo = false;
      return false;
    }
  }

  function medir(anchoCss, altoCss, dpr) {
    ancho = Math.max(0, num(anchoCss, 0));
    alto = Math.max(0, num(altoCss, 0));
    dprBase = limitar(num(dpr, 1), 0.5, 4);
    ajustarTamano();
  }

  function cuadro(estado) {
    if (!gl || !listo || perdido || ancho <= 0 || alto <= 0) { return; }
    if (gl.isContextLost()) { return; }

    var e = estado || 0;
    var ahora = num(e.ahora, previo < 0 ? 0 : previo + 16);
    var dt = previo < 0 ? 0 : ahora - previo;
    previo = ahora;
    if (inicio < 0) {
      inicio = ahora;
      graciaHasta = ahora + 1000;   // no medir mientras compilan los shaders
    }

    // Modo quieto: un cuadro estático; se rehace solo cada tanto (el giro y la hora avanzan).
    if (quieto) {
      if (!sucio && ahora - ultimoQuieto < 30000) { return; }
      ultimoQuieto = ahora;
    } else {
      medirRitmo(dt, ahora);   // puede bajar de nivel y cambiar tamaños antes de dibujar
    }

    var niv = NIVELES[nivel];
    var dtc = limitar(dt, 0, 100);   // volver de otra pestaña no produce saltos
    var giro = num(e.giro, 0) * SENTIDO_GIRO;

    // ---- entrada, tiempo y suavizados ----
    var u = 1, flor = 1, pulso = 0;
    if (quieto) {
      tiempo = 0;
    } else {
      tiempo += dtc / 1000;
      u = limitar((ahora - inicio) / DURACION_FLOR, 0, 1);
      flor = 1 - (1 - u) * (1 - u) * (1 - u);
      pulso = Math.sin(Math.PI * u) * (1 - u);   // respiro de luz al florecer

      var hayPuntero = (typeof e.px === 'number' && typeof e.py === 'number' && e.px === e.px && e.py === e.py);
      var px = hayPuntero ? limitar(e.px, -1, 1) : 0;
      var py = hayPuntero ? limitar(e.py, -1, 1) * Y_ABAJO : 0;
      var objX = limitar(px * 0.6 + limitar(num(e.incX, 0), -1, 1), -1, 1);
      var objY = limitar(py * 0.6 + limitar(num(e.incY, 0), -1, 1) * Y_ABAJO, -1, 1);

      var kPar = 1 - Math.exp(-dtc / 350);
      sParX += (objX - sParX) * kPar;
      sParY += (objY - sParY) * kPar;

      if (hayPuntero) {
        if (sPresencia < 0.02) {
          sPunX = px;   // aparece: no viajar desde la posición vieja
          sPunY = py;
        } else {
          var kPun = 1 - Math.exp(-dtc / 110);
          sPunX += (px - sPunX) * kPun;
          sPunY += (py - sPunY) * kPun;
        }
      }
      sPresencia += ((hayPuntero ? 1 : 0) - sPresencia) * (1 - Math.exp(-dtc / 450));
      sEnergia += (limitar(num(e.energia, 0), 0, 1) - sEnergia) * (1 - Math.exp(-dtc / 220));
    }

    // ---- ambiente: hora, día, estación, luna (valores neutros si faltan) ----
    var hora = num(e.hora, -1);
    var frio = 0, calido = 0;
    if (hora >= 0) {
      hora = hora % 24;
      frio = campanaHora(hora, 3.5, 2.2);                                            // madrugada
      calido = Math.max(campanaHora(hora, 6.75, 1.1), campanaHora(hora, 19.25, 1.2)); // amanecer / atardecer
    }
    var luna = num(e.luna, 0.25);
    var brillo = 0.5 - 0.5 * Math.cos(DOS_PI * luna);    // 0 luna nueva, 1 llena
    var diaC = num(e.dia, 0) + (hora >= 0 ? hora / 24 : 0);   // día continuo: no salta a medianoche
    var focoX = 0, focoY = 0;
    if (typeof e.estacion === 'number' && e.estacion === e.estacion) {
      focoX = Math.cos(DOS_PI * e.estacion) * 0.55 * ZOOM_NEBULOSA;
      focoY = Math.sin(DOS_PI * e.estacion) * 0.55 * ZOOM_NEBULOSA;
    }

    // crema: más fría de madrugada, apenas más cálida en los crepúsculos
    var cr = 0.949 + (0.80 - 0.949) * 0.45 * frio + (0.965 - 0.949) * 0.3 * calido;
    var cg = 0.914 + (0.86 - 0.914) * 0.45 * frio + (0.860 - 0.914) * 0.3 * calido;
    var cb = 0.847 + (0.93 - 0.847) * 0.45 * frio + (0.740 - 0.847) * 0.3 * calido;
    // los topes se respetan siempre, también durante el pulso de entrada
    var alfaNube = Math.min(TOPE_NUBE, TOPE_NUBE * (0.72 + 0.28 * brillo) * (1 - 0.28 * frio) * flor * (1 + 0.5 * pulso));
    var alfaRojo = Math.min(TOPE_ROJO, TOPE_ROJO * limitar(0.55 + 0.45 * calido - 0.25 * frio, 0, 1) * flor * (1 + 0.5 * pulso));
    var brilloPolvo = 1 - 0.3 * brillo;   // con luna nueva se ve más polvo

    cuadros++;

    // ---- 1. nebulosa al framebuffer chico ----
    if (nebPendiente || (!quieto && !niv.congelada && (!niv.salto || (cuadros & 1)))) {
      nebPendiente = false;
      var angNeb = giro + tiempo * (DOS_PI / 7200);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, fboAncho, fboAlto);
      gl.disable(gl.BLEND);
      gl.useProgram(progNeb);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufCuadro);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uNeb.u_escala, escX, escY);
      gl.uniform2f(uNeb.u_des, -sParX * 0.012, sParY * 0.012);
      gl.uniform3f(uNeb.u_rot, Math.cos(angNeb), Math.sin(angNeb), ZOOM_NEBULOSA * (1 + 0.14 * (1 - flor)));
      // derivas en celdas de ruido, envueltas en JS para no perder precisión en mediump;
      // el día corre la disposición entera: cada día es otro cielo
      gl.uniform2f(uNeb.u_d1, envolver(tiempo * 0.011 + diaC * 3.71), envolver(tiempo * 0.004 + diaC * 2.13));
      gl.uniform2f(uNeb.u_d2, envolver(7.3 - tiempo * 0.006 - diaC * 5.3), envolver(2.1 + tiempo * 0.017 + diaC * 1.9));
      gl.uniform2f(uNeb.u_d3, envolver(13.7 + tiempo * 0.021 + diaC * 2.9), envolver(9.2 - tiempo * 0.013 - diaC * 6.1));
      gl.uniform3f(uNeb.u_foco, focoX, focoY, 0.03 * Math.sin(tiempo * (DOS_PI / 23)));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // ---- 2. composición a pantalla ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.useProgram(progComp);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCuadro);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uComp.u_trama, lienzo.width / LADO_RUIDO, lienzo.height / LADO_RUIDO);
    gl.uniform3f(uComp.u_crema, cr, cg, cb);
    gl.uniform2f(uComp.u_alfa, alfaNube, alfaRojo);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ---- 3. polvo: un solo draw call ----
    if (nMotas > 0) {
      var a0 = giro + tiempo * (DOS_PI / 5400);
      var a1 = giro + tiempo * (DOS_PI / 3000);
      var a2 = giro + tiempo * (DOS_PI / 1700);
      gl.enable(gl.BLEND);
      gl.useProgram(progPolvo);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufMotas);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16);
      gl.uniform2f(uPolvo.u_inv, 1 / escX, 1 / escY);
      gl.uniform1f(uPolvo.u_radio, radio);
      gl.uniform3f(uPolvo.u_ang,
        a0 - DOS_PI * Math.floor(a0 / DOS_PI),
        a1 - DOS_PI * Math.floor(a1 / DOS_PI),
        a2 - DOS_PI * Math.floor(a2 / DOS_PI));
      gl.uniform4f(uPolvo.u_tiempo, tiempo % PERIODO_T, flor, dprEf, brilloPolvo);
      // las capas se corren en contra del puntero / la inclinación
      gl.uniform2f(uPolvo.u_par, -sParX * 0.05, sParY * 0.05);
      gl.uniform4f(uPolvo.u_punt, sPunX * escX, -sPunY * escY, sPresencia * (0.55 + 0.45 * sEnergia), sEnergia);
      gl.drawArrays(gl.POINTS, 0, nMotas);
      gl.disableVertexAttribArray(1);
    }

    sucio = false;
  }

  window.SaleHoyGL = {
    iniciar: iniciar,
    medir: medir,
    cuadro: cuadro
  };
})();
