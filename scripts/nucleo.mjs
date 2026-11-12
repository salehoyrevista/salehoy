// Genera netlify/lib/salehoy-nucleo.mjs a partir de public/salehoy.js.
//
// Las funciones del servidor necesitan la dirección de la obra, el contrato de
// USDC y las mismas reglas (filtro, dedicatorias) que usa el navegador. Para
// que haya UNA sola fuente y la dirección nunca se copie a mano, este script
// envuelve public/salehoy.js en un módulo. Corre antes de cada build.
import fs from "node:fs";

const fuente = fs.readFileSync("public/salehoy.js", "utf8").replace(/\r\n/g, "\n");
if (fuente.includes("`") || fuente.includes("${")) {
  throw new Error("public/salehoy.js no puede tener plantillas: rompería el envoltorio");
}

const modulo = `// GENERADO por scripts/nucleo.mjs desde public/salehoy.js. No editar a mano.
const window = {};
const location = { search: "" };
const navigator = { languages: ["es"] };
const document = { documentElement: { getAttribute() { return null; } } };
${fuente}
export default window.SaleHoy;
`;

fs.mkdirSync("netlify/lib", { recursive: true });
fs.writeFileSync("netlify/lib/salehoy-nucleo.mjs", modulo);
console.log("netlify/lib/salehoy-nucleo.mjs generado");
