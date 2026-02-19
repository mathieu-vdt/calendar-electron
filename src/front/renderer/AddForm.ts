import { addEvent } from '../model/index.js';
import { IEvent } from '../../interfaces/event';
const { ipcRenderer } = require('electron');

// ── Helpers ───────────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'danger' = 'success'): void {
  const container = document.getElementById('toast-container') as HTMLElement;
  const toast = document.createElement('div');
  toast.classList.add('toast', `toast-${type}`);
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function setLoading(loading: boolean): void {
  submitButton.disabled = loading;
  submitButton.innerHTML = loading
    ? 'Saving...'
    : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create event`;
}

// ── DOM refs ──────────────────────────────────────────────────────────────────

const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
const titreInput   = document.getElementById('titre')         as HTMLInputElement;
const dateDebInput = document.getElementById('date_deb')      as HTMLInputElement;
const dateFinInput = document.getElementById('date_fin')      as HTMLInputElement;
const descInput    = document.getElementById('description-input') as HTMLTextAreaElement;

// ── Pre-fill date when opened via double-click ────────────────────────────────

ipcRenderer.on('prefill-date', (_event: Event, dateStr: string) => {
  if (dateStr) {
    dateDebInput.value = dateStr;
    dateFinInput.value = dateStr;
    titreInput.focus();
  }
});

// ── Submit ────────────────────────────────────────────────────────────────────

submitButton?.addEventListener('click', async () => {
  const titre    = titreInput.value.trim();
  const dateDeb  = dateDebInput.value;
  const dateFin  = dateFinInput.value;

  // Basic validation
  if (!titre) {
    showToast('Title is required.', 'danger');
    titreInput.focus();
    return;
  }
  if (!dateDeb || !dateFin) {
    showToast('Start and end dates are required.', 'danger');
    return;
  }
  if (new Date(dateDeb) > new Date(dateFin)) {
    showToast('Start date must be before end date.', 'danger');
    return;
  }

  const eventData: IEvent = {
    titre,
    description: descInput.value.trim(),
    date_deb:    new Date(dateDeb),
    date_fin:    new Date(dateFin),
    location:    '',
    statut:      '',
    categorie:   '',
    transparence: '',
    nbMaj:       0,
  };

  setLoading(true);
  try {
    await addEvent(eventData);
    // Tell the main calendar window to refresh
    ipcRenderer.send('refresh-calendar');
    showToast('Event created successfully!', 'success');
    // Reset form
    titreInput.value   = '';
    dateDebInput.value = '';
    dateFinInput.value = '';
    descInput.value    = '';
    setTimeout(() => window.close(), 400);
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Error creating event:', e);
    showToast(`Error: ${e.message ?? 'Unknown error'}`, 'danger');
  } finally {
    setLoading(false);
  }
});


