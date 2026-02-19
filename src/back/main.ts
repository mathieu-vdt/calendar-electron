import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';

// ── Window references ─────────────────────────────────────────────────────────

let mainWindow:     BrowserWindow | null = null;
let eventWindow:    BrowserWindow | null = null;
let addEventWindow: BrowserWindow | null = null;

// ── Window factories ──────────────────────────────────────────────────────────

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 760,
    minHeight: 500,
    title: 'Calendar',
    frame: false,
    icon: join(__dirname, '../pages/img/typescript.png'),
    webPreferences: {
      preload: join(__dirname, './front/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('../pages/index.html');
  win.on('focus', () => { sendToMainWindow('refresh-calendar'); });
  win.on('closed', () => { mainWindow = null; });
  return win;
}

function createEventWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 680,
    height: 520,
    minWidth: 480,
    title: 'Event Details',
    frame: false,
    parent: mainWindow ?? undefined,
    icon: join(__dirname, '../pages/img/typescript.png'),
    webPreferences: {
      preload: join(__dirname, './front/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('../pages/event.html');
  win.on('closed', () => { eventWindow = null; });
  return win;
}

function createAddEventWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 560,
    height: 480,
    minWidth: 400,
    title: 'New Event',
    frame: false,
    parent: mainWindow ?? undefined,
    icon: join(__dirname, '../pages/img/typescript.png'),
    webPreferences: {
      preload: join(__dirname, './front/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('../pages/form.html');
  win.on('closed', () => { addEventWindow = null; });
  return win;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendToMainWindow(channel: string, ...args: unknown[]): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  mainWindow = createMainWindow();

  // Open event details window
  ipcMain.on('event-data', (_event, eventData) => {
    if (!eventWindow || eventWindow.isDestroyed()) {
      eventWindow = createEventWindow();
    } else {
      eventWindow.focus();
    }

    if (eventWindow.webContents.isLoading()) {
      eventWindow.webContents.once('did-finish-load', () => {
        eventWindow?.webContents.send('event-data', eventData);
      });
    } else {
      eventWindow.webContents.send('event-data', eventData);
    }
  });

  // Open add-event window; optional date string payload from double-click
  ipcMain.on('open-add-event-window', (_event, dateStr: string | null) => {
    if (!addEventWindow || addEventWindow.isDestroyed()) {
      addEventWindow = createAddEventWindow();

      if (dateStr) {
        addEventWindow.webContents.once('did-finish-load', () => {
          addEventWindow?.webContents.send('prefill-date', dateStr);
        });
      }
    } else {
      addEventWindow.focus();
      if (dateStr) {
        addEventWindow.webContents.send('prefill-date', dateStr);
      }
    }
  });

  // Forward explicit refresh-calendar requests from child windows
  ipcMain.on('refresh-calendar', () => {
    sendToMainWindow('refresh-calendar');
  });

  // Custom window controls
  ipcMain.on('win-minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  ipcMain.on('win-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on('win-close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
