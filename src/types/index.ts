// API Types
export * from './api';
export * from './user';
export * from './recognition';

// Tipos adicionales para el sistema
export interface EstadisticasUsuarios {
    usuarios: {
        total: number;
        activos: number;
        requisitoriados: number;
        porcentaje_requisitoriados: number;
    };
    imagenes: {
        total: number;
        promedio_por_usuario: number;
    };
    requisitorias: {
        distribucion: Record<string, number>;
        tipos_activos: number;
    };
}

export interface ModelInfo {
    model_loaded: boolean;
    training_status: string;
    last_training?: string;
    total_persons: number;
    total_images: number;
    algorithms?: string[];
    model_accuracy?: number;
    model_size_mb?: number;
}

export interface EstadoEntrenamiento {
    is_trained: boolean;
    training_in_progress: boolean;
    last_training_date?: string;
    total_persons: number;
    total_training_images: number;
    model_accuracy?: number;
    next_training_suggested: boolean;
}

// Tipos de errores comunes
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
}

// Tipos para navegación
export type RootStackParamList = {
    Home: undefined;
    Recognition: undefined;
    Users: undefined;
    Statistics: undefined;
    Alerts: undefined;
    Settings: undefined;
    UserDetail: { userId: number };
    UserEdit: { userId?: number };
    AddUser: undefined;
};

// Tipos para props de navegación
export interface NavigationProps {
    navigation: any;
    route?: any;
}

// Tipos para filtros
export interface FiltroUsuarios {
    nombre?: string;
    apellido?: string;
    email?: string;
    requisitoriado?: boolean;
    activo?: boolean;
}

// Tipos para paginación
export interface Paginacion {
    pagina: number;
    items_por_pagina: number;
    total: number;
    total_paginas: number;
}

// Tipos para configuración de la app
export interface AppConfig {
    apiBaseUrl: string;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
    enableCache: boolean;
    cacheTimeout: number;
}