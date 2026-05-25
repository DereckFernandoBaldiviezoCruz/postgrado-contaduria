const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const registerIpc = require('../backend/registerIpc');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const ASSETS = path.join(__dirname, 'assets');
const iconPath = path.join(ASSETS, 'icon.png');

let splash;
let mainWindow;

let modoSplash = true;

/* =========================
   SPLASH
========================= */
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

/* =========================
   MAIN
========================= */
function createMainWindow() {
  modoSplash = false;

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

  mainWindow.on('closed', async () => {
    mainWindow = null;
    global.usuarioActual = null;
    await session.defaultSession.clearStorageData();
  });
}

/* =========================
   READY
========================= */
app.whenReady().then(async () => {
  await session.defaultSession.clearStorageData();

  registerIpc();

  createSplash();

  /* 🔥 CONFIG UPDATER */
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  autoUpdater.autoDownload = false; // 🔥 CLAVE

  /* =========================
     BOTON REINICIAR
  ========================= */
  ipcMain.on('instalar_actualizacion', () => {
    autoUpdater.downloadUpdate();
  });

  /* =========================
     BUSCAR UPDATE INICIAL
  ========================= */
  autoUpdater.checkForUpdates();

  /* 🔥 SOLUCIÓN: FAILSAFE PARA SPLASH */
  /*setTimeout(() => {
    if (splash && !mainWindow) {
      console.log('⚠️ Forzando apertura de app');

      createMainWindow();
      splash.close();
      splash = null;
    }
  }, 10000);
*/
  /* =========================
     BUSCAR CADA 1 MIN
  ========================= */
  setInterval(() => {
    if (!modoSplash && mainWindow && !mainWindow.isDestroyed()) {
      autoUpdater.checkForUpdates();
    }
  }, 60000);

  /* =========================
     EVENTOS
  ========================= */

  autoUpdater.on('checking-for-update', () => {
    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('msg', 'Buscando actualizaciones...');
    }
  });

  autoUpdater.on('update-available', () => {
    if (modoSplash) {
      // 🔥 SPLASH → DESCARGA
      autoUpdater.downloadUpdate();

      if (splash && !splash.isDestroyed()) {
        splash.webContents.send('msg', 'Descargando actualización...');
      }
    } else {
      // 🔥 APP ABIERTA → SOLO AVISA
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update_available');
      }
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const porcentaje = Math.floor(progressObj.percent);

    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('msg', `Descargando ${porcentaje}%`);
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update_progress', porcentaje);
    }
  });

  autoUpdater.on('update-downloaded', () => {
    if (modoSplash) {
      // 🔥 INSTALAR AUTOMÁTICO
      splash.webContents.send('msg', 'Instalando actualización...');
    }
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-not-available', () => {
    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('msg', 'Cargando aplicación...');

      setTimeout(() => {
        createMainWindow();
        splash.close();
        splash = null;
      }, 1000);
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('❌ Error updater:', err);

    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('msg', 'Error al actualizar');

      setTimeout(() => {
        createMainWindow();
        splash.close();
        splash = null;
      }, 1500);
    }
  });
});

/* =========================
   APP EVENTS
========================= */
app.on('before-quit', () => {
  global.usuarioActual = null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
