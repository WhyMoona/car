// Вкладка «Расходы», просмотр и форма расхода
import { t } from '../../i18n.js';
import * as store from '../../core/store.js';
import { CATEGORIES, REMINDER_FROM_CATEGORY, uid } from '../../core/model.js';
import { inRange, byDateDesc, todayISO, addToISO, sum } from '../../core/calc.js';
import { icon } from '../icons.js';
import { esc, attr, money, moneyRound, km, fmtNum, fmtDate, fmtMonth, catIcon, catName, carName, groupByMonth } from '../fmt.js';
import {
  field, numInput, dateInput, textInput, textArea, chips, bindChips, bindNumeric, readForm, invalid, confirmDialog, emptyState, toast,
} from '../kit.js';
import { register, push, pop, replaceTop } from '../router.js';
import { periodFilter, rangeOf, bindDates } from '../filters.js';
import { mainButton, haptic } from '../../tg.js';

const F = { period: 'all', from: '', to: '', category: 'all', q: '' };

function expRow(e) {
  const meta = [fmtDate(e.date), catName(e.category), e.mileage != null ? km(e.mileage) : null].filter(Boolean).join(' · ');
  return `<button class="rec" data-act="view" data-id="${attr(e.id)}">
    ${catIcon(e.category)}
    <span class="rec-main"><b>${esc(e.description || catName(e.category))}</b><small>${esc(meta)}</small></span>
    <span class="rec-side"><b>${money(e.amount)}</b></span></button>`;
}

function filtered(list) {
  const range = rangeOf(F);
  const q = F.q.trim().toLowerCase();
  return list
    .filter((e) => inRange(e.date, range) && (F.category === 'all' || e.category === F.category)
      && (!q || e.description.toLowerCase().includes(q) || e.comment.toLowerCase().includes(q)))
    .sort(byDateDesc);
}

function listHTML(all) {
  if (!all.length) return emptyState('wallet', t('expenses.empty'));
  const list = filtered(all);
  const total = `<div class="summary card single"><div><small>${esc(t('expenses.total'))}</small><b>${moneyRound(sum(list, 'amount'))}</b></div></div>`;
  if (!list.length) return total + emptyState('search', t('expenses.emptyFilter'));
  return total + groupByMonth(list).map((g) => `<div class="group">
    <div class="group-head"><span>${esc(fmtMonth(g.key))}</span><span>${moneyRound(sum(g.items, 'amount'))}</span></div>
    <div class="card list">${g.items.map(expRow).join('')}</div></div>`).join('');
}

function render() {
  const car = store.activeCar();
  const all = store.carExpenses(car.id);
  const cats = chips('category', [{ value: 'all', label: t('expenses.allCategories') },
    ...CATEGORIES.map((c) => ({ value: c.id, label: catName(c.id), html: catIcon(c.id, 'xs') }))], F.category, { cls: 'scroll' });
  return `<header class="topbar plain"><h1>${esc(t('expenses.title'))}</h1><span class="sub">${esc(carName(car))}</span></header>
    <div class="search">${icon('search')}<input class="input" type="search" name="q" value="${attr(F.q)}" placeholder="${attr(t('common.search'))}" enterkeyhint="search"></div>
    ${periodFilter(F)}
    ${cats}
    <div class="content">${listHTML(all)}</div>
    <button class="fab" data-act="add" aria-label="${attr(t('expenses.new'))}">${icon('plus')}</button>`;
}

function mount(el) {
  const rerender = () => (el.innerHTML = render());
  bindChips(el, (name, value) => {
    F[name] = value;
    rerender();
  });
  bindDates(el, F, rerender);
  el.addEventListener('input', (e) => {
    if (e.target.name !== 'q') return;
    F.q = e.target.value;
    el.querySelector('.content').innerHTML = listHTML(store.carExpenses());
  });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add') {
      haptic.tap();
      push('expense-form', {});
    }
    if (b.dataset.act === 'view') push('expense-view', { id: b.dataset.id });
  });
}

register('expenses', { render, mount, live: true });

// ---------- Просмотр ----------

register('expense-view', {
  live: true,
  render({ id }) {
    const e = store.getState().expenses.find((x) => x.id === id);
    if (!e) return '';
    const row = (l, v) => `<div class="kv"><span>${esc(l)}</span><b>${v}</b></div>`;
    return `<div class="view-head">${catIcon(e.category, 'lg')}
        <div><h1>${money(e.amount)}</h1><p class="muted">${esc(e.description || catName(e.category))}</p></div></div>
      <div class="card kvs">
        ${row(t('expenses.category'), esc(catName(e.category)))}
        ${row(t('common.date'), esc(fmtDate(e.date, { year: true })))}
        ${row(t('common.mileage'), esc(km(e.mileage)))}
      </div>
      ${e.comment ? `<div class="card note">${esc(e.comment)}</div>` : ''}
      <button class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>`;
  },
  mount(el, { id }) {
    if (!store.getState().expenses.some((x) => x.id === id)) return;
    el.addEventListener('click', async (ev) => {
      if (!ev.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('expenses.deleteConfirm')))) return;
      pop();
      store.update((s) => (s.expenses = s.expenses.filter((x) => x.id !== id)));
      haptic.success();
    });
    mainButton.set({ text: t('common.edit'), onClick: () => push('expense-form', { id }) });
  },
});

// ---------- Форма ----------

function reminderPrefill(rec) {
  const type = REMINDER_FROM_CATEGORY[rec.category];
  if (rec.category === 'to') return { type, dueDate: addToISO(rec.date, { months: 12 }), dueMileage: rec.mileage != null ? rec.mileage + 10000 : null };
  if (rec.category === 'insurance') return { type, dueDate: addToISO(rec.date, { months: 12 }) };
  return { type, dueDate: addToISO(rec.date, { months: 6 }) };
}

register('expense-form', {
  render({ id }) {
    const s = store.getState();
    const car = store.activeCar();
    const e = id ? s.expenses.find((x) => x.id === id) : { date: todayISO(), category: 'to' };
    const unit = t('settings.' + s.settings.distanceUnit);
    const grid = `<div class="cat-grid" data-chips="category">${CATEGORIES.map((c) => `<button type="button" class="chip cat ${c.id === e.category ? 'active' : ''}" data-value="${c.id}">
      ${catIcon(c.id)}<span>${esc(catName(c.id))}</span></button>`).join('')}</div>`;
    return `<header class="topbar plain"><h1>${esc(id ? t('expenses.edit') : t('expenses.new'))}</h1></header>
      <form class="form" onsubmit="return false">
        <div class="big-input">${numInput('amount', e.amount, { suffix: s.settings.currency, placeholder: '0' })}</div>
        <div class="field"><span class="field-label">${esc(t('expenses.category'))}</span>${grid}</div>
        ${field(t('expenses.description'), textInput('description', e.description, { placeholder: t('expenses.descriptionPh'), maxlength: 120 }))}
        <div class="row2">
          ${field(t('common.date'), dateInput('date', e.date))}
          ${field(t('common.mileage'), numInput('mileage', e.mileage, { decimal: false, suffix: unit, placeholder: fmtNum(car.mileage) }))}
        </div>
        ${field(t('common.comment'), textArea('comment', e.comment))}
        ${id ? `<button type="button" class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>` : ''}
      </form>`;
  },
  mount(el, { id }) {
    const editing = id ? store.getState().expenses.find((x) => x.id === id) : null;
    const car = store.activeCar();
    bindChips(el);
    bindNumeric(el);
    if (!editing) setTimeout(() => el.querySelector('input[name="amount"]')?.focus(), 300);
    el.addEventListener('click', async (ev) => {
      if (!ev.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('expenses.deleteConfirm')))) return;
      store.update((s) => (s.expenses = s.expenses.filter((x) => x.id !== id)));
      haptic.success();
      pop();
      pop();
    });
    mainButton.set({
      text: t('common.save'),
      onClick: async () => {
        const v = readForm(el);
        if (!(v.amount > 0)) return invalid(el, 'amount', t('expenses.required'));
        const rec = { date: v.date || todayISO(), mileage: v.mileage, category: v.category || 'other', description: v.description, amount: v.amount, comment: v.comment };
        const carId = editing?.carId || car.id;
        store.update((s) => {
          if (editing) Object.assign(s.expenses.find((x) => x.id === id), rec);
          else s.expenses.push({ id: uid(), carId, ...rec });
          store.bumpMileage(s, carId, rec.mileage);
        });
        haptic.success();
        toast(t('car.saved'));
        if (!editing && REMINDER_FROM_CATEGORY[rec.category]) {
          mainButton.hide();
          const what = t('reminders.offerWhat.' + rec.category);
          const ok = await confirmDialog(t('reminders.offer', { what }), { okText: t('common.add'), danger: false });
          if (ok) return replaceTop('reminder-form', { carId, prefill: reminderPrefill(rec) });
        }
        pop();
      },
    });
  },
});
