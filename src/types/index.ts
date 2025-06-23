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

// Estado de entrenamiento actualizado (endpoint real)
export interface TrainingStatus {
    model_trained: boolean;
    auto_training_enabled: boolean;
    training_requirements: {
        can_train: boolean;
        users_with_images: number;
        total_images: number;
        min_required: number;
        pending_users: number;
        model_trained: boolean;
        auto_training_enabled: boolean;
        model_version: string;
    };
    system_ready: boolean;
    recommendation: string;
    model_version: string;
    fixes_status: string;
}

// Información detallada del modelo (del endpoint real)
export interface DetailedModelInfo {
    system_info: {
        is_trained: boolean;
        model_version: string;
        combination_method: string;
        confidence_threshold: number;
        training_sessions: number;
        data_type_handling: string;
    };
    eigenfaces_info: {
        algorithm: string;
        is_trained: boolean;
        n_components: number;
        image_size: number[];
        total_embeddings: number;
        unique_persons: number;
        threshold_distance: number;
        variance_explained: number;
        model_version: string;
        stability_diagnostics: {
            infinite_embeddings: number;
            nan_embeddings: number;
            stable_embeddings: number;
            stability_ratio: number;
        };
    };
    lbp_info: {
        algorithm: string;
        is_trained: boolean;
        radius: number;
        n_points: number;
        grid_size: number[];
        method: string;
        image_size: number[];
        total_features: number;
        unique_persons: number;
        threshold_similarity: number;
        feature_vector_size: number;
        data_type_requirement: string;
        preprocessing_steps: string[];
        model_version: string;
    };
    weights: {
        eigenfaces: number;
        lbp: number;
    };
    last_training: string | null;
    fixes_applied: string[];
}

// Estadísticas de alertas (endpoint real)
export interface AlertStats {
    total_alerts: number;
    by_level: {
        HIGH: number;
        MEDIUM: number;
        LOW: number;
    };
    by_requisition_type: Record<string, number>;
    daily_average: number;
    most_common_requisition: string;
    last_30_days: number;
}

// Información de alerta detallada (endpoint real)
export interface AlertInfo {
    person_id: number;
    person_name: string;
    person_lastname: string;
    student_id: string;
    requisition_type: string;
    confidence: number;
    detection_timestamp: string;
    image_path: string;
    alert_level: 'HIGH' | 'MEDIUM' | 'LOW';
    location: string;
    additional_info: {
        algorithm: string;
        processing_time: number;
        client_ip: string;
    };
}

// Alerta completa (endpoint real)
export interface Alert {
    alert_id: string;
    alert_info: AlertInfo;
    logged_at: string;
    status: string;
}

// Datos de historial de alertas
export interface AlertsData {
    total_alertas: number;
    filtro_nivel?: string;
    alertas: Alert[];
}

// Información de usuario en historial
export interface UserInfo {
    nombre: string;
    apellido: string;
    id_estudiante: string;
    requisitoriado: boolean;
    tipo_requisitoria: string | null;
}

// Item del historial de reconocimientos (endpoint real)
export interface RecognitionHistoryItem {
    id: number;
    usuario_id: number;
    confianza: number;
    distancia_euclidiana: string;
    reconocido: boolean;
    alerta_generada: boolean;
    fecha_reconocimiento: string;
    ip_origen: string;
    usuario_info: UserInfo;
}

// Datos completos del historial de reconocimientos
export interface RecognitionHistoryData {
    reconocimientos: RecognitionHistoryItem[];
    paginacion: {
        total: number;
        pagina: number;
        items_por_pagina: number;
        total_paginas: number;
    };
}

// Información del sistema
export interface SystemInfo {
    sistema: {
        nombre: string;
        version: string;
        environment: string;
        estado: string;
        timestamp: string;
    };
    ml_models: any;
    almacenamiento: {
        [key: string]: {
            total_files: number;
            exists: boolean;
        };
    };
    endpoints_disponibles: string[];
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
    RecognitionHistory: undefined;
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

// Tipos para filtros de reconocimiento
export interface FiltrosReconocimiento {
    usuario_id?: number;
    reconocido?: boolean;
    alerta_generada?: boolean;
    confianza_minima?: number;
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
    enableCache: boolean;
    cacheTimeout: number;
}

// Tipos para respuestas de reconocimiento mejoradas
export interface EnhancedRecognitionResult {
    reconocido: boolean;
    persona_id?: number;
    confianza: number;
    metodo: 'eigenfaces' | 'lbp' | 'hybrid';
    tiempo_procesamiento: number;
    timestamp: string;
    imagen_info: {
        dimensiones: string;
        canales: number;
        tamano_bytes: number;
    };
    detalles_tecnicos?: {
        eigenfaces?: {
            distancia: number;
            confianza: number;
            umbral: number;
        };
        lbp?: {
            similitud: number;
            confianza: number;
            umbral: number;
        };
        fusion?: {
            metodo: string;
            pesos: Record<string, number>;
            confianza_final: number;
        };
    };
    persona_info?: {
        id: number;
        nombre: string;
        apellido: string;
        id_estudiante?: string;
        requisitoriado: boolean;
        tipo_requisitoria?: string;
    };
    alerta_seguridad?: Alert;
}

// Estados de la aplicación
export interface AppState {
    isLoading: boolean;
    error: string | null;
    user: any | null;
    modelInfo: DetailedModelInfo | null;
    trainingStatus: TrainingStatus | null;
    alertStats: AlertStats | null;
}

// Configuración de endpoints
export interface EndpointConfig {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

// Métricas del sistema
export interface SystemMetrics {
    uptime: number;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    api_response_time: number;
    total_requests: number;
    error_rate: number;
}