# Face Recognition Security - Mobile Application

Sistema móvil de reconocimiento facial desarrollado en React Native con integración completa a la API de machine learning implementada desde cero.

## Información del Proyecto

**Versión:** 1.0.0  
**Plataforma:** React Native (Android/iOS)  
**Framework:** Expo SDK 53  
**Lenguaje:** TypeScript  
**API Backend:** [FR-ML API](https://fr-ml-api-production.up.railway.app)

## Características Principales

- **Reconocimiento facial en tiempo real** con cámara integrada
- **Gestión completa de usuarios** con registro y edición
- **Sistema de alertas de seguridad** para personas requisitoriadas
- **Dashboard con estadísticas** y métricas del sistema
- **Historial de reconocimientos** con filtros avanzados
- **Interfaz optimizada** para dispositivos móviles
- **Integración API REST** con manejo robusto de errores

## Tecnologías Utilizadas

### Core
- **React Native 0.79.4** - Framework principal
- **Expo SDK 53** - Herramientas de desarrollo
- **TypeScript 5.8.3** - Tipado estático
- **React Navigation 7.x** - Navegación

### UI/UX
- **React Native Paper 5.14.5** - Componentes Material Design
- **React Native Vector Icons** - Iconografía
- **React Native Chart Kit 6.12.0** - Gráficos y visualizaciones
- **React Native SVG** - Elementos vectoriales

### Funcionalidades
- **Expo Camera 16.1.8** - Captura de imágenes
- **Expo Image Picker 16.1.4** - Selección de galería
- **Axios 1.10.0** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local

### Desarrollo
- **Babel** - Transpilación de código
- **Metro** - Bundler de React Native
- **EAS Build** - Construcción de aplicaciones

## Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes generales
│   ├── recognition/     # Componentes de reconocimiento
│   └── users/           # Componentes de gestión de usuarios
├── navigation/          # Configuración de navegación
├── screens/             # Pantallas principales
├── services/            # Servicios de API
├── theme/               # Configuración de tema y estilos
├── types/               # Definiciones de TypeScript
└── utils/               # Utilidades y helpers
```

## Instalación y Configuración

### Prerequisitos

- Node.js 18.x o superior
- npm o yarn
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS, solo macOS)

### Instalación

```bash
# Clonar repositorio
git clone [URL_REPOSITORIO]
cd face-recognition-app

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npx expo start
```

### Configuración de Desarrollo

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web (para testing)
npx expo start --web
```

### Build de Producción

```bash
# Configurar EAS (primera vez)
npx eas login
npx eas build:configure

# Build Android
npx eas build --platform android

# Build iOS
npx eas build --platform ios

# Build para ambas plataformas
npx eas build --platform all
```

## Configuración de API

La aplicación se conecta por defecto a:
```
https://fr-ml-api-production.up.railway.app/api/v1
```

Para cambiar la URL de la API, modifica el archivo:
```typescript
// src/services/api.ts
const BASE_URL = 'https://tu-api-url.com/api/v1';
```

## Funcionalidades Principales

### 1. Reconocimiento Facial
- Captura de imágenes con cámara integrada
- Selección desde galería de fotos
- Procesamiento con algoritmos Eigenfaces, LBP e Híbrido
- Resultados en tiempo real con métricas de confianza
- Detección automática de personas requisitoriadas

### 2. Gestión de Usuarios
- Registro de usuarios con múltiples imágenes (1-5)
- Edición de información personal
- Visualización de estadísticas de reconocimiento
- Gestión de estado (activo/inactivo)

### 3. Sistema de Alertas
- Alertas automáticas para personas requisitoriadas
- Clasificación por niveles (Alta, Media, Baja)
- Historial completo de alertas de seguridad
- Notificaciones visuales y sonoras

### 4. Dashboard y Estadísticas
- Estado del sistema de machine learning
- Métricas de usuarios registrados
- Gráficos de distribución de alertas
- Información del modelo entrenado

### 5. Historial y Reportes
- Historial completo de reconocimientos
- Filtros por fecha, usuario y confianza
- Exportación de datos
- Métricas de rendimiento

## Arquitectura de la Aplicación

### Patron de Diseño
- **Arquitectura por capas** con separación clara de responsabilidades
- **Servicios centralizados** para comunicación con API
- **Gestión de estado local** con React Hooks
- **Tipado fuerte** con TypeScript

### Comunicación con API
```typescript
// Ejemplo de servicio
export class RecognitionService {
    static async identifyPerson(
        imageUri: string,
        algoritmo: 'eigenfaces' | 'lbp' | 'hybrid'
    ): Promise<ResponseWithData<RecognitionResult>> {
        // Implementación
    }
}
```

### Manejo de Estados
- Estados de carga y error consistentes
- Validación de formularios
- Persistencia local con AsyncStorage
- Sincronización con API

## Configuración de Tema

### Colores Principales
```typescript
export const colors = {
    primary: '#1e3a8a',      // Azul corporativo
    secondary: '#dc2626',    // Rojo alerta
    success: '#059669',      // Verde éxito
    warning: '#d97706',      // Naranja advertencia
    // ...
}
```

### Tipografía
```typescript
export const typography = {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    body1: { fontSize: 16, fontWeight: 'normal' },
    // ...
}
```

## Pruebas y Validación

### Testing Manual
- Pruebas de reconocimiento con diferentes condiciones de luz
- Validación de alertas de seguridad
- Testing de navegación y flujos de usuario
- Verificación de sincronización con API

### Debugging
```bash
# Logs de desarrollo
npx expo start --dev-client

# Depuración remota
npx expo start --debugger-mode
```

## Despliegue

### Android (APK)
```bash
# Build APK para distribución
eas build --platform android --profile production
```

### iOS (IPA)
```bash
# Build iOS para distribución
eas build --platform ios --profile production
```

### App Stores
```bash
# Envío automático a stores
eas submit --platform android
eas submit --platform ios
```

## Mantenimiento y Actualizaciones

### Actualizaciones OTA
```bash
# Publicar actualización sin rebuild
eas update --branch production
```

### Monitoreo
- Logs de errores centralizados
- Métricas de uso de la aplicación
- Monitoring de performance

## Seguridad

### Consideraciones Implementadas
- Validación de entrada en todos los formularios
- Manejo seguro de imágenes y datos biométricos
- Comunicación HTTPS con la API
- Almacenamiento local cifrado para datos sensibles
- Verificación de permisos de cámara y galería

### Mejores Prácticas
- No almacenamiento de imágenes faciales en dispositivo
- Transmisión segura de datos biométricos
- Implementación de timeouts para evitar bloqueos
- Gestión adecuada de memoria para imágenes

## Soporte y Documentación

### Recursos Adicionales
- Documentación de la API: [Enlace a documentación API]
- Guías de usuario: [Enlace a guías]
- Reporte de bugs: [Sistema de tickets]

### Contacto
Para soporte técnico y consultas sobre el desarrollo, contactar al equipo de desarrollo.

## Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

## Changelog

### v1.0.0 (2024)
- Lanzamiento inicial
- Integración completa con API ML
- Sistema de reconocimiento facial funcional
- Dashboard y estadísticas implementadas
- Sistema de alertas operativo