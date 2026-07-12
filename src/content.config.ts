import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articulos' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    narrador: z.enum(['el-matematico', 'la-cientifica', 'la-pitonisa', 'el-cronista', 'el-historiador']),
    edicion: z.string(),
    categoria: z.enum(['ciencia', 'historia', 'cultura', 'mistica']),
    tema: z.string().optional(),
    fecha: z.date(),
    palabras: z.number().optional(),
    tiempoLectura: z.number().optional(),
    destacado: z.boolean().default(false),
    imagen: z.string().optional(),
    // Override por artículo del recorte de la imagen de cabecera.
    // Por defecto se banner-crop a 480px de alto centrado; si la imagen
    // tiene el sujeto importante fuera del centro (p. ej. una figura arriba
    // y el resto de la composición abajo), usar imagenAltura: "none" para
    // mostrarla completa sin recortar, o imagenPosicion para reubicar el foco.
    imagenAltura: z.string().optional(),
    imagenPosicion: z.string().optional(),
  }),
});

const narradores = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/narradores' }),
  schema: z.object({
    nombre: z.string(),
    nombreReal: z.string().optional(),
    slug: z.string(),
    disciplina: z.string(),
    tono: z.string(),
    preguntaDeFondo: z.string(),
    bio: z.string(),
    pictograma: z.string().optional(),
  }),
});

const ediciones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ediciones' }),
  schema: z.object({
    numero: z.string(),
    titulo: z.string(),
    bajada: z.string(),
    fecha: z.date(),
    sumario: z.string().optional(),
    tapa: z.string().optional(),
  }),
});

const voces = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/voces' }),
  schema: z.object({
    numero: z.string(),
    nombre: z.string(),
    edicion: z.string(),
    fecha: z.date(),
    intro: z.string().optional(),
  }),
});

const cartas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cartas' }),
  schema: z.object({
    edicion: z.string(),
    firma: z.string(),
    fecha: z.date(),
  }),
});

const recomendaciones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recomendaciones' }),
  schema: z.object({
    tipo: z.enum(['pelicula', 'libro', 'disco']),
    titulo: z.string(),
    autor: z.string(),
    anio: z.number().optional(),
    edicion: z.string(),
    fecha: z.date(),
    bajada: z.string().optional(),
    imagen: z.string().optional(),
    enlaceObra: z.string().optional(),
    narrador: z.enum(['el-matematico', 'la-cientifica', 'la-pitonisa', 'el-cronista', 'el-historiador']).default('el-cronista'),
  }),
});

export const collections = { articulos, narradores, ediciones, voces, cartas, recomendaciones };
