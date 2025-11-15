/**
 * Preload Script - Puente seguro entre el proceso principal y el renderer
 * Este script se ejecuta en un contexto aislado con acceso controlado a Node.js
 */

const { contextBridge, ipcRenderer } = require('electron');

// Exponemos APIs seguras al renderer a través de contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // API para comunicación con el proceso principal
  send: (channel, data) => {
    // Whitelist de canales permitidos
    const validChannels = ['save-sale', 'print-ticket', 'get-settings'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  receive: (channel, func) => {
    const validChannels = ['sale-saved', 'print-complete', 'settings-loaded'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  invoke: async (channel, data) => {
    const validChannels = ['save-sale', 'print-ticket', 'get-settings'];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  }
});

// Exponemos información del sistema de forma segura
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
