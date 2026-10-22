// Точка входа
import { setLang, t } from './i18n.js';
import { inTelegram, isDemo, setupApp, cloudAdapter, bindNativeButtons } from './tg.js';
import * as store from './core/store.js';
import { initRouter, refresh } from './ui/router.js';
import { toast } from './ui/kit.js';
import { esc } from './ui/fmt.js';
import config from './config.js';
import './ui/screens/car.js';
import './ui/screens/carForm.js';
import './ui/screens/reminderForm.js';
import './ui/screens/fuel.js';
import './ui/screens/expenses.js';
import './ui/screens/settings.js';

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
  if (!inTelegram && !isDemo) return (browserStub(), hideSplash());
  setupApp();
  document.documentElement.classList.toggle('demo', isDemo);
  bindNativeButtons();
  const adapter = cloudAdapter();
  await store.init(adapter, { onNotice: (k) => toast(t('notices.' + k), 'long') });
  store.subscribe(() => refresh());
  initRouter();
  hideSplash();
  if (inTelegram && !adapter) toast(t('browser.old'), 'long');
}

main().catch((e) => {
  console.error(e);
  document.getElementById('splash')?.classList.add('hide');
  document.getElementById('app').innerHTML = `<div class="stub"><h1>Ошибка запуска</h1><p class="muted">${esc(e.message)}</p></div>`;
});
