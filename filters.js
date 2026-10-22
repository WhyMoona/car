// Фильтр по периоду (Месяц / Год / Всё время / Период с датами)
import { t } from '../i18n.js';
import { periodRange } from '../core/calc.js';
import { chips, dateInput } from './kit.js';
import { esc } from './fmt.js';

export function periodFilter(f) {
  return `${chips('period', ['month', 'year', 'all', 'custom'].map((v) => ({ value: v, label: t('periods.' + v) })), f.period, { cls: 'segmented' })}
    ${f.period === 'custom' ? `<div class="row2 dates">
      <label class="field"><span class="field-label">${esc(t('periods.from'))}</span>${dateInput('from', f.from)}</label>
      <label class="field"><span class="field-label">${esc(t('periods.to'))}</span>${dateInput('to', f.to)}</label></div>` : ''}`;
}

export const rangeOf = (f) => (f.period === 'custom' ? periodRange({ from: f.from, to: f.to }) : periodRange(f.period));

// Подписка на изменение дат в пользовательском периоде
export function bindDates(el, f, rerender) {
  el.addEventListener('change', (e) => {
    const n = e.target.name;
    if (n === 'from' || n === 'to') {
      f[n] = e.target.value;
      rerender();
    }
  });
}
