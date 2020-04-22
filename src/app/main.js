import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { RESTART_CHANNEL, UPDATE_CHANNEL } from './update';

let window = null;

function createWindow() {
  if (window) return;

  window = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    window.webContents.openDevTools({
      mode: 'bottom',
    });
  }

  window.on('closed', function () {
    window = null;
  });

  window.loadFile('index.html');
}

app.on('ready', () => {
  createWindow();

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  window.webContents.on('did-finish-load', () => {
    window.webContents.send(UPDATE_CHANNEL, { type: 'start-update-check' });

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        window.webContents.send(UPDATE_CHANNEL, { type: 'update-checked', result });

        if (result && result.updateInfo.files.length > 0) {
          window.webContents.send(UPDATE_CHANNEL, { type: 'update-download-start' });

          autoUpdater.downloadUpdate().then(() => {
            window.webContents.send(UPDATE_CHANNEL, { type: 'update-ready' });
          });
        }
      })
      .catch((error) => {
        window.webContents.send(UPDATE_CHANNEL, { type: 'update-error', error });
      });

    autoUpdater.addListener('download-progress', ({ percent }) => {
      window.webContents.send(UPDATE_CHANNEL, {
        type: 'update-download-progress',
        progress: percent / 100,
      });
    });

    autoUpdater.addListener('update-downloaded', (info) => {
      window.webContents.send(UPDATE_CHANNEL, { type: 'update-ready' });
    });
  });
});

app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  if (!window) {
    createWindow();
  }
});

ipcMain.on(RESTART_CHANNEL, () => {
  autoUpdater.quitAndInstall(false, true);
});
