// Состояние приложения: localStorage для мгновенного старта, CloudStorage для синхронизации.
import { emptyState, migrate, NewerFormatError } from './model.js';
import * as cloud from './cloud.js';
import { photoDB } from './photo.js';

const LS_STATE = 'bortjournal.state';
const LS_DIRTY = 'bortjournal.dirty';
const LS_MANIFEST = 'bortjournal.manifest';

let state = emptyState();
let adapter = null;
let manifest = null;
let photos = {};
let blocked = false; // в облаке данные более новой версии приложения
const listeners = new Set();
let hooks = { onSync: () => {}, onNotice: () => {} };

export const sync = { status: 'local', photosLocalOnly: false };

export const getState = () => state;
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach((fn) => fn(state));
const setSync = (status) => {
  sync.status = status;
  hooks.onSync(sync);
};

const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

function saveLocal() {
  if (!ls.set(LS_STATE, JSON.stringify(state))) hooks.onNotice('localFull');
}
const isDirty = () => ls.get(LS_DIRTY) === '1';
const setDirty = (v) => (v ? ls.set(LS_DIRTY, '1') : ls.del(LS_DIRTY));
const saveManifest = () => ls.set(LS_MANIFEST, JSON.stringify(manifest));

function loadLocal() {
  try {
    const s = ls.get(LS_STATE);
    return s ? migrate(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

async function loadPhotos() {
  photos = await photoDB.all(state.cars.filter((c) => c.hasPhoto).map((c) => c.id));
}

// Возвращает promise, который резолвится, когда можно рисовать интерфейс.
export async function init(cloudAdapter, h = {}) {
  hooks = { ...hooks, ...h };
  adapter = cloudAdapter;
  const local = loadLocal();
  try { manifest = JSON.parse(ls.get(LS_MANIFEST) || 'null'); } catch { manifest = null; }
  if (local) {
    state = local;
    await loadPhotos();
    if (adapter) pull(true);
    return;
  }
  // Первый запуск на этом устройстве — ждём облако, чтобы не показать пустой экран владельцу данных
  if (adapter) {
    await Promise.race([pull(false), new Promise((r) => setTimeout(r, 6000))]);
  }
}

async function pull(hasLocal) {
  setSync('syncing');
  try {
    const remote = await cloud.loadCloud(adapter);
    if (remote) {
      let rstate;
      try {
        rstate = migrate(remote.state);
      } catch (e) {
        if (e instanceof NewerFormatError) {
          blocked = true;
          setSync('newer');
          hooks.onNotice('newer');
          return;
        }
        throw e;
      }
      manifest = remote.manifest;
      saveManifest();
      if (!hasLocal || (!isDirty() && rstate.updatedAt > state.updatedAt)) {
        state = rstate;
        saveLocal();
        await loadPhotos();
        emit();
      }
      let fetched = false;
      for (const car of state.cars) {
        if (!car.hasPhoto || photos[car.id]) continue;
        const b64 = await cloud.loadPhoto(adapter, manifest, car.id).catch(() => null);
        if (b64) {
          photos[car.id] = b64;
          await photoDB.set(car.id, b64);
          fetched = true;
        }
      }
      if (fetched) emit();
    }
    if (isDirty() || (!remote && state.cars.length)) await push();
    else setSync('ok');
  } catch (e) {
    console.warn('cloud pull failed', e);
    setSync('error');
  }
}

let pushing = false;
let again = false;
let timer = null;

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(push, 400);
}

export function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    push();
  }
}

async function save(withPhotos) {
  return cloud.saveCloud(adapter, state, withPhotos ? photos : {}, manifest);
}

async function push() {
  timer = null;
  if (!adapter || blocked) return;
  if (pushing) {
    again = true;
    return;
  }
  pushing = true;
  setSync('syncing');
  const stamp = state.updatedAt;
  try {
    let res;
    try {
      res = await save(true);
      sync.photosLocalOnly = false;
    } catch (e) {
      if (!(e instanceof cloud.QuotaError)) throw e;
      await cloud.sweepOrphans(adapter, manifest).catch(() => {});
      try {
        res = await save(true);
        sync.photosLocalOnly = false;
      } catch (e2) {
        if (!(e2 instanceof cloud.QuotaError) || !Object.keys(photos).length) throw e2;
        res = await save(false);
        if (!sync.photosLocalOnly) hooks.onNotice('photosLocal');
        sync.photosLocalOnly = true;
      }
    }
    manifest = res.manifest;
    saveManifest();
    if (state.updatedAt === stamp) setDirty(false);
    setSync('ok');
  } catch (e) {
    console.warn('cloud push failed', e);
    if (e instanceof cloud.QuotaError) {
      setSync('quota');
      hooks.onNotice('quota');
    } else setSync('error');
  } finally {
    pushing = false;
    if (again) {
      again = false;
      push();
    }
  }
}

export function retrySync() {
  if (adapter && isDirty()) push();
}

// ---------- Изменения ----------

export function update(fn) {
  fn(state);
  state.updatedAt = Date.now();
  saveLocal();
  setDirty(true);
  emit();
  schedule();
}

export const getPhoto = (carId) => photos[carId] || null;
export const allPhotos = () => ({ ...photos });

export async function setPhoto(carId, b64) {
  photos[carId] = b64;
  await photoDB.set(carId, b64);
  update((s) => {
    const c = s.cars.find((x) => x.id === carId);
    if (c) c.hasPhoto = true;
  });
}

export async function removePhoto(carId) {
  delete photos[carId];
  await photoDB.remove(carId);
  update((s) => {
    const c = s.cars.find((x) => x.id === carId);
    if (c) c.hasPhoto = false;
  });
}

export async function replaceAll(newState, newPhotos = {}) {
  await photoDB.clear();
  photos = {};
  for (const [id, b64] of Object.entries(newPhotos)) {
    if (!newState.cars.some((c) => c.id === id)) continue;
    photos[id] = b64;
    await photoDB.set(id, b64);
  }
  state = newState;
  update(() => {});
}

export async function wipeAll() {
  clearTimeout(timer);
  state = emptyState();
  photos = {};
  await photoDB.clear();
  ls.del(LS_STATE);
  ls.del(LS_DIRTY);
  ls.del(LS_MANIFEST);
  if (adapter && !blocked) {
    await cloud.clearCloud(adapter);
    manifest = null;
  }
  emit();
}

export const usage = () => cloud.usage(manifest);
export const hasCloud = () => !!adapter;

// ---------- Выборки ----------

export const activeCar = () => state.cars.find((c) => c.id === state.activeCarId) || state.cars[0] || null;
export const carFuel = (id = state.activeCarId) => state.fuel.filter((f) => f.carId === id);
export const carExpenses = (id = state.activeCarId) => state.expenses.filter((e) => e.carId === id);
export const carReminders = (id = state.activeCarId) => state.reminders.filter((r) => r.carId === id);

// Пробег машины растёт автоматически, если в записи указан больший
export function bumpMileage(s, carId, mileage) {
  const c = s.cars.find((x) => x.id === carId);
  if (c && mileage != null && mileage > (c.mileage ?? 0)) c.mileage = mileage;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', retrySync);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
