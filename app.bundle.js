// Собрано автоматически из папки js/ командой node build.mjs — не редактируйте вручную.
(function () {
'use strict';
const __f = {};
const __c = {};
function __req(id) {
  if (!(id in __c)) {
    if (!__f[id]) throw new Error('Нет модуля ' + id);
    __c[id] = __f[id]();
  }
  return __c[id];
}
__f["js/app.js"] = function () {
// Точка входа
const { setLang, t } = __req("js/i18n.js");
const { env, initTelegram, setupApp, cloudAdapter, bindNativeButtons } = __req("js/tg.js");
const store = __req("js/core/store.js");
const { initRouter, refresh } = __req("js/ui/router.js");
const { toast } = __req("js/ui/kit.js");
const { esc } = __req("js/ui/fmt.js");
const config = __req("js/config.js").default;
__req("js/ui/screens/car.js");
__req("js/ui/screens/carForm.js");
__req("js/ui/screens/reminderForm.js");
__req("js/ui/screens/fuel.js");
__req("js/ui/screens/expenses.js");
__req("js/ui/screens/settings.js");

setLang('ru');

function browserStub() {
  const bot = config.BOT_USERNAME;
  document.getElementById('app').innerHTML = `<div class="stub">
    <img src="icon.svg" alt="" width="88" height="88">
    <h1>${esc(t('browser.title'))}</h1>
    <p>${esc(t('browser.text'))}</p>
    ${bot ? `<a class="btn primary wide" href="https://t.me/${encodeURIComponent(bot)}">${esc(t('browser.button'))}</a>` : `<p class="muted small">${esc(t('browser.noBot'))}</p>`}
  </div>`;
}

async function main() {
  const hideSplash = () => document.getElementById('splash')?.classList.add('hide');
  await initTelegram();
  const { inTelegram, isDemo } = env;
  if (!inTelegram && !isDemo) {
    browserStub();
    hideSplash();
    window.__bjReady = true;
    return;
  }
  setupApp();
  document.documentElement.classList.toggle('demo', isDemo);
  bindNativeButtons();
  const adapter = cloudAdapter();
  await store.init(adapter, { onNotice: (k) => toast(t('notices.' + k), 'long') });
  store.subscribe(() => refresh());
  initRouter();
  hideSplash();
  window.__bjReady = true;
  if (inTelegram && !adapter) toast(t('browser.old'), 'long');
}

main().catch((e) => {
  console.error(e);
  if (window.__bjShowError) window.__bjShowError(e.message);
});

return {  };
};

__f["js/i18n.js"] = function () {
const ru = __req("js/i18n/ru.js").default;

const LANGS = { ru };
let dict = ru;

function setLang(code) {
  dict = LANGS[code] || ru;
  document.documentElement.lang = code in LANGS ? code : 'ru';
}

// t('car.mileage'), t('reminders.daysLeft', { n: 3 })
function t(key, params) {
  const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (typeof v !== 'string') return v ?? key;
  return params ? v.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? '')) : v;
}

// Русское склонение: plural(5, 'days') -> 'дней'
function plural(n, key) {
  const forms = dict.plural[key];
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

const locale = () => dict.locale;

return { setLang, t, plural, locale };
};

__f["js/i18n/ru.js"] = function () {
// Все тексты интерфейса. Чтобы добавить язык — скопируйте файл (например, en.js),
// переведите значения и подключите его в js/i18n.js.
const __default = {
  appName: 'Бортжурнал',
  locale: 'ru-RU',

  tabs: { car: 'Моя машина', fuel: 'Заправки', expenses: 'Расходы' },

  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    done: 'Готово',
    close: 'Закрыть',
    yes: 'Да',
    no: 'Нет',
    optional: 'необязательно',
    auto: 'авто',
    empty: '—',
    search: 'Поиск по описанию',
    loading: 'Загрузка…',
    comment: 'Комментарий',
    date: 'Дата',
    mileage: 'Пробег',
    amount: 'Сумма',
    total: 'Итого',
    all: 'Все',
  },

  periods: { month: 'Месяц', year: 'Год', all: 'Всё время', custom: 'Период', from: 'С', to: 'По' },

  browser: {
    title: 'Это приложение работает в Telegram',
    text: 'Откройте «Бортжурнал» в Telegram — там хранятся ваши машины, заправки и расходы.',
    button: 'Открыть в Telegram',
    noBot: 'Укажите имя бота в js/config.js, чтобы здесь появилась кнопка.',
    old: 'Обновите Telegram: этой версии не хватает облачного хранилища. Данные пока сохраняются только на этом устройстве.',
  },

  onboarding: {
    title: 'Добавьте свою машину',
    text: 'Пара полей — и можно записывать заправки и расходы. Остальное заполните позже.',
    start: 'Начать',
  },

  car: {
    addPhoto: 'Добавить фото',
    replacePhoto: 'Заменить фото',
    deletePhoto: 'Удалить фото',
    photoTitle: 'Фото машины',
    updateMileage: 'Обновить пробег',
    edit: 'Редактировать',
    mileage: 'Пробег',
    year: 'Год выпуска',
    fuelType: 'Топливо',
    tank: 'Объём бака',
    vin: 'VIN',
    color: 'Цвет',
    avgConsumption: 'Средний расход',
    spentMonth: 'Потрачено за месяц',
    noData: 'нет данных',
    switchTitle: 'Мои машины',
    addCar: 'Добавить машину',
    newCar: 'Новая машина',
    editCar: 'Данные машины',
    brand: 'Марка',
    model: 'Модель',
    plate: 'Госномер',
    brandPh: 'Например, Kia',
    modelPh: 'Например, Rio',
    platePh: 'А123ВС 77',
    colorPh: 'Например, белый',
    currentMileage: 'Текущий пробег',
    deleteCar: 'Удалить машину',
    deleteCarConfirm: 'Удалить машину «{name}» со всеми заправками, расходами и напоминаниями?',
    deleted: 'Машина удалена',
    saved: 'Сохранено',
    required: 'Укажите марку и пробег',
    mileageTitle: 'Новый пробег',
    mileageHint: 'Сейчас: {value}',
    mileageLess: 'Новый пробег меньше текущего. Всё равно сохранить?',
    photoSaving: 'Сжимаю фото…',
    photoError: 'Не удалось открыть фото',
  },

  fuelTypes: { ai92: 'АИ-92', ai95: 'АИ-95', ai98: 'АИ-98', dt: 'ДТ', gas: 'Газ', ev: 'Электро' },

  reminders: {
    title: 'Напоминания',
    empty: 'Добавьте ОСАГО, ТО или замену масла — подсвечу, когда подойдёт срок.',
    add: 'Добавить',
    new: 'Новое напоминание',
    edit: 'Напоминание',
    type: 'Что напомнить',
    titleField: 'Название',
    titlePh: 'Например, замена тормозных колодок',
    dueDate: 'Дата',
    dueMileage: 'При пробеге',
    note: 'Заметка',
    needDue: 'Укажите дату или пробег',
    needTitle: 'Укажите название',
    overdue: 'Просрочено',
    daysLeft: 'через {n} {days}',
    daysAgo: '{n} {days} назад',
    today: 'сегодня',
    kmLeft: 'через {n} {unit}',
    kmOver: 'на {n} {unit} позже',
    deleteConfirm: 'Удалить напоминание?',
    offer: 'Создать напоминание о следующем {what}?',
    offerWhat: { to: 'ТО', insurance: 'продлении страховки', tires: 'смене шин' },
    types: { osago: 'ОСАГО', kasko: 'КАСКО', to: 'Плановое ТО', oil: 'Замена масла', inspection: 'Техосмотр', tires: 'Смена шин', custom: 'Другое' },
  },

  stats: {
    title: 'Статистика',
    month: 'За месяц',
    allTime: 'За всё время',
    perKm: 'Стоимость 1 {unit}',
    byCategory: 'Расходы по категориям',
    empty: 'Пока нет трат за этот период',
  },

  fuel: {
    title: 'Заправки',
    monthTotal: 'В этом месяце',
    liters: 'Литры',
    price: 'Цена за литр',
    priceShort: 'Цена за л',
    station: 'АЗС',
    fullTank: 'Полный бак',
    fullHint: 'Отмечайте, если заправились до полного — так считается расход',
    fuelType: 'Топливо',
    empty: 'Здесь будут ваши заправки. Нажмите «+», чтобы добавить первую.',
    emptyFilter: 'Ничего не найдено. Попробуйте изменить фильтры.',
    new: 'Новая заправка',
    edit: 'Заправка',
    view: 'Заправка',
    consumption: 'Расход',
    calcHint: 'Введите любые два значения — третье посчитается',
    required: 'Укажите литры и сумму',
    deleteConfirm: 'Удалить эту заправку?',
    list: 'Список',
    charts: 'Графики',
    priceChart: 'Цена за литр по месяцам',
    consChart: 'Расход по месяцам',
    stations: 'По сетям АЗС',
    times: '{n} {times}',
    avgPrice: 'ср. {price}',
    noCharts: 'Графики появятся после нескольких заправок. Для расхода отмечайте «Полный бак».',
    allStations: 'Все АЗС',
  },

  expenses: {
    title: 'Расходы',
    total: 'За период',
    category: 'Категория',
    description: 'Описание',
    descriptionPh: 'Например, замена масла и фильтров',
    empty: 'Здесь будут расходы на машину: ТО, мойка, страховка, штрафы…',
    emptyFilter: 'Ничего не найдено. Попробуйте изменить фильтры.',
    new: 'Новый расход',
    edit: 'Расход',
    view: 'Расход',
    required: 'Укажите сумму',
    deleteConfirm: 'Удалить этот расход?',
    allCategories: 'Все',
  },

  categories: {
    fuel: 'Топливо', to: 'ТО', repair: 'Ремонт', parts: 'Запчасти', tires: 'Шины', wash: 'Мойка',
    insurance: 'Страховка', tax: 'Налог', fines: 'Штрафы', parking: 'Парковка', tolls: 'Платные дороги',
    accessories: 'Аксессуары', other: 'Другое',
  },

  settings: {
    title: 'Настройки',
    currency: 'Валюта',
    units: 'Единицы',
    distance: 'Расстояние',
    volume: 'Объём',
    km: 'км', mi: 'миль',
    l: 'л', gal: 'гал',
    data: 'Данные',
    exportJSON: 'Экспорт в JSON',
    exportJSONHint: 'Полная копия с фото — для восстановления',
    exportCSV: 'Экспорт в CSV',
    exportCSVHint: 'Таблица для Excel',
    copyJSON: 'Скопировать JSON',
    copied: 'Скопировано в буфер обмена',
    copyFail: 'Не удалось скопировать',
    importJSON: 'Импорт из JSON',
    importHint: 'Заменит все текущие данные',
    importPaste: 'Вставить текст JSON',
    importPastePh: 'Вставьте сюда содержимое файла экспорта',
    importConfirm: 'Импорт заменит все текущие данные: машины, заправки, расходы. Продолжить?',
    importDone: 'Данные восстановлены',
    importError: 'Не получилось прочитать файл. Нужен JSON, сохранённый из «Бортжурнала».',
    importNewer: 'Файл создан более новой версией приложения. Обновите приложение.',
    exportFail: 'Не удалось сохранить файл. Используйте «Скопировать JSON».',
    wipe: 'Удалить все данные',
    wipeConfirm: 'Удалить все машины, заправки, расходы и фото? Это нельзя отменить.',
    wipeConfirm2: 'Точно удалить всё? Данные будут удалены и из облака Telegram.',
    wiped: 'Все данные удалены',
    storage: 'Хранилище',
    cloudUsage: 'Облако Telegram: занято {used} из {max} ячеек',
    cloudOff: 'Облако недоступно — данные хранятся только на этом устройстве',
    sync: { ok: 'Синхронизировано', syncing: 'Синхронизация…', error: 'Нет связи — сохраню, когда появится интернет', quota: 'В облаке закончилось место', newer: 'В облаке данные новой версии — обновите приложение', local: 'Только на устройстве' },
    about: 'О приложении',
    aboutText: 'Данные хранятся в вашем облаке Telegram и видны только вам.',
    version: 'Версия {v}',
  },

  notices: {
    photosLocal: 'Фото сохранено только на этом устройстве: в облаке Telegram не хватает места.',
    quota: 'В облаке Telegram закончилось место. Новые записи сохраняются на устройстве. Удалите старые записи или фото.',
    newer: 'Данные в облаке сохранены более новой версией. Обновите приложение, чтобы не потерять записи.',
    localFull: 'Память устройства переполнена — запись может не сохраниться.',
  },

  plural: {
    days: ['день', 'дня', 'дней'],
    times: ['раз', 'раза', 'раз'],
  },

  months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  monthsShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
};

return { default: __default };
};

__f["js/tg.js"] = function () {
// Обёртка над Telegram.WebApp с запасным режимом для отладки в браузере.
const { memoryAdapter, telegramAdapter } = __req("js/core/cloud.js");
const { hasLaunchParams, loadOfficialSDK, installBridge } = __req("js/tgbridge.js");

let W = null;
const params = new URLSearchParams(location.search);

// inTelegram — открыто внутри Telegram; isDemo — проверка в обычном браузере (localhost, файл с диска, ?demo);
// bridge — официальный скрипт telegram.org не загрузился, работаем через встроенную связь
const env = { inTelegram: false, isDemo: false, bridge: false };

async function initTelegram() {
  if (window.Telegram?.WebApp?.initData) {
    W = window.Telegram.WebApp;
  } else if (hasLaunchParams()) {
    const ok = await loadOfficialSDK(4000);
    W = ok && window.Telegram?.WebApp ? window.Telegram.WebApp : installBridge();
    env.bridge = !!W.isBridge;
  }
  env.inTelegram = !!(W && (W.initData || (W.platform && W.platform !== 'unknown')));
  const local = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname) || params.has('demo');
  env.isDemo = !env.inTelegram && local;
  return env;
}

const atLeast = (v) => !!(W && W.isVersionAtLeast && W.isVersionAtLeast(v));
const safe = (fn) => { try { return fn(); } catch (e) { console.warn(e); return undefined; } };

const COLORS = { bg: '#f2f4f7', surface: '#ffffff', accent: '#1479c9' };

function setupApp() {
  if (!env.inTelegram) return;
  safe(() => W.ready());
  safe(() => W.expand());
  if (atLeast('6.1')) {
    safe(() => W.setHeaderColor(COLORS.bg));
    safe(() => W.setBackgroundColor(COLORS.bg));
  }
  if (atLeast('7.10')) safe(() => W.setBottomBarColor(COLORS.surface));
  if (atLeast('7.7')) safe(() => W.disableVerticalSwipes());
  if (atLeast('8.0') && ['ios', 'android'].includes(W.platform)) safe(() => W.requestFullscreen());
  document.documentElement.classList.add('tg', 'tg-' + (W.platform || 'web'));
}

function cloudAdapter() {
  if (env.inTelegram) {
    if (W.CloudStorage && atLeast('6.9')) return telegramAdapter(W.CloudStorage);
    return null;
  }
  if (env.isDemo) {
    // имитация CloudStorage в localStorage браузера
    const KEY = 'bortjournal.demoCloud';
    let init = {};
    try { init = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { /* ignore */ }
    return memoryAdapter(init, (data) => {
      try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(data))); } catch { /* ignore */ }
    });
  }
  return null;
}

const userName = () => W?.initDataUnsafe?.user?.first_name || '';

// ---------- Вибрация ----------
const haptic = {
  success: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.notificationOccurred('success')),
  warning: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.notificationOccurred('warning')),
  error: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.notificationOccurred('error')),
  tap: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.impactOccurred('light')),
  select: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.selectionChanged()),
};

// ---------- Кнопка «Назад» ----------
let backHandler = null;
const mockBack = () => document.getElementById('mock-back');

const backButton = {
  show(handler) {
    backHandler = handler;
    if (env.inTelegram && atLeast('6.1')) safe(() => W.BackButton.show());
    else if (mockBack()) mockBack().hidden = false;
  },
  hide() {
    backHandler = null;
    if (env.inTelegram && atLeast('6.1')) safe(() => W.BackButton.hide());
    else if (mockBack()) mockBack().hidden = true;
  },
};

// ---------- Главная кнопка (MainButton) ----------
let mainHandler = null;
const mockMain = () => document.getElementById('mock-main');

const mainButton = {
  set({ text, onClick, enabled = true }) {
    mainHandler = onClick;
    if (env.inTelegram) {
      safe(() => W.MainButton.setParams({ text, color: COLORS.accent, text_color: '#ffffff', is_active: enabled, is_visible: true }));
    } else if (mockMain()) {
      const b = mockMain();
      b.textContent = text;
      b.disabled = !enabled;
      b.hidden = false;
    }
    document.documentElement.classList.add('has-main');
  },
  progress(on) {
    if (env.inTelegram) safe(() => (on ? W.MainButton.showProgress(false) : W.MainButton.hideProgress()));
    else if (mockMain()) mockMain().classList.toggle('loading', on);
  },
  hide() {
    mainHandler = null;
    if (env.inTelegram) safe(() => W.MainButton.hide());
    else if (mockMain()) mockMain().hidden = true;
    document.documentElement.classList.remove('has-main');
  },
};

function bindNativeButtons() {
  const onBack = () => backHandler && backHandler();
  const onMain = () => mainHandler && mainHandler();
  if (env.inTelegram) {
    safe(() => W.BackButton.onClick(onBack));
    safe(() => W.MainButton.onClick(onMain));
  }
  mockBack()?.addEventListener('click', onBack);
  mockMain()?.addEventListener('click', onMain);
}

// ---------- Системные диалоги ----------
function nativeConfirm(message) {
  if (env.inTelegram && atLeast('6.2')) {
    return new Promise((resolve) => {
      try {
        W.showConfirm(message, (ok) => resolve(!!ok));
      } catch {
        resolve(window.confirm(message));
      }
    });
  }
  return null; // пусть интерфейс покажет свой диалог
}

function openTelegramLink(url) {
  if (env.inTelegram) safe(() => W.openTelegramLink(url));
  else location.href = url;
}

return { env, initTelegram, COLORS, setupApp, cloudAdapter, userName, haptic, backButton, mainButton, bindNativeButtons, nativeConfirm, openTelegramLink };
};

__f["js/core/cloud.js"] = function () {
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

const { compress, decompress, chunk, hash } = __req("js/core/codec.js");
const { DATA_VERSION } = __req("js/core/model.js");

const LIMITS = { maxKeys: 1024, maxValue: 4096, chunk: 4000 };
const MANIFEST = 'manifest';
const BATCH = 50;

class QuotaError extends Error {
  constructor(msg, info) {
    super(msg);
    this.name = 'QuotaError';
    this.info = info;
  }
}

const keyOf = (doc, h, i) => `${doc}-${h}-${i}`;
const keysOf = (doc, e) => Array.from({ length: e.n }, (_, i) => keyOf(doc, e.h, i));

function manifestKeys(manifest) {
  if (!manifest) return [];
  return Object.entries(manifest.docs).flatMap(([doc, e]) => keysOf(doc, e));
}

function usage(manifest) {
  return { keys: manifest ? manifestKeys(manifest).length + 1 : 0, maxKeys: LIMITS.maxKeys };
}

// Разбиваем состояние на документы (строки, готовые к записи)
async function buildDocs(state, photos = {}) {
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

async function saveCloud(adapter, state, photos, prev) {
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

async function loadManifest(adapter) {
  const raw = (await adapter.get([MANIFEST]))[MANIFEST];
  if (!raw) return null;
  return JSON.parse(await decompress(raw));
}

// Загружает данные (без фото). Возвращает { state, manifest } или null
async function loadCloud(adapter) {
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

async function loadPhoto(adapter, manifest, carId) {
  const e = manifest?.docs?.['p' + carId];
  if (!e) return null;
  return (await readDoc(adapter, 'p' + carId, e)).slice(1);
}

// Удаляет ключи, на которые не ссылается manifest (остатки прерванных записей)
async function sweepOrphans(adapter, manifest) {
  const keep = new Set([MANIFEST, ...manifestKeys(manifest)]);
  const orphans = (await adapter.keys()).filter((k) => !keep.has(k));
  if (orphans.length) await removeBatched(adapter, orphans);
  return orphans.length;
}

async function clearCloud(adapter) {
  const keys = await adapter.keys();
  if (keys.length) await removeBatched(adapter, keys);
}

// ---------- Адаптеры ----------

function telegramAdapter(cs) {
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
function memoryAdapter(initial = {}, onChange) {
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

return { LIMITS, QuotaError, manifestKeys, usage, buildDocs, saveCloud, loadManifest, loadCloud, loadPhoto, sweepOrphans, clearCloud, telegramAdapter, memoryAdapter };
};

__f["js/core/codec.js"] = function () {
// Сжатие, хеш и разбивка строк на части для Telegram CloudStorage.

function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + str.length.toString(36);
}

function bytesToB64(bytes) {
  let s = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  return btoa(s);
}

function b64ToBytes(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function pipe(bytes, stream) {
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(buf);
}

// 'D' + base64(deflate) — если браузер умеет сжимать, иначе 'J' + исходный JSON
async function compress(str) {
  if (typeof CompressionStream === 'undefined') return 'J' + str;
  const out = await pipe(new TextEncoder().encode(str), new CompressionStream('deflate-raw'));
  return 'D' + bytesToB64(out);
}

async function decompress(s) {
  if (s[0] === 'J') return s.slice(1);
  if (s[0] === 'D') {
    const out = await pipe(b64ToBytes(s.slice(1)), new DecompressionStream('deflate-raw'));
    return new TextDecoder().decode(out);
  }
  throw new Error('unknown encoding');
}

function chunk(str, size) {
  if (!str.length) return [''];
  const parts = [];
  for (let i = 0; i < str.length; i += size) parts.push(str.slice(i, i + size));
  return parts;
}

return { hash, bytesToB64, b64ToBytes, compress, decompress, chunk };
};

__f["js/core/model.js"] = function () {
// Модель данных, справочники и миграции формата.

const DATA_VERSION = 1;

const FUEL_TYPES = ['ai92', 'ai95', 'ai98', 'dt', 'gas', 'ev'];

// Иконки сетей — нейтральные значки с инициалами (не фирменные логотипы).
const STATIONS = [
  { id: 'neftm', name: 'Нефтьмагистраль', short: 'НМ', color: '#2a5caa' },
  { id: 'lukoil', name: 'Лукойл', short: 'Л', color: '#d6332a' },
  { id: 'rosneft', name: 'Роснефть', short: 'Р', color: '#f0b323', fg: '#1d1d1f' },
  { id: 'teboil', name: 'Teboil', short: 'T', color: '#1677c8' },
  { id: 'tatneft', name: 'Татнефть', short: 'ТН', color: '#1f8a4c' },
  { id: 'other', name: 'Другая', short: '•', color: '#8a94a6' },
];

const CATEGORIES = [
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
const FUEL_CATEGORY = { id: 'fuel', icon: 'fuel', color: '#1a7fd9' };

const REMINDER_TYPES = ['osago', 'kasko', 'to', 'oil', 'inspection', 'tires', 'custom'];

// Категории расходов, после которых предлагаем напоминание
const REMINDER_FROM_CATEGORY = { to: 'to', insurance: 'osago', tires: 'tires' };

function categoryById(id) {
  if (id === 'fuel') return FUEL_CATEGORY;
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

function stationById(id) {
  return STATIONS.find((s) => s.id === id) || STATIONS[STATIONS.length - 1];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function emptyState() {
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

function normalize(d) {
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

class NewerFormatError extends Error {}

function migrate(raw) {
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

return { DATA_VERSION, FUEL_TYPES, STATIONS, CATEGORIES, FUEL_CATEGORY, REMINDER_TYPES, REMINDER_FROM_CATEGORY, categoryById, stationById, uid, emptyState, normalize, NewerFormatError, migrate };
};

__f["js/tgbridge.js"] = function () {
// Связь с Telegram без внешнего скрипта telegram.org.
// Используется, если официальный telegram-web-app.js не загрузился (например, сайт недоступен).
// Реализует только то, что нужно приложению, по протоколу Mini Apps (postEvent / receiveEvent).

const LP_KEY = 'bortjournal.tglp';

function launchParams() {
  const read = (s) => new URLSearchParams(String(s || '').replace(/^#/, ''));
  let p = read(location.hash);
  if (p.get('tgWebAppData') || p.get('tgWebAppPlatform')) {
    try { sessionStorage.setItem(LP_KEY, location.hash); } catch { /* ignore */ }
  } else {
    try { p = read(sessionStorage.getItem(LP_KEY)); } catch { /* ignore */ }
  }
  return p;
}

const hasLaunchParams = () => {
  const p = launchParams();
  return !!(p.get('tgWebAppData') || p.get('tgWebAppPlatform'));
};

function loadOfficialSDK(timeout = 4000) {
  return new Promise((resolve) => {
    if (window.Telegram?.WebApp) return resolve(true);
    const s = document.createElement('script');
    let timer = null;
    const done = (ok) => {
      clearTimeout(timer);
      resolve(ok);
    };
    s.src = 'https://telegram.org/js/telegram-web-app.js';
    s.async = true;
    s.onload = () => done(!!window.Telegram?.WebApp);
    s.onerror = () => done(false);
    timer = setTimeout(() => done(false), timeout);
    document.head.append(s);
  });
}

function versionAtLeast(have, need) {
  const a = String(have).split('.').map(Number);
  const b = String(need).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x !== y) return x > y;
  }
  return true;
}

function installBridge() {
  const p = launchParams();
  const initData = p.get('tgWebAppData') || '';
  const platform = p.get('tgWebAppPlatform') || 'unknown';
  const version = p.get('tgWebAppVersion') || '6.0';
  const initDataUnsafe = {};
  try {
    const user = new URLSearchParams(initData).get('user');
    if (user) initDataUnsafe.user = JSON.parse(user);
  } catch { /* ignore */ }

  const listeners = {};
  const on = (type, fn) => (listeners[type] = listeners[type] || []).push(fn);
  const receive = (type, data) => (listeners[type] || []).slice().forEach((fn) => {
    try { fn(data); } catch (e) { console.warn(e); }
  });
  const post = (type, data) => {
    try {
      if (window.TelegramWebviewProxy) window.TelegramWebviewProxy.postEvent(type, JSON.stringify(data));
      else if (window.external && 'notify' in window.external) window.external.notify(JSON.stringify({ eventType: type, eventData: data }));
      else if (window.parent !== window) window.parent.postMessage(JSON.stringify({ eventType: type, eventData: data }), '*');
    } catch (e) {
      console.warn('postEvent', type, e);
    }
  };
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent) return;
    let d;
    try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
    if (d && d.eventType) receive(d.eventType, d.eventData);
  });

  // Безопасные зоны экрана (полноэкранный режим)
  const setInsets = (prefix, d) => {
    if (!d) return;
    for (const side of ['top', 'bottom', 'left', 'right']) {
      document.documentElement.style.setProperty(`--tg-${prefix}-inset-${side}`, (Number(d[side]) || 0) + 'px');
    }
  };
  on('safe_area_changed', (d) => setInsets('safe-area', d));
  on('content_safe_area_changed', (d) => setInsets('content-safe-area', d));

  const atLeast = (v) => versionAtLeast(version, v);

  // Вызовы CloudStorage через custom methods
  const pending = {};
  on('custom_method_invoked', (d) => {
    const cb = pending[d?.req_id];
    if (!cb) return;
    delete pending[d.req_id];
    cb(d.error || null, d.result);
  });
  const invoke = (method, params, cb) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const timer = setTimeout(() => {
      if (pending[id]) {
        delete pending[id];
        cb('TIMEOUT');
      }
    }, 10000);
    pending[id] = (err, res) => {
      clearTimeout(timer);
      cb(err, res);
    };
    post('web_app_invoke_custom_method', { req_id: id, method, params });
  };

  function button(eventType, pressedEvent, full) {
    const state = { is_visible: false, is_active: true, is_progress_visible: false, text: '', color: '#2481cc', text_color: '#ffffff' };
    const handlers = [];
    on(pressedEvent, () => handlers.slice().forEach((h) => h()));
    const sync = () => post(eventType, full ? { ...state } : { is_visible: state.is_visible });
    return {
      get isVisible() { return state.is_visible; },
      setParams(prm) {
        if ('text' in prm) state.text = prm.text;
        if ('color' in prm) state.color = prm.color;
        if ('text_color' in prm) state.text_color = prm.text_color;
        if ('is_active' in prm) state.is_active = prm.is_active;
        if ('is_visible' in prm) state.is_visible = prm.is_visible;
        sync();
        return this;
      },
      show() { state.is_visible = true; sync(); return this; },
      hide() { state.is_visible = false; sync(); return this; },
      showProgress() { state.is_progress_visible = true; sync(); return this; },
      hideProgress() { state.is_progress_visible = false; sync(); return this; },
      onClick(fn) { handlers.push(fn); return this; },
      offClick(fn) { const i = handlers.indexOf(fn); if (i >= 0) handlers.splice(i, 1); return this; },
    };
  }

  const WebApp = {
    initData,
    initDataUnsafe,
    platform,
    version,
    isBridge: true,
    isVersionAtLeast: atLeast,
    ready: () => post('web_app_ready'),
    expand: () => post('web_app_expand'),
    requestFullscreen: () => post('web_app_request_fullscreen'),
    setHeaderColor: (color) => post('web_app_set_header_color', { color }),
    setBackgroundColor: (color) => post('web_app_set_background_color', { color }),
    setBottomBarColor: (color) => post('web_app_set_bottom_bar_color', { color }),
    disableVerticalSwipes: () => post('web_app_setup_swipe_behavior', { allow_vertical_swipe: false }),
    openTelegramLink: (url) => post('web_app_open_tg_link', { path_full: String(url).replace(/^https?:\/\/t\.me/, '') }),
    showConfirm(message, cb) {
      const handler = (d) => {
        const list = listeners.popup_closed;
        list.splice(list.indexOf(handler), 1);
        cb && cb(d?.button_id === 'ok');
      };
      on('popup_closed', handler);
      post('web_app_open_popup', { title: '', message: String(message).slice(0, 256), buttons: [{ id: 'ok', type: 'ok', text: '' }, { id: 'cancel', type: 'cancel', text: '' }] });
    },
    HapticFeedback: {
      impactOccurred: (style) => post('web_app_trigger_haptic_feedback', { type: 'impact', impact_style: style }),
      notificationOccurred: (kind) => post('web_app_trigger_haptic_feedback', { type: 'notification', notification_type: kind }),
      selectionChanged: () => post('web_app_trigger_haptic_feedback', { type: 'selection_change' }),
    },
    MainButton: button('web_app_setup_main_button', 'main_button_pressed', true),
    BackButton: button('web_app_setup_back_button', 'back_button_pressed', false),
    CloudStorage: {
      setItem: (key, value, cb) => invoke('saveStorageValue', { key, value }, (e, r) => cb && cb(e, !e && !!r)),
      getItem: (key, cb) => invoke('getStorageValues', { keys: [key] }, (e, r) => cb && cb(e, r ? r[key] : '')),
      getItems: (keys, cb) => invoke('getStorageValues', { keys }, (e, r) => cb && cb(e, r || {})),
      removeItems: (keys, cb) => invoke('deleteStorageValues', { keys }, (e, r) => cb && cb(e, !e && !!r)),
      getKeys: (cb) => invoke('getStorageKeys', {}, (e, r) => cb && cb(e, r || [])),
    },
  };

  const T = { WebApp, WebView: { receiveEvent: receive, postEvent: post, onEvent: on }, Utils: {} };
  // Если официальный скрипт всё-таки догрузится позже, он не должен перехватить события
  try {
    Object.defineProperty(window, 'Telegram', { value: Object.freeze(T), writable: false, configurable: false });
  } catch {
    window.Telegram = T;
  }
  if (atLeast('8.0')) {
    post('web_app_request_safe_area');
    post('web_app_request_content_safe_area');
  }
  return WebApp;
}

return { launchParams, hasLaunchParams, loadOfficialSDK, installBridge };
};

__f["js/core/store.js"] = function () {
// Состояние приложения: localStorage для мгновенного старта, CloudStorage для синхронизации.
const { emptyState, migrate, NewerFormatError } = __req("js/core/model.js");
const cloud = __req("js/core/cloud.js");
const { photoDB } = __req("js/core/photo.js");

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

const sync = { status: 'local', photosLocalOnly: false };

const getState = () => state;
const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
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
async function init(cloudAdapter, h = {}) {
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

function flush() {
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

function retrySync() {
  if (adapter && isDirty()) push();
}

// ---------- Изменения ----------

function update(fn) {
  fn(state);
  state.updatedAt = Date.now();
  saveLocal();
  setDirty(true);
  emit();
  schedule();
}

const getPhoto = (carId) => photos[carId] || null;
const allPhotos = () => ({ ...photos });

async function setPhoto(carId, b64) {
  photos[carId] = b64;
  await photoDB.set(carId, b64);
  update((s) => {
    const c = s.cars.find((x) => x.id === carId);
    if (c) c.hasPhoto = true;
  });
}

async function removePhoto(carId) {
  delete photos[carId];
  await photoDB.remove(carId);
  update((s) => {
    const c = s.cars.find((x) => x.id === carId);
    if (c) c.hasPhoto = false;
  });
}

async function replaceAll(newState, newPhotos = {}) {
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

async function wipeAll() {
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

const usage = () => cloud.usage(manifest);
const hasCloud = () => !!adapter;

// ---------- Выборки ----------

const activeCar = () => state.cars.find((c) => c.id === state.activeCarId) || state.cars[0] || null;
const carFuel = (id = state.activeCarId) => state.fuel.filter((f) => f.carId === id);
const carExpenses = (id = state.activeCarId) => state.expenses.filter((e) => e.carId === id);
const carReminders = (id = state.activeCarId) => state.reminders.filter((r) => r.carId === id);

// Пробег машины растёт автоматически, если в записи указан больший
function bumpMileage(s, carId, mileage) {
  const c = s.cars.find((x) => x.id === carId);
  if (c && mileage != null && mileage > (c.mileage ?? 0)) c.mileage = mileage;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', retrySync);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

return { sync, getState, subscribe, init, flush, retrySync, update, getPhoto, allPhotos, setPhoto, removePhoto, replaceAll, wipeAll, usage, hasCloud, activeCar, carFuel, carExpenses, carReminders, bumpMileage };
};

__f["js/core/photo.js"] = function () {
// Фото машины: сжатие на устройстве и хранение в IndexedDB.

const DB_NAME = 'bortjournal';
const STORE = 'photos';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const timer = setTimeout(() => reject(new Error('indexedDB timeout')), 2500);
    const req = indexedDB.open(DB_NAME, 1);
    req.onsuccess = () => (clearTimeout(timer), resolve(req.result));
    req.onerror = () => (clearTimeout(timer), reject(req.error));
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
  });
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
  });
}

// В памяти тоже держим копию — если IndexedDB недоступна, фото живёт до перезапуска
const mem = new Map();

const photoDB = {
  async get(carId) {
    if (mem.has(carId)) return mem.get(carId);
    try {
      const v = await tx('readonly', (s) => s.get(carId));
      if (v) mem.set(carId, v);
      return v || null;
    } catch {
      return null;
    }
  },
  async set(carId, b64) {
    mem.set(carId, b64);
    try { await tx('readwrite', (s) => s.put(b64, carId)); } catch { /* только память */ }
  },
  async remove(carId) {
    mem.delete(carId);
    try { await tx('readwrite', (s) => s.delete(carId)); } catch { /* ignore */ }
  },
  async clear() {
    mem.clear();
    try { await tx('readwrite', (s) => s.clear()); } catch { /* ignore */ }
  },
  async all(ids) {
    const out = {};
    for (const id of ids) {
      const v = await this.get(id);
      if (v) out[id] = v;
    }
    return out;
  },
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

// Уменьшает до 800 px по длинной стороне и подбирает качество JPEG до ~75 КБ.
// Возвращает base64 без префикса data:.
async function compressPhoto(file, { maxSide = 800, maxBytes = 78 * 1024 } = {}) {
  const { img, url } = await loadImage(file);
  try {
    let scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const q of [0.82, 0.74, 0.66, 0.58, 0.5]) {
        const b64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
        if (b64.length * 0.75 <= maxBytes) return b64;
      }
      scale *= 0.8;
    }
    return canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

const photoURL = (b64) => (b64 ? 'data:image/jpeg;base64,' + b64 : '');

return { photoDB, compressPhoto, photoURL };
};

__f["js/ui/router.js"] = function () {
// Навигация: три вкладки + стек вложенных экранов с кнопкой «Назад» Telegram.
const { backButton, mainButton, haptic } = __req("js/tg.js");
const { getState } = __req("js/core/store.js");
const { t } = __req("js/i18n.js");
const { icon } = __req("js/ui/icons.js");

const screens = {};
const stack = [];
const TABS = [
  { id: 'car', icon: 'car' },
  { id: 'fuel', icon: 'fuel' },
  { id: 'expenses', icon: 'wallet' },
];
let tab = 'car';
const scrollPos = {};
let cleanup = null;
let current = null;

const register = (name, screen) => (screens[name] = screen);
const currentTab = () => tab;

function rootName() {
  return getState().cars.length ? tab : 'onboarding';
}

function go(tabId) {
  if (tabId === tab && !stack.length) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  scrollPos[tab] = window.scrollY;
  stack.length = 0;
  tab = tabId;
  haptic.select();
  render('fade');
}

function push(name, params = {}) {
  if (!stack.length) scrollPos[tab] = window.scrollY;
  stack.push({ name, params });
  render('fwd');
}

function pop() {
  stack.pop();
  render('back');
}

function replaceTop(name, params = {}) {
  stack.pop();
  stack.push({ name, params });
  render('fwd');
}

function popToRoot() {
  stack.length = 0;
  render('back');
}

// Перерисовка при изменении данных — только «живые» экраны, формы не трогаем
function refresh() {
  if (!current) return render('');
  const scr = screens[current.name];
  const rootChanged = !stack.length && current.name !== rootName();
  if (rootChanged || scr.live) render('', { keepScroll: !rootChanged });
}

function render(anim, { keepScroll = false } = {}) {
  const view = document.getElementById('view');
  const y = window.scrollY;
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  mainButton.hide();

  const top = stack[stack.length - 1];
  const entry = top || { name: rootName(), params: {} };
  if (!top) tab = getState().cars.length ? tab : 'car';
  const scr = screens[entry.name];
  current = entry;

  const el = document.createElement('div');
  el.className = 'screen' + (anim ? ' enter-' + anim : '');
  el.innerHTML = scr.render(entry.params);
  view.replaceChildren(el);
  cleanup = scr.mount ? scr.mount(el, entry.params) : null;

  const showTabs = !top && getState().cars.length > 0;
  renderTabbar(showTabs);
  document.documentElement.classList.toggle('nested', !!top);

  if (top) backButton.show(() => pop());
  else backButton.hide();

  if (keepScroll) window.scrollTo(0, y);
  else window.scrollTo(0, top ? 0 : scrollPos[tab] || 0);
}

function renderTabbar(show) {
  const bar = document.getElementById('tabbar');
  bar.hidden = !show;
  if (!show) return;
  bar.innerHTML = TABS.map(
    (x) => `<button class="tab ${x.id === tab ? 'active' : ''}" data-tab="${x.id}">${icon(x.icon)}<span>${t('tabs.' + x.id)}</span></button>`,
  ).join('');
}

function initRouter() {
  document.getElementById('tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) go(b.dataset.tab);
  });
  render('');
}

return { register, currentTab, go, push, pop, replaceTop, popToRoot, refresh, initRouter };
};

__f["js/ui/icons.js"] = function () {
// Простые линейные иконки 24×24.
const P = {
  car: '<path d="M3 13l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5v4a1 1 0 0 1-1 1h-1.5M5.5 18H4a1 1 0 0 1-1-1v-4h18M9.5 18h5"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/>',
  fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.8a2 2 0 0 0-.6-1.4L18 5"/>',
  wallet: '<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v3M21 16v3a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M17 12a2 2 0 0 0 0 4h4v-4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  camera: '<path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z"/><circle cx="12" cy="13" r="3.5"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  hammer: '<path d="m15 12-8.4 8.4a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 15 22 10.6M20 12.6 13.4 6a3 3 0 0 0-4.2 0L8 7.2l1.4 1.4"/>',
  cog: '<path d="M12 2.5 20.2 7v10L12 21.5 3.8 17V7z"/><circle cx="12" cy="12" r="3.5"/>',
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/>',
  droplets: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  landmark: '<path d="M3 21h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 3l8 5H4z"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  gauge: '<path d="m12 14 4-4M3.3 19a10 10 0 1 1 17.4 0"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  cloud: '<path d="M17.5 19H8a6 6 0 1 1 5.7-8h1.8a4.5 4.5 0 0 1 2 8.5z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/><path d="M12 21a2.5 2.5 0 0 1 0-5h2a3 3 0 0 0 3-3"/>',
  tank: '<rect x="4" y="6" width="16" height="14" rx="3"/><path d="M8 6V4h8v2M4 13h16"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.3A6 6 0 1 1 9.3 15.5"/>',
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  steering: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3.5 10.5 10 12M20.5 10.5 14 12M12 14v7"/>',
};

function icon(name, cls = '') {
  return `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.more}</svg>`;
}

return { icon };
};

__f["js/ui/kit.js"] = function () {
// Общие элементы интерфейса: тосты, нижние шторки, подтверждения, поля форм.
const { t } = __req("js/i18n.js");
const { esc, attr } = __req("js/ui/fmt.js");
const { icon } = __req("js/ui/icons.js");
const { nativeConfirm, haptic } = __req("js/tg.js");
const { parseNum } = __req("js/core/calc.js");

// ---------- Тосты ----------
function toast(message, type = '') {
  const host = document.getElementById('toasts');
  host.querySelectorAll('.toast:not(.long)').forEach((n) => n.remove());
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  host.append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, type === 'long' ? 5500 : 2600);
}

// ---------- Нижняя шторка ----------
function sheet({ title = '', body = '', onMount } = {}) {
  const host = document.getElementById('overlay');
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-bg"></div><div class="sheet" role="dialog">
    <div class="sheet-grip"></div>
    ${title ? `<div class="sheet-title">${esc(title)}</div>` : ''}
    <div class="sheet-body">${body}</div></div>`;
  host.append(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  let closed = false;
  let onClose = null;
  const close = (v) => {
    if (closed) return;
    closed = true;
    wrap.classList.remove('open');
    setTimeout(() => wrap.remove(), 250);
    onClose?.(v);
  };
  wrap.querySelector('.sheet-bg').addEventListener('click', () => close(null));
  const api = { el: wrap.querySelector('.sheet'), close, onClose: (fn) => (onClose = fn) };
  onMount?.(api);
  return api;
}

// actions: [{ id, label, icon?, danger?, html? }] → Promise<id|null>
function actionSheet({ title, actions }) {
  return new Promise((resolve) => {
    const body = `<div class="menu">${actions
      .map((a) => `<button class="menu-item ${a.danger ? 'danger' : ''} ${a.active ? 'active' : ''}" data-id="${attr(a.id)}">
        ${a.html || (a.icon ? icon(a.icon) : '')}<span>${esc(a.label)}</span>${a.active ? icon('check', 'tail') : ''}</button>`)
      .join('')}<button class="menu-item cancel" data-id="">${esc(t('common.cancel'))}</button></div>`;
    const s = sheet({ title, body });
    s.onClose(resolve);
    s.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (b) s.close(b.dataset.id || null);
    });
  });
}

async function confirmDialog(message, { okText = t('common.delete'), danger = true } = {}) {
  haptic.warning();
  const native = nativeConfirm(message);
  if (native) return native;
  return new Promise((resolve) => {
    const s = sheet({
      body: `<p class="confirm-text">${esc(message)}</p>
        <div class="confirm-actions"><button class="btn secondary" data-v="0">${esc(t('common.cancel'))}</button>
        <button class="btn ${danger ? 'danger' : 'primary'}" data-v="1">${esc(okText)}</button></div>`,
    });
    s.onClose((v) => resolve(!!v));
    s.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (b) s.close(b.dataset.v === '1');
    });
  });
}

// ---------- Поля форм ----------
function field(label, control, { hint = '', tag = '', cls = '' } = {}) {
  return `<label class="field ${cls}"><span class="field-label">${esc(label)}${tag ? ` <em class="tag">${esc(tag)}</em>` : ''}</span>${control}${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}</label>`;
}

const textInput = (name, value = '', { placeholder = '', maxlength = 80, upper = false } = {}) =>
  `<input class="input" type="text" name="${name}" value="${attr(value)}" placeholder="${attr(placeholder)}" maxlength="${maxlength}" autocomplete="off" ${upper ? 'autocapitalize="characters"' : ''}>`;

const numInput = (name, value, { placeholder = '', suffix = '', decimal = true } = {}) =>
  `<div class="input-wrap"><input class="input num" type="text" name="${name}" value="${value == null ? '' : attr(String(value).replace('.', ','))}"
    inputmode="${decimal ? 'decimal' : 'numeric'}" placeholder="${attr(placeholder)}" autocomplete="off" data-num="${decimal ? 'dec' : 'int'}">${suffix ? `<span class="suffix">${esc(suffix)}</span>` : ''}</div>`;

const dateInput = (name, value) => `<input class="input" type="date" name="${name}" value="${attr(value)}">`;

const textArea = (name, value = '', placeholder = '') =>
  `<textarea class="input area" name="${name}" rows="2" maxlength="500" placeholder="${attr(placeholder)}">${esc(value)}</textarea>`;

// options: [{ value, label, html? }]
const chips = (name, options, selected, { cls = '' } = {}) =>
  `<div class="chips ${cls}" data-chips="${name}">${options
    .map((o) => `<button type="button" class="chip ${o.value === selected ? 'active' : ''}" data-value="${attr(o.value)}">${o.html || ''}<span>${esc(o.label)}</span></button>`)
    .join('')}</div>`;

const toggle = (name, checked, label, hint = '') =>
  `<label class="toggle-row"><span><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</span>
    <input type="checkbox" name="${name}" ${checked ? 'checked' : ''}><span class="switch"></span></label>`;

function bindChips(root, onChange) {
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    const group = chip?.closest('[data-chips]');
    if (!group) return;
    group.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    haptic.select();
    onChange?.(group.dataset.chips, chip.dataset.value);
  });
}

function readForm(root) {
  const out = {};
  root.querySelectorAll('input[name], textarea[name]').forEach((el) => {
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.dataset.num) out[el.name] = parseNum(el.value);
    else out[el.name] = el.value.trim();
  });
  root.querySelectorAll('[data-chips]').forEach((g) => {
    out[g.dataset.chips] = g.querySelector('.chip.active')?.dataset.value ?? null;
  });
  return out;
}

// Цифровые поля: только цифры и одна запятая
function bindNumeric(root) {
  root.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.dataset?.num) return;
    let v = el.value.replace('.', ',').replace(el.dataset.num === 'int' ? /[^\d\s]/g : /[^\d,\s]/g, '');
    const i = v.indexOf(',');
    if (i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/,/g, '');
    if (v !== el.value) el.value = v;
  });
}

function invalid(root, name, message) {
  const el = root.querySelector(`[name="${name}"]`);
  el?.classList.add('invalid');
  el?.focus();
  setTimeout(() => el?.classList.remove('invalid'), 1600);
  haptic.error();
  toast(message, 'error');
}

const emptyState = (iconName, text) => `<div class="empty">${icon(iconName)}<p>${esc(text)}</p></div>`;

function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    input.addEventListener('change', () => {
      resolve(input.files?.[0] || null);
      input.remove();
    });
    document.body.append(input);
    input.click();
  });
}

return { toast, sheet, actionSheet, confirmDialog, field, textInput, numInput, dateInput, textArea, chips, toggle, bindChips, readForm, bindNumeric, invalid, emptyState, pickFile };
};

__f["js/ui/fmt.js"] = function () {
// Форматирование и мелкие помощники для разметки.
const { t, locale } = __req("js/i18n.js");
const { getState } = __req("js/core/store.js");
const { stationById, categoryById } = __req("js/core/model.js");
const { icon } = __req("js/ui/icons.js");

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const attr = esc;

const nf = new Map();
function fmtNum(n, digits = 0, minDigits = 0) {
  if (n == null || !isFinite(n)) return t('common.empty');
  const key = digits + ':' + minDigits;
  if (!nf.has(key)) nf.set(key, new Intl.NumberFormat(locale(), { maximumFractionDigits: digits, minimumFractionDigits: minDigits }));
  return nf.get(key).format(n);
}

const cur = () => getState().settings.currency || '₽';
const distU = () => t('settings.' + (getState().settings.distanceUnit || 'km'));
const volU = () => t('settings.' + (getState().settings.volumeUnit || 'l'));

// Суммы: копейки показываем, только если они есть
const money = (n) => (n == null ? t('common.empty') : `${fmtNum(n, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2)} ${cur()}`);
const moneyRound = (n) => (n == null ? t('common.empty') : `${fmtNum(Math.round(n))} ${cur()}`);
const price = (n) => (n == null ? t('common.empty') : `${fmtNum(n, 2, 2)} ${cur()}`);
const km = (n) => (n == null ? t('common.empty') : `${fmtNum(n)} ${distU()}`);
const liters = (n) => (n == null ? t('common.empty') : `${fmtNum(n, 2)} ${volU()}`);
const cons = (n) => (n == null ? t('common.empty') : `${fmtNum(n, 1, 1)} ${volU()}/100`);

function fmtDate(iso, { year } = {}) {
  if (!iso) return t('common.empty');
  const [y, m, d] = iso.split('-').map(Number);
  const showYear = year ?? y !== new Date().getFullYear();
  return `${d} ${t('monthsShort')[m - 1]}${showYear ? ' ' + y : ''}`;
}

function fmtMonth(key) {
  const [y, m] = key.split('-').map(Number);
  const name = t('months')[m - 1];
  return name[0].toUpperCase() + name.slice(1) + (y !== new Date().getFullYear() ? ' ' + y : '');
}

const fmtMonthShort = (key) => {
  const [y, m] = key.split('-').map(Number);
  return t('monthsShort')[m - 1] + (m === 1 ? ' ' + String(y).slice(2) : '');
};

const carName = (c) => (c ? `${c.brand} ${c.model}`.trim() || t('car.newCar') : '');

function stationBadge(id, size = '') {
  const s = stationById(id);
  return `<span class="badge-st ${size}" style="background:${s.color};color:${s.fg || '#fff'}">${esc(s.short)}</span>`;
}

function catIcon(id, size = '') {
  const c = categoryById(id);
  return `<span class="cat-ic ${size}" style="--c:${c.color}">${icon(c.icon)}</span>`;
}

const catName = (id) => t('categories.' + id);
const fuelName = (id) => t('fuelTypes.' + id);
const stationName = (id) => stationById(id).name;

function groupByMonth(items) {
  const groups = [];
  let cur = null;
  for (const it of items) {
    const k = it.date.slice(0, 7);
    if (!cur || cur.key !== k) groups.push((cur = { key: k, items: [] }));
    cur.items.push(it);
  }
  return groups;
}

return { esc, attr, fmtNum, cur, distU, volU, money, moneyRound, price, km, liters, cons, fmtDate, fmtMonth, fmtMonthShort, carName, stationBadge, catIcon, catName, fuelName, stationName, groupByMonth };
};

__f["js/core/calc.js"] = function () {
// Чистые функции расчётов. Даты — строки 'YYYY-MM-DD'.

const round = (n, d = 2) => {
  const k = 10 ** d;
  return Math.round((n + Number.EPSILON) * k) / k;
};

function parseNum(v) {
  if (v == null) return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const t = String(v).replace(/[\s ]/g, '').replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return isFinite(n) ? n : null;
}

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = (now = new Date()) => toISO(now);
const monthKey = (iso) => (iso || '').slice(0, 7);

function addToISO(iso, { days = 0, months = 0 } = {}) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + months, d + days);
  return toISO(dt);
}

function daysBetween(fromISO, toISOStr) {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISOStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

// ---------- Литры / сумма / цена: любые два из трёх ----------


// order — поля в порядке редактирования; вычисляем то, что не входит в два последних
function pickTarget(order = []) {
  const recent = [];
  for (let i = order.length - 1; i >= 0 && recent.length < 2; i--) {
    if (!recent.includes(order[i])) recent.push(order[i]);
  }
  // при прочих равных считаем цену, затем литры
  return ['price', 'liters', 'amount'].find((f) => !recent.includes(f));
}

function solveFuel({ liters, amount, price }, target) {
  if (target === 'price' && liters > 0 && amount != null) return round(amount / liters, 2);
  if (target === 'liters' && price > 0 && amount != null) return round(amount / price, 2);
  if (target === 'amount' && liters != null && price != null) return round(liters * price, 2);
  return null;
}

// ---------- Расход топлива ----------

// Расход между двумя заправками «до полного бака».
// Возвращает Map(id заправки -> { consumption, distance, liters }).
function consumptionIntervals(fuel) {
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

function averageConsumption(fuel) {
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
function periodRange(period, now = new Date()) {
  if (period && typeof period === 'object') return { from: period.from || null, to: period.to || null };
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === 'month') return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
  if (period === 'year') return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: null, to: null };
}

const inRange = (date, r) => (!r.from || date >= r.from) && (!r.to || date <= r.to);

const sum = (arr, key) => arr.reduce((s, x) => s + (Number(x[key]) || 0), 0);

function totals(fuel, expenses, range) {
  const f = fuel.filter((x) => inRange(x.date, range));
  const e = expenses.filter((x) => inRange(x.date, range));
  const fuelAmount = sum(f, 'amount');
  const expAmount = sum(e, 'amount');
  return { fuelAmount, expAmount, total: fuelAmount + expAmount, liters: sum(f, 'liters'), fuelCount: f.length, expCount: e.length };
}

// Итоги по категориям (заправки — категория 'fuel'), по убыванию
function categoryTotals(fuel, expenses, range) {
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
function stationStats(fuel, range = {}) {
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
function costPerKm(car, fuel, expenses) {
  const miles = [car.initialMileage, car.mileage, ...fuel.map((f) => f.mileage), ...expenses.map((e) => e.mileage)]
    .filter((x) => x != null && isFinite(x));
  if (miles.length < 2) return null;
  const dist = Math.max(...miles) - Math.min(...miles);
  if (dist <= 0) return null;
  const total = sum(fuel, 'amount') + sum(expenses, 'amount');
  return total > 0 ? total / dist : null;
}

// Помесячные ряды: средняя цена литра и средний расход
function monthlySeries(fuel) {
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
function reminderStatus(r, { today, mileage }) {
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
function sortReminders(list, ctx) {
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

const byDateDesc = (a, b) => b.date.localeCompare(a.date) || (b.mileage ?? 0) - (a.mileage ?? 0);

return { round, parseNum, toISO, todayISO, monthKey, addToISO, daysBetween, pickTarget, solveFuel, consumptionIntervals, averageConsumption, periodRange, inRange, sum, totals, categoryTotals, stationStats, costPerKm, monthlySeries, reminderStatus, sortReminders, byDateDesc };
};

__f["js/config.js"] = function () {
// Настройки, которые нужно поменять под себя.
const __default = {
  // Имя бота без @, например 'bortjournal_bot'. Нужно для страницы «Откройте в Telegram».
  BOT_USERNAME: '',
  VERSION: '1.0.0',
};

return { default: __default };
};

__f["js/ui/screens/car.js"] = function () {
// Вкладка «Моя машина»
const { t, plural } = __req("js/i18n.js");
const store = __req("js/core/store.js");
const { averageConsumption, totals, periodRange, costPerKm, categoryTotals, sortReminders, todayISO } = __req("js/core/calc.js");
const { categoryById } = __req("js/core/model.js");
const { photoURL, compressPhoto } = __req("js/core/photo.js");
const { icon } = __req("js/ui/icons.js");
const { esc, attr, fmtNum, km, moneyRound, money, cons, volU, distU, carName, catIcon, catName, fmtDate } = __req("js/ui/fmt.js");
const { actionSheet, confirmDialog, chips, bindChips, toast, pickFile } = __req("js/ui/kit.js");
const { push, register } = __req("js/ui/router.js");
const { donut } = __req("js/ui/charts.js");
const { haptic } = __req("js/tg.js");

let statsPeriod = 'month';

function statCard(label, value, { big = false, iconName = '', cls = '' } = {}) {
  return `<div class="stat ${big ? 'big' : ''} ${cls}">
    <span class="stat-label">${iconName ? icon(iconName) : ''}${esc(label)}</span>
    <span class="stat-value">${value}</span></div>`;
}

function reminderTitle(r) {
  return r.type === 'custom' ? r.title || t('reminders.types.custom') : t('reminders.types.' + r.type);
}

function reminderDue(r, s) {
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

async function choosePhoto(car) {
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

async function deleteCar(car) {
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

return { reminderDue, choosePhoto, deleteCar };
};

__f["js/ui/charts.js"] = function () {
// Лёгкие SVG-графики без библиотек.
const { esc } = __req("js/ui/fmt.js");

// Кольцевая диаграмма. items: [{ value, color }]
function donut(items, { size = 168, stroke = 26, center = '', sub = '' } = {}) {
  const total = items.reduce((s, x) => s + x.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = items.length > 1 ? 2 : 0;
  let offset = 0;
  const arcs = items
    .map((x) => {
      const len = total ? (x.value / total) * c : 0;
      const dash = Math.max(len - gap, 0.01);
      const el = `<circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="${x.color}" stroke-width="${stroke}"
        stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
      offset += len;
      return el;
    })
    .join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">
    <circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>${arcs}
    <text x="50%" y="${size / 2 - 2}" text-anchor="middle" class="donut-v">${esc(center)}</text>
    <text x="50%" y="${size / 2 + 17}" text-anchor="middle" class="donut-s">${esc(sub)}</text></svg>`;
}

// Столбчатая диаграмма. points: [{ label, value }] (value может быть null)
function bars(points, { color = 'var(--accent)', fmt = (v) => String(v), height = 170 } = {}) {
  const w = 340;
  const top = 22;
  const bottom = 22;
  const vals = points.map((p) => p.value).filter((v) => v != null);
  if (!vals.length) return '';
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  // Ось не от нуля, если значения близки — так видна динамика цены
  const base = min > 0 && (max - min) / max < 0.35 ? min - (max - min || max * 0.1) * 0.6 : 0;
  const span = max - base || 1;
  const n = points.length;
  const slot = w / n;
  const bw = Math.min(28, slot * 0.62);
  const h = height - top - bottom;
  const lastIdx = points.map((p) => p.value != null).lastIndexOf(true);
  const showEvery = n > 8 ? 2 : 1;
  const items = points
    .map((p, i) => {
      const x = i * slot + (slot - bw) / 2;
      const label = i % showEvery === (n - 1) % showEvery
        ? `<text x="${x + bw / 2}" y="${height - 6}" text-anchor="middle" class="bar-l">${esc(p.label)}</text>` : '';
      if (p.value == null) return label;
      const bh = Math.max(3, ((p.value - base) / span) * h);
      const y = top + h - bh;
      const isLast = i === lastIdx;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${color}" opacity="${isLast ? 1 : 0.55}"/>
        ${isLast || n <= 6 ? `<text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" class="bar-v ${isLast ? 'strong' : ''}">${esc(fmt(p.value))}</text>` : ''}${label}`;
    })
    .join('');
  return `<svg class="bars" viewBox="0 0 ${w} ${height}" role="img">
    <line x1="0" x2="${w}" y1="${top + h + 0.5}" y2="${top + h + 0.5}" stroke="var(--line)"/>${items}</svg>`;
}

return { donut, bars };
};

__f["js/ui/screens/carForm.js"] = function () {
// Форма машины, первый запуск и обновление пробега
const { t } = __req("js/i18n.js");
const store = __req("js/core/store.js");
const { FUEL_TYPES, uid } = __req("js/core/model.js");
const { photoURL } = __req("js/core/photo.js");
const { icon } = __req("js/ui/icons.js");
const { esc, km } = __req("js/ui/fmt.js");
const { field, textInput, numInput, chips, bindChips, bindNumeric, readForm, invalid, toast, confirmDialog } = __req("js/ui/kit.js");
const { register, pop } = __req("js/ui/router.js");
const { mainButton, haptic } = __req("js/tg.js");
const { choosePhoto, deleteCar } = __req("js/ui/screens/car.js");

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


return {  };
};

__f["js/ui/screens/reminderForm.js"] = function () {
// Форма напоминания
const { t } = __req("js/i18n.js");
const store = __req("js/core/store.js");
const { REMINDER_TYPES, uid } = __req("js/core/model.js");
const { icon } = __req("js/ui/icons.js");
const { esc } = __req("js/ui/fmt.js");
const { field, textInput, numInput, dateInput, textArea, chips, bindChips, bindNumeric, readForm, invalid, confirmDialog } = __req("js/ui/kit.js");
const { register, pop } = __req("js/ui/router.js");
const { mainButton, haptic } = __req("js/tg.js");

register('reminder-form', {
  render(params) {
    const r = params.id ? store.getState().reminders.find((x) => x.id === params.id) : { type: 'osago', ...(params.prefill || {}) };
    const unit = t('settings.' + store.getState().settings.distanceUnit);
    return `<header class="topbar plain"><h1>${esc(params.id ? t('reminders.edit') : t('reminders.new'))}</h1></header>
      <form class="form" onsubmit="return false">
        <div class="field"><span class="field-label">${esc(t('reminders.type'))}</span>
          ${chips('type', REMINDER_TYPES.map((v) => ({ value: v, label: t('reminders.types.' + v) })), r.type)}</div>
        <div class="title-field" ${r.type === 'custom' ? '' : 'hidden'}>
          ${field(t('reminders.titleField'), textInput('title', r.title, { placeholder: t('reminders.titlePh') }))}</div>
        <div class="row2">
          ${field(t('reminders.dueDate'), dateInput('dueDate', r.dueDate || ''))}
          ${field(t('reminders.dueMileage'), numInput('dueMileage', r.dueMileage, { decimal: false, suffix: unit }))}
        </div>
        ${field(t('reminders.note'), textArea('note', r.note))}
        ${params.id ? `<button type="button" class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>` : ''}
      </form>`;
  },
  mount(el, params) {
    const editing = params.id ? store.getState().reminders.find((x) => x.id === params.id) : null;
    const carId = editing?.carId || params.carId || store.getState().activeCarId;
    bindNumeric(el);
    bindChips(el, (name, value) => {
      if (name === 'type') el.querySelector('.title-field').hidden = value !== 'custom';
    });
    el.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('reminders.deleteConfirm')))) return;
      store.update((s) => (s.reminders = s.reminders.filter((x) => x.id !== editing.id)));
      haptic.success();
      pop();
    });
    mainButton.set({
      text: t('common.save'),
      onClick: () => {
        const v = readForm(el);
        if (v.type === 'custom' && !v.title) return invalid(el, 'title', t('reminders.needTitle'));
        if (!v.dueDate && v.dueMileage == null) return invalid(el, 'dueDate', t('reminders.needDue'));
        const data = { type: v.type, title: v.type === 'custom' ? v.title : '', dueDate: v.dueDate, dueMileage: v.dueMileage, note: v.note };
        store.update((s) => {
          if (editing) Object.assign(s.reminders.find((x) => x.id === editing.id), data);
          else s.reminders.push({ id: uid(), carId, ...data });
        });
        haptic.success();
        pop();
      },
    });
  },
});

return {  };
};

__f["js/ui/screens/fuel.js"] = function () {
// Вкладка «Заправки», просмотр и форма заправки
const { t, plural } = __req("js/i18n.js");
const store = __req("js/core/store.js");
const { STATIONS, FUEL_TYPES, uid } = __req("js/core/model.js");
const { consumptionIntervals, totals, periodRange, inRange, monthlySeries, stationStats, byDateDesc, todayISO, pickTarget, solveFuel } = __req("js/core/calc.js");
const { icon } = __req("js/ui/icons.js");
const { esc, attr, fmtNum, money, moneyRound, price, km, liters, cons, volU, cur, fmtDate, fmtMonth, fmtMonthShort, stationBadge, stationName, fuelName, carName, groupByMonth } = __req("js/ui/fmt.js");
const { field, numInput, dateInput, textArea, chips, toggle, bindChips, bindNumeric, readForm, invalid, confirmDialog, emptyState, toast } = __req("js/ui/kit.js");
const { register, push, pop } = __req("js/ui/router.js");
const { periodFilter, rangeOf, bindDates } = __req("js/ui/filters.js");
const { bars } = __req("js/ui/charts.js");
const { mainButton, haptic } = __req("js/tg.js");

const F = { mode: 'list', period: 'all', from: '', to: '', station: 'all' };

function summary(fuel) {
  const m = totals(fuel, [], periodRange('month'));
  return `<div class="summary card">
    <div><small>${esc(t('fuel.monthTotal'))}</small><b>${moneyRound(m.fuelAmount)}</b></div>
    <div><small>${esc(t('fuel.liters'))}</small><b>${fmtNum(m.liters, 1)} ${esc(volU())}</b></div>
  </div>`;
}

function fuelRow(f, c) {
  const meta = [fmtDate(f.date), liters(f.liters), f.price != null ? `${price(f.price)}/${volU()}` : null, f.mileage != null ? km(f.mileage) : null]
    .filter(Boolean).join(' · ');
  return `<button class="rec" data-act="view" data-id="${attr(f.id)}">
    ${stationBadge(f.station)}
    <span class="rec-main"><b>${esc(stationName(f.station))}</b><small>${esc(meta)}</small></span>
    <span class="rec-side"><b>${money(f.amount)}</b>${c ? `<small class="cons">${esc(cons(c.consumption))}</small>` : ''}</span>
  </button>`;
}

function listView(fuel) {
  const range = rangeOf(F);
  const intervals = consumptionIntervals(fuel);
  const list = fuel.filter((f) => inRange(f.date, range) && (F.station === 'all' || f.station === F.station)).sort(byDateDesc);
  const stationChips = chips('station', [{ value: 'all', label: t('fuel.allStations') }, ...STATIONS.map((s) => ({ value: s.id, label: s.name, html: stationBadge(s.id, 'xs') }))], F.station, { cls: 'scroll' });
  if (!fuel.length) return emptyState('fuel', t('fuel.empty'));
  const body = list.length
    ? groupByMonth(list).map((g) => `<div class="group">
        <div class="group-head"><span>${esc(fmtMonth(g.key))}</span><span>${moneyRound(g.items.reduce((s, x) => s + (x.amount || 0), 0))}</span></div>
        <div class="card list">${g.items.map((f) => fuelRow(f, intervals.get(f.id))).join('')}</div></div>`).join('')
    : emptyState('search', t('fuel.emptyFilter'));
  const tot = totals(list, [], {});
  return `${stationChips}
    ${list.length ? `<div class="period-total"><span>${esc(t('common.total'))}: ${fmtNum(tot.liters, 1)} ${esc(volU())}</span><b>${moneyRound(tot.fuelAmount)}</b></div>` : ''}
    ${body}`;
}

function chartsView(fuel) {
  const range = rangeOf(F);
  const inR = fuel.filter((f) => inRange(f.date, range));
  const series = monthlySeries(inR).slice(-12);
  const st = stationStats(inR);
  const priceData = series.filter((s) => s.avgPrice != null).map((s) => ({ label: fmtMonthShort(s.month), value: s.avgPrice }));
  const consData = series.filter((s) => s.consumption != null).map((s) => ({ label: fmtMonthShort(s.month), value: s.consumption }));
  const priceChart = priceData.length ? bars(priceData, { fmt: (v) => fmtNum(v, 2, 2) }) : '';
  const consChart = consData.length ? bars(consData, { fmt: (v) => fmtNum(v, 1, 1), color: 'var(--accent-2)' }) : '';
  const stations = st.length
    ? `<div class="card list">${st.map((s) => `<div class="rec static">${stationBadge(s.station)}
        <span class="rec-main"><b>${esc(stationName(s.station))}</b>
        <small>${esc(t('fuel.times', { n: s.count, times: plural(s.count, 'times') }))} · ${fmtNum(s.liters, 1)} ${esc(volU())} · ${esc(t('fuel.avgPrice', { price: price(s.avgPrice) }))}</small></span>
        <span class="rec-side"><b>${moneyRound(s.amount)}</b></span></div>`).join('')}</div>`
    : '';
  if (!priceChart && !consChart && !stations) return emptyState('chart', t('fuel.noCharts'));
  return `
    ${priceChart ? `<div class="card"><div class="card-title">${esc(t('fuel.priceChart'))}, ${esc(cur())}/${esc(volU())}</div>${priceChart}</div>` : ''}
    <div class="card"><div class="card-title">${esc(t('fuel.consChart'))}, ${esc(volU())}/100</div>${consChart || `<p class="muted small">${esc(t('fuel.noCharts'))}</p>`}</div>
    ${stations ? `<div class="section-head"><h2>${esc(t('fuel.stations'))}</h2></div>${stations}` : ''}`;
}

function render() {
  const car = store.activeCar();
  const fuel = store.carFuel(car.id);
  return `<header class="topbar plain"><h1>${esc(t('fuel.title'))}</h1><span class="sub">${esc(carName(car))}</span></header>
    ${summary(fuel)}
    ${chips('mode', [{ value: 'list', label: t('fuel.list'), html: icon('list') }, { value: 'charts', label: t('fuel.charts'), html: icon('chart') }], F.mode, { cls: 'segmented' })}
    ${periodFilter(F)}
    <div class="content">${F.mode === 'list' ? listView(fuel) : chartsView(fuel)}</div>
    <button class="fab" data-act="add" aria-label="${attr(t('fuel.new'))}">${icon('plus')}</button>`;
}

function mount(el) {
  const rerender = () => (el.innerHTML = render());
  bindChips(el, (name, value) => {
    F[name] = value;
    rerender();
  });
  bindDates(el, F, rerender);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add') {
      haptic.tap();
      push('fuel-form', {});
    }
    if (b.dataset.act === 'view') push('fuel-view', { id: b.dataset.id });
  });
}

register('fuel', { render, mount, live: true });

// ---------- Просмотр ----------

function row(label, value) {
  return `<div class="kv"><span>${esc(label)}</span><b>${value}</b></div>`;
}

register('fuel-view', {
  live: true,
  render({ id }) {
    const f = store.getState().fuel.find((x) => x.id === id);
    if (!f) return '';
    const c = consumptionIntervals(store.carFuel(f.carId)).get(f.id);
    return `<div class="view-head">${stationBadge(f.station, 'lg')}
        <div><h1>${money(f.amount)}</h1><p class="muted">${esc(stationName(f.station))} · ${esc(fmtDate(f.date, { year: true }))}</p></div></div>
      <div class="card kvs">
        ${row(t('common.date'), esc(fmtDate(f.date, { year: true })))}
        ${row(t('common.mileage'), esc(km(f.mileage)))}
        ${row(t('fuel.fuelType'), esc(fuelName(f.fuelType)))}
        ${row(t('fuel.liters'), esc(liters(f.liters)))}
        ${row(t('fuel.price'), esc(price(f.price)))}
        ${row(t('fuel.fullTank'), esc(f.full ? t('common.yes') : t('common.no')))}
        ${c ? row(t('fuel.consumption'), esc(cons(c.consumption))) : ''}
      </div>
      ${f.comment ? `<div class="card note">${esc(f.comment)}</div>` : ''}
      <button class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>`;
  },
  mount(el, { id }) {
    if (!store.getState().fuel.some((x) => x.id === id)) return;
    el.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('fuel.deleteConfirm')))) return;
      pop();
      store.update((s) => (s.fuel = s.fuel.filter((x) => x.id !== id)));
      haptic.success();
    });
    mainButton.set({ text: t('common.edit'), onClick: () => push('fuel-form', { id }) });
  },
});

// ---------- Форма ----------

const TRIO = ['liters', 'amount', 'price'];

register('fuel-form', {
  render({ id }) {
    const s = store.getState();
    const car = store.activeCar();
    const f = id
      ? s.fuel.find((x) => x.id === id)
      : { date: todayISO(), station: s.lastStation || 'lukoil', fuelType: car.fuelType, full: true };
    const unit = t('settings.' + s.settings.distanceUnit);
    const stations = `<div class="station-grid" data-chips="station">${STATIONS.map((st) => `<button type="button" class="chip st ${st.id === f.station ? 'active' : ''}" data-value="${st.id}">
      ${stationBadge(st.id)}<span>${esc(st.name)}</span></button>`).join('')}</div>`;
    const trio = (name, label, suffix) =>
      field(label, numInput(name, f[name], { suffix }), { cls: 'trio-' + name, tag: t('common.auto') });
    return `<header class="topbar plain"><h1>${esc(id ? t('fuel.edit') : t('fuel.new'))}</h1></header>
      <form class="form" onsubmit="return false">
        <div class="row2">
          ${field(t('common.date'), dateInput('date', f.date))}
          ${field(t('common.mileage'), numInput('mileage', f.mileage, { decimal: false, suffix: unit, placeholder: fmtNum(car.mileage) }))}
        </div>
        <div class="field"><span class="field-label">${esc(t('fuel.station'))}</span>${stations}</div>
        <div class="field"><span class="field-label">${esc(t('fuel.fuelType'))}</span>
          ${chips('fuelType', FUEL_TYPES.map((v) => ({ value: v, label: t('fuelTypes.' + v) })), f.fuelType, { cls: 'scroll' })}</div>
        <div class="trio">
          ${trio('liters', t('fuel.liters'), volU())}
          ${trio('amount', t('common.amount'), cur())}
          ${trio('price', t('fuel.priceShort'), cur())}
        </div>
        <p class="field-hint">${esc(t('fuel.calcHint'))}</p>
        ${toggle('full', f.full, t('fuel.fullTank'), t('fuel.fullHint'))}
        ${field(t('common.comment'), textArea('comment', f.comment))}
        ${id ? `<button type="button" class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>` : ''}
      </form>`;
  },
  mount(el, { id }) {
    const editing = id ? store.getState().fuel.find((x) => x.id === id) : null;
    const car = store.activeCar();
    bindChips(el);
    bindNumeric(el);
    const order = editing ? ['liters', 'amount'] : [];
    const inputs = Object.fromEntries(TRIO.map((n) => [n, el.querySelector(`input[name="${n}"]`)]));
    const markAuto = () => {
      const target = pickTarget(order);
      TRIO.forEach((n) => el.querySelector('.trio-' + n).classList.toggle('is-auto', n === target));
      return target;
    };
    markAuto();
    el.addEventListener('input', (e) => {
      const n = e.target.name;
      if (!TRIO.includes(n)) return;
      if (order[order.length - 1] !== n) order.push(n);
      const target = markAuto();
      if (target === n) return;
      const v = readForm(el.querySelector('.trio'));
      const res = solveFuel(v, target);
      inputs[target].value = res == null ? '' : String(res).replace('.', ',');
    });
    el.addEventListener('click', async (e) => {
      if (!e.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('fuel.deleteConfirm')))) return;
      store.update((s) => (s.fuel = s.fuel.filter((x) => x.id !== id)));
      haptic.success();
      pop();
      pop();
    });
    mainButton.set({
      text: t('common.save'),
      onClick: () => {
        const v = readForm(el);
        if (v.price == null) v.price = solveFuel(v, 'price');
        if (v.liters == null) v.liters = solveFuel(v, 'liters');
        if (v.amount == null) v.amount = solveFuel(v, 'amount');
        if (!(v.liters > 0)) return invalid(el, 'liters', t('fuel.required'));
        if (!(v.amount > 0)) return invalid(el, 'amount', t('fuel.required'));
        if (v.price == null) v.price = solveFuel(v, 'price');
        const rec = {
          date: v.date || todayISO(), mileage: v.mileage, station: v.station || 'other', fuelType: v.fuelType || car.fuelType,
          liters: v.liters, amount: v.amount, price: v.price, full: !!v.full, comment: v.comment,
        };
        store.update((s) => {
          if (editing) Object.assign(s.fuel.find((x) => x.id === id), rec);
          else s.fuel.push({ id: uid(), carId: car.id, ...rec });
          s.lastStation = rec.station;
          store.bumpMileage(s, editing?.carId || car.id, rec.mileage);
        });
        haptic.success();
        toast(t('car.saved'));
        pop();
      },
    });
  },
});

return {  };
};

__f["js/ui/filters.js"] = function () {
// Фильтр по периоду (Месяц / Год / Всё время / Период с датами)
const { t } = __req("js/i18n.js");
const { periodRange } = __req("js/core/calc.js");
const { chips, dateInput } = __req("js/ui/kit.js");
const { esc } = __req("js/ui/fmt.js");

function periodFilter(f) {
  return `${chips('period', ['month', 'year', 'all', 'custom'].map((v) => ({ value: v, label: t('periods.' + v) })), f.period, { cls: 'segmented' })}
    ${f.period === 'custom' ? `<div class="row2 dates">
      <label class="field"><span class="field-label">${esc(t('periods.from'))}</span>${dateInput('from', f.from)}</label>
      <label class="field"><span class="field-label">${esc(t('periods.to'))}</span>${dateInput('to', f.to)}</label></div>` : ''}`;
}

const rangeOf = (f) => (f.period === 'custom' ? periodRange({ from: f.from, to: f.to }) : periodRange(f.period));

// Подписка на изменение дат в пользовательском периоде
function bindDates(el, f, rerender) {
  el.addEventListener('change', (e) => {
    const n = e.target.name;
    if (n === 'from' || n === 'to') {
      f[n] = e.target.value;
      rerender();
    }
  });
}

return { periodFilter, rangeOf, bindDates };
};

__f["js/ui/screens/expenses.js"] = function () {
// Вкладка «Расходы», просмотр и форма расхода
const { t } = __req("js/i18n.js");
const store = __req("js/core/store.js");
const { CATEGORIES, REMINDER_FROM_CATEGORY, uid } = __req("js/core/model.js");
const { inRange, byDateDesc, todayISO, addToISO, sum } = __req("js/core/calc.js");
const { icon } = __req("js/ui/icons.js");
const { esc, attr, money, moneyRound, km, fmtNum, fmtDate, fmtMonth, catIcon, catName, carName, groupByMonth } = __req("js/ui/fmt.js");
const { field, numInput, dateInput, textInput, textArea, chips, bindChips, bindNumeric, readForm, invalid, confirmDialog, emptyState, toast } = __req("js/ui/kit.js");
const { register, push, pop, replaceTop } = __req("js/ui/router.js");
const { periodFilter, rangeOf, bindDates } = __req("js/ui/filters.js");
const { mainButton, haptic } = __req("js/tg.js");

const F = { period: 'all', from: '', to: '', category: 'all', q: '' };

function expRow(e) {
  const meta = [fmtDate(e.date), catName(e.category), e.mileage != null ? km(e.mileage) : null].filter(Boolean).join(' · ');
  return `<button class="rec" data-act="view" data-id="${attr(e.id)}">
    ${catIcon(e.category)}
    <span class="rec-main"><b>${esc(e.description || catName(e.category))}</b><small>${esc(meta)}</small></span>
    <span class="rec-side"><b>${money(e.amount)}</b></span></button>`;
}

function filtered(list) {
  const range = rangeOf(F);
  const q = F.q.trim().toLowerCase();
  return list
    .filter((e) => inRange(e.date, range) && (F.category === 'all' || e.category === F.category)
      && (!q || e.description.toLowerCase().includes(q) || e.comment.toLowerCase().includes(q)))
    .sort(byDateDesc);
}

function listHTML(all) {
  if (!all.length) return emptyState('wallet', t('expenses.empty'));
  const list = filtered(all);
  const total = `<div class="summary card single"><div><small>${esc(t('expenses.total'))}</small><b>${moneyRound(sum(list, 'amount'))}</b></div></div>`;
  if (!list.length) return total + emptyState('search', t('expenses.emptyFilter'));
  return total + groupByMonth(list).map((g) => `<div class="group">
    <div class="group-head"><span>${esc(fmtMonth(g.key))}</span><span>${moneyRound(sum(g.items, 'amount'))}</span></div>
    <div class="card list">${g.items.map(expRow).join('')}</div></div>`).join('');
}

function render() {
  const car = store.activeCar();
  const all = store.carExpenses(car.id);
  const cats = chips('category', [{ value: 'all', label: t('expenses.allCategories') },
    ...CATEGORIES.map((c) => ({ value: c.id, label: catName(c.id), html: catIcon(c.id, 'xs') }))], F.category, { cls: 'scroll' });
  return `<header class="topbar plain"><h1>${esc(t('expenses.title'))}</h1><span class="sub">${esc(carName(car))}</span></header>
    <div class="search">${icon('search')}<input class="input" type="search" name="q" value="${attr(F.q)}" placeholder="${attr(t('common.search'))}" enterkeyhint="search"></div>
    ${periodFilter(F)}
    ${cats}
    <div class="content">${listHTML(all)}</div>
    <button class="fab" data-act="add" aria-label="${attr(t('expenses.new'))}">${icon('plus')}</button>`;
}

function mount(el) {
  const rerender = () => (el.innerHTML = render());
  bindChips(el, (name, value) => {
    F[name] = value;
    rerender();
  });
  bindDates(el, F, rerender);
  el.addEventListener('input', (e) => {
    if (e.target.name !== 'q') return;
    F.q = e.target.value;
    el.querySelector('.content').innerHTML = listHTML(store.carExpenses());
  });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'add') {
      haptic.tap();
      push('expense-form', {});
    }
    if (b.dataset.act === 'view') push('expense-view', { id: b.dataset.id });
  });
}

register('expenses', { render, mount, live: true });

// ---------- Просмотр ----------

register('expense-view', {
  live: true,
  render({ id }) {
    const e = store.getState().expenses.find((x) => x.id === id);
    if (!e) return '';
    const row = (l, v) => `<div class="kv"><span>${esc(l)}</span><b>${v}</b></div>`;
    return `<div class="view-head">${catIcon(e.category, 'lg')}
        <div><h1>${money(e.amount)}</h1><p class="muted">${esc(e.description || catName(e.category))}</p></div></div>
      <div class="card kvs">
        ${row(t('expenses.category'), esc(catName(e.category)))}
        ${row(t('common.date'), esc(fmtDate(e.date, { year: true })))}
        ${row(t('common.mileage'), esc(km(e.mileage)))}
      </div>
      ${e.comment ? `<div class="card note">${esc(e.comment)}</div>` : ''}
      <button class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>`;
  },
  mount(el, { id }) {
    if (!store.getState().expenses.some((x) => x.id === id)) return;
    el.addEventListener('click', async (ev) => {
      if (!ev.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('expenses.deleteConfirm')))) return;
      pop();
      store.update((s) => (s.expenses = s.expenses.filter((x) => x.id !== id)));
      haptic.success();
    });
    mainButton.set({ text: t('common.edit'), onClick: () => push('expense-form', { id }) });
  },
});

// ---------- Форма ----------

function reminderPrefill(rec) {
  const type = REMINDER_FROM_CATEGORY[rec.category];
  if (rec.category === 'to') return { type, dueDate: addToISO(rec.date, { months: 12 }), dueMileage: rec.mileage != null ? rec.mileage + 10000 : null };
  if (rec.category === 'insurance') return { type, dueDate: addToISO(rec.date, { months: 12 }) };
  return { type, dueDate: addToISO(rec.date, { months: 6 }) };
}

register('expense-form', {
  render({ id }) {
    const s = store.getState();
    const car = store.activeCar();
    const e = id ? s.expenses.find((x) => x.id === id) : { date: todayISO(), category: 'to' };
    const unit = t('settings.' + s.settings.distanceUnit);
    const grid = `<div class="cat-grid" data-chips="category">${CATEGORIES.map((c) => `<button type="button" class="chip cat ${c.id === e.category ? 'active' : ''}" data-value="${c.id}">
      ${catIcon(c.id)}<span>${esc(catName(c.id))}</span></button>`).join('')}</div>`;
    return `<header class="topbar plain"><h1>${esc(id ? t('expenses.edit') : t('expenses.new'))}</h1></header>
      <form class="form" onsubmit="return false">
        <div class="big-input">${numInput('amount', e.amount, { suffix: s.settings.currency, placeholder: '0' })}</div>
        <div class="field"><span class="field-label">${esc(t('expenses.category'))}</span>${grid}</div>
        ${field(t('expenses.description'), textInput('description', e.description, { placeholder: t('expenses.descriptionPh'), maxlength: 120 }))}
        <div class="row2">
          ${field(t('common.date'), dateInput('date', e.date))}
          ${field(t('common.mileage'), numInput('mileage', e.mileage, { decimal: false, suffix: unit, placeholder: fmtNum(car.mileage) }))}
        </div>
        ${field(t('common.comment'), textArea('comment', e.comment))}
        ${id ? `<button type="button" class="btn danger-ghost" data-act="delete">${icon('trash')}${esc(t('common.delete'))}</button>` : ''}
      </form>`;
  },
  mount(el, { id }) {
    const editing = id ? store.getState().expenses.find((x) => x.id === id) : null;
    const car = store.activeCar();
    bindChips(el);
    bindNumeric(el);
    if (!editing) setTimeout(() => el.querySelector('input[name="amount"]')?.focus(), 300);
    el.addEventListener('click', async (ev) => {
      if (!ev.target.closest('[data-act="delete"]')) return;
      if (!(await confirmDialog(t('expenses.deleteConfirm')))) return;
      store.update((s) => (s.expenses = s.expenses.filter((x) => x.id !== id)));
      haptic.success();
      pop();
      pop();
    });
    mainButton.set({
      text: t('common.save'),
      onClick: async () => {
        const v = readForm(el);
        if (!(v.amount > 0)) return invalid(el, 'amount', t('expenses.required'));
        const rec = { date: v.date || todayISO(), mileage: v.mileage, category: v.category || 'other', description: v.description, amount: v.amount, comment: v.comment };
        const carId = editing?.carId || car.id;
        store.update((s) => {
          if (editing) Object.assign(s.expenses.find((x) => x.id === id), rec);
          else s.expenses.push({ id: uid(), carId, ...rec });
          store.bumpMileage(s, carId, rec.mileage);
        });
        haptic.success();
        toast(t('car.saved'));
        if (!editing && REMINDER_FROM_CATEGORY[rec.category]) {
          mainButton.hide();
          const what = t('reminders.offerWhat.' + rec.category);
          const ok = await confirmDialog(t('reminders.offer', { what }), { okText: t('common.add'), danger: false });
          if (ok) return replaceTop('reminder-form', { carId, prefill: reminderPrefill(rec) });
        }
        pop();
      },
    });
  },
});

return {  };
};

__f["js/ui/screens/settings.js"] = function () {
// Настройки: валюта, единицы, экспорт/импорт, удаление данных
const { t } = __req("js/i18n.js");
const store = __req("js/core/store.js");
const { NewerFormatError } = __req("js/core/model.js");
const { buildExportJSON, parseImportJSON, buildCSV } = __req("js/core/exportData.js");
const { icon } = __req("js/ui/icons.js");
const { esc, stationName, catName, fuelName } = __req("js/ui/fmt.js");
const { chips, bindChips, toast, confirmDialog, sheet, pickFile } = __req("js/ui/kit.js");
const { register, popToRoot } = __req("js/ui/router.js");
const { haptic } = __req("js/tg.js");
const config = __req("js/config.js").default;

const CURRENCIES = ['₽', '$', '€', '₸', 'Br', '₴', '₾'];

function item(act, iconName, title, hint = '', cls = '') {
  return `<button class="row-item ${cls}" data-act="${act}">${icon(iconName)}<span><b>${esc(title)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</span></button>`;
}

function syncLine() {
  if (!store.hasCloud()) return esc(t('settings.cloudOff'));
  const u = store.usage();
  return `${esc(t('settings.sync.' + store.sync.status) || '')}<br>${esc(t('settings.cloudUsage', { used: u.keys, max: u.maxKeys }))}`;
}

const stamp = () => new Date().toISOString().slice(0, 10);

async function saveFile(name, text, mime) {
  const file = new File([text], name, { type: mime });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      return true;
    }
  } catch (e) {
    if (e?.name === 'AbortError') return true;
  }
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch {
    return false;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

const exportJSON = () => buildExportJSON(store.getState(), store.allPhotos());

async function doImport(text) {
  let parsed;
  try {
    parsed = parseImportJSON(text);
  } catch (e) {
    toast(e instanceof NewerFormatError ? t('settings.importNewer') : t('settings.importError'), 'error');
    haptic.error();
    return false;
  }
  if (!(await confirmDialog(t('settings.importConfirm'), { okText: t('common.done'), danger: false }))) return false;
  await store.replaceAll(parsed.state, parsed.photos);
  haptic.success();
  toast(t('settings.importDone'));
  popToRoot();
  return true;
}

function pasteSheet() {
  sheet({
    title: t('settings.importPaste'),
    body: `<textarea class="input area tall" placeholder="${esc(t('settings.importPastePh'))}"></textarea>
      <button class="btn primary wide" data-act="go">${esc(t('settings.importJSON'))}</button>`,
    onMount(s) {
      s.el.querySelector('[data-act="go"]').addEventListener('click', async () => {
        const text = s.el.querySelector('textarea').value.trim();
        if (!text) return;
        s.close();
        await doImport(text);
      });
    },
  });
}

register('settings', {
  render() {
    const st = store.getState().settings;
    return `<header class="topbar plain"><h1>${esc(t('settings.title'))}</h1></header>
      <section class="section"><div class="section-head"><h2>${esc(t('settings.currency'))}</h2></div>
        ${chips('currency', CURRENCIES.map((c) => ({ value: c, label: c })), st.currency)}</section>
      <section class="section"><div class="section-head"><h2>${esc(t('settings.units'))}</h2></div>
        <div class="card pad-s">
          <div class="unit-row"><span>${esc(t('settings.distance'))}</span>${chips('distanceUnit', ['km', 'mi'].map((v) => ({ value: v, label: t('settings.' + v) })), st.distanceUnit, { cls: 'segmented compact' })}</div>
          <div class="unit-row"><span>${esc(t('settings.volume'))}</span>${chips('volumeUnit', ['l', 'gal'].map((v) => ({ value: v, label: t('settings.' + v) })), st.volumeUnit, { cls: 'segmented compact' })}</div>
        </div></section>
      <section class="section"><div class="section-head"><h2>${esc(t('settings.data'))}</h2></div>
        <div class="card list">
          ${item('export-json', 'download', t('settings.exportJSON'), t('settings.exportJSONHint'))}
          ${item('export-csv', 'download', t('settings.exportCSV'), t('settings.exportCSVHint'))}
          ${item('copy-json', 'copy', t('settings.copyJSON'))}
          ${item('import-file', 'upload', t('settings.importJSON'), t('settings.importHint'))}
          ${item('import-paste', 'copy', t('settings.importPaste'))}
        </div></section>
      <section class="section"><div class="section-head"><h2>${esc(t('settings.storage'))}</h2></div>
        <div class="card row-static">${icon('cloud')}<span class="sync-line">${syncLine()}</span></div>
        <div class="card list">${item('wipe', 'trash', t('settings.wipe'), '', 'danger')}</div></section>
      <section class="section about">
        <img src="icon.svg" alt="" width="44" height="44">
        <div><b>${esc(t('appName'))}</b><small>${esc(t('settings.version', { v: config.VERSION }))}</small><p>${esc(t('settings.aboutText'))}</p></div>
      </section>`;
  },
  mount(el) {
    bindChips(el, (name, value) => {
      store.update((s) => (s.settings[name] = value));
    });
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'export-json') {
        if (!(await saveFile(`bortjournal-${stamp()}.json`, exportJSON(), 'application/json'))) toast(t('settings.exportFail'), 'error');
      } else if (act === 'export-csv') {
        const csv = buildCSV(store.getState(), { stationName, categoryName: catName, fuelName });
        if (!(await saveFile(`bortjournal-${stamp()}.csv`, csv, 'text/csv'))) toast(t('settings.exportFail'), 'error');
      } else if (act === 'copy-json') {
        toast((await copyText(exportJSON())) ? t('settings.copied') : t('settings.copyFail'));
      } else if (act === 'import-file') {
        const file = await pickFile('application/json,.json,text/plain');
        if (file) await doImport(await file.text());
      } else if (act === 'import-paste') {
        pasteSheet();
      } else if (act === 'wipe') {
        if (!(await confirmDialog(t('settings.wipeConfirm')))) return;
        if (!(await confirmDialog(t('settings.wipeConfirm2')))) return;
        await store.wipeAll();
        haptic.success();
        toast(t('settings.wiped'));
        popToRoot();
      }
    });
    const timer = setInterval(() => {
      const line = el.querySelector('.sync-line');
      if (line) line.innerHTML = syncLine();
    }, 1500);
    return () => clearInterval(timer);
  },
});

return {  };
};

__f["js/core/exportData.js"] = function () {
// Экспорт и импорт данных.
const { migrate } = __req("js/core/model.js");

const APP_ID = 'bortjournal';

function buildExportJSON(state, photos) {
  return JSON.stringify({ app: APP_ID, version: state.version, exportedAt: new Date().toISOString(), data: state, photos }, null, 1);
}

function parseImportJSON(text) {
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
function buildCSV(state, { stationName, categoryName, fuelName }) {
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

return { APP_ID, buildExportJSON, parseImportJSON, buildCSV };
};
__req("js/app.js");
})();
