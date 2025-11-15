const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Para simplificar este ejemplo (en prod usar preload)
    },
  });

  // CAMBIO IMPORTANTE: Cargar el archivo local
  win.loadFile('index.html'); 
}

app.whenReady().then(() => {
  createWindow();
});