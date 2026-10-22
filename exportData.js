// Экспорт и импорт данных.
import { migrate } from './model.js';

export const APP_ID = 'bortjournal';

export function buildExportJSON(state, photos) {
  return JSON.stringify({ app: APP_ID, version: state.version, exportedAt: new Date().toISOString(), data: state, photos }, null, 1);
}

export function parseImportJSON(text) {
  const obj = JSON.parse(text);
  const raw = obj && obj.app === APP_ID ? obj.data : obj;
  const state = migrate(raw);
  const photos = obj && obj.photos && typeof obj.photos === 'object' ? obj.photos : {};
  for (const c of state.cars) c.hasPhoto = !!photos[c.id];
  return { state, photos };
}

const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const n = (v) => (v == null ? '' : String(v).replace('.', ','));

// CSV с разделителем «;» и BOM — корректно открывается в Excel
export function buildCSV(state, { stationName, categoryName, fuelName }) {
  const carName = (id) => {
    const c = state.cars.find((x) => x.id === id);
    return c ? `${c.brand} ${c.model}`.trim() : '';
  };
  const head = ['Тип', 'Дата', 'Машина', 'Пробег', 'Категория / АЗС', 'Топливо', 'Описание', 'Литры', 'Цена за литр', 'Сумма', 'Полный бак', 'Комментарий'];
  const rows = [
    ...state.fuel.map((f) => ['Заправка', f.date, carName(f.carId), n(f.mileage), stationName(f.station), fuelName(f.fuelType), '', n(f.liters), n(f.price), n(f.amount), f.full ? 'да' : 'нет', f.comment]),
    ...state.expenses.map((e) => ['Расход', e.date, carName(e.carId), n(e.mileage), categoryName(e.category), '', e.description, '', '', n(e.amount), '', e.comment]),
  ].sort((a, b) => String(b[1]).localeCompare(String(a[1])));
  return '﻿' + [head, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
}
