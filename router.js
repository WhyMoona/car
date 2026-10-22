// Навигация: три вкладки + стек вложенных экранов с кнопкой «Назад» Telegram.
import { backButton, mainButton, haptic } from '../tg.js';
import { getState } from '../core/store.js';
import { t } from '../i18n.js';
import { icon } from './icons.js';

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

export const register = (name, screen) => (screens[name] = screen);
export const currentTab = () => tab;

function rootName() {
  return getState().cars.length ? tab : 'onboarding';
}

export function go(tabId) {
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

export function push(name, params = {}) {
  if (!stack.length) scrollPos[tab] = window.scrollY;
  stack.push({ name, params });
  render('fwd');
}

export function pop() {
  stack.pop();
  render('back');
}

export function replaceTop(name, params = {}) {
  stack.pop();
  stack.push({ name, params });
  render('fwd');
}

export function popToRoot() {
  stack.length = 0;
  render('back');
}

// Перерисовка при изменении данных — только «живые» экраны, формы не трогаем
export function refresh() {
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

export function initRouter() {
  document.getElementById('tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) go(b.dataset.tab);
  });
  render('');
}
