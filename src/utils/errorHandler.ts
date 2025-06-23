/**
 * Utilidades para manejo de errores mejorado
 */

export interface ApiErrorResponse {
    detail?: string;
    message?: string;
    errors?: any;
    status?: number;
}

export interface ApiError extends Error {
    response?: {
        data: ApiErrorResponse;
        status: number;
        statusText: string;
    };
    request?: any;
    config?: any;
}

/**
 * Extrae un mensaje de error legible de una respuesta de API
 */
export const extractErrorMessage = (error: any): string => {
    // Error de red o sin respuesta
    if (!error?.response) {
        if (error?.code === 'NETWORK_ERROR') {
            return 'Error de conexión. Verifica tu conexión a internet.';
        }
        if (error?.message?.includes('timeout')) {
            return 'Tiempo de espera agotado. Intenta nuevamente.';
        }
        return error?.message || 'Error de conexión al servidor.';
    }

    // Error con respuesta del servidor
    const { data, status } = error.response;

    // Intentar extraer mensaje específico
    let message = data?.detail || data?.message || data?.errors;

    // Si el mensaje es un objeto, intentar extraer información útil
    if (typeof message === 'object') {
        if (Array.isArray(message)) {
            message = message.join(', ');
        } else {
            message = JSON.stringify(message);
        }
    }

    // Mensajes por código de estado
    if (!message || typeof message !== 'string') {
        switch (status) {
            case 400:
                message = 'Datos inválidos enviados al servidor.';
                break;
            case 401:
                message = 'No autorizado. Verifica tus credenciales.';
                break;
            case 403:
                message = 'Acceso denegado.';
                break;
            case 404:
                message = 'Recurso no encontrado.';
                break;
            case 422:
                message = 'Datos de entrada inválidos.';
                break;
            case 429:
                message = 'Demasiadas solicitudes. Intenta más tarde.';
                break;
            case 500:
                message = 'Error interno del servidor.';
                break;
            case 502:
                message = 'Error de gateway. El servidor no está disponible.';
                break;
            case 503:
                message = 'Servicio no disponible temporalmente.';
                break;
            case 504:
                message = 'Tiempo de espera del servidor agotado.';
                break;
            default:
                message = `Error del servidor (${status})`;
        }
    }

    return message;
};

/**
 * Maneja errores de forma consistente y devuelve un mensaje apropiado
 */
export const handleApiError = (error: any, defaultMessage?: string): string => {
    console.error('API Error:', error);

    const message = extractErrorMessage(error);
    return message || defaultMessage || 'Ha ocurrido un error inesperado.';
};

/**
 * Verifica si un error es de red/conectividad
 */
export const isNetworkError = (error: any): boolean => {
    return !error?.response || error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error');
};

/**
 * Verifica si un error es de timeout
 */
export const isTimeoutError = (error: any): boolean => {
    return error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
};

/**
 * Verifica si es un error del servidor (5xx)
 */
export const isServerError = (error: any): boolean => {
    const status = error?.response?.status;
    return status >= 500 && status < 600;
};

/**
 * Verifica si es un error del cliente (4xx)
 */
export const isClientError = (error: any): boolean => {
    const status = error?.response?.status;
    return status >= 400 && status < 500;
};

/**
 * Formatea errores para logging/debugging
 */
export const formatErrorForLogging = (error: any, context?: string): string => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';

    if (error?.response) {
        return `${timestamp} ${contextStr}API Error ${error.response.status}: ${extractErrorMessage(error)}`;
    }

    return `${timestamp} ${contextStr}Error: ${error?.message || 'Unknown error'}`;
};

/**
 * Retry logic para peticiones fallidas
 */
export const shouldRetry = (error: any, retryCount: number, maxRetries: number = 3): boolean => {
    if (retryCount >= maxRetries) {
        return false;
    }

    // Retry en errores de red
    if (isNetworkError(error)) {
        return true;
    }

    // Retry en errores de servidor
    if (isServerError(error)) {
        return true;
    }

    // Retry en timeout
    if (isTimeoutError(error)) {
        return true;
    }

    // No retry para errores de cliente
    return false;
};

/**
 * Calcula el delay para retry con backoff exponencial
 */
export const calculateRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
    return Math.min(baseDelay * Math.pow(2, retryCount), 10000); // Max 10 segundos
};