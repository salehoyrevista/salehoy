// Rutas y rótulos de las tres obras del sitio, en español e inglés.
// "Sin motivo" no cambia; las dos obras nuevas tienen rutas propias.
export const SITIO = "https://salehoy.com.ar";

export const RUTAS_OBRAS = {
  es: {
    sinMotivo: "/",
    interruptor: "/interruptor/",
    minuto: "/minuto/",
    minutoElegir: "/minuto/elegir/",
    minutoArchivo: "/minuto/archivo/",
    minutoTerminos: "/minuto/terminos/",
    minutoPagina: (id) => "/minuto/m/" + id + "/"      // id con guiones: 2026-12-24T03-33Z
  },
  en: {
    sinMotivo: "/en/",
    interruptor: "/en/switch/",
    minuto: "/en/minute/",
    minutoElegir: "/en/minute/choose/",
    minutoArchivo: "/en/minute/archive/",
    minutoTerminos: "/en/minute/terms/",
    minutoPagina: (id) => "/en/minute/m/" + id + "/"
  }
};

export const NOMBRES_OBRAS = {
  es: { sinMotivo: "Sin motivo", interruptor: "El interruptor", minuto: "El minuto", obras: "Obras de Solzimer" },
  en: { sinMotivo: "Sin motivo", interruptor: "The Switch", minuto: "The Minute", obras: "Works by Solzimer" }
};
