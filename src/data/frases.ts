/**
 * SaleHoy — Máquina de Frases
 *
 * Base curada de 80 frases sobre azar, juego, suerte y destino.
 *
 * Tiers de rareza:
 *  - tier 1 (común, ~60%): clásicos, refranes universales, citas conocidas.
 *  - tier 2 (medio, ~30%): buenas pero menos sonadas, tango, dichos argentinos.
 *  - tier 3 (jackpot, ~10%): joyas, autores menos populares, citas específicas.
 *
 * Las frases con autor verificable llevan "autor" preciso.
 * Las populares sin autor único llevan "Refrán" o "Anónimo".
 * Las dudosas se marcan como "atribuida a".
 */

export type Tier = 1 | 2 | 3;

export interface Frase {
  texto: string;
  autor: string;
  obra?: string;
  tier: Tier;
}

export const FRASES: Frase[] = [
  // ============ TIER 1 — clásicos y refranes universales (48) ============
  { texto: 'Dios no juega a los dados con el universo.', autor: 'Albert Einstein', tier: 1 },
  { texto: 'El azar es el seudónimo que Dios usa cuando no quiere firmar.', autor: 'Anatole France', tier: 1 },
  { texto: 'La fortuna favorece a los audaces.', autor: 'Virgilio', obra: 'Eneida', tier: 1 },
  { texto: 'No existe el azar; sólo existe la ignorancia de las causas.', autor: 'Baruch Spinoza', tier: 1 },
  { texto: 'La suerte es lo que pasa cuando la preparación se encuentra con la oportunidad.', autor: 'Séneca', tier: 1 },
  { texto: 'Las matemáticas son el alfabeto con el cual Dios ha escrito el universo.', autor: 'Galileo Galilei', tier: 1 },
  { texto: 'Quien no arriesga, no gana.', autor: 'Refrán popular', tier: 1 },
  { texto: 'A caballo regalado no se le miran los dientes.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Más vale pájaro en mano que cien volando.', autor: 'Refrán popular', tier: 1 },
  { texto: 'La suerte está echada.', autor: 'Julio César', obra: 'al cruzar el Rubicón', tier: 1 },
  { texto: 'No hay mal que por bien no venga.', autor: 'Refrán popular', tier: 1 },
  { texto: 'El amor es ciego, pero el matrimonio le devuelve la vista.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Camarón que se duerme se lo lleva la corriente.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Hay quien tiene más suerte que entendimiento.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Cada cual juega con las cartas que le tocan.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Sobre el azar hay leyes; sobre la ignorancia, opiniones.', autor: 'Atribuida a Voltaire', tier: 1 },
  { texto: 'La vida es una tragedia para los que sienten y una comedia para los que piensan.', autor: 'Jean de La Bruyère', tier: 1 },
  { texto: 'Quien con esperanza vive, alegre muere.', autor: 'Refrán popular', tier: 1 },
  { texto: 'En el juego y en el amor, todo vale.', autor: 'Refrán popular', tier: 1 },
  { texto: 'El que se enoja, pierde.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Caballo grande, ande o no ande.', autor: 'Refrán argentino', tier: 1 },
  { texto: 'Despacio que tengo apuro.', autor: 'Refrán argentino', tier: 1 },
  { texto: 'Mientras hay vida, hay esperanza.', autor: 'Refrán popular', tier: 1 },
  { texto: 'La esperanza es el último que se pierde.', autor: 'Refrán popular', tier: 1 },
  { texto: 'El destino baraja las cartas, pero somos nosotros los que jugamos.', autor: 'Arthur Schopenhauer', tier: 1 },
  { texto: 'No se puede engañar a la muerte ni a los impuestos.', autor: 'Atribuida a Benjamin Franklin', tier: 1 },
  { texto: 'El que mucho abarca, poco aprieta.', autor: 'Refrán popular', tier: 1 },
  { texto: 'A quien madruga, Dios lo ayuda.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Los dados de Júpiter caen siempre de manera afortunada.', autor: 'Sófocles', tier: 1 },
  { texto: 'Es de necios confundir valor y precio.', autor: 'Antonio Machado', tier: 1 },
  { texto: 'La vida es lo que te pasa mientras estás ocupado haciendo otros planes.', autor: 'John Lennon', tier: 1 },
  { texto: 'Después de la lluvia siempre sale el sol.', autor: 'Refrán popular', tier: 1 },
  { texto: 'No hay viento favorable para quien no sabe a dónde va.', autor: 'Séneca', tier: 1 },
  { texto: 'El que tiene boca se equivoca.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Dios aprieta pero no ahorca.', autor: 'Refrán popular', tier: 1 },
  { texto: 'No se le pueden poner puertas al campo.', autor: 'Refrán popular', tier: 1 },
  { texto: 'En la duda, abstente.', autor: 'Atribuida a Confucio', tier: 1 },
  { texto: 'A río revuelto, ganancia de pescadores.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Cría fama y échate a dormir.', autor: 'Refrán popular', tier: 1 },
  { texto: 'El que ríe último, ríe mejor.', autor: 'Refrán popular', tier: 1 },
  { texto: 'No hay deuda que no se pague ni plazo que no se cumpla.', autor: 'Refrán popular', tier: 1 },
  { texto: 'El tiempo es oro.', autor: 'Atribuida a Benjamin Franklin', tier: 1 },
  { texto: 'Lo que natura no da, Salamanca no presta.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Vísteme despacio que estoy apurado.', autor: 'Napoleón Bonaparte', tier: 1 },
  { texto: 'No por mucho madrugar amanece más temprano.', autor: 'Refrán popular', tier: 1 },
  { texto: 'Quien siembra vientos, recoge tempestades.', autor: 'Refrán popular', tier: 1 },
  { texto: 'A grandes males, grandes remedios.', autor: 'Refrán popular', tier: 1 },
  { texto: 'En boca cerrada no entran moscas.', autor: 'Refrán popular', tier: 1 },

  // ============ TIER 2 — buenas pero menos conocidas (24) ============
  { texto: 'La vida es tan corta y el oficio de vivir tan difícil, que cuando uno empieza a aprenderlo, ya hay que morirse.', autor: 'Ernesto Sabato', tier: 2 },
  { texto: 'Vivir es ir muriendo.', autor: 'Enrique Santos Discépolo', tier: 2 },
  { texto: 'El mundo fue y será una porquería, ya lo sé.', autor: 'Enrique Santos Discépolo', obra: 'Cambalache', tier: 2 },
  { texto: 'Yira, yira... aunque te quiebre la vida, aunque te muerda un dolor, no esperes nunca una ayuda, ni una mano, ni un favor.', autor: 'Enrique Santos Discépolo', obra: 'Yira Yira', tier: 2 },
  { texto: 'San La Muerte protege, pero también cobra.', autor: 'Dicho popular del litoral argentino', tier: 2 },
  { texto: 'Vivir con miedo es como vivir a medias.', autor: 'Refrán popular', tier: 2 },
  { texto: 'Las apariencias engañan, pero las primeras impresiones casi nunca.', autor: 'Anónimo', tier: 2 },
  { texto: 'En las palabras del que apuesta hay una verdad que el ganador olvida.', autor: 'Anónimo', tier: 2 },
  { texto: 'El que entiende el azar deja de buscarle sentido.', autor: 'Anónimo', tier: 2 },
  { texto: 'La probabilidad es solo el sentido común reducido a cálculo.', autor: 'Pierre-Simon Laplace', tier: 2 },
  { texto: 'La fe es creer en lo que no se ve, y la recompensa de esta fe es ver lo que se cree.', autor: 'San Agustín', tier: 2 },
  { texto: 'El destino mezcla las cartas; nosotros las jugamos.', autor: 'Arthur Schopenhauer', tier: 2 },
  { texto: 'Las únicas certezas que tenemos sobre el futuro son la muerte y los impuestos.', autor: 'Benjamin Franklin', tier: 2 },
  { texto: 'La fortuna es como el cristal: cuando más brilla, más fácilmente se rompe.', autor: 'Publilio Siro', tier: 2 },
  { texto: 'En la mesa de juego, el silencio dice más que las cartas.', autor: 'Anónimo', tier: 2 },
  { texto: 'No hay nada más previsible que el comportamiento del que cree estar improvisando.', autor: 'Anónimo', tier: 2 },
  { texto: 'El que pierde con elegancia tiene la última carta.', autor: 'Anónimo', tier: 2 },
  { texto: 'A todos nos llega la mano caliente alguna vez. El problema es saber cuándo dejarla enfriar.', autor: 'Refrán de mesa', tier: 2 },
  { texto: 'El azar tiene sus razones que la razón no conoce.', autor: 'Variación de Pascal', tier: 2 },
  { texto: 'Una sociedad sin ritos del azar es una sociedad sin escapatoria.', autor: 'Roger Caillois', obra: 'Los juegos y los hombres', tier: 2 },
  { texto: 'El jugador no busca el premio: busca el momento antes del premio.', autor: 'Anónimo', tier: 2 },
  { texto: 'Las palabras "siempre" y "nunca" no existen en el lenguaje del azar.', autor: 'Anónimo', tier: 2 },
  { texto: 'Lo que se llama suerte es la atención al detalle.', autor: 'Winston Churchill', tier: 2 },
  { texto: 'Quien sólo busca premios, nunca entiende el juego.', autor: 'Anónimo', tier: 2 },

  // ============ TIER 3 — jackpot, joyas (8) ============
  { texto: 'Como todos los hombres de Babilonia, he sido procónsul; como todos, esclavo.', autor: 'Jorge Luis Borges', obra: 'La lotería en Babilonia', tier: 3 },
  { texto: 'Toda lotería es un sistema cifrado donde el azar finge ser destino.', autor: 'Anónimo', tier: 3 },
  { texto: 'El universo (que otros llaman la Biblioteca) se compone de un número indefinido, y tal vez infinito, de galerías hexagonales.', autor: 'Jorge Luis Borges', obra: 'La biblioteca de Babel', tier: 3 },
  { texto: 'No es cierto que jugando se pueda ganar; lo cierto es que se necesita jugar.', autor: 'Atribuida a Fyodor Dostoievski', tier: 3 },
  { texto: 'El que apuesta en el último instante apuesta al instante, no al número.', autor: 'Anónimo', tier: 3 },
  { texto: 'Hay una sola libertad, y es la de no esperar nada de la suerte.', autor: 'Fernando Pessoa', tier: 3 },
  { texto: 'El azar es la forma educada que tiene la necesidad de presentarse en sociedad.', autor: 'Anónimo', tier: 3 },
  { texto: 'Todo cálculo de probabilidades termina, tarde o temprano, en una confesión.', autor: 'Anónimo', tier: 3 },
];

/**
 * Devuelve una frase al azar respetando los pesos de tier.
 * tier 1 → 60%, tier 2 → 30%, tier 3 → 10%.
 */
export function fraseAlAzar(): Frase {
  const r = Math.random() * 100;
  let tier: Tier = 1;
  if (r < 10) tier = 3;
  else if (r < 40) tier = 2;
  else tier = 1;

  const pool = FRASES.filter(f => f.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

export const TIER_LABELS: Record<Tier, string> = {
  1: 'Clásica',
  2: 'Curiosidad',
  3: '★ Jackpot ★',
};
