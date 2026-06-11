export type Categoria =
  | 'filosofia' | 'ciencia' | 'literatura' | 'cine' | 'dicho'
  | 'quiniela' | 'historia' | 'salehoy' | 'rock' | 'tango' | 'latam';

export interface Frase {
  id: number;
  texto: string;
  autor: string;
  obra?: string;
  categoria: Categoria;
}

export const FRASES: Frase[] = [

  // ── FILOSOFÍA ──────────────────────────────────────────────────────────────
  { id: 1,  texto: 'La suerte está echada.', autor: 'Julio César', obra: 'al cruzar el Rubicón, 49 a.C.', categoria: 'filosofia' },
  { id: 2,  texto: 'La fortuna ayuda a los audaces.', autor: 'Virgilio', obra: 'Eneida', categoria: 'filosofia' },
  { id: 3,  texto: 'El tiempo es un niño que juega.', autor: 'Heráclito', obra: 'fragmento 52', categoria: 'filosofia' },
  { id: 4,  texto: 'Hay que apostar: no es voluntario, ya estamos embarcados.', autor: 'Blaise Pascal', obra: 'Pensamientos', categoria: 'filosofia' },
  { id: 5,  texto: 'Un golpe de dados jamás abolirá el azar.', autor: 'Stéphane Mallarmé', obra: '1897', categoria: 'filosofia' },
  { id: 6,  texto: 'Todo lo que existe es fruto del azar y la necesidad.', autor: 'atribuida a Demócrito', categoria: 'filosofia' },
  { id: 7,  texto: 'El azar es el seudónimo que Dios usa cuando no quiere firmar.', autor: 'Anatole France', categoria: 'filosofia' },
  { id: 8,  texto: 'No existe el azar; sólo existe la ignorancia de las causas.', autor: 'Baruch Spinoza', categoria: 'filosofia' },
  { id: 9,  texto: 'La suerte es lo que pasa cuando la preparación se encuentra con la oportunidad.', autor: 'Séneca', categoria: 'filosofia' },
  { id: 10, texto: 'Sobre el azar hay leyes; sobre la ignorancia, opiniones.', autor: 'atribuida a Voltaire', categoria: 'filosofia' },
  { id: 11, texto: 'El destino baraja las cartas, pero somos nosotros los que jugamos.', autor: 'Arthur Schopenhauer', categoria: 'filosofia' },
  { id: 12, texto: 'Los dados de Júpiter caen siempre de manera afortunada.', autor: 'Sófocles', categoria: 'filosofia' },
  { id: 13, texto: 'No hay viento favorable para quien no sabe a dónde va.', autor: 'Séneca', categoria: 'filosofia' },
  { id: 14, texto: 'En la duda, abstente.', autor: 'atribuida a Confucio', categoria: 'filosofia' },
  { id: 15, texto: 'La fe es creer en lo que no se ve, y la recompensa de esta fe es ver lo que se cree.', autor: 'San Agustín', categoria: 'filosofia' },
  { id: 16, texto: 'La fortuna es como el cristal: cuando más brilla, más fácilmente se rompe.', autor: 'Publilio Siro', categoria: 'filosofia' },
  { id: 17, texto: 'El azar tiene sus razones que la razón no conoce.', autor: 'variación de Pascal', categoria: 'filosofia' },

  // ── CIENCIA ────────────────────────────────────────────────────────────────
  { id: 18, texto: 'Dios no juega a los dados con el universo.', autor: 'Albert Einstein', obra: 'carta a Max Born, 1926', categoria: 'ciencia' },
  { id: 19, texto: 'Deje de decirle a Dios lo que tiene que hacer.', autor: 'Niels Bohr', obra: 'respuesta a Einstein', categoria: 'ciencia' },
  { id: 20, texto: 'El azar favorece a la mente preparada.', autor: 'Louis Pasteur', obra: '1854', categoria: 'ciencia' },
  { id: 21, texto: 'Las matemáticas son el alfabeto con el cual Dios ha escrito el universo.', autor: 'Galileo Galilei', categoria: 'ciencia' },
  { id: 22, texto: 'La probabilidad es solo el sentido común reducido a cálculo.', autor: 'Pierre-Simon Laplace', categoria: 'ciencia' },

  // ── LITERATURA ─────────────────────────────────────────────────────────────
  { id: 23, texto: 'La lotería es una intensificación del azar.', autor: 'Jorge Luis Borges', obra: 'La lotería en Babilonia', categoria: 'literatura' },
  { id: 24, texto: 'Como todos los hombres de Babilonia, he sido procónsul; como todos, esclavo.', autor: 'Jorge Luis Borges', obra: 'La lotería en Babilonia', categoria: 'literatura' },
  { id: 25, texto: 'El universo (que otros llaman la Biblioteca) se compone de un número indefinido, y tal vez infinito, de galerías hexagonales.', autor: 'Jorge Luis Borges', obra: 'La biblioteca de Babel', categoria: 'literatura' },
  { id: 26, texto: 'Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.', autor: 'Julio Cortázar', obra: 'Rayuela', categoria: 'literatura' },
  { id: 27, texto: '¡Mi reino por un caballo!', autor: 'William Shakespeare', obra: 'Ricardo III', categoria: 'literatura' },
  { id: 28, texto: 'La ventura siempre deja una puerta abierta en las desdichas.', autor: 'Miguel de Cervantes', obra: 'Don Quijote', categoria: 'literatura' },
  { id: 29, texto: 'La vida es una tragedia para los que sienten y una comedia para los que piensan.', autor: 'Jean de La Bruyère', categoria: 'literatura' },
  { id: 30, texto: 'La vida es lo que te pasa mientras estás ocupado haciendo otros planes.', autor: 'John Lennon', categoria: 'literatura' },
  { id: 31, texto: 'Es de necios confundir valor y precio.', autor: 'Antonio Machado', categoria: 'literatura' },
  { id: 32, texto: 'La vida es tan corta y el oficio de vivir tan difícil, que cuando uno empieza a aprenderlo, ya hay que morirse.', autor: 'Ernesto Sabato', categoria: 'literatura' },
  { id: 33, texto: 'No es cierto que jugando se pueda ganar; lo cierto es que se necesita jugar.', autor: 'atribuida a Fyodor Dostoievski', categoria: 'literatura' },
  { id: 34, texto: 'Hay una sola libertad, y es la de no esperar nada de la suerte.', autor: 'Fernando Pessoa', categoria: 'literatura' },
  { id: 35, texto: 'Una sociedad sin ritos del azar es una sociedad sin escapatoria.', autor: 'Roger Caillois', obra: 'Los juegos y los hombres', categoria: 'literatura' },

  // ── CINE ───────────────────────────────────────────────────────────────────
  { id: 36, texto: 'La vida es como una caja de bombones.', autor: 'Forrest Gump', obra: '1994', categoria: 'cine' },
  { id: 37, texto: 'La pregunta es: ¿te sentís con suerte?', autor: 'Harry el Sucio', obra: '1971', categoria: 'cine' },
  { id: 38, texto: 'Que la suerte esté siempre de tu lado.', autor: 'Los juegos del hambre', obra: '2012', categoria: 'cine' },
  { id: 39, texto: 'Que la Fuerza te acompañe.', autor: 'Star Wars', obra: '1977', categoria: 'cine' },

  // ── DICHO ──────────────────────────────────────────────────────────────────
  { id: 40, texto: 'Desgraciado en el juego, afortunado en el amor.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 41, texto: 'El que no arriesga no gana.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 42, texto: 'Al que le van a dar, le guardan.', autor: 'Dicho rioplatense', categoria: 'dicho' },
  { id: 43, texto: 'Cuando toca, toca.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 44, texto: 'La tercera es la vencida.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 45, texto: 'No hay dos sin tres.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 46, texto: 'La suerte de la fea, la bonita la desea.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 47, texto: 'Unos nacen con estrella y otros nacen estrellados.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 48, texto: 'El que nace para pito nunca llega a corneta.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 49, texto: 'Lo que ha de ser, será.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 50, texto: 'San La Muerte protege, pero también cobra.', autor: 'Dicho popular del litoral argentino', categoria: 'dicho' },
  { id: 51, texto: 'A caballo regalado no se le miran los dientes.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 52, texto: 'Más vale pájaro en mano que cien volando.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 53, texto: 'No hay mal que por bien no venga.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 54, texto: 'Camarón que se duerme se lo lleva la corriente.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 55, texto: 'Hay quien tiene más suerte que entendimiento.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 56, texto: 'Cada cual juega con las cartas que le tocan.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 57, texto: 'Quien con esperanza vive, alegre muere.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 58, texto: 'En el juego y en el amor, todo vale.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 59, texto: 'El que se enoja, pierde.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 60, texto: 'Caballo grande, ande o no ande.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 61, texto: 'Despacio que tengo apuro.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 62, texto: 'Mientras hay vida, hay esperanza.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 63, texto: 'La esperanza es el último que se pierde.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 64, texto: 'No se puede engañar a la muerte ni a los impuestos.', autor: 'atribuida a Benjamin Franklin', categoria: 'dicho' },
  { id: 65, texto: 'El que mucho abarca, poco aprieta.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 66, texto: 'A quien madruga, Dios lo ayuda.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 67, texto: 'Después de la lluvia siempre sale el sol.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 68, texto: 'El que tiene boca se equivoca.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 69, texto: 'Dios aprieta pero no ahorca.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 70, texto: 'No se le pueden poner puertas al campo.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 71, texto: 'A río revuelto, ganancia de pescadores.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 72, texto: 'Cría fama y échate a dormir.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 73, texto: 'El que ríe último, ríe mejor.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 74, texto: 'No hay deuda que no se pague ni plazo que no se cumpla.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 75, texto: 'El tiempo es oro.', autor: 'atribuida a Benjamin Franklin', categoria: 'dicho' },
  { id: 76, texto: 'Lo que natura no da, Salamanca no presta.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 77, texto: 'No por mucho madrugar amanece más temprano.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 78, texto: 'Quien siembra vientos, recoge tempestades.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 79, texto: 'A grandes males, grandes remedios.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 80, texto: 'En boca cerrada no entran moscas.', autor: 'Dicho popular', categoria: 'dicho' },
  { id: 81, texto: 'Vivir con miedo es como vivir a medias.', autor: 'Dicho popular', categoria: 'dicho' },

  // ── QUINIELA ───────────────────────────────────────────────────────────────
  { id: 82, texto: '22: el loco.', autor: 'Tabla de los sueños', categoria: 'quiniela' },
  { id: 83, texto: '48: el muerto que habla.', autor: 'Tabla de los sueños', categoria: 'quiniela' },
  { id: 84, texto: '15: la niña bonita.', autor: 'Tabla de los sueños', categoria: 'quiniela' },
  { id: 85, texto: '17: la desgracia.', autor: 'Tabla de los sueños', categoria: 'quiniela' },
  { id: 86, texto: '01: el agua.', autor: 'Tabla de los sueños', categoria: 'quiniela' },

  // ── HISTORIA ───────────────────────────────────────────────────────────────
  { id: 87, texto: 'Prefiero un general con suerte a uno bueno.', autor: 'atribuida a Napoleón Bonaparte', categoria: 'historia' },
  { id: 88, texto: 'El que apuesta al dólar pierde.', autor: 'Lorenzo Sigaut', obra: 'ministro de Economía, 1981', categoria: 'historia' },
  { id: 89, texto: 'Fue la mano de Dios.', autor: 'Diego Maradona', obra: '1986', categoria: 'historia' },
  { id: 90, texto: 'Vísteme despacio que estoy apurado.', autor: 'Napoleón Bonaparte', categoria: 'historia' },
  { id: 91, texto: 'Las únicas certezas que tenemos sobre el futuro son la muerte y los impuestos.', autor: 'Benjamin Franklin', categoria: 'historia' },
  { id: 92, texto: 'Lo que se llama suerte es la atención al detalle.', autor: 'Winston Churchill', categoria: 'historia' },

  // ── TANGO ──────────────────────────────────────────────────────────────────
  { id: 93, texto: 'Vivir es ir muriendo.', autor: 'Enrique Santos Discépolo', categoria: 'tango' },
  { id: 94, texto: 'El mundo fue y será una porquería, ya lo sé.', autor: 'Enrique Santos Discépolo', obra: 'Cambalache', categoria: 'tango' },
  { id: 95, texto: 'Yira, yira... aunque te quiebre la vida, aunque te muerda un dolor, no esperes nunca una ayuda, ni una mano, ni un favor.', autor: 'Enrique Santos Discépolo', obra: 'Yira Yira', categoria: 'tango' },

  // ── SALEHOY ────────────────────────────────────────────────────────────────
  { id: 96,  texto: 'El azar no se apura. Vos tampoco.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 97,  texto: 'Todos los números salen. El tuyo está haciendo fila.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 98,  texto: 'La bolillera no sabe tu nombre. Por eso jugás.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 99,  texto: 'Un pálpito es un recuerdo del futuro.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 100, texto: 'El que anota los sueños madruga dos veces.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 101, texto: 'El azar es puntual. El que llega tarde sos vos.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 102, texto: 'Nadie inventó un número: todos estaban ahí, esperando.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 103, texto: 'La suerte no se busca: se atiende.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 104, texto: 'Jugar es preguntarle algo al universo y aceptar cualquier respuesta.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 105, texto: 'La quiniela es el diario íntimo de un país.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 106, texto: 'El destino también improvisa.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 107, texto: 'Perder es enterarse de que mañana hay revancha.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 108, texto: 'Las apariencias engañan, pero las primeras impresiones casi nunca.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 109, texto: 'En las palabras del que apuesta hay una verdad que el ganador olvida.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 110, texto: 'El que entiende el azar deja de buscarle sentido.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 111, texto: 'En la mesa de juego, el silencio dice más que las cartas.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 112, texto: 'No hay nada más previsible que el comportamiento del que cree estar improvisando.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 113, texto: 'El que pierde con elegancia tiene la última carta.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 114, texto: 'A todos nos llega la mano caliente alguna vez. El problema es saber cuándo dejarla enfriar.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 115, texto: 'El jugador no busca el premio: busca el momento antes del premio.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 116, texto: 'Las palabras "siempre" y "nunca" no existen en el lenguaje del azar.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 117, texto: 'Quien sólo busca premios, nunca entiende el juego.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 118, texto: 'Toda lotería es un sistema cifrado donde el azar finge ser destino.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 119, texto: 'El que apuesta en el último instante apuesta al instante, no al número.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 120, texto: 'El azar es la forma educada que tiene la necesidad de presentarse en sociedad.', autor: 'Voz SaleHoy', categoria: 'salehoy' },
  { id: 121, texto: 'Todo cálculo de probabilidades termina, tarde o temprano, en una confesión.', autor: 'Voz SaleHoy', categoria: 'salehoy' },

  // ── ROCK (carga Pedro) ─────────────────────────────────────────────────────
  // { id: 122, texto: '...', autor: 'Indio Solari', obra: 'canción / disco', categoria: 'rock' },

  // ── LATAM (carga Pedro) ────────────────────────────────────────────────────
  // { id: 123, texto: '...', autor: 'Silvio Rodríguez', obra: '...', categoria: 'latam' },
];
