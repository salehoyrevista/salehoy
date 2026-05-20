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
  }),
});

const narradores = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/narradores' }),
  schema: z.object({
    nombre: z.string(),
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

export const collections = { articulos, narradores, ediciones, voces, cartas };
