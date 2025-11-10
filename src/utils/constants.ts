export const API_CONFIG = {
    BASE_URL: 'https://fr-ml-api-production.up.railway.app/api/v1',
    TIMEOUT: 30000, // 30 segundos
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 segundo
} as const;

export const CAMERA_CONFIG = {
    QUALITY: 0.8,
    ASPECT_RATIO: [1, 1] as [number, number],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png'] as const,
} as const;

export const RECOGNITION_CONFIG = {
    DEFAULT_ALGORITHM: 'hybrid' as const,
    CONFIDENCE_THRESHOLD: 70,
    PROCESSING_TIMEOUT: 30000,
    INCLUDE_DETAILS: true,
} as const;

export const UI_CONFIG = {
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100,
    },
    REFRESH_INTERVALS: {
        DASHBOARD: 30000, // 30 segundos
        STATISTICS: 60000, // 1 minuto
        ALERTS: 15000, // 15 segundos
    },
    ANIMATION_DURATION: 300,
} as const;

export const ALERT_LEVELS = {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
} as const;

export const RECOGNITION_ALGORITHMS = {
    EIGENFACES: 'eigenfaces',
    LBP: 'lbp',
    HYBRID: 'hybrid',
} as const;

export const USER_LIMITS = {
    MIN_IMAGES: 1,
    MAX_IMAGES: 15,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100,
} as const;

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    SERVER_ERROR: 'Error del servidor. Intenta nuevamente.',
    PERMISSION_DENIED: 'Permisos denegados. Habilita los permisos necesarios.',
    FILE_TOO_LARGE: 'El archivo es demasiado grande. Máximo 10MB.',
    INVALID_FORMAT: 'Formato de archivo no válido. Usa JPG, JPEG o PNG.',
    PROCESSING_ERROR: 'Error al procesar la imagen. Intenta con otra imagen.',
    MODEL_NOT_TRAINED: 'El modelo no está entrenado. Entrena el modelo primero.',
    INSUFFICIENT_DATA: 'Datos insuficientes para entrenar el modelo.',
} as const;

export const SUCCESS_MESSAGES = {
    USER_CREATED: 'Usuario creado exitosamente',
    USER_UPDATED: 'Usuario actualizado exitosamente',
    USER_DELETED: 'Usuario eliminado exitosamente',
    MODEL_TRAINED: 'Modelo entrenado exitosamente',
    IMAGES_ADDED: 'Imágenes añadidas exitosamente',
    RECOGNITION_COMPLETED: 'Reconocimiento completado',
} as const;