/*
 * Sin motivo · capa sonora opcional (Web Audio, sin archivos ni dependencias).
 *
 * Regla: nunca suena sin que la persona lo active. El AudioContext recién se
 * crea dentro de activar(), que debe llamarse desde un gesto del usuario.
 *
 * Grafo:
 *   bordón ─┐
 *   aire ───┤
 *   roce ───┼─► mezcla ─► compresor ─► maestro (tope 0,22) ─► salida
 *   notas ──┤
 *      └─► reverberación (3 delays realimentados y filtrados) ─┘
 */
(function () {
  'use strict';

  var Contexto = window.AudioContext || window.webkitAudioContext;

  var TOPE_MAESTRO = 0.22;
  var MAX_VOCES = 6;
  var RAIZ = 220; // La3; el bordón vive dos octavas más abajo
  // Tres pentatónicas sobre la misma raíz (semitonos). Difieren en una o dos
  // notas, así las colas de reverberación nunca chocan feo entre sí.
  var ESCALAS = [
    [0, 3, 5, 7, 10], // menor
    [0, 2, 5, 7, 10], // suspendida
    [0, 2, 5, 7, 9]   // abierta
  ];

  var ctx = null;
  var encendido = false;
  var voces = 0;
  var temporizadorSuspension = 0;

  // Nodos que se tocan después de construir
  var maestro, mezcla, busNotas;
  var filtroBordon, gananciaQuinta, filtroAire;
  var filtroRoce, gananciaRoce, paneoRoce;

  // Limitadores de ritmo (en tiempo del contexto)
  var ultimoGesto = -1;
  var proximaNotaGesto = 0;
  var ultimoCielo = -10;

  function disponible() {
    return !!Contexto;
  }

  function acotar(v, min, max) {
    if (v !== v) { return min; } // NaN
    return v < min ? min : (v > max ? max : v);
  }

  // Hash FNV-1a de 32 bits: la misma semilla da siempre el mismo número.
  function hash(texto) {
    var h = 2166136261;
    var s = String(texto);
    var i;
    for (i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }

  // Grado "indice" de una escala, contando octavas hacia arriba desde RAIZ.
  function frecuencia(escala, indice) {
    var octava = Math.floor(indice / 5);
    var grado = indice - octava * 5;
    return RAIZ * Math.pow(2, octava + escala[grado] / 12);
  }

  function crearPaneo(valor) {
    if (!ctx.createStereoPanner) { return null; }
    var p = ctx.createStereoPanner();
    p.pan.value = valor;
    return p;
  }

  // ---------------------------------------------------------------- grafo

  function construir() {
    ctx = new Contexto();

    maestro = ctx.createGain();
    maestro.gain.value = 0;
    maestro.connect(ctx.destination);

    // Limitador suave antes del maestro: lo que sale nunca supera el tope.
    var compresor = ctx.createDynamicsCompressor();
    compresor.threshold.value = -10;
    compresor.knee.value = 10;
    compresor.ratio.value = 6;
    compresor.attack.value = 0.01;
    compresor.release.value = 0.3;
    compresor.connect(maestro);

    mezcla = ctx.createGain();
    mezcla.connect(compresor);

    construirReverberacion();
    construirBordon();
    construirAire();
  }

  // Tres delays con realimentación propia y cruzada en anillo, cada uno con
  // su pasa-bajos: una cola oscura de ~3 s por muy poco CPU.
  function construirReverberacion() {
    var tiempos = [0.149, 0.211, 0.307];
    var cortes = [1900, 1500, 1200];
    var paneos = [-0.6, 0, 0.6];
    var delays = [];
    var filtros = [];
    var i, propia, cruzada, paneo;

    busNotas = ctx.createGain();
    busNotas.connect(mezcla);

    var envio = ctx.createGain();
    envio.gain.value = 0.4;
    busNotas.connect(envio);

    var salida = ctx.createGain();
    salida.gain.value = 0.5;
    salida.connect(mezcla);

    for (i = 0; i < 3; i++) {
      delays[i] = ctx.createDelay(0.5);
      delays[i].delayTime.value = tiempos[i];
      filtros[i] = ctx.createBiquadFilter();
      filtros[i].type = 'lowpass';
      filtros[i].frequency.value = cortes[i];
      envio.connect(delays[i]);
      delays[i].connect(filtros[i]);

      propia = ctx.createGain();
      propia.gain.value = 0.42;
      filtros[i].connect(propia);
      propia.connect(delays[i]);

      paneo = crearPaneo(paneos[i]);
      if (paneo) {
        filtros[i].connect(paneo);
        paneo.connect(salida);
      } else {
        filtros[i].connect(salida);
      }
    }
    for (i = 0; i < 3; i++) {
      cruzada = ctx.createGain();
      cruzada.gain.value = 0.3;
      filtros[i].connect(cruzada);
      cruzada.connect(delays[(i + 1) % 3]);
    }
  }

  function crearOscilador(tipo, frec, ganancia, destino) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = frec;
    g.gain.value = ganancia;
    osc.connect(g);
    g.connect(destino);
    osc.start(0);
    return g;
  }

  // Bordón: La grave (triángulo), su octava y una quinta apenas desafinadas.
  // El tercer armónico del triángulo bate lentísimo contra la quinta.
  function construirBordon() {
    filtroBordon = ctx.createBiquadFilter();
    filtroBordon.type = 'lowpass';
    filtroBordon.frequency.value = 280;
    filtroBordon.Q.value = 0.5;

    var gananciaBordon = ctx.createGain();
    gananciaBordon.gain.value = 0.5;
    filtroBordon.connect(gananciaBordon);
    gananciaBordon.connect(mezcla);

    crearOscilador('triangle', 55, 0.5, filtroBordon);
    crearOscilador('sine', 110.2, 0.3, filtroBordon);
    gananciaQuinta = crearOscilador('sine', 164.6, 0.14, filtroBordon);

    // Respiración: un LFO de ~20 s mueve la amplitud; otro de ~32 s, el corte.
    var lfoRespira = ctx.createOscillator();
    lfoRespira.frequency.value = 0.05;
    var profBordon = ctx.createGain();
    profBordon.gain.value = 0.14;
    lfoRespira.connect(profBordon);
    profBordon.connect(gananciaBordon.gain);
    lfoRespira.start(0);

    var lfoCorte = ctx.createOscillator();
    lfoCorte.frequency.value = 0.031;
    var profCorte = ctx.createGain();
    profCorte.gain.value = 70;
    lfoCorte.connect(profCorte);
    profCorte.connect(filtroBordon.frequency);
    lfoCorte.start(0);

    // El aire respira al revés que el bordón (ver construirAire).
    construirBordon.lfo = lfoRespira;
  }

  // Un solo buffer de ruido (2 s, en bucle) alimenta el aire de fondo y el
  // roce de la estela, cada uno con su pasa-banda.
  function construirAire() {
    var largo = Math.floor(ctx.sampleRate * 2);
    var buffer = ctx.createBuffer(1, largo, ctx.sampleRate);
    var datos = buffer.getChannelData(0);
    var i;
    for (i = 0; i < largo; i++) {
      datos[i] = Math.random() * 2 - 1;
    }
    var ruido = ctx.createBufferSource();
    ruido.buffer = buffer;
    ruido.loop = true;

    filtroAire = ctx.createBiquadFilter();
    filtroAire.type = 'bandpass';
    filtroAire.frequency.value = 900;
    filtroAire.Q.value = 0.8;
    var gananciaAire = ctx.createGain();
    gananciaAire.gain.value = 0.035;
    ruido.connect(filtroAire);
    filtroAire.connect(gananciaAire);
    gananciaAire.connect(mezcla);

    var profAire = ctx.createGain();
    profAire.gain.value = -0.012;
    construirBordon.lfo.connect(profAire);
    profAire.connect(gananciaAire.gain);

    filtroRoce = ctx.createBiquadFilter();
    filtroRoce.type = 'bandpass';
    filtroRoce.frequency.value = 1000;
    filtroRoce.Q.value = 1.4;
    gananciaRoce = ctx.createGain();
    gananciaRoce.gain.value = 0;
    ruido.connect(filtroRoce);
    filtroRoce.connect(gananciaRoce);
    paneoRoce = crearPaneo(0);
    if (paneoRoce) {
      gananciaRoce.connect(paneoRoce);
      paneoRoce.connect(mezcla);
    } else {
      gananciaRoce.connect(mezcla);
    }

    ruido.start(0);
  }

  // ---------------------------------------------------------------- voces

  // Una voz tipo kalimba: seno + parcial agudo que se apaga antes.
  // "caida" es la constante de tiempo; la voz dura unas 6 constantes.
  // Si ya hay "limite" voces sonando, se descarta.
  function tocar(frec, pico, caida, pan, limite) {
    if (!encendido || !ctx || ctx.state !== 'running' || voces >= limite) { return; }
    var t = ctx.currentTime + 0.01;
    var fin = t + caida * 6 + 0.05;

    // Las notas agudas pesan menos, para que nunca pinchen.
    var nivel = pico * Math.min(1, Math.pow(330 / frec, 0.4));

    var env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(nivel, t + 0.008);
    env.gain.setTargetAtTime(0, t + 0.008, caida);

    var cuerpo = ctx.createOscillator();
    cuerpo.type = 'sine';
    cuerpo.frequency.value = frec;
    cuerpo.connect(env);

    var parcial = ctx.createOscillator();
    parcial.type = 'sine';
    parcial.frequency.value = frec * 3.01;
    var envParcial = ctx.createGain();
    envParcial.gain.setValueAtTime(0.16, t);
    envParcial.gain.setTargetAtTime(0, t, caida * 0.22);
    parcial.connect(envParcial);
    envParcial.connect(env);

    var paneo = crearPaneo(pan);
    if (paneo) {
      env.connect(paneo);
      paneo.connect(busNotas);
    } else {
      env.connect(busNotas);
    }

    voces++;
    cuerpo.onended = function () {
      voces--;
      cuerpo.disconnect();
      parcial.disconnect();
      envParcial.disconnect();
      env.disconnect();
      if (paneo) { paneo.disconnect(); }
    };

    cuerpo.start(t);
    parcial.start(t);
    cuerpo.stop(fin);
    parcial.stop(fin);
  }

  // Todo lo que define el sonido de un asterisco sale de su semilla.
  function leerSemilla(semilla) {
    var h = hash(semilla);
    return {
      escala: ESCALAS[h % 3],
      indice: (h >>> 4) % 13,                         // La3 .. Re6
      pan: (((h >>> 12) % 101) / 100) * 1.2 - 0.6,
      inicio: (h >>> 20) % 3,                         // desde dónde sube el arpegio
      demora: (h >>> 24) % 30                         // ms, para que no sea de reloj
    };
  }

  function nota(semilla) {
    if (!encendido) { return; }
    var s = leerSemilla(semilla);
    tocar(frecuencia(s.escala, s.indice), 0.3, 0.5, s.pan, MAX_VOCES);
  }

  function gota(s, i, total) {
    return function () {
      // Cada gota un poco más presente y más hacia el lugar de la nota final.
      tocar(frecuencia(s.escala, s.inicio + i), 0.13 + 0.012 * i, 0.11,
        s.pan * (i + 1) / (total + 1), MAX_VOCES - 1);
    };
  }

  function nacer(semilla, cantidadPuntas) {
    if (!encendido) { return; }
    var s = leerSemilla(semilla);
    var puntas = Math.round(acotar(Number(cantidadPuntas), 5, 8));
    var i;
    for (i = 0; i < puntas; i++) {
      setTimeout(gota(s, i, puntas), i * 150 + (i % 2) * s.demora);
    }
    // Las gotas dejan siempre una voz libre para la nota propia.
    setTimeout(function () {
      tocar(frecuencia(s.escala, s.indice), 0.3, 0.5, s.pan, MAX_VOCES);
    }, puntas * 150 + 130);
  }

  // ------------------------------------------------------------ movimiento

  function gesto(x, y, velocidad) {
    if (!encendido) { return; }
    var t = ctx.currentTime;
    if (t - ultimoGesto < 0.05) { return; } // como mucho 20 veces por segundo
    ultimoGesto = t;

    var v = acotar(velocidad, 0, 1);
    if (v < 0.01) { return; } // quieto: el roce ya tiene su caída programada
    x = acotar(x, 0, 1);
    y = acotar(y, 0, 1);

    // Roce: arriba suena más claro, abajo más oscuro (450 Hz .. 2250 Hz).
    filtroRoce.frequency.setTargetAtTime(450 * Math.pow(5, 1 - y), t, 0.12);
    var g = gananciaRoce.gain;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0.02 + 0.2 * v, t, 0.09);
    g.setTargetAtTime(0, t + 0.22, 0.45); // se apaga solo si no llegan más gestos
    if (paneoRoce) {
      paneoRoce.pan.setTargetAtTime((x * 2 - 1) * 0.8, t, 0.15);
    }

    // De vez en cuando, una nota muy suave: escala según x, altura según y.
    if (v > 0.06 && t >= proximaNotaGesto) {
      proximaNotaGesto = t + 0.6 + Math.random() * 1.4;
      tocar(
        frecuencia(ESCALAS[Math.min(2, Math.floor(x * 3))], 2 + Math.round((1 - y) * 8)),
        0.07 + 0.05 * v, 0.3, (x * 2 - 1) * 0.7, 4
      );
    }
  }

  // El giro del cielo (una vuelta por día) corre lentísimo el color del
  // ambiente: corte del bordón, peso de la quinta y altura del aire.
  function cielo(giro) {
    if (!encendido || giro !== giro) { return; }
    var t = ctx.currentTime;
    if (t - ultimoCielo < 2) { return; }
    ultimoCielo = t;
    filtroBordon.frequency.setTargetAtTime(280 + 70 * Math.sin(giro), t, 3);
    gananciaQuinta.gain.setTargetAtTime(0.14 + 0.07 * Math.sin(giro * 2), t, 3);
    filtroAire.frequency.setTargetAtTime(900 + 350 * Math.cos(giro), t, 3);
  }

  // ------------------------------------------------------ encender / apagar

  function fundir(destino, segundos) {
    var t = ctx.currentTime;
    var g = maestro.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(destino, t + segundos);
  }

  function reanudar() {
    var p = null;
    try {
      if (ctx.state !== 'running' && ctx.resume) { p = ctx.resume(); }
    } catch (e) { p = null; }
    return (p && p.then) ? p : Promise.resolve();
  }

  function suspender() {
    try {
      if (ctx && ctx.state === 'running' && ctx.suspend) { ctx.suspend(); }
    } catch (e) { /* nada que hacer */ }
  }

  function activar() {
    if (!disponible() || typeof Promise === 'undefined') {
      return (typeof Promise === 'undefined') ? false : Promise.resolve(false);
    }
    try {
      if (!ctx) {
        construir();
        document.addEventListener('visibilitychange', alCambiarVisibilidad, false);
      }
    } catch (e) {
      ctx = null;
      return Promise.resolve(false);
    }
    clearTimeout(temporizadorSuspension);
    encendido = true;
    var p = reanudar(); // dentro del gesto del usuario (iOS/Safari)
    fundir(TOPE_MAESTRO, 2);
    return p.then(function () {
      if (ctx.state !== 'running') { encendido = false; }
      return encendido;
    }, function () {
      encendido = false;
      return false;
    });
  }

  function desactivar() {
    if (!ctx || !encendido) { return; }
    encendido = false;
    fundir(0, 1);
    clearTimeout(temporizadorSuspension);
    temporizadorSuspension = setTimeout(function () {
      if (!encendido) { suspender(); }
    }, 1150);
  }

  function activo() {
    return encendido;
  }

  // Pestaña oculta: silencio y contexto suspendido. Al volver, solo se
  // reanuda si la persona lo había dejado activo.
  function alCambiarVisibilidad() {
    if (!ctx) { return; }
    clearTimeout(temporizadorSuspension);
    if (document.hidden) {
      if (ctx.state === 'running') {
        maestro.gain.cancelScheduledValues(ctx.currentTime);
        maestro.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
        temporizadorSuspension = setTimeout(function () {
          if (document.hidden || !encendido) { suspender(); }
        }, 150);
      }
    } else if (encendido) {
      reanudar().then(function () {
        if (encendido) { fundir(TOPE_MAESTRO, 1.2); }
      }, function () { /* el navegador no dejó reanudar: queda en silencio */ });
    }
  }

  window.SaleHoySonido = {
    disponible: disponible,
    activar: activar,
    desactivar: desactivar,
    activo: activo,
    gesto: gesto,
    nota: nota,
    nacer: nacer,
    cielo: cielo
  };
})();
