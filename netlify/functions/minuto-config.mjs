// GET /api/minuto/config — lo que la página de pedir necesita saber.
//   aporte: null si el autor todavía no cargó SALES_ADDRESS (no se muestra nada de aportes), o la
//           dirección, la red (siempre Base) y montos sugeridos. El aporte es voluntario y aparte:
//           no cambia nada del minuto.
import { aporte } from "../lib/ajustes.mjs";
import { DEDICATORIA_MAX } from "../lib/filtro.mjs";
import { json, redPublica } from "../lib/minuto.mjs";

export default async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  const a = aporte();
  return json({
    aporte: a ? { direccion: a.direccion, red: redPublica(a.red), sugeridos: a.sugeridos } : null,
    dedicatoriaMax: DEDICATORIA_MAX
  });
};

export const config = { path: "/api/minuto/config" };
