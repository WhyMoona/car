// Обёртка над Telegram.WebApp с запасным режимом для отладки в браузере.
import { memoryAdapter, telegramAdapter } from './core/cloud.js';
import { hasLaunchParams, loadOfficialSDK, installBridge } from './tgbridge.js';

let W = null;
const params = new URLSearchParams(location.search);

// inTelegram — открыто внутри Telegram; isDemo — проверка в обычном браузере (localhost, файл с диска, ?demo);
// bridge — официальный скрипт telegram.org не загрузился, работаем через встроенную связь
export const env = { inTelegram: false, isDemo: false, bridge: false };

export async function initTelegram() {
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

export const COLORS = { bg: '#f2f4f7', surface: '#ffffff', accent: '#1479c9' };

export function setupApp() {
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

export function cloudAdapter() {
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

export const userName = () => W?.initDataUnsafe?.user?.first_name || '';

// ---------- Вибрация ----------
export const haptic = {
  success: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.notificationOccurred('success')),
  warning: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.notificationOccurred('warning')),
  error: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.notificationOccurred('error')),
  tap: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.impactOccurred('light')),
  select: () => env.inTelegram && atLeast('6.1') && safe(() => W.HapticFeedback.selectionChanged()),
};

// ---------- Кнопка «Назад» ----------
let backHandler = null;
const mockBack = () => document.getElementById('mock-back');

export const backButton = {
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

export const mainButton = {
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

export function bindNativeButtons() {
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
export function nativeConfirm(message) {
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

export function openTelegramLink(url) {
  if (env.inTelegram) safe(() => W.openTelegramLink(url));
  else location.href = url;
}
