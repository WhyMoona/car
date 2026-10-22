// Настройки: валюта, единицы, экспорт/импорт, удаление данных
import { t } from '../../i18n.js';
import * as store from '../../core/store.js';
import { NewerFormatError } from '../../core/model.js';
import { buildExportJSON, parseImportJSON, buildCSV } from '../../core/exportData.js';
import { icon } from '../icons.js';
import { esc, stationName, catName, fuelName } from '../fmt.js';
import { chips, bindChips, toast, confirmDialog, sheet, pickFile } from '../kit.js';
import { register, popToRoot } from '../router.js';
import { haptic } from '../../tg.js';
import config from '../../config.js';

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
