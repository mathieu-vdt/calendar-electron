// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { getAll } from '../front/model/index.js';

let eventWindow: BrowserWindow | null = null;

let addEventWindow: BrowserWindow | null = null;

ipcMain.handle('get-all-events', async (event) => {
  try {
    const events = await getAll();
    return events;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des événements.');
  }
});

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Mon CRUD Electron",

    icon: join(__dirname, '../../pages/img/typescript.png'),

    webPreferences: {
      preload: join(__dirname, '../front/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('../../pages/index.html')



  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  //gestion des évènements
  // mainWindow.on("move", () => {
  //   console.log('fenetre deplacé');

  // })
}

function createEventWindow(): BrowserWindow {
  const eventWindow = new BrowserWindow({
    width: 700,
    height: 500,
    title: "Évènement",

    icon: join(__dirname, '../../pages/img/typescript.png'),

    webPreferences: {
      preload: join(__dirname, '../front/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  eventWindow.loadFile('../../pages/event.html')



  // Open the DevTools.
  eventWindow.webContents.openDevTools()

  return eventWindow;

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  
  // Écouter l'événement 'event-data' du processus de rendu
  ipcMain.on('event-data', (event, eventData) => {
    // Check if the event window is already open or has been destroyed
    if (!eventWindow || eventWindow.isDestroyed()) {
      eventWindow = createEventWindow();
    }

    // Load the HTML file for displaying event information
    eventWindow.loadFile('../../pages/event.html');

    // Pass the event information to the event window
    eventWindow.webContents.on('did-finish-load', () => {
      if (eventWindow) {
        eventWindow.webContents.send('event-data', eventData);
      }
    });
  });


  // Créez une nouvelle fenêtre d'ajout d'événement lorsque vous recevez un message de la fenêtre principale
  ipcMain.on('open-add-event-window', () => {
    if (!addEventWindow) {
      createAddEventWindow();
    }
  });

  

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function createAddEventWindow() {
  const eventWindow = new BrowserWindow({
    width: 700,
    height: 500,
    title: "Création d'un évènement",

    icon: join(__dirname, '../../pages/img/typescript.png'),

    webPreferences: {
      preload: join(__dirname, '../front/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  eventWindow.loadFile('../../pages/form.html')

  return eventWindow;
}


