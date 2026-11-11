// /api/estadisticas — los contadores de los últimos días, en JSON.
// Son números agregados y anónimos, por eso son públicos: no hay nada que
// identifique a nadie. La página /estadisticas/ los muestra en una tabla.
import { getStore } from "@netlify/blobs";

const DIAS = 60;

export default async function () {
  const visitas = getStore("visitas");
  const bots = getStore("bots");
  const dias = [];
  const hoy = Date.now();
  const claves = [];
  for (let i = 0; i < DIAS; i++) claves.push(new Date(hoy - i * 86400000).toISOString().slice(0, 10));

  const leidos = await Promise.all(claves.map(async (dia) => {
    const [v, b] = await Promise.all([
      visitas.get(dia, { type: "json" }).catch(() => null),
      bots.get(dia, { type: "json" }).catch(() => null)
    ]);
    return v || b ? { dia, ...(v || { visitas: 0 }), bots: b || {} } : null;
  }));
  for (const d of leidos) if (d) dias.push(d);

  return new Response(JSON.stringify({ generado: new Date().toISOString(), dias }, null, 1), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": "public, s-maxage=300"
    }
  });
}

export const config = { path: "/api/estadisticas" };
