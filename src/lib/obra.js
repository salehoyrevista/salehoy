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
  pt: { cielo: "/pt/", sobre: "/pt/sobre-a-obra/", estrella: "/pt/presentear-uma-estrela/", frases: "/pt/frases-presente-sem-motivo/", regalo: "/regalo.html?lang=pt", agentes: "/agentes/" },
  fr: { cielo: "/fr/", sobre: "/fr/a-propos/", estrella: "/fr/offrir-une-etoile/", frases: "/fr/phrases-cadeau-sans-raison/", regalo: "/regalo.html?lang=fr", agentes: "/agentes/" },
  it: { cielo: "/it/", sobre: "/it/sull-opera/", estrella: "/it/regalare-una-stella/", frases: "/it/frasi-regalo-senza-motivo/", regalo: "/regalo.html?lang=it", agentes: "/agentes/" },
  de: { cielo: "/de/", sobre: "/de/ueber-das-werk/", estrella: "/de/einen-stern-schenken/", frases: "/de/sprueche-geschenk-ohne-grund/", regalo: "/regalo.html?lang=de", agentes: "/agentes/" },
  zh: { cielo: "/zh/", sobre: "/zh/guanyu-zuopin/", estrella: "/zh/song-xingxing/", frases: "/zh/song-li-zengyan/", regalo: "/regalo.html?lang=zh", agentes: "/agentes/" },
  ja: { cielo: "/ja/", sobre: "/ja/sakuhin-ni-tsuite/", estrella: "/ja/hoshi-wo-okuru/", frases: "/ja/okurimono-kotoba/", regalo: "/regalo.html?lang=ja", agentes: "/agentes/" }
};

// En qué idiomas existe cada página de texto.
export const IDIOMAS_PAGINA = {
  estrella: ["es", "en", "pt", "fr", "it", "de", "zh", "ja"],
  frases: ["es", "en", "pt", "fr", "it", "de", "zh", "ja"],
  sobre: ["es", "en", "pt", "fr", "it", "de", "zh", "ja"]
};

// La misma página en los otros idiomas, para hreflang y el pie.
export function alternativas(clave, lang) {
  return IDIOMAS_PAGINA[clave].filter((l) => l !== lang).map((l) => ({ lang: l, href: RUTAS[l][clave] }));
}

// Rótulos de la navegación de las páginas de texto.
export const NAV = {
  es: { cielo: "el cielo", regalo: "regalar", sobre: "sobre la obra", estrella: "regalar una estrella", frases: "frases", agentes: "para agentes de IA", otros: "también en" },
  en: { cielo: "the sky", regalo: "give", sobre: "about the work", estrella: "gift a star", frases: "quotes", agentes: "for AI agents", otros: "also in" },
  pt: { cielo: "o céu", regalo: "presentear", sobre: "sobre a obra", estrella: "presentear uma estrela", frases: "frases", agentes: "para agentes de IA", otros: "também em" },
  fr: { cielo: "le ciel", regalo: "offrir", sobre: "à propos de l’œuvre", estrella: "offrir une étoile", frases: "phrases", agentes: "pour les agents IA", otros: "aussi en" },
  it: { cielo: "il cielo", regalo: "regala", sobre: "sull’opera", estrella: "regalare una stella", frases: "frasi", agentes: "per agenti IA", otros: "anche in" },
  de: { cielo: "der Himmel", regalo: "schenken", sobre: "über das Werk", estrella: "einen Stern schenken", frases: "Sprüche", agentes: "für KI-Agenten", otros: "auch auf" },
  zh: { cielo: "天空", regalo: "送礼", sobre: "关于作品", estrella: "送一颗星星", frases: "赠言", agentes: "给 AI 智能体", otros: "其他语言" },
  ja: { cielo: "空", regalo: "贈る", sobre: "作品について", estrella: "星を贈る", frases: "言葉", agentes: "AI エージェント向け", otros: "ほかの言語" }
};
