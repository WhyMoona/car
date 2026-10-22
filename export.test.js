import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExportJSON, parseImportJSON, buildCSV } from '../js/core/exportData.js';
import { emptyState, migrate } from '../js/core/model.js';

const state = migrate({
  ...emptyState(),
  cars: [{ id: 'c1', brand: 'Kia', model: 'Rio', mileage: 1000, hasPhoto: true }],
  fuel: [{ id: 'f1', carId: 'c1', date: '2026-10-01', mileage: 900, station: 'lukoil', liters: 40.5, amount: 2430, price: 60, full: true, comment: 'с "кавычками"; и точкой с запятой' }],
  expenses: [{ id: 'e1', carId: 'c1', date: '2026-10-02', mileage: 950, category: 'wash', description: 'Мойка', amount: 500 }],
});

test('экспорт и импорт JSON вместе с фото', () => {
  const text = buildExportJSON(state, { c1: 'QUJD' });
  const back = parseImportJSON(text);
  assert.deepEqual(back.state.fuel, state.fuel);
  assert.equal(back.photos.c1, 'QUJD');
  assert.equal(back.state.cars[0].hasPhoto, true);
});

test('импорт без фото снимает флаг hasPhoto', () => {
  const back = parseImportJSON(JSON.stringify(state));
  assert.equal(back.state.cars[0].hasPhoto, false);
});

test('импорт мусора выбрасывает ошибку', () => {
  assert.throws(() => parseImportJSON('не json'));
  assert.throws(() => parseImportJSON('42'));
});

test('CSV: разделитель ;, экранирование, запятая в числах', () => {
  const csv = buildCSV(state, { stationName: () => 'Лукойл', categoryName: () => 'Мойка', fuelName: () => 'АИ-95' });
  const lines = csv.replace('﻿', '').split('\r\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[1].startsWith('Расход;2026-10-02'));
  assert.ok(lines[2].includes('40,5'));
  assert.ok(lines[2].includes('"с ""кавычками""; и точкой с запятой"'));
});
