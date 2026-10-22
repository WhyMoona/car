// Хранение данных в Telegram CloudStorage.
//
// Ограничения CloudStorage: до 1024 ключей на пользователя, значение до 4096 символов,
// ключ 1–128 символов [A-Za-z0-9_-].
//
// Формат:
//   manifest            — сжатый JSON { v, updatedAt, docs: { <doc>: { h, n } } }
//   <doc>-<hash>-<i>    — части документа
// Документы: meta (настройки, машины, напоминания), y<ГГГГ> (записи за год), p<carId> (фото).
// Части пишутся под новым хешем, затем manifest, затем старые части удаляются —
// при обрыве связи на середине старые данные остаются целыми.

import { compress, decompress, chunk, hash } from './codec.js';
import { DATA_VERSION } from './model.js';

export const LIMITS = { maxKeys: 1024, maxValue: 4096, chunk: 4000 };
const MANIFEST = 'manifest';
const BATCH = 50;

export class QuotaError extends Error {
  constructor(msg, info) {
    super(msg);
    this.name = 'QuotaError';
    this.info = info;
  }
}

const keyOf = (doc, h, i) => `${doc}-${h}-${i}`;
const keysOf = (doc, e) => Array.from({ length: e.n }, (_, i) => keyOf(doc, e.h, i));

export function manifestKeys(manifest) {
  if (!manifest) return [];
  return Object.entries(manifest.docs).flatMap(([doc, e]) => keysOf(doc, e));
}

export function usage(manifest) {
  return { keys: manifest ? manifestKeys(manifest).length + 1 : 0, maxKeys: LIMITS.maxKeys };
}

// Разбиваем состояние на документы (строки, готовые к записи)
export async function buildDocs(state, photos = {}) {
  const docs = {};
  const meta = {
    version: state.version,
    updatedAt: state.updatedAt,
    settings: state.settings,
    activeCarId: state.activeCarId,
    lastStation: state.lastStation,
    cars: state.cars,
    reminders: state.reminders,
  };
  docs.meta = await compress(JSON.stringify(meta));
  const years = new Map();
  const bucket = (y) => {
    if (!years.has(y)) years.set(y, { fuel: [], expenses: [] });
    return years.get(y);
  };
  for (const f of state.fuel) bucket(f.date.slice(0, 4) || '0000').fuel.push(f);
  for (const e of state.expenses) bucket(e.date.slice(0, 4) || '0000').expenses.push(e);
  for (const [y, data] of years) docs['y' + y] = await compress(JSON.stringify(data));
  for (const [carId, b64] of Object.entries(photos)) if (b64) docs['p' + carId] = 'B' + b64;
  return docs;
}

export async function saveCloud(adapter, state, photos, prev) {
  const docs = await buildDocs(state, photos);
  const entries = {};
  const writes = [];
  for (const [doc, payload] of Object.entries(docs)) {
    const h = hash(payload);
    const old = prev?.docs?.[doc];
    if (old && old.h === h) {
      entries[doc] = old;
      continue;
    }
    const parts = chunk(payload, LIMITS.chunk);
    entries[doc] = { h, n: parts.length };
    parts.forEach((p, i) => writes.push([keyOf(doc, h, i), p]));
  }
  const manifest = { v: DATA_VERSION, updatedAt: state.updatedAt, docs: entries };
  const manifestStr = await compress(JSON.stringify(manifest));
  if (manifestStr.length > LIMITS.maxValue) throw new QuotaError('manifest too large');

  const newKeys = new Set(manifestKeys(manifest));
  const oldKeys = manifestKeys(prev).filter((k) => !newKeys.has(k));
  const finalCount = newKeys.size + 1;
  if (finalCount > LIMITS.maxKeys) throw new QuotaError('too many keys', { need: finalCount });

  // Если старые и новые части вместе не помещаются — сначала чистим старые
  const cleanFirst = finalCount + oldKeys.length > LIMITS.maxKeys;
  if (cleanFirst && oldKeys.length) await removeBatched(adapter, oldKeys);
  for (const [k, v] of writes) await adapter.set(k, v);
  await adapter.set(MANIFEST, manifestStr);
  if (!cleanFirst && oldKeys.length) await removeBatched(adapter, oldKeys);
  return { manifest, written: writes.length, removed: oldKeys.length };
}

async function removeBatched(adapter, keys) {
  for (let i = 0; i < keys.length; i += BATCH) await adapter.remove(keys.slice(i, i + BATCH));
}

async function getBatched(adapter, keys) {
  const out = {};
  for (let i = 0; i < keys.length; i += BATCH) Object.assign(out, await adapter.get(keys.slice(i, i + BATCH)));
  return out;
}

async function readDoc(adapter, doc, e) {
  const keys = keysOf(doc, e);
  const vals = await getBatched(adapter, keys);
  const s = keys.map((k) => {
    if (vals[k] == null || vals[k] === '') throw new Error('missing chunk ' + k);
    return vals[k];
  }).join('');
  if (hash(s) !== e.h) throw new Error('corrupt ' + doc);
  return s;
}

export async function loadManifest(adapter) {
  const raw = (await adapter.get([MANIFEST]))[MANIFEST];
  if (!raw) return null;
  return JSON.parse(await decompress(raw));
}

// Загружает данные (без фото). Возвращает { state, manifest } или null
export async function loadCloud(adapter) {
  const manifest = await loadManifest(adapter);
  if (!manifest || !manifest.docs.meta) return null;
  const meta = JSON.parse(await decompress(await readDoc(adapter, 'meta', manifest.docs.meta)));
  const state = { ...meta, fuel: [], expenses: [] };
  for (const [doc, e] of Object.entries(manifest.docs)) {
    if (doc[0] !== 'y') continue;
    const data = JSON.parse(await decompress(await readDoc(adapter, doc, e)));
    state.fuel.push(...(data.fuel || []));
    state.expenses.push(...(data.expenses || []));
  }
  return { state, manifest };
}

export async function loadPhoto(adapter, manifest, carId) {
  const e = manifest?.docs?.['p' + carId];
  if (!e) return null;
  return (await readDoc(adapter, 'p' + carId, e)).slice(1);
}

// Удаляет ключи, на которые не ссылается manifest (остатки прерванных записей)
export async function sweepOrphans(adapter, manifest) {
  const keep = new Set([MANIFEST, ...manifestKeys(manifest)]);
  const orphans = (await adapter.keys()).filter((k) => !keep.has(k));
  if (orphans.length) await removeBatched(adapter, orphans);
  return orphans.length;
}

export async function clearCloud(adapter) {
  const keys = await adapter.keys();
  if (keys.length) await removeBatched(adapter, keys);
}

// ---------- Адаптеры ----------

export function telegramAdapter(cs) {
  const call = (fn, ...args) =>
    new Promise((resolve, reject) => {
      fn.call(cs, ...args, (err, res) => (err ? reject(new Error(String(err))) : resolve(res)));
    });
  return {
    get: (keys) => call(cs.getItems, keys).then((r) => r || {}),
    set: (k, v) => call(cs.setItem, k, v),
    remove: (keys) => call(cs.removeItems, keys),
    keys: () => call(cs.getKeys).then((r) => r || []),
  };
}

// Хранилище в памяти с теми же ограничениями (тесты и демо-режим вне Telegram)
export function memoryAdapter(initial = {}, onChange) {
  const data = new Map(Object.entries(initial));
  const KEY_RE = /^[A-Za-z0-9_-]{1,128}$/;
  return {
    data,
    async get(keys) {
      const out = {};
      for (const k of keys) out[k] = data.get(k) ?? '';
      return out;
    },
    async set(k, v) {
      if (!KEY_RE.test(k)) throw new Error('bad key ' + k);
      if (v.length > LIMITS.maxValue) throw new Error('value too long');
      if (!data.has(k) && data.size >= LIMITS.maxKeys) throw new Error('key limit');
      data.set(k, v);
      onChange?.(data);
    },
    async remove(keys) {
      keys.forEach((k) => data.delete(k));
      onChange?.(data);
    },
    async keys() {
      return [...data.keys()];
    },
  };
}
