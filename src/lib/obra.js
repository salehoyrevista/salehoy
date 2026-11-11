// Datos de la obra para usar al construir el sitio.
// La única fuente es public/salehoy.js (lo que corre en el navegador): de ahí
// salen la dirección, el contrato de USDC y los textos. Nada se copia a mano.
import fs from "node:fs";

const fuente = fs.readFileSync("public/salehoy.js", "utf8");
const ventana = {};
new Function("window", "location", "navigator", "document", fuente)(
  ventana, { search: "" }, { languages: ["es"] }, { documentElement: { getAttribute() { return null; } } }
);

export const S = ventana.SaleHoy;
export const SITIO = "https://salehoy.com.ar";
export const DIRECCION = S.DIRECCION;
export const USDC_BASE = S.USDC_BASE;
export const AUTOR = S.AUTOR;
export const INICIO = "2026-10-29";
export const RED = { nombre: "Base", chainId: 8453, explorador: "https://base.blockscout.com" };

// Direcciones de cada página por idioma. Donde un idioma no tiene versión
// propia, apunta a la inglesa.
export const RUTAS = {
  es: { cielo: "/", sobre: "/sobre/", estrella: "/regalar-una-estrella/", frases: "/frases-regalo-sin-motivo/", regalo: "/regalo.html?lang=es", agentes: "/agentes/" },
  en: { cielo: "/en/", sobre: "/en/about/", estrella: "/en/gift-a-star/", frases: "/en/gift-for-no-reason-quotes/", regalo: "/regalo.html?lang=en", agentes: "/agentes/" },
  pt: { cielo: "/pt/", sobre: "/en/about/", estrella: "/pt/presentear-uma-estrela/", frases: "/pt/frases-presente-sem-motivo/", regalo: "/regalo.html?lang=pt", agentes: "/agentes/" }
};

// Rótulos de la navegación de las páginas de texto.
export const NAV = {
  es: { cielo: "el cielo", regalo: "regalar", sobre: "sobre la obra", estrella: "regalar una estrella", frases: "frases", agentes: "para agentes de IA", otros: "también en" },
  en: { cielo: "the sky", regalo: "give", sobre: "about the work", estrella: "gift a star", frases: "quotes", agentes: "for AI agents", otros: "also in" },
  pt: { cielo: "o céu", regalo: "presentear", sobre: "sobre a obra", estrella: "presentear uma estrela", frases: "frases", agentes: "para agentes de IA", otros: "também em" }
};
