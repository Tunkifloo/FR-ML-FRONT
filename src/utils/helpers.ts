import { Alert } from 'react-native';
import { ERROR_MESSAGES } from './constants';

/**
 * Formatea fechas para mostrar en la UI
 */
export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Fecha inválida';
    }
};

/**
 * Formatea fechas solo con fecha (sin hora)
 */
export const formatDateOnly = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Fecha inválida';
    }
};

/**
 * Formatea fechas de forma relativa (hace X tiempo)
 */
export const formatRelativeDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;

        return formatDateOnly(dateString);
    } catch {
        return 'Fecha inválida';
    }
};

/**
 * Formatea porcentajes
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea números grandes con separadores
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('es-ES');
};

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida que el nombre sea válido
 */
export const isValidName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (text: string): string => {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Trunca texto largo
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Obtiene iniciales de un nombre
 */
export const getInitials = (firstName: string, lastName?: string): string => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
};

/**
 * Maneja errores de API y muestra mensajes apropiados
 */
export const handleApiError = (error: any): string => {
    if (!error) return ERROR_MESSAGES.SERVER_ERROR;

    // Error de red
    if (error.code === 'NETWORK_ERROR' || !error.response) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Error del servidor
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message;

        switch (status) {
            case 400:
                return message || 'Datos inválidos';
            case 401:
                return 'No autorizado';
            case 403:
                return 'Acceso denegado';
            case 404:
                return 'Recurso no encontrado';
            case 422:
                return message || 'Datos de entrada inválidos';
            case 500:
                return ERROR_MESSAGES.SERVER_ERROR;
            case 503:
                return 'Servicio no disponible temporalmente';
            default:
                return message || ERROR_MESSAGES.SERVER_ERROR;
        }
    }

    return error.message || ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Muestra alertas nativas
 */
export const showAlert = (title: string, message: string, buttons?: any[]) => {
    Alert.alert(title, message, buttons);
};

/**
 * Muestra alerta de confirmación
 */
export const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
) => {
    Alert.alert(
        title,
        message,
        [
            {
                text: 'Cancelar',
                style: 'cancel',
                onPress: onCancel,
            },
            {
                text: 'Confirmar',
                style: 'default',
                onPress: onConfirm,
            },
        ]
    );
};

/**
 * Genera un delay para operaciones asíncronas
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry de operaciones asíncronas
 */
export const retryOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                await delay(delayMs * Math.pow(2, i)); // Exponential backoff
            }
        }
    }

    throw lastError;
};

/**
 * Debounce para búsquedas
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), waitMs);
    };
};

/**
 * Obtiene el color según el nivel de alerta
 */
export const getAlertColor = (level: string): string => {
    switch (level.toUpperCase()) {
        case 'HIGH': return '#dc2626';
        case 'MEDIUM': return '#d97706';
        case 'LOW': return '#0284c7';
        default: return '#6b7280';
    }
};

/**
 * Obtiene el color según el nivel de confianza
 */
export const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#059669'; // Verde
    if (confidence >= 60) return '#d97706'; // Naranja
    return '#dc2626'; // Rojo
};

/**
 * Valida el tamaño de archivo
 */
export const isValidFileSize = (sizeBytes: number, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return sizeBytes <= maxSizeBytes;
};

/**
 * Obtiene extensión de archivo
 */
export const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Valida formato de imagen
 */
export const isValidImageFormat = (filename: string): boolean => {
    const extension = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'bmp'].includes(extension);
};

