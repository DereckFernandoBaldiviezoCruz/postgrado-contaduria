const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const registerIpc = require('../backend/registerIpc');
const { autoUpdater } = require('electron-updater');
const ASSETS = path.join(__dirname, 'assets');
const iconPath = path.join(ASSETS, 'icon.png');

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
let splash;
let mainWindow;
function createSplash() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    icon: iconPath,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: iconPath,
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
}

const log = require('electron-log');
app.whenReady().then(async () => {
  await session.defaultSession.clearStorageData();

  registerIpc();

  createSplash();

  autoUpdater.logger = require('electron-log');
  autoUpdater.logger.transports.file.level = 'info';

  autoUpdater.checkForUpdates();

  autoUpdater.on('checking-for-update', () => {
    splash.webContents.send('msg', 'Buscando actualizaciones...');
  });

  autoUpdater.on('update-available', () => {
    splash.webContents.send('msg', 'Descargando actualización...');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    splash.webContents.send(
      'msg',
      `Descargando ${Math.floor(progressObj.percent)}%`,
    );
  });

  autoUpdater.on('update-downloaded', () => {
    splash.webContents.send('msg', 'Instalando actualización...');
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-not-available', () => {
    splash.webContents.send('msg', 'Cargando aplicación...');

    setTimeout(() => {
      createMainWindow();
      splash.close();
    }, 1000);
  });

  autoUpdater.on('error', (err) => {
    splash.webContents.send('msg', 'Error al actualizar');

    setTimeout(() => {
      createMainWindow();
      splash.close();
    }, 1500);
  });
});

app.on('before-quit', () => {
  global.usuarioActual = null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
