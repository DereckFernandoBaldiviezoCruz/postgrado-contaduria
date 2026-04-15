const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const registerIpc = require('../backend/registerIpc');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', async () => {
    global.usuarioActual = null;

    // 🔥 borrar sesión del navegador
    await session.defaultSession.clearStorageData();
  });
}

app.whenReady().then(async () => {
  await session.defaultSession.clearStorageData();

  registerIpc(); // 🔥 AQUÍ SE REGISTRAN TODOS LOS IPC
  createWindow();
});

app.on('before-quit', () => {
  global.usuarioActual = null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
