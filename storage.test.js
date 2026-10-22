import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compress, decompress, chunk, hash } from '../js/core/codec.js';
import {
  saveCloud, loadCloud, loadPhoto, memoryAdapter, LIMITS, QuotaError, manifestKeys, sweepOrphans,
} from '../js/core/cloud.js';
import { emptyState, migrate, DATA_VERSION, NewerFormatError } from '../js/core/model.js';

function sampleState(nFuel = 30) {
  const s = emptyState();
  s.updatedAt = 1000;
  s.cars = [{ id: 'car1', brand: 'Kia', model: 'Rio', mileage: 52000, initialMileage: 40000 }];
  s.activeCarId = 'car1';
  for (let i = 0; i < nFuel; i++) {
    const y = 2024 + (i % 3);
    s.fuel.push({
      id: 'f' + i, carId: 'car1', date: `${y}-0${1 + (i % 9)}-1${i % 9}`, mileage: 40000 + i * 400,
      station: 'lukoil', fuelType: 'ai95', liters: 35 + (i % 7), amount: 2000 + i, price: 58.4, full: i % 2 === 0,
      comment: 'Комментарий ' + i,
    });
  }
  s.expenses.push({ id: 'e1', carId: 'car1', date: '2026-05-01', mileage: 50000, category: 'to', description: 'Масло', amount: 9000, comment: '' });
  return migrate(s);
}

test('сжатие и распаковка (кириллица, пустая строка)', async () => {
  for (const str of ['', 'привет, мир', JSON.stringify(sampleState())]) {
    const c = await compress(str);
    assert.equal(await decompress(c), str);
  }
  const big = JSON.stringify(sampleState(200));
  assert.ok((await compress(big)).length < big.length);
});

test('разбивка на части', () => {
  assert.deepEqual(chunk('abcdefg', 3), ['abc', 'def', 'g']);
  assert.deepEqual(chunk('', 3), ['']);
  assert.equal(chunk('x'.repeat(8001), 4000).length, 3);
  assert.notEqual(hash('a'), hash('b'));
});

test('сохранение и чтение из CloudStorage с разбивкой', async () => {
  const cloud = memoryAdapter();
  const state = sampleState(400);
  const { manifest } = await saveCloud(cloud, state, {}, null);
  for (const v of cloud.data.values()) assert.ok(v.length <= LIMITS.maxValue);
  assert.ok(Object.keys(manifest.docs).includes('meta'));
  assert.ok(Object.keys(manifest.docs).some((d) => d.startsWith('y')));
  const loaded = await loadCloud(cloud);
  const back = migrate(loaded.state);
  assert.equal(back.fuel.length, 400);
  assert.deepEqual(
    back.fuel.slice().sort((a, b) => a.id.localeCompare(b.id)),
    state.fuel.slice().sort((a, b) => a.id.localeCompare(b.id)),
  );
  assert.deepEqual(back.expenses, state.expenses);
  assert.deepEqual(back.cars, state.cars);
});

test('документ больше 4096 символов делится на несколько ключей', async () => {
  const cloud = memoryAdapter();
  const photo = 'A'.repeat(95000);
  const { manifest } = await saveCloud(cloud, sampleState(5), { car1: photo }, null);
  assert.ok(manifest.docs.pcar1.n >= 24);
  assert.equal(await loadPhoto(cloud, manifest, 'car1'), photo);
});

test('повторное сохранение пишет только изменённые части и удаляет старые', async () => {
  const cloud = memoryAdapter();
  const state = sampleState(60);
  const first = await saveCloud(cloud, state, {}, null);
  const again = await saveCloud(cloud, state, {}, first.manifest);
  assert.equal(again.written, 0);
  assert.equal(again.removed, 0);

  state.fuel.find((f) => f.date.startsWith('2026')).liters = 99;
  state.updatedAt = 2000;
  const third = await saveCloud(cloud, state, {}, again.manifest);
  assert.ok(third.written >= 2); // год 2026 + meta (updatedAt)
  assert.ok(third.removed >= 2);
  assert.equal(cloud.data.size, manifestKeys(third.manifest).length + 1);
  const loaded = await loadCloud(cloud);
  assert.ok(loaded.state.fuel.some((f) => f.liters === 99));
});

test('при нехватке места выбрасывается QuotaError, данные не портятся', async () => {
  const cloud = memoryAdapter();
  const state = sampleState(10);
  const ok = await saveCloud(cloud, state, {}, null);
  const hugePhoto = 'A'.repeat(LIMITS.chunk * LIMITS.maxKeys);
  await assert.rejects(saveCloud(cloud, state, { car1: hugePhoto }, ok.manifest), QuotaError);
  const loaded = await loadCloud(cloud);
  assert.equal(loaded.state.fuel.length, 10);
});

test('удаление осиротевших ключей', async () => {
  const cloud = memoryAdapter();
  const { manifest } = await saveCloud(cloud, sampleState(5), {}, null);
  await cloud.set('meta-zzz-0', 'мусор');
  assert.equal(await sweepOrphans(cloud, manifest), 1);
  assert.ok(await loadCloud(cloud));
});

test('пустое облако возвращает null', async () => {
  assert.equal(await loadCloud(memoryAdapter()), null);
});

test('миграция: данные без версии и данные из будущей версии', () => {
  const old = { cars: [{ id: 'c', brand: 'Lada', mileage: '1000' }], fuel: [{ id: 'f', carId: 'c', date: '2026-01-01', liters: '30', station: 'неизвестная' }] };
  const m = migrate(old);
  assert.equal(m.version, DATA_VERSION);
  assert.equal(m.cars[0].mileage, 1000);
  assert.equal(m.fuel[0].liters, 30);
  assert.equal(m.fuel[0].station, 'other');
  assert.equal(m.activeCarId, 'c');
  assert.deepEqual(m.expenses, []);
  assert.throws(() => migrate({ version: DATA_VERSION + 1 }), NewerFormatError);
});
