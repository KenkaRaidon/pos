/**
 * Scanner Module - Gestión del escáner de códigos de barras con cámara
 * Utiliza la librería html5-qrcode para escanear códigos de barras
 */

class BarcodeScanner {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.onScanCallback = null;
    this.lastScannedCode = null;
    this.lastScanTime = 0;
    this.scanCooldown = 4000; // 4 segundos de cooldown entre escaneos del mismo código
    this.config = {
      fps: 10,
      qrbox: { width: 300, height: 150 },
      aspectRatio: 1.7777778, // 16:9
      // Los formatos se establecerán en init() cuando la librería esté cargada
      formatsToSupport: null
    };
  }

  /**
   * Inicializa el escáner
   */
  init(onScanCallback) {
    this.onScanCallback = onScanCallback;
    
    // Configurar formatos soportados ahora que la librería está cargada
    if (typeof Html5QrcodeSupportedFormats !== 'undefined') {
      this.config.formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.QR_CODE
      ];
    }
    
    this.setupEventListeners();
    console.log('📷 Scanner inicializado');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    const toggleBtn = document.getElementById('toggle-scanner-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleScanner());
    }
  }

  /**
   * Inicia el escáner de cámara
   */
  async startScanner() {
    if (this.isScanning) {
      console.log('⚠️ El escáner ya está activo');
      return;
    }

    try {
      const readerElement = document.getElementById('qr-reader');
      if (!readerElement) {
        throw new Error('Elemento #qr-reader no encontrado');
      }

      // Importar la librería si no está disponible
      if (typeof Html5Qrcode === 'undefined') {
        throw new Error('Librería html5-qrcode no cargada');
      }

      this.html5QrCode = new Html5Qrcode('qr-reader');

      // Configuración del escáner
      const config = {
        fps: this.config.fps,
        qrbox: this.config.qrbox,
        aspectRatio: this.config.aspectRatio,
        disableFlip: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };
      
      // Añadir formatos si están disponibles
      if (this.config.formatsToSupport) {
        config.formatsToSupport = this.config.formatsToSupport;
      }

      // Iniciar escáner con la cámara trasera por defecto
      await this.html5QrCode.start(
        { facingMode: 'environment' }, // Cámara trasera
        config,
        (decodedText, decodedResult) => this.onScanSuccess(decodedText, decodedResult),
        (errorMessage) => this.onScanError(errorMessage)
      );

      this.isScanning = true;
      this.updateUI(true);
      console.log('✅ Escáner iniciado');

    } catch (error) {
      console.error('❌ Error al iniciar escáner:', error);
      
      // Intentar con cámara frontal si la trasera falla
      try {
        const fallbackConfig = {
          fps: this.config.fps,
          qrbox: this.config.qrbox,
          disableFlip: false
        };
        
        if (this.config.formatsToSupport) {
          fallbackConfig.formatsToSupport = this.config.formatsToSupport;
        }
        
        await this.html5QrCode.start(
          { facingMode: 'user' }, // Cámara frontal
          fallbackConfig,
          (decodedText, decodedResult) => this.onScanSuccess(decodedText, decodedResult),
          (errorMessage) => this.onScanError(errorMessage)
        );

        this.isScanning = true;
        this.updateUI(true);
        console.log('✅ Escáner iniciado con cámara frontal');

      } catch (fallbackError) {
        console.error('❌ Error al iniciar con cámara frontal:', fallbackError);
        alert('No se pudo acceder a la cámara. Por favor verifica los permisos.');
        this.updateUI(false);
      }
    }
  }

  /**
   * Detiene el escáner
   */
  async stopScanner() {
    if (!this.isScanning || !this.html5QrCode) {
      return;
    }

    try {
      await this.html5QrCode.stop();
      this.html5QrCode.clear();
      this.isScanning = false;
      this.lastScannedCode = null; // Resetear el último código escaneado
      this.lastScanTime = 0;
      this.updateUI(false);
      console.log('🛑 Escáner detenido');
    } catch (error) {
      console.error('❌ Error al detener escáner:', error);
    }
  }

  /**
   * Alterna el estado del escáner
   */
  async toggleScanner() {
    if (this.isScanning) {
      await this.stopScanner();
    } else {
      await this.startScanner();
    }
  }

  /**
   * Callback cuando se escanea exitosamente
   */
  onScanSuccess(decodedText, decodedResult) {
    const currentTime = Date.now();
    
    // Verificar si es el mismo código y si está dentro del período de cooldown
    if (this.lastScannedCode === decodedText && 
        (currentTime - this.lastScanTime) < this.scanCooldown) {
      // Ignorar escaneos duplicados dentro del período de cooldown
      return;
    }
    
    // Actualizar el último código escaneado y tiempo
    this.lastScannedCode = decodedText;
    this.lastScanTime = currentTime;
    
    console.log('📦 Código escaneado:', decodedText);
    
    // Llamar al callback proporcionado
    if (this.onScanCallback && typeof this.onScanCallback === 'function') {
      this.onScanCallback(decodedText);
    }

    // Opcional: detener el escáner después de un escaneo exitoso
    // this.stopScanner();
  }

  /**
   * Callback para errores de escaneo (se ejecuta constantemente mientras no detecta códigos)
   */
  onScanError(errorMessage) {
    // No hacer nada, esto se ejecuta constantemente cuando no hay código detectado
    // Solo loguear en modo debug si es necesario
  }

  /**
   * Actualiza la UI según el estado del escáner
   */
  updateUI(isActive) {
    const toggleBtn = document.getElementById('toggle-scanner-btn');
    const scannerSection = document.getElementById('scanner-section');
    const readerElement = document.getElementById('qr-reader');

    if (toggleBtn) {
      if (isActive) {
        toggleBtn.textContent = '⏸️ PAUSAR CÁMARA';
        toggleBtn.classList.remove('btn-primary');
        toggleBtn.classList.add('btn-warning');
      } else {
        toggleBtn.textContent = '📷 ACTIVAR CÁMARA';
        toggleBtn.classList.remove('btn-warning');
        toggleBtn.classList.add('btn-primary');
      }
    }

    if (scannerSection) {
      if (isActive) {
        scannerSection.classList.add('active');
      } else {
        scannerSection.classList.remove('active');
      }
    }

    // Mostrar/ocultar el elemento de video
    if (readerElement) {
      readerElement.style.display = isActive ? 'block' : 'none';
    }
  }

  /**
   * Obtiene las cámaras disponibles
   */
  async getCameras() {
    try {
      const devices = await Html5Qrcode.getCameras();
      return devices;
    } catch (error) {
      console.error('Error al obtener cámaras:', error);
      return [];
    }
  }

  /**
   * Limpia los recursos del escáner
   */
  cleanup() {
    if (this.html5QrCode && this.isScanning) {
      this.stopScanner();
    }
  }
}

// Instancia singleton global
const barcodeScanner = new BarcodeScanner();
