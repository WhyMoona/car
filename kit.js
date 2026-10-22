// Общие элементы интерфейса: тосты, нижние шторки, подтверждения, поля форм.
import { t } from '../i18n.js';
import { esc, attr } from './fmt.js';
import { icon } from './icons.js';
import { nativeConfirm, haptic } from '../tg.js';
import { parseNum } from '../core/calc.js';

// ---------- Тосты ----------
export function toast(message, type = '') {
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
export function sheet({ title = '', body = '', onMount } = {}) {
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
export function actionSheet({ title, actions }) {
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

export async function confirmDialog(message, { okText = t('common.delete'), danger = true } = {}) {
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
export function field(label, control, { hint = '', tag = '', cls = '' } = {}) {
  return `<label class="field ${cls}"><span class="field-label">${esc(label)}${tag ? ` <em class="tag">${esc(tag)}</em>` : ''}</span>${control}${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}</label>`;
}

export const textInput = (name, value = '', { placeholder = '', maxlength = 80, upper = false } = {}) =>
  `<input class="input" type="text" name="${name}" value="${attr(value)}" placeholder="${attr(placeholder)}" maxlength="${maxlength}" autocomplete="off" ${upper ? 'autocapitalize="characters"' : ''}>`;

export const numInput = (name, value, { placeholder = '', suffix = '', decimal = true } = {}) =>
  `<div class="input-wrap"><input class="input num" type="text" name="${name}" value="${value == null ? '' : attr(String(value).replace('.', ','))}"
    inputmode="${decimal ? 'decimal' : 'numeric'}" placeholder="${attr(placeholder)}" autocomplete="off" data-num="${decimal ? 'dec' : 'int'}">${suffix ? `<span class="suffix">${esc(suffix)}</span>` : ''}</div>`;

export const dateInput = (name, value) => `<input class="input" type="date" name="${name}" value="${attr(value)}">`;

export const textArea = (name, value = '', placeholder = '') =>
  `<textarea class="input area" name="${name}" rows="2" maxlength="500" placeholder="${attr(placeholder)}">${esc(value)}</textarea>`;

// options: [{ value, label, html? }]
export const chips = (name, options, selected, { cls = '' } = {}) =>
  `<div class="chips ${cls}" data-chips="${name}">${options
    .map((o) => `<button type="button" class="chip ${o.value === selected ? 'active' : ''}" data-value="${attr(o.value)}">${o.html || ''}<span>${esc(o.label)}</span></button>`)
    .join('')}</div>`;

export const toggle = (name, checked, label, hint = '') =>
  `<label class="toggle-row"><span><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</span>
    <input type="checkbox" name="${name}" ${checked ? 'checked' : ''}><span class="switch"></span></label>`;

export function bindChips(root, onChange) {
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    const group = chip?.closest('[data-chips]');
    if (!group) return;
    group.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    haptic.select();
    onChange?.(group.dataset.chips, chip.dataset.value);
  });
}

export function readForm(root) {
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
export function bindNumeric(root) {
  root.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.dataset?.num) return;
    let v = el.value.replace('.', ',').replace(el.dataset.num === 'int' ? /[^\d\s]/g : /[^\d,\s]/g, '');
    const i = v.indexOf(',');
    if (i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/,/g, '');
    if (v !== el.value) el.value = v;
  });
}

export function invalid(root, name, message) {
  const el = root.querySelector(`[name="${name}"]`);
  el?.classList.add('invalid');
  el?.focus();
  setTimeout(() => el?.classList.remove('invalid'), 1600);
  haptic.error();
  toast(message, 'error');
}

export const emptyState = (iconName, text) => `<div class="empty">${icon(iconName)}<p>${esc(text)}</p></div>`;

export function pickFile(accept) {
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
