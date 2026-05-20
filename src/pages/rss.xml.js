import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articulos = await getCollection('articulos');
  const narradores = await getCollection('narradores');
  const narradorMap = new Map(narradores.map(n => [n.data.slug, n.data.nombre]));

  return rss({
    title: 'SaleHoy — Revista cultural del juego y el azar',
    description: 'Análisis, cultura, ciencia y mística del juego y el azar.',
    site: context.site,
    items: articulos
      .sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf())
      .map(a => ({
        title: a.data.title,
        description: a.data.subtitle ?? '',
        pubDate: a.data.fecha,
        link: `/articulos/${a.id}/`,
        author: narradorMap.get(a.data.narrador) ?? a.data.narrador,
        categories: [a.data.categoria],
      })),
    customData: '<language>es-AR</language>',
  });
}
