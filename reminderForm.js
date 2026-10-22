// Форма напоминания
import { t } from '../../i18n.js';
import * as store from '../../core/store.js';
import { REMINDER_TYPES, uid } from '../../core/model.js';
import { icon } from '../icons.js';
import { esc } from '../fmt.js';
import { field, textInput, numInput, dateInput, textArea, chips, bindChips, bindNumeric, readForm, invalid, confirmDialog } from '../kit.js';
import { register, pop } from '../router.js';
import { mainButton, haptic } from '../../tg.js';

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
