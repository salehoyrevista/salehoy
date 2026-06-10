/**
 * la-data.ts — Helpers para la sección La Data
 * Todas las funciones son puras y se ejecutan en build-time (Astro SSG).
 */

// ─── MESES ────────────────────────────────────────────────────────────────────

export const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** "2026-05" → "Mayo 2026" */
export function formatMes(yyyymm: string): string {
  const [year, month] = yyyymm.split('-').map(Number);
  return `${MESES_ES[month - 1]} ${year}`;
}

// ─── FORMATOS NUMÉRICOS ───────────────────────────────────────────────────────

/** 0.4167 → "+42%"  |  -0.5 → "−50%" */
export function formatVsPromedio(v: number): string {
  const pct = Math.round(v * 100);
  if (pct >= 0) return `+${pct}%`;
  return `−${Math.abs(pct)}%`; // Unicode minus
}

/** 0.208 → "20.8%" */
export function formatPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

// ─── FECHAS ───────────────────────────────────────────────────────────────────

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** "2026-05-02" → "2 may" */
export function formatDateShort(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return `${d.getUTCDate()} ${MESES_CORTOS[d.getUTCMonth()]}`;
}

/** "2026-06-10T03:06:44.997Z" → "10 jun 03:06" */
export function formatGeneradoEl(iso: string): string {
  const d = new Date(iso);
  const dia = d.getUTCDate();
  const mes = MESES_CORTOS[d.getUTCMonth()];
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dia} ${mes} ${hh}:${mm}`;
}

// ─── PROSA ────────────────────────────────────────────────────────────────────

/**
 * Convierte backticks en spans mono, luego divide en párrafos.
 * "" → "" (silencioso)
 */
export function renderProseHTML(text: string): string {
  if (!text || !text.trim()) return '';
  // Backtick → span mono
  const withSpans = text.replace(/`([^`]+)`/g, '<span class="ld-mono">$1</span>');
  // Divide por doble salto de línea
  return withSpans
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join('\n');
}

/** Solo backticks → spans, sin crear párrafos. */
export function renderInlineHTML(text: string): string {
  if (!text || !text.trim()) return '';
  return text.replace(/`([^`]+)`/g, '<span class="ld-mono">$1</span>');
}

// ─── DÉCADAS ──────────────────────────────────────────────────────────────────

export interface DecadaItem {
  rango: string;
  apariciones: number;
}

export interface PeakLow {
  peak: DecadaItem;
  low: DecadaItem;
}

/** Devuelve el item con más y menos apariciones de un array porDecada. */
export function peakDecada(porDecada: DecadaItem[]): PeakLow {
  const sorted = [...porDecada].sort((a, b) => b.apariciones - a.apariciones);
  return {
    peak: sorted[0],
    low: sorted[sorted.length - 1],
  };
}

// ─── PALETAS Y CONSTANTES DE ZONA ────────────────────────────────────────────

export interface ZonePalette {
  bg: string;
  accent: string;
}

export const PALETAS: Record<string, ZonePalette> = {
  nacional:    { bg: '#0F1730', accent: '#5BD37A' },
  buenosAires: { bg: '#2A1A0E', accent: '#D4A574' },
  cordoba:     { bg: '#162922', accent: '#7FB8C9' },
  comparativa: { bg: '#F5F1E8', accent: '#1B1F2A' },
};

export const ZONA_NOMBRE: Record<string, string> = {
  nacional:    'Nacional',
  buenosAires: 'Buenos Aires',
  cordoba:     'Córdoba',
};

export const ZONA_SLUG: Record<string, string> = {
  nacional:    'nacional',
  buenosAires: 'buenos-aires',
  cordoba:     'cordoba',
  comparativa: 'comparativa',
};
