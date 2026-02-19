import { IEvent } from '../../interfaces/event';
import { getAll } from '../model/index.js';
const { ipcRenderer } = require('electron');

const MONTH_NAMES: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

let currentMonth: number;
let currentYear: number;

const daysGrid        = document.getElementById('days-grid') as HTMLElement;
const currentMonthEl  = document.getElementById('currentMonthText') as HTMLElement;
const prevBtn         = document.getElementById('prevMonthBtn') as HTMLButtonElement;
const nextBtn         = document.getElementById('nextMonthBtn') as HTMLButtonElement;
const addEventBtn     = document.getElementById('add-event-button') as HTMLButtonElement;

addEventBtn?.addEventListener('click', () => {
  ipcRenderer.send('open-add-event-window', null);
});

// Refresh calendar whenever an event is added / edited / deleted
ipcRenderer.on('refresh-calendar', () => {
  updateCalendar();
});

async function updateCalendar(): Promise<void> {
  daysGrid.innerHTML = '';
  currentMonthEl.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  // Fetch all events once for this month
  let events: IEvent[] = [];
  try {
    events = await getAll();
  } catch (err) {
    console.error('Error loading events:', err);
  }

  const today      = new Date();
  const firstDay   = new Date(currentYear, currentMonth, 1).getDay();
  const numDays    = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Monday-first: Sunday (0) → 6 empty cells, Monday (1) → 0, etc.
  const leadingEmpty = (firstDay + 6) % 7;

  // Leading empty cells
  for (let i = 0; i < leadingEmpty; i++) {
    const empty = document.createElement('div');
    daysGrid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= numDays; d++) {
    const cellDate     = new Date(currentYear, currentMonth, d);
    const isoDateStr   = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday      =
      today.getDate()     === d           &&
      today.getMonth()    === currentMonth &&
      today.getFullYear() === currentYear;

    const cell = document.createElement('div');
    cell.classList.add('day');
    if (isToday) cell.classList.add('today');

    const numEl = document.createElement('span');
    numEl.classList.add('day-number');
    numEl.textContent = String(d);
    cell.appendChild(numEl);

    // Double-click → open add-event form with this date pre-filled
    cell.addEventListener('dblclick', () => {
      ipcRenderer.send('open-add-event-window', isoDateStr);
    });

    // Events that span this date — compare YYYY-MM-DD strings to avoid timezone shift
    const dayEvents = events.filter(ev => {
      const start = (ev.date_deb as unknown as string).slice(0, 10);
      const end   = (ev.date_fin as unknown as string).slice(0, 10);
      return isoDateStr >= start && isoDateStr <= end;
    });

    dayEvents.forEach((ev: IEvent) => {
      const chip = document.createElement('div');
      chip.classList.add('event');
      chip.textContent = ev.titre;
      chip.title       = ev.titre;
      chip.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        ipcRenderer.send('event-data', ev);
      });
      cell.appendChild(chip);
    });

    daysGrid.appendChild(cell);
  }
}

function showPreviousMonth(): void {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  updateCalendar();
}

function showNextMonth(): void {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  updateCalendar();
}

prevBtn.addEventListener('click', showPreviousMonth);
nextBtn.addEventListener('click', showNextMonth);

const now    = new Date();
currentMonth = now.getMonth();
currentYear  = now.getFullYear();

updateCalendar();

  
  
