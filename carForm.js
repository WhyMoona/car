// Форма машины, первый запуск и обновление пробега
import { t } from '../../i18n.js';
import * as store from '../../core/store.js';
import { FUEL_TYPES, uid } from '../../core/model.js';
import { photoURL } from '../../core/photo.js';
import { icon } from '../icons.js';
import { esc, km } from '../fmt.js';
import { field, textInput, numInput, chips, bindChips, bindNumeric, readForm, invalid, toast, confirmDialog } from '../kit.js';
import { register, pop } from '../router.js';
import { mainButton, haptic } from '../../tg.js';
import { choosePhoto, deleteCar } from './car.js';

function photoField(b64) {
  return `<button type="button" class="photo-pick ${b64 ? 'has' : ''}" data-act="photo">
    ${b64 ? `<img src="${photoURL(b64)}" alt="">` : `${icon('camera')}<span>${esc(t('car.addPhoto'))}</span><small>${esc(t('common.optional'))}</small>`}
  </button>`;
}

function fuelChips(sel) {
  return chips('fuelType', FUEL_TYPES.map((f) => ({ value: f, label: t('fuelTypes.' + f) })), sel);
}

function formBody(car, { short = false } = {}) {
  const c = car || { fuelType: 'ai95' };
  const main = `
    ${field(t('car.brand'), textInput('brand', c.brand, { placeholder: t('car.brandPh'), maxlength: 40 }))}
    ${field(t('car.model'), textInput('model', c.model, { placeholder: t('car.modelPh'), maxlength: 40 }))}
    ${field(t('car.currentMileage'), numInput('mileage', c.mileage, { suffix: t('settings.' + store.getState().settings.distanceUnit), decimal: false, placeholder: '0' }))}`;
  if (short) return main;
  return `${main}
    ${field(t('car.plate'), textInput('plate', c.plate, { placeholder: t('car.platePh'), maxlength: 15, upper: true }), { tag: t('common.optional') })}
    <div class="field"><span class="field-label">${esc(t('car.fuelType'))}</span>${fuelChips(c.fuelType)}</div>
    <div class="row2">
      ${field(t('car.year'), numInput('year', c.year, { decimal: false, placeholder: '2018' }))}
      ${field(t('car.tank'), numInput('tank', c.tank, { suffix: t('settings.' + store.getState().settings.volumeUnit), placeholder: '50' }))}
    </div>
    ${field(t('car.color'), textInput('color', c.color, { placeholder: t('car.colorPh'), maxlength: 30 }))}
    ${field(t('car.vin'), textInput('vin', c.vin, { placeholder: 'XTA...', maxlength: 17, upper: true }))}`;
}

function makeMount({ first = false } = {}) {
  return (el, params) => {
    const editing = params.id ? store.getState().cars.find((c) => c.id === params.id) : null;
    let pendingPhoto = editing ? store.getPhoto(editing.id) : null;
    let photoChanged = false;
    bindChips(el);
    bindNumeric(el);
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'photo') {
        const b64 = await choosePhoto(null);
        if (b64) {
          pendingPhoto = b64;
          photoChanged = true;
          b.outerHTML = photoField(b64);
        }
      }
      if (b.dataset.act === 'delete' && editing) {
        if (await deleteCar(editing)) pop();
      }
    });

    const save = async () => {
      const v = readForm(el);
      if (!v.brand) return invalid(el, 'brand', t('car.required'));
      if (v.mileage == null) return invalid(el, 'mileage', t('car.required'));
      v.vin = (v.vin || '').toUpperCase();
      v.plate = (v.plate || '').toUpperCase();
      let id = editing?.id;
      store.update((s) => {
        if (editing) {
          const c = s.cars.find((x) => x.id === editing.id);
          Object.assign(c, v, { fuelType: v.fuelType || c.fuelType });
        } else {
          id = uid();
          s.cars.push({
            id, brand: v.brand, model: v.model || '', plate: v.plate || '', year: v.year ?? null,
            fuelType: v.fuelType || 'ai95', tank: v.tank ?? null, vin: v.vin || '', color: v.color || '',
            mileage: v.mileage, initialMileage: v.mileage, hasPhoto: false, createdAt: Date.now(),
          });
          s.activeCarId = id;
        }
      });
      if (pendingPhoto && (photoChanged || !editing)) await store.setPhoto(id, pendingPhoto);
      haptic.success();
      if (!first) {
        toast(t('car.saved'));
        pop();
      }
    };
    mainButton.set({ text: first ? t('onboarding.start') : t('common.save'), onClick: save });
  };
}

register('car-form', {
  render(params) {
    const car = params.id ? store.getState().cars.find((c) => c.id === params.id) : null;
    const photo = car ? store.getPhoto(car.id) : null;
    return `<header class="topbar plain"><h1>${esc(car ? t('car.editCar') : t('car.newCar'))}</h1></header>
      <form class="form" onsubmit="return false">
        ${photoField(photo)}
        ${formBody(car)}
        ${car ? `<button type="button" class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('car.deleteCar'))}</button>` : ''}
      </form>`;
  },
  mount: makeMount(),
});

register('onboarding', {
  render() {
    return `<div class="welcome">
        <img class="welcome-logo" src="icon.svg" alt="">
        <h1>${esc(t('onboarding.title'))}</h1>
        <p>${esc(t('onboarding.text'))}</p>
      </div>
      <form class="form" onsubmit="return false">
        ${photoField(null)}
        ${formBody(null, { short: true })}
      </form>`;
  },
  mount: makeMount({ first: true }),
});

register('mileage', {
  render() {
    const car = store.activeCar();
    return `<header class="topbar plain"><h1>${esc(t('car.mileageTitle'))}</h1></header>
      <form class="form" onsubmit="return false">
        <div class="big-input">${numInput('mileage', car.mileage, { decimal: false, suffix: t('settings.' + store.getState().settings.distanceUnit) })}</div>
        <p class="muted center">${esc(t('car.mileageHint', { value: km(car.mileage) }))}</p>
      </form>`;
  },
  mount(el) {
    const car = store.activeCar();
    bindNumeric(el);
    const input = el.querySelector('input');
    setTimeout(() => {
      input.focus();
      input.select();
    }, 250);
    mainButton.set({
      text: t('common.save'),
      onClick: async () => {
        const { mileage } = readForm(el);
        if (mileage == null) return invalid(el, 'mileage', t('car.required'));
        if (mileage < car.mileage && !(await confirmDialog(t('car.mileageLess'), { okText: t('common.save'), danger: false }))) return;
        store.update((s) => (s.cars.find((c) => c.id === car.id).mileage = mileage));
        haptic.success();
        pop();
      },
    });
  },
});

