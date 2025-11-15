/**
 * Main Process - Proceso principal de Electron
 * Maneja la creación de ventanas y configuración de seguridad
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

/**
 * Crea la ventana principal de la aplicación
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#2c3e50',
    webPreferences: {
      // Seguridad: Context Isolation habilitado
      contextIsolation: true,
      
      // Seguridad: Node Integration deshabilitado en el renderer
      nodeIntegration: false,
      
      // Preload script para exponer APIs seguras
      preload: path.join(__dirname, '../preload/preload.js'),
      
      // Seguridad adicional
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    // Opciones de ventana
    title: 'Sistema POS',
    icon: path.join(__dirname, '../renderer/assets/images/icon.png'), // Agregar icono después
    show: false, // No mostrar hasta que esté listo
    autoHideMenuBar: true, // Ocultar barra de menú (producción)
  });

  // Cargar el HTML
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // DevTools - Solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Limpiar referencia cuando se cierre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Configuración de IPC Handlers
 */
function setupIpcHandlers() {
  // Handler para guardar ventas
  ipcMain.handle('save-sale', async (event, saleData) => {
    try {
      console.log('Guardando venta:', saleData);
      // Aquí podrías agregar lógica adicional del proceso principal
      // Por ejemplo, guardar localmente, sincronizar, etc.
      return { success: true, saleId: Date.now() };
    } catch (error) {
      console.error('Error al guardar venta:', error);
      throw error;
    }
  });

  // Handler para imprimir tickets
  ipcMain.handle('print-ticket', async (event, ticketData) => {
    try {
      console.log('Imprimiendo ticket:', ticketData);
      // TODO: Implementar lógica de impresión
      // mainWindow.webContents.print() o usar impresora térmica
      return { success: true };
    } catch (error) {
      console.error('Error al imprimir:', error);
      throw error;
    }
  });

  // Handler para obtener configuración
  ipcMain.handle('get-settings', async () => {
    try {
      // TODO: Cargar configuración desde archivo o base de datos local
      return {
        apiUrl: 'http://localhost:3000',
        storeName: 'Mi Tienda',
        taxRate: 0.16
      };
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      throw error;
    }
  });
}

/**
 * Ciclo de vida de la aplicación
 */

// Cuando Electron haya terminado de inicializarse
app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  // En macOS, recrear ventana cuando se hace clic en el dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cerrar la app cuando todas las ventanas estén cerradas (excepto macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Seguridad: Prevenir navegación a URLs externas
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Solo permitir navegación a file:// protocol
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      console.warn('Navegación bloqueada:', navigationUrl);
    }
  });

  // Prevenir apertura de nuevas ventanas
  contents.setWindowOpenHandler(({ url }) => {
    console.warn('Intento de abrir nueva ventana bloqueado:', url);
    return { action: 'deny' };
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  // TODO: Implementar sistema de logging
});

// Logging de información de inicio
console.log('🚀 Iniciando aplicación POS...');
console.log('📁 Directorio de la app:', app.getAppPath());
console.log('📁 Directorio de datos:', app.getPath('userData'));
console.log('🔧 Versión de Electron:', process.versions.electron);
console.log('🔧 Versión de Node:', process.versions.node);
console.log('🔧 Versión de Chrome:', process.versions.chrome);
