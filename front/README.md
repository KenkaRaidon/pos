# Sistema POS - Frontend con Electron

Sistema de Punto de Venta moderno desarrollado con Electron, diseñado con arquitectura modular y seguridad en mente.

## 🚀 Características

- ✅ **Arquitectura Modular**: Código organizado en módulos reutilizables
- ✅ **Seguridad**: Context Isolation habilitado, Node Integration deshabilitado
- ✅ **Diseño Profesional**: UI moderna y responsive con CSS modular
- ✅ **Sistema de Carrito**: Gestión completa de productos y ventas
- ✅ **Integración con Backend**: Cliente API para NestJS
- ✅ **Atajos de Teclado**: Navegación rápida con F1, F12, ESC

## 📁 Estructura del Proyecto

```
front/
├── src/
│   ├── main/                # Proceso principal de Electron
│   │   └── main.js         # Configuración de ventanas y seguridad
│   ├── preload/            # Scripts preload
│   │   └── preload.js      # Bridge seguro entre procesos
│   └── renderer/           # Interfaz de usuario
│       ├── index.html      # HTML principal
│       ├── js/
│       │   ├── app.js      # Punto de entrada
│       │   ├── modules/    # Módulos de lógica
│       │   │   ├── cart.js     # Gestión del carrito
│       │   │   ├── products.js # Búsqueda de productos
│       │   │   ├── sales.js    # Gestión de ventas
│       │   │   └── ui.js       # Gestión de UI
│       │   └── utils/
│       │       └── api.js      # Cliente HTTP
│       ├── css/
│       │   ├── main.css        # Estilos principales
│       │   ├── variables.css   # Variables CSS
│       │   └── components/     # Estilos por componente
│       └── assets/
│           └── images/
├── package.json
└── README.md
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 📦 Build

```bash
# Build para todas las plataformas
npm run build

# Build específico
npm run build:mac
npm run build:win
npm run build:linux
```

## ⌨️ Atajos de Teclado

- **F1**: Enfocar el scanner de código de barras
- **F12**: Procesar cobro
- **ESC**: Vaciar carrito
- **Enter**: Agregar producto escaneado

## 🔒 Seguridad

Este proyecto implementa las mejores prácticas de seguridad para Electron:

- ✅ Context Isolation habilitado
- ✅ Node Integration deshabilitado en renderer
- ✅ Preload script para APIs controladas
- ✅ Content Security Policy configurada
- ✅ Validación de navegación web
- ✅ Prevención de ventanas emergentes

## 🎨 Diseño

El diseño utiliza:

- Sistema de variables CSS para consistencia
- Componentes modulares reutilizables
- Gradientes y sombras modernas
- Animaciones suaves
- Responsive para diferentes tamaños

## 🔗 Integración con Backend

El frontend se conecta al backend NestJS en `http://localhost:3000`

Endpoints utilizados:
- `GET /products/barcode/:barcode` - Buscar producto
- `POST /sales` - Guardar venta
- `GET /sales` - Historial de ventas

## 📝 Próximas Mejoras

- [ ] Modal de pago personalizado
- [ ] Soporte para impresoras térmicas
- [ ] Sistema de sonidos
- [ ] Búsqueda manual de productos
- [ ] Historial de ventas en el cliente
- [ ] Reportes y estadísticas
- [ ] Modo offline con sincronización
- [ ] Multi-idioma

## 👨‍💻 Desarrollo

Para agregar nuevos módulos, sigue la estructura:

1. Crear archivo en `src/renderer/js/modules/`
2. Exportar clase o funciones
3. Importar en `app.js`
4. Crear estilos en `src/renderer/css/components/`

## 🐛 Debug

Para habilitar DevTools en producción, modifica `NODE_ENV`:

```bash
NODE_ENV=development npm start
```

## 📄 Licencia

ISC
