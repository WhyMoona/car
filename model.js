// Модель данных, справочники и миграции формата.

export const DATA_VERSION = 1;

export const FUEL_TYPES = ['ai92', 'ai95', 'ai98', 'dt', 'gas', 'ev'];

// Иконки сетей — нейтральные значки с инициалами (не фирменные логотипы).
export const STATIONS = [
  { id: 'neftm', name: 'Нефтьмагистраль', short: 'НМ', color: '#2a5caa' },
  { id: 'lukoil', name: 'Лукойл', short: 'Л', color: '#d6332a' },
  { id: 'rosneft', name: 'Роснефть', short: 'Р', color: '#f0b323', fg: '#1d1d1f' },
  { id: 'teboil', name: 'Teboil', short: 'T', color: '#1677c8' },
  { id: 'tatneft', name: 'Татнефть', short: 'ТН', color: '#1f8a4c' },
  { id: 'other', name: 'Другая', short: '•', color: '#8a94a6' },
];

export const CATEGORIES = [
  { id: 'to', icon: 'wrench', color: '#0f9d9a' },
  { id: 'repair', icon: 'hammer', color: '#e0674b' },
  { id: 'parts', icon: 'cog', color: '#7a6ff0' },
  { id: 'tires', icon: 'tire', color: '#445066' },
  { id: 'wash', icon: 'droplets', color: '#3ba7e5' },
  { id: 'insurance', icon: 'shield', color: '#2f7de1' },
  { id: 'tax', icon: 'landmark', color: '#b07d2b' },
  { id: 'fines', icon: 'alert', color: '#d4404f' },
  { id: 'parking', icon: 'parking', color: '#5b8def' },
  { id: 'tolls', icon: 'route', color: '#8c6bb1' },
  { id: 'accessories', icon: 'sparkles', color: '#e2a03f' },
  { id: 'other', icon: 'more', color: '#9aa3b2' },
];

// Псевдокатегория для заправок в общей статистике
export const FUEL_CATEGORY = { id: 'fuel', icon: 'fuel', color: '#1a7fd9' };

export const REMINDER_TYPES = ['osago', 'kasko', 'to', 'oil', 'inspection', 'tires', 'custom'];

// Категории расходов, после которых предлагаем напоминание
export const REMINDER_FROM_CATEGORY = { to: 'to', insurance: 'osago', tires: 'tires' };

export function categoryById(id) {
  if (id === 'fuel') return FUEL_CATEGORY;
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function stationById(id) {
  return STATIONS.find((s) => s.id === id) || STATIONS[STATIONS.length - 1];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function emptyState() {
  return {
    version: DATA_VERSION,
    updatedAt: 0,
    settings: { currency: '₽', distanceUnit: 'km', volumeUnit: 'l' },
    activeCarId: null,
    lastStation: null,
    cars: [],
    fuel: [],
    expenses: [],
    reminders: [],
  };
}

const num = (v) => (v === '' || v == null || !isFinite(Number(v)) ? null : Number(v));
const str = (v) => (v == null ? '' : String(v));

function normalizeCar(c) {
  return {
    id: str(c.id) || uid(),
    brand: str(c.brand),
    model: str(c.model),
    plate: str(c.plate),
    year: num(c.year),
    fuelType: FUEL_TYPES.includes(c.fuelType) ? c.fuelType : 'ai95',
    tank: num(c.tank),
    vin: str(c.vin),
    color: str(c.color),
    mileage: num(c.mileage) ?? 0,
    initialMileage: num(c.initialMileage) ?? num(c.mileage) ?? 0,
    hasPhoto: !!c.hasPhoto,
    createdAt: num(c.createdAt) ?? Date.now(),
  };
}

function normalizeFuel(f) {
  return {
    id: str(f.id) || uid(),
    carId: str(f.carId),
    date: str(f.date),
    mileage: num(f.mileage),
    station: STATIONS.some((s) => s.id === f.station) ? f.station : 'other',
    fuelType: FUEL_TYPES.includes(f.fuelType) ? f.fuelType : 'ai95',
    liters: num(f.liters),
    amount: num(f.amount),
    price: num(f.price),
    full: !!f.full,
    comment: str(f.comment),
  };
}

function normalizeExpense(e) {
  return {
    id: str(e.id) || uid(),
    carId: str(e.carId),
    date: str(e.date),
    mileage: num(e.mileage),
    category: CATEGORIES.some((c) => c.id === e.category) ? e.category : 'other',
    description: str(e.description),
    amount: num(e.amount) ?? 0,
    comment: str(e.comment),
  };
}

function normalizeReminder(r) {
  return {
    id: str(r.id) || uid(),
    carId: str(r.carId),
    type: REMINDER_TYPES.includes(r.type) ? r.type : 'custom',
    title: str(r.title),
    dueDate: str(r.dueDate),
    dueMileage: num(r.dueMileage),
    note: str(r.note),
  };
}

export function normalize(d) {
  const base = emptyState();
  const out = {
    ...base,
    version: DATA_VERSION,
    updatedAt: num(d.updatedAt) ?? 0,
    settings: { ...base.settings, ...(d.settings || {}) },
    activeCarId: d.activeCarId ?? null,
    lastStation: d.lastStation ?? null,
    cars: (d.cars || []).map(normalizeCar),
    fuel: (d.fuel || []).map(normalizeFuel),
    expenses: (d.expenses || []).map(normalizeExpense),
    reminders: (d.reminders || []).map(normalizeReminder),
  };
  if (!out.cars.some((c) => c.id === out.activeCarId)) out.activeCarId = out.cars[0]?.id ?? null;
  return out;
}

// Миграции: ключ — версия, ИЗ которой переводим. Новые версии добавляются сюда.
const MIGRATIONS = {
  0: (d) => ({ ...d }), // данные без версии считаем первой версией
};

export class NewerFormatError extends Error {}

export function migrate(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('bad data');
  let d = { ...raw };
  let v = Number(d.version) || 0;
  if (v > DATA_VERSION) throw new NewerFormatError('newer format');
  while (v < DATA_VERSION) {
    d = MIGRATIONS[v](d);
    v += 1;
    d.version = v;
  }
  return normalize(d);
}
