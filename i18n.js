import ru from './i18n/ru.js';

const LANGS = { ru };
let dict = ru;

export function setLang(code) {
  dict = LANGS[code] || ru;
  document.documentElement.lang = code in LANGS ? code : 'ru';
}

// t('car.mileage'), t('reminders.daysLeft', { n: 3 })
export function t(key, params) {
  const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (typeof v !== 'string') return v ?? key;
  return params ? v.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? '')) : v;
}

// Русское склонение: plural(5, 'days') -> 'дней'
export function plural(n, key) {
  const forms = dict.plural[key];
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export const locale = () => dict.locale;
