// Связь с Telegram без внешнего скрипта telegram.org.
// Используется, если официальный telegram-web-app.js не загрузился (например, сайт недоступен).
// Реализует только то, что нужно приложению, по протоколу Mini Apps (postEvent / receiveEvent).

const LP_KEY = 'bortjournal.tglp';

export function launchParams() {
  const read = (s) => new URLSearchParams(String(s || '').replace(/^#/, ''));
  let p = read(location.hash);
  if (p.get('tgWebAppData') || p.get('tgWebAppPlatform')) {
    try { sessionStorage.setItem(LP_KEY, location.hash); } catch { /* ignore */ }
  } else {
    try { p = read(sessionStorage.getItem(LP_KEY)); } catch { /* ignore */ }
  }
  return p;
}

export const hasLaunchParams = () => {
  const p = launchParams();
  return !!(p.get('tgWebAppData') || p.get('tgWebAppPlatform'));
};

export function loadOfficialSDK(timeout = 4000) {
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

export function installBridge() {
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
