import { updEvent, delEvent } from '../model/index.js';
import { IEvent } from '../../interfaces/event';
const { ipcRenderer } = require('electron');

// ── Helpers ──────────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'danger' = 'success'): void {
  const container = document.getElementById('toast-container') as HTMLElement;
  const toast = document.createElement('div');
  toast.classList.add('toast', `toast-${type}`);
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatDate(raw: Date | string): string {
  return new Date(raw).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── State ─────────────────────────────────────────────────────────────────────

let currentEvent: IEvent | null = null;

// ── DOM refs (resolved once) ──────────────────────────────────────────────────

const detailsView    = document.getElementById('event-details-view') as HTMLElement;
const editFormView   = document.getElementById('edit-form-view')     as HTMLElement;
const detailsCard    = document.getElementById('event-details')      as HTMLElement;

const editBtn        = document.getElementById('edit')               as HTMLButtonElement;
const deleteBtn      = document.getElementById('delete')             as HTMLButtonElement;
const saveBtn        = document.getElementById('save-btn')           as HTMLButtonElement;
const cancelEditBtn  = document.getElementById('cancel-edit')        as HTMLButtonElement;

const editIdInput    = document.getElementById('edit-id')            as HTMLInputElement;
const editTitre      = document.getElementById('edit-titre')         as HTMLInputElement;
const editDateDeb    = document.getElementById('edit-date-deb')      as HTMLInputElement;
const editDateFin    = document.getElementById('edit-date-fin')      as HTMLInputElement;
const editDesc       = document.getElementById('edit-description')   as HTMLTextAreaElement;

const deleteDialog   = document.getElementById('delete-dialog')      as HTMLElement;
const dialogCancel   = document.getElementById('dialog-cancel')      as HTMLButtonElement;
const dialogConfirm  = document.getElementById('dialog-confirm')     as HTMLButtonElement;

// ── Render event details card ─────────────────────────────────────────────────

function renderDetails(ev: IEvent): void {
  detailsCard.innerHTML = `
    <div class="card-header">
      <h1>${escapeHtml(ev.titre)}</h1>
      <div class="meta">
        <span class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          From ${formatDate(ev.date_deb)} to ${formatDate(ev.date_fin)}
        </span>
      </div>
    </div>
    <div class="card-body">
      ${ev.description
        ? `<p class="description">${escapeHtml(ev.description)}</p>`
        : `<p style="color:var(--text-3);font-style:italic;">No description.</p>`}
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Show / hide views ─────────────────────────────────────────────────────────

function showDetails(): void {
  detailsView.classList.remove('hidden');
  editFormView.classList.add('hidden');
}

function showEditForm(): void {
  if (!currentEvent) return;
  editIdInput.value   = String(currentEvent.id ?? '');
  editTitre.value     = currentEvent.titre;
  editDateDeb.value   = new Date(currentEvent.date_deb).toISOString().split('T')[0];
  editDateFin.value   = new Date(currentEvent.date_fin).toISOString().split('T')[0];
  editDesc.value      = currentEvent.description;

  detailsView.classList.add('hidden');
  editFormView.classList.remove('hidden');
}

// ── Button listeners (registered once) ───────────────────────────────────────

editBtn.addEventListener('click', showEditForm);
cancelEditBtn.addEventListener('click', showDetails);

saveBtn.addEventListener('click', async () => {
  if (!currentEvent) return;

  const updated: IEvent = {
    ...currentEvent,
    id:          parseInt(editIdInput.value),
    titre:       editTitre.value.trim(),
    date_deb:    new Date(editDateDeb.value),
    date_fin:    new Date(editDateFin.value),
    description: editDesc.value.trim(),
  };

  if (!updated.titre) {
    showToast('Title is required.', 'danger');
    return;
  }

  try {
    await updEvent(updated);
    currentEvent = updated;
    renderDetails(updated);
    showDetails();
    ipcRenderer.send('refresh-calendar');
    showToast('Event updated successfully.', 'success');
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Error updating event:', e);
    showToast(`Error: ${e.message ?? 'Unknown error'}`, 'danger');
  }
});

deleteBtn.addEventListener('click', () => {
  deleteDialog.classList.remove('hidden');
});

dialogCancel.addEventListener('click', () => {
  deleteDialog.classList.add('hidden');
});

dialogConfirm.addEventListener('click', async () => {
  if (!currentEvent?.id) return;
  deleteDialog.classList.add('hidden');

  try {
    await delEvent(currentEvent.id);
    ipcRenderer.send('refresh-calendar');
    showToast('Event deleted.', 'success');
    setTimeout(() => window.close(), 400);
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Error deleting event:', e);
    showToast(`Error: ${e.message ?? 'Unknown error'}`, 'danger');
  }
});

// ── IPC: receive event data ───────────────────────────────────────────────────

ipcRenderer.on('event-data', (_event: Event, eventData: IEvent) => {
  currentEvent = eventData;
  renderDetails(eventData);
  showDetails();
});

