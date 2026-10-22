// Лёгкие SVG-графики без библиотек.
import { esc } from './fmt.js';

// Кольцевая диаграмма. items: [{ value, color }]
export function donut(items, { size = 168, stroke = 26, center = '', sub = '' } = {}) {
  const total = items.reduce((s, x) => s + x.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = items.length > 1 ? 2 : 0;
  let offset = 0;
  const arcs = items
    .map((x) => {
      const len = total ? (x.value / total) * c : 0;
      const dash = Math.max(len - gap, 0.01);
      const el = `<circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="${x.color}" stroke-width="${stroke}"
        stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
      offset += len;
      return el;
    })
    .join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">
    <circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>${arcs}
    <text x="50%" y="${size / 2 - 2}" text-anchor="middle" class="donut-v">${esc(center)}</text>
    <text x="50%" y="${size / 2 + 17}" text-anchor="middle" class="donut-s">${esc(sub)}</text></svg>`;
}

// Столбчатая диаграмма. points: [{ label, value }] (value может быть null)
export function bars(points, { color = 'var(--accent)', fmt = (v) => String(v), height = 170 } = {}) {
  const w = 340;
  const top = 22;
  const bottom = 22;
  const vals = points.map((p) => p.value).filter((v) => v != null);
  if (!vals.length) return '';
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  // Ось не от нуля, если значения близки — так видна динамика цены
  const base = min > 0 && (max - min) / max < 0.35 ? min - (max - min || max * 0.1) * 0.6 : 0;
  const span = max - base || 1;
  const n = points.length;
  const slot = w / n;
  const bw = Math.min(28, slot * 0.62);
  const h = height - top - bottom;
  const lastIdx = points.map((p) => p.value != null).lastIndexOf(true);
  const showEvery = n > 8 ? 2 : 1;
  const items = points
    .map((p, i) => {
      const x = i * slot + (slot - bw) / 2;
      const label = i % showEvery === (n - 1) % showEvery
        ? `<text x="${x + bw / 2}" y="${height - 6}" text-anchor="middle" class="bar-l">${esc(p.label)}</text>` : '';
      if (p.value == null) return label;
      const bh = Math.max(3, ((p.value - base) / span) * h);
      const y = top + h - bh;
      const isLast = i === lastIdx;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${color}" opacity="${isLast ? 1 : 0.55}"/>
        ${isLast || n <= 6 ? `<text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" class="bar-v ${isLast ? 'strong' : ''}">${esc(fmt(p.value))}</text>` : ''}${label}`;
    })
    .join('');
  return `<svg class="bars" viewBox="0 0 ${w} ${height}" role="img">
    <line x1="0" x2="${w}" y1="${top + h + 0.5}" y2="${top + h + 0.5}" stroke="var(--line)"/>${items}</svg>`;
}
