// Cuenta las visitas de buscadores y crawlers de IA (GPTBot, ClaudeBot,
// PerplexityBot, Googlebot...). Ellos no ejecutan JavaScript, así que no
// pasan por /api/visita: se los reconoce acá, por su User-Agent.
//
// No toca la respuesta: deja pasar el pedido tal cual. Si algo falla, el
// sitio se sirve igual (onError: "bypass").
import { getStore } from "@netlify/blobs";

const BOTS = [
  ["GPTBot", /GPTBot/i],
  ["ChatGPT-User", /ChatGPT-User/i],
  ["OAI-SearchBot", /OAI-SearchBot/i],
  ["ClaudeBot", /ClaudeBot|Claude-Web|anthropic-ai/i],
  ["Claude-User", /Claude-User|Claude-SearchBot/i],
  ["PerplexityBot", /PerplexityBot|Perplexity-User/i],
  ["Googlebot", /Googlebot/i],
  ["GoogleOther", /GoogleOther|Google-InspectionTool|Google-CloudVertexBot/i],
  ["Bingbot", /bingbot/i],
  ["Applebot", /Applebot/i],
  ["Amazonbot", /Amazonbot/i],
  ["Meta", /meta-externalagent|facebookexternalhit|FacebookBot/i],
  ["Bytespider", /Bytespider/i],
  ["CCBot", /CCBot/i],
  ["DuckDuckBot", /DuckDuckBot|DuckAssistBot/i],
  ["YandexBot", /YandexBot/i],
  ["MistralAI", /MistralAI/i],
  ["cohere", /cohere-ai/i],
  ["otros", /bot|crawl|spider/i]
];

async function contar(nombre, pagina) {
  const dia = new Date().toISOString().slice(0, 10);
  const store = getStore("bots");
  const datos = (await store.get(dia, { type: "json" })) || {};
  const b = datos[nombre] || (datos[nombre] = { total: 0, paginas: {} });
  b.total++;
  if (pagina in b.paginas || Object.keys(b.paginas).length < 60) b.paginas[pagina] = (b.paginas[pagina] || 0) + 1;
  await store.setJSON(dia, datos);
}

export default async function (request, context) {
  try {
    const ua = request.headers.get("user-agent") || "";
    const bot = BOTS.find(([, re]) => re.test(ua));
    if (bot) {
      const pagina = new URL(request.url).pathname.slice(0, 80);
      context.waitUntil(contar(bot[0], pagina).catch(() => {}));
    }
  } catch (e) {}
  // sin "return": el pedido sigue su camino normal
}

export const config = {
  path: "/*",
  excludedPath: ["/api/*", "/fonts/*", "/_astro/*", "/*.png", "/*.js", "/*.css", "/*.woff2", "/*.ico"],
  onError: "bypass"
};
