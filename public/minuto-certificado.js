// Certificado de un minuto de "El minuto": una imagen vertical (1080 x 1350) para mandar.
//
// Se dibuja en el navegador, en un <canvas>, con las tipografías reales del sitio. No sale del
// dispositivo salvo que la persona la comparta. La dedicatoria solo se dibuja si está aprobada;
// si no, dice "Este minuto es un regalo."
//
//   MinutoCertificado.lienzo(datos)    -> Promise<HTMLCanvasElement>
//   MinutoCertificado.imagen(datos)    -> Promise<Blob>   (JPEG)
//   MinutoCertificado.entregar(datos)  -> Promise<"compartido" | "descargado" | "cancelado">
//   MinutoCertificado.descargar(datos) -> Promise<"descargado">
//
// datos: { id | idurl, instante (ms), zona (IANA), estado, dedicatoria, prueba, lang }
(function () {
  var ANCHO = 1080, ALTO = 1350, MARGEN = 96;
  var TINTA = "#0e0d12", CREMA = "#f2e9d8", TENUE = "rgba(242,233,216,.6)", LINEA = "rgba(242,233,216,.22)", BERMELLON = "#e2553a";
  var SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif';
  var MONO = '"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace';

  var T = {
    es: { obra: "EL MINUTO", regalo: "Este minuto es un regalo.", prueba: "PRUEBA", horaDe: "hora de", dura: "60 segundos", compartir: "El minuto", archivo: "el-minuto-" },
    en: { obra: "THE MINUTE", regalo: "This minute is a gift.", prueba: "TEST", horaDe: "time in", dura: "60 seconds", compartir: "The Minute", archivo: "the-minute-" }
  };

  function idioma(datos) {
    var l = (datos && datos.lang) || document.documentElement.lang || "es";
    return l === "en" ? "en" : "es";
  }
  function idUrl(datos) {
    return String(datos.idurl || datos.id || "").replace(":", "-");
  }
  function zonaSegura(zona) {
    try { new Intl.DateTimeFormat("en", { timeZone: zona }); return zona; } catch (e) { return "UTC"; }
  }
  function partes(instante, zona, lang) {
    var z = zonaSegura(zona || "UTC"), d = new Date(instante);
    var hm = new Intl.DateTimeFormat("en-GB", { timeZone: z, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
    function v(tipo) { for (var i = 0; i < hm.length; i++) if (hm[i].type === tipo) return hm[i].value; return "00"; }
    return {
      hora: v("hour") + ":" + v("minute"),
      fecha: new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-AR", { timeZone: z, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d),
      zona: z.replace(/_/g, " "),
      utc: d.toISOString().slice(0, 16).replace("T", " ") + " UTC"
    };
  }

  // Las tipografías tienen que estar cargadas antes de dibujar: si no, el lienzo usa las de reemplazo.
  function tipografias() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var espera = new Promise(function (listo) { setTimeout(listo, 4000); });   // sin red: se dibuja igual
    var carga = Promise.all([
      document.fonts.load('400 100px "Instrument Serif"'),
      document.fonts.load('italic 400 100px "Instrument Serif"'),
      document.fonts.load('400 30px "IBM Plex Mono"')
    ]).catch(function () {});
    return Promise.race([carga, espera]);
  }

  function espaciado(ctx, texto, x, y, espacio) {
    // letra por letra: letterSpacing del lienzo todavía no está en todos los navegadores
    for (var i = 0; i < texto.length; i++) {
      ctx.fillText(texto[i], x, y);
      x += ctx.measureText(texto[i]).width + espacio;
    }
    return x;
  }
  function anchoEspaciado(ctx, texto, espacio) {
    var a = 0;
    for (var i = 0; i < texto.length; i++) a += ctx.measureText(texto[i]).width + espacio;
    return a - espacio;
  }

  function renglones(ctx, texto, anchoMax) {
    var palabras = String(texto).split(/\s+/), lineas = [], actual = "";
    function partir(palabra) {            // una palabra más ancha que el renglón se corta
      var trozo = "";
      for (var i = 0; i < palabra.length; i++) {
        if (ctx.measureText(trozo + palabra[i]).width > anchoMax && trozo) { lineas.push(trozo); trozo = ""; }
        trozo += palabra[i];
      }
      return trozo;
    }
    for (var i = 0; i < palabras.length; i++) {
      var p = palabras[i];
      if (!p) continue;
      var prueba = actual ? actual + " " + p : p;
      if (ctx.measureText(prueba).width <= anchoMax) { actual = prueba; continue; }
      if (actual) lineas.push(actual);
      actual = ctx.measureText(p).width > anchoMax ? partir(p) : p;
    }
    if (actual) lineas.push(actual);
    return lineas;
  }

  function dibujar(datos) {
    var lang = idioma(datos), t = T[lang];
    var p = partes(datos.instante, datos.zona, lang);
    var aprobada = datos.estado === "aprobada" && typeof datos.dedicatoria === "string" && datos.dedicatoria.trim() !== "";
    var util = ANCHO - MARGEN * 2;

    var lienzo = document.createElement("canvas");
    lienzo.width = ANCHO; lienzo.height = ALTO;
    var ctx = lienzo.getContext("2d");
    ctx.fillStyle = TINTA;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.textBaseline = "alphabetic";

    // marco fino
    ctx.strokeStyle = LINEA; ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, ANCHO - 96, ALTO - 96);

    // arriba: la obra y la firma
    ctx.font = "400 26px " + MONO;
    ctx.fillStyle = CREMA;
    espaciado(ctx, t.obra, MARGEN, 150, 5);
    ctx.fillStyle = TENUE;
    ctx.textAlign = "right";
    ctx.fillText("Solzimer", ANCHO - MARGEN, 150);
    ctx.textAlign = "left";
    if (datos.prueba) {
      ctx.fillStyle = BERMELLON;
      var x0 = MARGEN + anchoEspaciado(ctx, t.obra, 5) + 34;
      espaciado(ctx, t.prueba, x0, 150, 5);
    }

    // la hora, enorme: se ajusta para ocupar el ancho
    var tam = 400;
    ctx.font = "400 " + tam + "px " + SERIF;
    var ancho = ctx.measureText(p.hora).width;
    if (ancho > util) { tam = Math.floor(tam * util / ancho); ctx.font = "400 " + tam + "px " + SERIF; }
    ctx.fillStyle = CREMA;
    var baseHora = 210 + tam * 0.78;
    ctx.fillText(p.hora, MARGEN - tam * 0.03, baseHora);

    // fecha larga y zona
    var y = baseHora + 96;
    ctx.font = "400 52px " + SERIF;
    var fecha = renglones(ctx, p.fecha, util);
    for (var i = 0; i < fecha.length; i++) { ctx.fillText(fecha[i], MARGEN, y); y += 60; }
    ctx.font = "400 24px " + MONO;
    ctx.fillStyle = TENUE;
    y += 2;
    var zona = renglones(ctx, t.horaDe + " " + p.zona + " · " + p.utc, util);
    for (var j = 0; j < zona.length; j++) { ctx.fillText(zona[j], MARGEN, y); y += 36; }

    // la dedicatoria (o la frase neutra), en itálica; se achica si no entra
    var pieY = ALTO - 150;
    var lineaY = pieY - 60;
    var desde = y + 40, hasta = lineaY - 50;
    var texto = aprobada ? datos.dedicatoria.trim() : t.regalo;
    var cuerpo = aprobada ? 84 : 64, lineas, alto;
    do {
      ctx.font = "italic 400 " + cuerpo + "px " + SERIF;
      lineas = renglones(ctx, texto, util);
      alto = lineas.length * cuerpo * 1.12;
      if (alto <= hasta - desde) break;
      cuerpo -= 4;
    } while (cuerpo > 30);
    ctx.fillStyle = aprobada ? CREMA : TENUE;
    var yd = desde + Math.max(0, (hasta - desde - alto) / 2) + cuerpo * 0.86;
    for (var k = 0; k < lineas.length; k++) { ctx.fillText(lineas[k], MARGEN, yd); yd += cuerpo * 1.12; }

    // línea fina y pie
    ctx.fillStyle = LINEA;
    ctx.fillRect(MARGEN, lineaY, util, 2);
    ctx.font = "400 24px " + MONO;
    ctx.fillStyle = CREMA;
    var pie = "salehoy.com.ar" + (lang === "en" ? "/en/minute/m/" : "/minuto/m/") + idUrl(datos);
    var tamPie = 24;
    while (ctx.measureText(pie).width > util && tamPie > 14) { tamPie -= 1; ctx.font = "400 " + tamPie + "px " + MONO; }
    ctx.fillText(pie, MARGEN, pieY);
    ctx.font = "400 22px " + MONO;
    ctx.fillStyle = TENUE;
    ctx.fillText(t.dura, MARGEN, pieY + 40);

    return lienzo;
  }

  function lienzo(datos) {
    return tipografias().then(function () { return dibujar(datos); });
  }

  function imagen(datos) {
    return lienzo(datos).then(function (c) {
      return new Promise(function (listo, falla) {
        if (!c.toBlob) { falla(new Error("sin toBlob")); return; }
        c.toBlob(function (blob) { if (blob) listo(blob); else falla(new Error("sin imagen")); }, "image/jpeg", 0.92);
      });
    });
  }

  function nombre(datos) { return T[idioma(datos)].archivo + idUrl(datos) + ".jpg"; }

  function bajar(blob, datos) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre(datos);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 8000);
    return "descargado";
  }

  function descargar(datos) {
    return imagen(datos).then(function (blob) { return bajar(blob, datos); });
  }

  // Si el dispositivo puede compartir archivos (celulares), abre el menú de compartir; si no, descarga.
  function entregar(datos) {
    return imagen(datos).then(function (blob) {
      var archivo = null;
      try { archivo = new File([blob], nombre(datos), { type: "image/jpeg" }); } catch (e) {}
      var puede = false;
      try { puede = !!(archivo && navigator.share && navigator.canShare && navigator.canShare({ files: [archivo] })); } catch (e) {}
      if (!puede) return bajar(blob, datos);
      return navigator.share({ files: [archivo], title: T[idioma(datos)].compartir }).then(
        function () { return "compartido"; },
        function (e) { return e && e.name === "AbortError" ? "cancelado" : bajar(blob, datos); }
      );
    });
  }

  window.MinutoCertificado = { lienzo: lienzo, imagen: imagen, entregar: entregar, descargar: descargar };
})();
