import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNum, pickTarget, solveFuel, consumptionIntervals, averageConsumption, periodRange, inRange,
  totals, categoryTotals, stationStats, costPerKm, monthlySeries, reminderStatus, addToISO,
} from '../js/core/calc.js';

test('parseNum понимает запятую, пробелы и пустые значения', () => {
  assert.equal(parseNum('52,7'), 52.7);
  assert.equal(parseNum('1 234,5'), 1234.5);
  assert.equal(parseNum(''), null);
  assert.equal(parseNum('abc'), null);
  assert.equal(parseNum(10), 10);
});

test('цена за литр: любые два значения из трёх', () => {
  assert.equal(solveFuel({ liters: 40, amount: 2400 }, 'price'), 60);
  assert.equal(solveFuel({ amount: 2400, price: 60 }, 'liters'), 40);
  assert.equal(solveFuel({ liters: 40, price: 59.99 }, 'amount'), 2399.6);
  assert.equal(solveFuel({ liters: 0, amount: 100 }, 'price'), null);
  assert.equal(solveFuel({ liters: 40 }, 'price'), null);
});

test('pickTarget вычисляет поле, которое редактировали давнее всего', () => {
  assert.equal(pickTarget([]), 'price');
  assert.equal(pickTarget(['liters', 'amount']), 'price');
  assert.equal(pickTarget(['liters', 'price']), 'amount');
  assert.equal(pickTarget(['price', 'amount']), 'liters');
  assert.equal(pickTarget(['liters', 'amount', 'price']), 'liters');
  assert.equal(pickTarget(['amount', 'amount', 'price']), 'liters');
});

const F = (id, date, mileage, liters, full, extra = {}) => ({ id, date, mileage, liters, full, amount: liters * 60, station: 'lukoil', ...extra });

test('расход л/100 км между полными баками, с учётом недоливов', () => {
  const fuel = [
    F('a', '2026-01-01', 10000, 40, true),
    F('b', '2026-01-05', 10200, 15, false),
    F('c', '2026-01-10', 10500, 25, true),
    F('d', '2026-01-20', 11000, 40, true),
  ];
  const m = consumptionIntervals(fuel);
  assert.equal(m.has('a'), false);
  assert.equal(m.has('b'), false);
  assert.equal(m.get('c').consumption, 8); // (15+25)/500*100
  assert.equal(m.get('d').consumption, 8); // 40/500*100
  assert.equal(averageConsumption(fuel), 8);
});

test('расход: заправки до первого полного бака не учитываются, порядок ввода не важен', () => {
  const fuel = [
    F('d', '2026-02-10', 1600, 30, true),
    F('x', '2026-02-01', 900, 20, false),
    F('a', '2026-02-02', 1000, 35, true),
  ];
  const m = consumptionIntervals(fuel);
  assert.equal(m.size, 1);
  assert.equal(m.get('d').consumption, 5);
  assert.equal(averageConsumption([F('a', '2026-01-01', 100, 10, true)]), null);
});

test('периоды и фильтр по датам', () => {
  const now = new Date(2026, 9, 22);
  assert.deepEqual(periodRange('month', now), { from: '2026-10-01', to: '2026-10-31' });
  assert.deepEqual(periodRange('year', now), { from: '2026-01-01', to: '2026-12-31' });
  assert.deepEqual(periodRange('all', now), { from: null, to: null });
  assert.deepEqual(periodRange({ from: '2026-03-01', to: '2026-03-15' }), { from: '2026-03-01', to: '2026-03-15' });
  assert.equal(inRange('2026-10-31', periodRange('month', now)), true);
  assert.equal(inRange('2026-11-01', periodRange('month', now)), false);
  assert.equal(addToISO('2026-01-31', { months: 1 }), '2026-03-03');
  assert.equal(addToISO('2026-10-22', { months: 12 }), '2027-10-22');
});

const fuel = [
  { id: '1', date: '2026-10-02', mileage: 100, liters: 40, amount: 2400, station: 'lukoil', full: true },
  { id: '2', date: '2026-10-12', mileage: 600, liters: 30, amount: 1950, station: 'rosneft', full: true },
  { id: '3', date: '2026-09-12', mileage: 50, liters: 10, amount: 580, station: 'lukoil', full: false },
];
const expenses = [
  { id: 'e1', date: '2026-10-05', mileage: 300, category: 'wash', amount: 500 },
  { id: 'e2', date: '2026-10-07', mileage: 400, category: 'to', amount: 12000 },
  { id: 'e3', date: '2025-12-01', mileage: 10, category: 'wash', amount: 400 },
];

test('итоги за период', () => {
  const r = periodRange('month', new Date(2026, 9, 22));
  const t = totals(fuel, expenses, r);
  assert.equal(t.fuelAmount, 4350);
  assert.equal(t.expAmount, 12500);
  assert.equal(t.total, 16850);
  assert.equal(t.liters, 70);
  const all = totals(fuel, expenses, periodRange('all'));
  assert.equal(all.total, 4930 + 12900);
});

test('итоги по категориям включают заправки', () => {
  const c = categoryTotals(fuel, expenses, periodRange('all'));
  assert.deepEqual(c, [
    { id: 'to', total: 12000 },
    { id: 'fuel', total: 4930 },
    { id: 'wash', total: 900 },
  ]);
});

test('статистика по сетям АЗС', () => {
  const s = stationStats(fuel);
  const luk = s.find((x) => x.station === 'lukoil');
  assert.equal(luk.count, 2);
  assert.equal(luk.amount, 2980);
  assert.equal(luk.liters, 50);
  assert.equal(luk.avgPrice, 59.6);
  assert.equal(s[0].station, 'lukoil');
  const oct = stationStats(fuel, { from: '2026-10-01', to: '2026-10-31' });
  assert.equal(oct.find((x) => x.station === 'lukoil').count, 1);
});

test('стоимость 1 км', () => {
  const car = { initialMileage: 0, mileage: 1000 };
  assert.equal(costPerKm(car, fuel, expenses), (4930 + 12900) / 1000);
  assert.equal(costPerKm({ initialMileage: 5, mileage: 5 }, [], []), null);
});

test('помесячные ряды цены и расхода', () => {
  const s = monthlySeries(fuel);
  assert.equal(s.length, 2);
  assert.equal(s[0].month, '2026-09');
  assert.equal(s[0].avgPrice, 58);
  assert.equal(s[1].avgPrice, round2(4350 / 70));
  assert.equal(s[1].consumption, 6); // 30 / 500 * 100
});
const round2 = (n) => Math.round(n * 100) / 100;

test('статусы напоминаний', () => {
  const ctx = { today: '2026-10-22', mileage: 50000 };
  assert.equal(reminderStatus({ dueDate: '2027-01-01' }, ctx).status, 'ok');
  assert.equal(reminderStatus({ dueDate: '2026-11-10' }, ctx).status, 'soon');
  assert.equal(reminderStatus({ dueDate: '2026-10-21' }, ctx).status, 'overdue');
  assert.equal(reminderStatus({ dueMileage: 50800 }, ctx).status, 'soon');
  assert.equal(reminderStatus({ dueMileage: 49999 }, ctx).status, 'overdue');
  assert.equal(reminderStatus({ dueMileage: 60000, dueDate: '2026-10-01' }, ctx).status, 'overdue');
  assert.equal(reminderStatus({ dueMileage: 60000 }, ctx).kmLeft, 10000);
});
