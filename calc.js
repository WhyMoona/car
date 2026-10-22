// Чистые функции расчётов. Даты — строки 'YYYY-MM-DD'.

export const round = (n, d = 2) => {
  const k = 10 ** d;
  return Math.round((n + Number.EPSILON) * k) / k;
};

export function parseNum(v) {
  if (v == null) return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const t = String(v).replace(/[\s ]/g, '').replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return isFinite(n) ? n : null;
}

const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = (now = new Date()) => toISO(now);
export const monthKey = (iso) => (iso || '').slice(0, 7);

export function addToISO(iso, { days = 0, months = 0 } = {}) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + months, d + days);
  return toISO(dt);
}

export function daysBetween(fromISO, toISOStr) {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISOStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

// ---------- Литры / сумма / цена: любые два из трёх ----------


// order — поля в порядке редактирования; вычисляем то, что не входит в два последних
export function pickTarget(order = []) {
  const recent = [];
  for (let i = order.length - 1; i >= 0 && recent.length < 2; i--) {
    if (!recent.includes(order[i])) recent.push(order[i]);
  }
  // при прочих равных считаем цену, затем литры
  return ['price', 'liters', 'amount'].find((f) => !recent.includes(f));
}

export function solveFuel({ liters, amount, price }, target) {
  if (target === 'price' && liters > 0 && amount != null) return round(amount / liters, 2);
  if (target === 'liters' && price > 0 && amount != null) return round(amount / price, 2);
  if (target === 'amount' && liters != null && price != null) return round(liters * price, 2);
  return null;
}

// ---------- Расход топлива ----------

// Расход между двумя заправками «до полного бака».
// Возвращает Map(id заправки -> { consumption, distance, liters }).
export function consumptionIntervals(fuel) {
  const list = fuel
    .filter((f) => f.mileage != null && f.liters != null)
    .slice()
    .sort((a, b) => a.mileage - b.mileage || a.date.localeCompare(b.date));
  const res = new Map();
  let lastFull = null;
  let liters = 0;
  for (const f of list) {
    if (lastFull) liters += f.liters;
    if (f.full) {
      if (lastFull) {
        const distance = f.mileage - lastFull.mileage;
        if (distance > 0) {
          res.set(f.id, { consumption: (liters / distance) * 100, distance, liters, date: f.date });
        }
      }
      lastFull = f;
      liters = 0;
    }
  }
  return res;
}

export function averageConsumption(fuel) {
  let liters = 0;
  let dist = 0;
  for (const v of consumptionIntervals(fuel).values()) {
    liters += v.liters;
    dist += v.distance;
  }
  return dist > 0 ? (liters / dist) * 100 : null;
}

// ---------- Периоды ----------

// period: 'month' | 'year' | 'all' | { from, to }
export function periodRange(period, now = new Date()) {
  if (period && typeof period === 'object') return { from: period.from || null, to: period.to || null };
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === 'month') return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
  if (period === 'year') return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: null, to: null };
}

export const inRange = (date, r) => (!r.from || date >= r.from) && (!r.to || date <= r.to);

export const sum = (arr, key) => arr.reduce((s, x) => s + (Number(x[key]) || 0), 0);

export function totals(fuel, expenses, range) {
  const f = fuel.filter((x) => inRange(x.date, range));
  const e = expenses.filter((x) => inRange(x.date, range));
  const fuelAmount = sum(f, 'amount');
  const expAmount = sum(e, 'amount');
  return { fuelAmount, expAmount, total: fuelAmount + expAmount, liters: sum(f, 'liters'), fuelCount: f.length, expCount: e.length };
}

// Итоги по категориям (заправки — категория 'fuel'), по убыванию
export function categoryTotals(fuel, expenses, range) {
  const map = new Map();
  const add = (id, v) => map.set(id, (map.get(id) || 0) + (Number(v) || 0));
  for (const f of fuel) if (inRange(f.date, range)) add('fuel', f.amount);
  for (const e of expenses) if (inRange(e.date, range)) add(e.category, e.amount);
  return [...map.entries()]
    .map(([id, total]) => ({ id, total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
}

// Статистика по сетям АЗС: число заправок, сумма, литры, средняя цена (взвешенная по литрам)
export function stationStats(fuel, range = {}) {
  const map = new Map();
  for (const f of fuel) {
    if (!inRange(f.date, range)) continue;
    const s = map.get(f.station) || { station: f.station, count: 0, amount: 0, liters: 0 };
    s.count += 1;
    s.amount += Number(f.amount) || 0;
    s.liters += Number(f.liters) || 0;
    map.set(f.station, s);
  }
  return [...map.values()]
    .map((s) => ({ ...s, avgPrice: s.liters > 0 ? round(s.amount / s.liters, 2) : null }))
    .sort((a, b) => b.amount - a.amount);
}

// Стоимость 1 км: все траты / пройденное расстояние
export function costPerKm(car, fuel, expenses) {
  const miles = [car.initialMileage, car.mileage, ...fuel.map((f) => f.mileage), ...expenses.map((e) => e.mileage)]
    .filter((x) => x != null && isFinite(x));
  if (miles.length < 2) return null;
  const dist = Math.max(...miles) - Math.min(...miles);
  if (dist <= 0) return null;
  const total = sum(fuel, 'amount') + sum(expenses, 'amount');
  return total > 0 ? total / dist : null;
}

// Помесячные ряды: средняя цена литра и средний расход
export function monthlySeries(fuel) {
  const months = new Map();
  const get = (k) => {
    if (!months.has(k)) months.set(k, { month: k, amount: 0, liters: 0, cLiters: 0, cDist: 0 });
    return months.get(k);
  };
  for (const f of fuel) {
    const m = get(monthKey(f.date));
    if (f.amount != null && f.liters > 0) {
      m.amount += f.amount;
      m.liters += f.liters;
    }
  }
  for (const v of consumptionIntervals(fuel).values()) {
    const m = get(monthKey(v.date));
    m.cLiters += v.liters;
    m.cDist += v.distance;
  }
  return [...months.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      month: m.month,
      avgPrice: m.liters > 0 ? round(m.amount / m.liters, 2) : null,
      consumption: m.cDist > 0 ? round((m.cLiters / m.cDist) * 100, 2) : null,
    }));
}

// Статус напоминания: ok | soon | overdue
export function reminderStatus(r, { today, mileage }) {
  let daysLeft = null;
  let kmLeft = null;
  if (r.dueDate) daysLeft = daysBetween(today, r.dueDate);
  if (r.dueMileage != null && mileage != null) kmLeft = r.dueMileage - mileage;
  let status = 'ok';
  if ((daysLeft != null && daysLeft < 0) || (kmLeft != null && kmLeft < 0)) status = 'overdue';
  else if ((daysLeft != null && daysLeft < 30) || (kmLeft != null && kmLeft < 1000)) status = 'soon';
  return { status, daysLeft, kmLeft };
}

const STATUS_RANK = { overdue: 0, soon: 1, ok: 2 };
export function sortReminders(list, ctx) {
  return list
    .map((r) => ({ r, s: reminderStatus(r, ctx) }))
    .sort((a, b) => {
      const d = STATUS_RANK[a.s.status] - STATUS_RANK[b.s.status];
      if (d) return d;
      const ad = a.s.daysLeft ?? (a.s.kmLeft != null ? a.s.kmLeft / 50 : 1e9);
      const bd = b.s.daysLeft ?? (b.s.kmLeft != null ? b.s.kmLeft / 50 : 1e9);
      return ad - bd;
    });
}

export const byDateDesc = (a, b) => b.date.localeCompare(a.date) || (b.mileage ?? 0) - (a.mileage ?? 0);
