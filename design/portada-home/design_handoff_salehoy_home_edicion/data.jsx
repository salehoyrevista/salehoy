// SaleHoy · Edición #01 data — articles, narrators, La sala devices.
// Ornaments live in ../assets; accents come from the design tokens.

const NARR = {
  vichy:  { name: "La Vichy",        role: "La Pitonisa",   accent: "var(--acento-vichy)",  orn: "assets/trebol-tres.svg" },
  maria:  { name: "María Lange",     role: "La Científica", accent: "var(--acento-maria)",  orn: "assets/ornamento-divan.svg" },
  paulo:  { name: "Paulo Castillo",  role: "El Cronista",   accent: "var(--acento-paulo)",  orn: "assets/ornamento-surco.svg" },
  tomas:  { name: "Tomás Vera",      role: "El Matemático", accent: "var(--acento-tomas)",  orn: "assets/ornamento-barras.svg" },
  anibal: { name: "Aníbal Belmonte", role: "El Historiador",accent: "var(--acento-anibal)", orn: "assets/ornamento-pluma.svg" },
};

// Order: feature first.
const ARTICLES = [
  {
    id: "babilonia",
    feature: true,
    narr: "vichy",
    eyebrow: "Crónica",
    title: "La Babilonia de la esquina",
    deck: "En el kiosco de quiniela de Bv. Oroño se cruzan, cada mañana, todas las formas que tiene un barrio de pedirle algo al azar.",
  },
  {
    id: "numero-vuelve",
    narr: "maria",
    eyebrow: "Nota clínica",
    title: "El número que vuelve",
    deck: "Qué nombramos, en realidad, cuando decimos que un número “nos persigue”.",
  },
  {
    id: "pueblo-sonando",
    narr: "paulo",
    eyebrow: "Crónica larga",
    title: "Un pueblo soñando en clave de números",
    deck: "Una semana en un pueblo de Córdoba donde el sueño de la noche se cobra a la mañana siguiente.",
  },
  {
    id: "rachas",
    narr: "tomas",
    eyebrow: "La Data",
    title: "¿Existen las rachas?",
    deck: "Treinta sorteos, una moneda y la diferencia entre lo que sentimos y lo que ocurre.",
  },
  {
    id: "hecha-rosario",
    narr: "anibal",
    eyebrow: "Ensayo histórico",
    title: "Hecha en Rosario",
    deck: "El expediente, casi olvidado, de cómo la quiniela dejó de ser delito para volverse costumbre.",
  },
];

const SALA = [
  { id: "quiniela", name: "La Data", what: "El número de hoy, leído como dato y como augurio.", crt: "22" },
  { id: "anecdotario", name: "El Anecdotario", what: "Historias que mandan los lectores. Una por día.", crt: "···" },
  { id: "frases", name: "Máquina de Frases", what: "Tirá de la palanca; cae una sentencia sobre la suerte.", crt: "★" },
  { id: "ruleta", name: "La Ruleta", what: "Un narrador al azar, una lectura que no buscabas.", crt: "07" },
];

const EDITOR_LETTER = [
  "Hay barrios que se ordenan alrededor de una iglesia, y barrios que se ordenan alrededor de un kiosco de quiniela. SaleHoy nace, en buena medida, de mirar con atención el segundo caso.",
  "Esta primera edición —“La quiniela al diván”— no viene a celebrar el juego ni a advertir sobre él. Viene a escucharlo. A entender por qué un número soñado a las cuatro de la mañana puede organizar el día de una familia entera, y qué dice eso de nosotros mucho antes de decir nada sobre la suerte.",
  "Reunimos cinco voces y cinco oficios alrededor de la misma mesa: la pitonisa y la científica, el cronista, el matemático y el historiador. No se ponen de acuerdo, y está bien que así sea. El azar se deja mirar mejor de costado, entre varios.",
  "Pasen. La cocina ya está abierta.",
];

window.SH = { NARR, ARTICLES, SALA, EDITOR_LETTER };
