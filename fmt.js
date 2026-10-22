// Форматирование и мелкие помощники для разметки.
import { t, locale } from '../i18n.js';
import { getState } from '../core/store.js';
import { stationById, categoryById } from '../core/model.js';
import { icon } from './icons.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const attr = esc;

const nf = new Map();
export function fmtNum(n, digits = 0, minDigits = 0) {
  if (n == null || !isFinite(n)) return t('common.empty');
  const key = digits + ':' + minDigits;
  if (!nf.has(key)) nf.set(key, new Intl.NumberFormat(locale(), { maximumFractionDigits: digits, minimumFractionDigits: minDigits }));
  return nf.get(key).format(n);
}

export const cur = () => getState().settings.currency || '₽';
export const distU = () => t('settings.' + (getState().settings.distanceUnit || 'km'));
export const volU = () => t('settings.' + (getState().settings.volumeUnit || 'l'));

// Суммы: копейки показываем, только если они есть
export const money = (n) => (n == null ? t('common.empty') : `${fmtNum(n, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2)} ${cur()}`);
export const moneyRound = (n) => (n == null ? t('common.empty') : `${fmtNum(Math.round(n))} ${cur()}`);
export const price = (n) => (n == null ? t('common.empty') : `${fmtNum(n, 2, 2)} ${cur()}`);
export const km = (n) => (n == null ? t('common.empty') : `${fmtNum(n)} ${distU()}`);
export const liters = (n) => (n == null ? t('common.empty') : `${fmtNum(n, 2)} ${volU()}`);
export const cons = (n) => (n == null ? t('common.empty') : `${fmtNum(n, 1, 1)} ${volU()}/100`);

export function fmtDate(iso, { year } = {}) {
  if (!iso) return t('common.empty');
  const [y, m, d] = iso.split('-').map(Number);
  const showYear = year ?? y !== new Date().getFullYear();
  return `${d} ${t('monthsShort')[m - 1]}${showYear ? ' ' + y : ''}`;
}

export function fmtMonth(key) {
  const [y, m] = key.split('-').map(Number);
  const name = t('months')[m - 1];
  return name[0].toUpperCase() + name.slice(1) + (y !== new Date().getFullYear() ? ' ' + y : '');
}

export const fmtMonthShort = (key) => {
  const [y, m] = key.split('-').map(Number);
  return t('monthsShort')[m - 1] + (m === 1 ? ' ' + String(y).slice(2) : '');
};

export const carName = (c) => (c ? `${c.brand} ${c.model}`.trim() || t('car.newCar') : '');

export function stationBadge(id, size = '') {
  const s = stationById(id);
  return `<span class="badge-st ${size}" style="background:${s.color};color:${s.fg || '#fff'}">${esc(s.short)}</span>`;
}

export function catIcon(id, size = '') {
  const c = categoryById(id);
  return `<span class="cat-ic ${size}" style="--c:${c.color}">${icon(c.icon)}</span>`;
}

export const catName = (id) => t('categories.' + id);
export const fuelName = (id) => t('fuelTypes.' + id);
export const stationName = (id) => stationById(id).name;

export function groupByMonth(items) {
  const groups = [];
  let cur = null;
  for (const it of items) {
    const k = it.date.slice(0, 7);
    if (!cur || cur.key !== k) groups.push((cur = { key: k, items: [] }));
    cur.items.push(it);
  }
  return groups;
}
