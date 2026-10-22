// Вкладка «Моя машина»
import { t, plural } from '../../i18n.js';
import * as store from '../../core/store.js';
import { averageConsumption, totals, periodRange, costPerKm, categoryTotals, sortReminders, todayISO } from '../../core/calc.js';
import { categoryById } from '../../core/model.js';
import { photoURL, compressPhoto } from '../../core/photo.js';
import { icon } from '../icons.js';
import { esc, attr, fmtNum, km, moneyRound, money, cons, volU, distU, carName, catIcon, catName, fmtDate } from '../fmt.js';
import { actionSheet, confirmDialog, chips, bindChips, toast, pickFile } from '../kit.js';
import { push, register } from '../router.js';
import { donut } from '../charts.js';
import { haptic } from '../../tg.js';

let statsPeriod = 'month';

function statCard(label, value, { big = false, iconName = '', cls = '' } = {}) {
  return `<div class="stat ${big ? 'big' : ''} ${cls}">
    <span class="stat-label">${iconName ? icon(iconName) : ''}${esc(label)}</span>
    <span class="stat-value">${value}</span></div>`;
}

function reminderTitle(r) {
  return r.type === 'custom' ? r.title || t('reminders.types.custom') : t('reminders.types.' + r.type);
}

export function reminderDue(r, s) {
  const parts = [];
  const days = (n) => plural(n, 'days');
  if (r.dueDate) {
    let rel;
    if (s.daysLeft === 0) rel = t('reminders.today');
    else if (s.daysLeft > 0) rel = t('reminders.daysLeft', { n: s.daysLeft, days: days(s.daysLeft) });
    else rel = t('reminders.daysAgo', { n: -s.daysLeft, days: days(-s.daysLeft) });
    parts.push(`${fmtDate(r.dueDate, { year: true })} · ${rel}`);
  }
  if (r.dueMileage != null) {
    const unit = distU();
    let rel = '';
    if (s.kmLeft != null) {
      rel = s.kmLeft >= 0
        ? ' · ' + t('reminders.kmLeft', { n: fmtNum(s.kmLeft), unit })
        : ' · ' + t('reminders.kmOver', { n: fmtNum(-s.kmLeft), unit });
    }
    parts.push(`${km(r.dueMileage)}${rel}`);
  }
  return parts.join('<br>');
}

function remindersBlock(car) {
  const list = sortReminders(store.carReminders(car.id), { today: todayISO(), mileage: car.mileage });
  const items = list
    .map(({ r, s }) => `<button class="reminder ${s.status}" data-act="reminder" data-id="${attr(r.id)}">
      <span class="rem-ic">${icon(s.status === 'ok' ? 'bell' : 'alert')}</span>
      <span class="rem-body"><b>${esc(reminderTitle(r))}</b><small>${reminderDue(r, s)}</small></span>
      ${s.status === 'overdue' ? `<span class="pill">${esc(t('reminders.overdue'))}</span>` : icon('chevronRight', 'tail')}
    </button>`)
    .join('');
  return `<section class="section">
    <div class="section-head"><h2>${esc(t('reminders.title'))}</h2>
      <button class="link-btn" data-act="add-reminder">${icon('plus')}${esc(t('reminders.add'))}</button></div>
    ${items ? `<div class="reminders">${items}</div>` : `<div class="card muted-card">${esc(t('reminders.empty'))}</div>`}
  </section>`;
}

function statsBlock(car) {
  const fuel = store.carFuel(car.id);
  const exp = store.carExpenses(car.id);
  const month = totals(fuel, exp, periodRange('month'));
  const all = totals(fuel, exp, periodRange('all'));
  const perKm = costPerKm(car, fuel, exp);
  const range = periodRange(statsPeriod);
  const cats = categoryTotals(fuel, exp, range);
  const sum = cats.reduce((s, x) => s + x.total, 0);
  const chart = cats.length
    ? `<div class="donut-wrap">${donut(cats.map((c) => ({ value: c.total, color: categoryById(c.id).color })), { center: moneyRound(sum), sub: t('common.total') })}</div>
       <div class="legend">${cats
        .map((c) => `<div class="legend-row">${catIcon(c.id, 'sm')}<span class="legend-name">${esc(catName(c.id))}</span>
          <span class="legend-pct">${Math.round((c.total / sum) * 100)}%</span><b>${moneyRound(c.total)}</b></div>`)
        .join('')}</div>`
    : `<p class="muted center pad">${esc(t('stats.empty'))}</p>`;

  return `<section class="section">
    <div class="section-head"><h2>${esc(t('stats.title'))}</h2></div>
    <div class="grid2">
      ${statCard(t('stats.month'), moneyRound(month.total))}
      ${statCard(t('stats.allTime'), moneyRound(all.total))}
      ${statCard(t('stats.perKm', { unit: distU() }), perKm == null ? `<span class="muted">${esc(t('car.noData'))}</span>` : money(Math.round(perKm * 100) / 100), { cls: 'span2' })}
    </div>
    <div class="card">
      <div class="card-title">${esc(t('stats.byCategory'))}</div>
      ${chips('period', ['month', 'year', 'all'].map((v) => ({ value: v, label: t('periods.' + v) })), statsPeriod, { cls: 'segmented' })}
      ${chart}
    </div>
  </section>`;
}

function render() {
  const car = store.activeCar();
  if (!car) return '';
  const photo = store.getPhoto(car.id);
  const fuel = store.carFuel(car.id);
  const avg = averageConsumption(fuel);
  const month = totals(fuel, store.carExpenses(car.id), periodRange('month'));
  const tank = car.tank != null ? `${fmtNum(car.tank, 1)} ${volU()}` : null;
  const dash = `<span class="muted">${t('common.empty')}</span>`;

  return `
  <header class="topbar">
    <button class="car-switch" data-act="switch">${icon('car')}<span>${esc(carName(car))}</span>${icon('chevronDown')}</button>
    <button class="icon-btn" data-act="settings" aria-label="${attr(t('settings.title'))}">${icon('gear')}</button>
  </header>

  <div class="hero ${photo ? 'has-photo' : ''}" data-act="photo">
    ${photo
      ? `<img src="${photoURL(photo)}" alt="">`
      : `<div class="hero-empty">${icon('car', 'hero-car')}<span class="btn small secondary">${icon('camera')}${esc(t('car.addPhoto'))}</span></div>`}
  </div>

  <div class="car-title">
    <h1>${esc(carName(car))}</h1>
    ${car.plate ? `<span class="plate">${esc(car.plate)}</span>` : ''}
  </div>

  <div class="actions-row">
    <button class="btn secondary grow" data-act="mileage">${icon('gauge')}${esc(t('car.updateMileage'))}</button>
    <button class="btn secondary square" data-act="edit" aria-label="${attr(t('car.edit'))}">${icon('pencil')}</button>
  </div>

  <div class="grid2">
    ${statCard(t('car.mileage'), km(car.mileage), { big: true, iconName: 'gauge' })}
    ${statCard(t('car.spentMonth'), moneyRound(month.total), { big: true, iconName: 'wallet' })}
    ${statCard(t('car.avgConsumption'), avg == null ? `<span class="muted small">${esc(t('car.noData'))}</span>` : cons(avg), { iconName: 'fuel' })}
    ${statCard(t('car.fuelType'), esc(t('fuelTypes.' + car.fuelType)), { iconName: 'droplets' })}
    ${statCard(t('car.year'), car.year ? esc(car.year) : dash, { iconName: 'calendar' })}
    ${statCard(t('car.tank'), tank ? esc(tank) : dash, { iconName: 'tank' })}
    ${statCard(t('car.color'), car.color ? esc(car.color) : dash, { iconName: 'palette' })}
    ${statCard(t('car.vin'), car.vin ? `<span class="vin">${esc(car.vin)}</span>` : dash, { iconName: 'hash' })}
  </div>

  ${remindersBlock(car)}
  ${statsBlock(car)}
  `;
}

async function photoMenu(car) {
  if (!store.getPhoto(car.id)) return choosePhoto(car);
  const act = await actionSheet({
    title: t('car.photoTitle'),
    actions: [
      { id: 'replace', label: t('car.replacePhoto'), icon: 'image' },
      { id: 'delete', label: t('car.deletePhoto'), icon: 'trash', danger: true },
    ],
  });
  if (act === 'replace') choosePhoto(car);
  if (act === 'delete') {
    await store.removePhoto(car.id);
    haptic.success();
  }
}

export async function choosePhoto(car) {
  const file = await pickFile('image/*');
  if (!file) return null;
  try {
    toast(t('car.photoSaving'));
    const b64 = await compressPhoto(file);
    if (car) {
      await store.setPhoto(car.id, b64);
      haptic.success();
    }
    return b64;
  } catch {
    toast(t('car.photoError'), 'error');
    return null;
  }
}

async function switchCar() {
  const s = store.getState();
  const act = await actionSheet({
    title: t('car.switchTitle'),
    actions: [
      ...s.cars.map((c) => {
        const p = store.getPhoto(c.id);
        return {
          id: c.id,
          label: carName(c) + (c.plate ? ' · ' + c.plate : ''),
          active: c.id === s.activeCarId,
          html: p ? `<img class="thumb" src="${photoURL(p)}" alt="">` : `<span class="thumb">${icon('car')}</span>`,
        };
      }),
      { id: '__add', label: t('car.addCar'), icon: 'plus' },
    ],
  });
  if (!act) return;
  if (act === '__add') return push('car-form', {});
  if (act !== s.activeCarId) {
    store.update((st) => (st.activeCarId = act));
    haptic.select();
  }
}

function mount(el) {
  const car = store.activeCar();
  bindChips(el, (name, value) => {
    if (name === 'period') {
      statsPeriod = value;
      const sec = el.querySelectorAll('.section')[1];
      sec.outerHTML = statsBlock(car);
    }
  });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'photo') photoMenu(car);
    else if (act === 'switch') switchCar();
    else if (act === 'settings') push('settings');
    else if (act === 'edit') push('car-form', { id: car.id });
    else if (act === 'mileage') push('mileage');
    else if (act === 'add-reminder') push('reminder-form', { carId: car.id });
    else if (act === 'reminder') push('reminder-form', { id: b.dataset.id });
  });
}

register('car', { render, mount, live: true });

export async function deleteCar(car) {
  const ok = await confirmDialog(t('car.deleteCarConfirm', { name: carName(car) }));
  if (!ok) return false;
  if (store.getPhoto(car.id)) await store.removePhoto(car.id);
  store.update((s) => {
    s.cars = s.cars.filter((c) => c.id !== car.id);
    s.fuel = s.fuel.filter((f) => f.carId !== car.id);
    s.expenses = s.expenses.filter((x) => x.carId !== car.id);
    s.reminders = s.reminders.filter((r) => r.carId !== car.id);
    if (s.activeCarId === car.id) s.activeCarId = s.cars[0]?.id ?? null;
  });
  haptic.success();
  toast(t('car.deleted'));
  return true;
}
