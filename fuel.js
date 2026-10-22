// Вкладка «Заправки», просмотр и форма заправки
import { t, plural } from '../../i18n.js';
import * as store from '../../core/store.js';
import { STATIONS, FUEL_TYPES, uid } from '../../core/model.js';
import {
  consumptionIntervals, totals, periodRange, inRange, monthlySeries, stationStats, byDateDesc, todayISO, pickTarget, solveFuel,
} from '../../core/calc.js';
import { icon } from '../icons.js';
import {
  esc, attr, fmtNum, money, moneyRound, price, km, liters, cons, volU, cur, fmtDate, fmtMonth, fmtMonthShort,
  stationBadge, stationName, fuelName, carName, groupByMonth,
} from '../fmt.js';
import {
  field, numInput, dateInput, textArea, chips, toggle, bindChips, bindNumeric, readForm, invalid, confirmDialog, emptyState, toast,
} from '../kit.js';
import { register, push, pop } from '../router.js';
import { periodFilter, rangeOf, bindDates } from '../filters.js';
import { bars } from '../charts.js';
import { mainButton, haptic } from '../../tg.js';

const F = { mode: 'list', period: 'all', from: '', to: '', station: 'all' };

function summary(fuel) {
  const m = totals(fuel, [], periodRange('month'));
  return `<div class="summary card">
    <div><small>${esc(t('fuel.monthTotal'))}</small><b>${moneyRound(m.fuelAmount)}</b></div>
    <div><small>${esc(t('fuel.liters'))}</small><b>${fmtNum(m.liters, 1)} ${esc(volU())}</b></div>
  </div>`;
}

function fuelRow(f, c) {
  const meta = [fmtDate(f.date), liters(f.liters), f.price != null ? `${price(f.price)}/${volU()}` : null, f.mileage != null ? km(f.mileage) : null]
    .filter(Boolean).join(' · ');
  return `<button class="rec" data-act="view" data-id="${attr(f.id)}">
    ${stationBadge(f.station)}
    <span class="rec-main"><b>${esc(stationName(f.station))}</b><small>${esc(meta)}</small></span>
    <span class="rec-side"><b>${money(f.amount)}</b>${c ? `<small class="cons">${esc(cons(c.consumption))}</small>` : ''}</span>
  </button>`;
}

function listView(fuel) {
  const range = rangeOf(F);
  const intervals = consumptionIntervals(fuel);
  const list = fuel.filter((f) => inRange(f.date, range) && (F.station === 'all' || f.station === F.station)).sort(byDateDesc);
  const stationChips = chips('station', [{ value: 'all', label: t('fuel.allStations') }, ...STATIONS.map((s) => ({ value: s.id, label: s.name, html: stationBadge(s.id, 'xs') }))], F.station, { cls: 'scroll' });
  if (!fuel.length) return emptyState('fuel', t('fuel.empty'));
  const body = list.length
    ? groupByMonth(list).map((g) => `<div class="group">
        <div class="group-head"><span>${esc(fmtMonth(g.key))}</span><span>${moneyRound(g.items.reduce((s, x) => s + (x.amount || 0), 0))}</span></div>
        <div class="card list">${g.items.map((f) => fuelRow(f, intervals.get(f.id))).join('')}</div></div>`).join('')
    : emptyState('search', t('fuel.emptyFilter'));
  const tot = totals(list, [], {});
  return `${stationChips}
    ${list.length ? `<div class="period-total"><span>${esc(t('common.total'))}: ${fmtNum(tot.liters, 1)} ${esc(volU())}</span><b>${moneyRound(tot.fuelAmount)}</b></div>` : ''}
    ${body}`;
}

function chartsView(fuel) {
  const range = rangeOf(F);
  const inR = fuel.filter((f) => inRange(f.date, range));
  const series = monthlySeries(inR).slice(-12);
  const st = stationStats(inR);
  const priceData = series.filter((s) => s.avgPrice != null).map((s) => ({ label: fmtMonthShort(s.month), value: s.avgPrice }));
  const consData = series.filter((s) => s.consumption != null).map((s) => ({ label: fmtMonthShort(s.month), value: s.consumption }));
  const priceChart = priceData.length ? bars(priceData, { fmt: (v) => fmtNum(v, 2, 2) }) : '';
  const consChart = consData.length ? bars(consData, { fmt: (v) => fmtNum(v, 1, 1), color: 'var(--accent-2)' }) : '';
  const stations = st.length
    ? `<div class="card list">${st.map((s) => `<div class="rec static">${stationBadge(s.station)}
        <span class="rec-main"><b>${esc(stationName(s.station))}</b>
        <small>${esc(t('fuel.times', { n: s.count, times: plural(s.count, 'times') }))} · ${fmtNum(s.liters, 1)} ${esc(volU())} · ${esc(t('fuel.avgPrice', { price: price(s.avgPrice) }))}</small></span>
        <span class="rec-side"><b>${moneyRound(s.amount)}</b></span></div>`).join('')}</div>`
    : '';
  if (!priceChart && !consChart && !stations) return emptyState('chart', t('fuel.noCharts'));
  return `
    ${priceChart ? `<div class="card"><div class="card-title">${esc(t('fuel.priceChart'))}, ${esc(cur())}/${esc(volU())}</div>${priceChart}</div>` : ''}
    <div class="card"><div class="card-title">${esc(t('fuel.consChart'))}, ${esc(volU())}/100</div>${consChart || `<p class="muted small">${esc(t('fuel.noCharts'))}</p>`}</div>
    ${stations ? `<div class="section-head"><h2>${esc(t('fuel.stations'))}</h2></div>${stations}` : ''}`;
}

function render() {
  const car = store.activeCar();
  const fuel = store.carFuel(car.id);
  return `<header class="topbar plain"><h1>${esc(t('fuel.title'))}</h1><span class="sub">${esc(carName(car))}</span></header>
    ${summary(fuel)}
    ${chips('mode', [{ value: 'list', label: t('fuel.list'), html: icon('list') }, { value: 'charts', label: t('fuel.charts'), html: icon('chart') }], F.mode, { cls: 'segmented' })}
    ${periodFilter(F)}
    <div class="content">${F.mode === 'list' ? listView(fuel) : chartsView(fuel)}</div>
    <button class="fab" data-act="add" aria-label="${attr(t('fuel.new'))}">${icon('plus')}</button>`;
}

function mount(el) {
  const rerender = () => (el.innerHTML = render());
  bindChips(el, (name, value) => {
    F[name] = value;
    rerender();
  });
  bindDates(el, F, rerender);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add') {
      haptic.tap();
      push('fuel-form', {});
    }
    if (b.dataset.act === 'view') push('fuel-view', { id: b.dataset.id });
  });
}

register('fuel', { render, mount, live: true });

// ---------- Просмотр ----------

function row(label, value) {
  return `<div class="kv"><span>${esc(label)}</span><b>${value}</b></div>`;
}

register('fuel-view', {
  live: true,
  render({ id }) {
    const f = store.getState().fuel.find((x) => x.id === id);
    if (!f) return '';
    const c = consumptionIntervals(store.carFuel(f.carId)).get(f.id);
    return `<div class="view-head">${stationBadge(f.station, 'lg')}
        <div><h1>${money(f.amount)}</h1><p class="muted">${esc(stationName(f.station))} · ${esc(fmtDate(f.date, { year: true }))}</p></div></div>
      <div class="card kvs">
        ${row(t('common.date'), esc(fmtDate(f.date, { year: true })))}
        ${row(t('common.mileage'), esc(km(f.mileage)))}
        ${row(t('fuel.fuelType'), esc(fuelName(f.fuelType)))}
        ${row(t('fuel.liters'), esc(liters(f.liters)))}
        ${row(t('fuel.price'), esc(price(f.price)))}
        ${row(t('fuel.fullTank'), esc(f.full ? t('common.yes') : t('common.no')))}
        ${c ? row(t('fuel.consumption'), esc(cons(c.consumption))) : ''}
      </div>
      ${f.comment ? `<div class="card note">${esc(f.comment)}</div>` : ''}
      <button class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>`;
  },
  mount(el, { id }) {
    if (!store.getState().fuel.some((x) => x.id === id)) return;
    el.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('fuel.deleteConfirm')))) return;
      pop();
      store.update((s) => (s.fuel = s.fuel.filter((x) => x.id !== id)));
      haptic.success();
    });
    mainButton.set({ text: t('common.edit'), onClick: () => push('fuel-form', { id }) });
  },
});

// ---------- Форма ----------

const TRIO = ['liters', 'amount', 'price'];

register('fuel-form', {
  render({ id }) {
    const s = store.getState();
    const car = store.activeCar();
    const f = id
      ? s.fuel.find((x) => x.id === id)
      : { date: todayISO(), station: s.lastStation || 'lukoil', fuelType: car.fuelType, full: true };
    const unit = t('settings.' + s.settings.distanceUnit);
    const stations = `<div class="station-grid" data-chips="station">${STATIONS.map((st) => `<button type="button" class="chip st ${st.id === f.station ? 'active' : ''}" data-value="${st.id}">
      ${stationBadge(st.id)}<span>${esc(st.name)}</span></button>`).join('')}</div>`;
    const trio = (name, label, suffix) =>
      field(label, numInput(name, f[name], { suffix }), { cls: 'trio-' + name, tag: t('common.auto') });
    return `<header class="topbar plain"><h1>${esc(id ? t('fuel.edit') : t('fuel.new'))}</h1></header>
      <form class="form" onsubmit="return false">
        <div class="row2">
          ${field(t('common.date'), dateInput('date', f.date))}
          ${field(t('common.mileage'), numInput('mileage', f.mileage, { decimal: false, suffix: unit, placeholder: fmtNum(car.mileage) }))}
        </div>
        <div class="field"><span class="field-label">${esc(t('fuel.station'))}</span>${stations}</div>
        <div class="field"><span class="field-label">${esc(t('fuel.fuelType'))}</span>
          ${chips('fuelType', FUEL_TYPES.map((v) => ({ value: v, label: t('fuelTypes.' + v) })), f.fuelType, { cls: 'scroll' })}</div>
        <div class="trio">
          ${trio('liters', t('fuel.liters'), volU())}
          ${trio('amount', t('common.amount'), cur())}
          ${trio('price', t('fuel.priceShort'), cur())}
        </div>
        <p class="field-hint">${esc(t('fuel.calcHint'))}</p>
        ${toggle('full', f.full, t('fuel.fullTank'), t('fuel.fullHint'))}
        ${field(t('common.comment'), textArea('comment', f.comment))}
        ${id ? `<button type="button" class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>` : ''}
      </form>`;
  },
  mount(el, { id }) {
    const editing = id ? store.getState().fuel.find((x) => x.id === id) : null;
    const car = store.activeCar();
    bindChips(el);
    bindNumeric(el);
    const order = editing ? ['liters', 'amount'] : [];
    const inputs = Object.fromEntries(TRIO.map((n) => [n, el.querySelector(`input[name="${n}"]`)]));
    const markAuto = () => {
      const target = pickTarget(order);
      TRIO.forEach((n) => el.querySelector('.trio-' + n).classList.toggle('is-auto', n === target));
      return target;
    };
    markAuto();
    el.addEventListener('input', (e) => {
      const n = e.target.name;
      if (!TRIO.includes(n)) return;
      if (order[order.length - 1] !== n) order.push(n);
      const target = markAuto();
      if (target === n) return;
      const v = readForm(el.querySelector('.trio'));
      const res = solveFuel(v, target);
      inputs[target].value = res == null ? '' : String(res).replace('.', ',');
    });
    el.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('fuel.deleteConfirm')))) return;
      store.update((s) => (s.fuel = s.fuel.filter((x) => x.id !== id)));
      haptic.success();
      pop();
      pop();
    });
    mainButton.set({
      text: t('common.save'),
      onClick: () => {
        const v = readForm(el);
        if (v.price == null) v.price = solveFuel(v, 'price');
        if (v.liters == null) v.liters = solveFuel(v, 'liters');
        if (v.amount == null) v.amount = solveFuel(v, 'amount');
        if (!(v.liters > 0)) return invalid(el, 'liters', t('fuel.required'));
        if (!(v.amount > 0)) return invalid(el, 'amount', t('fuel.required'));
        if (v.price == null) v.price = solveFuel(v, 'price');
        const rec = {
          date: v.date || todayISO(), mileage: v.mileage, station: v.station || 'other', fuelType: v.fuelType || car.fuelType,
          liters: v.liters, amount: v.amount, price: v.price, full: !!v.full, comment: v.comment,
        };
        store.update((s) => {
          if (editing) Object.assign(s.fuel.find((x) => x.id === id), rec);
          else s.fuel.push({ id: uid(), carId: car.id, ...rec });
          s.lastStation = rec.station;
          store.bumpMileage(s, editing?.carId || car.id, rec.mileage);
        });
        haptic.success();
        toast(t('car.saved'));
        pop();
      },
    });
  },
});
