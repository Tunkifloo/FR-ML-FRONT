export interface RecognitionResult {
    reconocido: boolean;
    persona_id?: number;
    confianza: number;
    metodo: string;
    tiempo_procesamiento: number;
    timestamp: string;
    imagen_info: {
        dimensiones: string;
        canales: number;
        tamano_bytes: number;
    };
    persona_info?: {
        id: number;
        nombre: string;
        apellido: string;
        id_estudiante?: string;
        requisitoriado: boolean;
        tipo_requisitoria?: string;
    };
    alerta_seguridad?: AlertaSeguridad;
    detalles_tecnicos?: any;
    historial_id?: number;
}

export interface AlertaSeguridad {
    alert_id: string;
    alert_level: 'HIGH' | 'MEDIUM' | 'LOW';
    alert_type: string;
    person_name: string;
    person_lastname: string;
    requisition_type: string;
    confidence: number;
    timestamp: string;
    location: string;
    message: string;
    detection_timestamp: string;
    image_path: string;
    additional_info: {
        algorithm: string;
        processing_time: number;
        client_ip: string;
    };
}

export interface HistorialReconocimiento {
    id: number;
    usuario_id?: number;
    confianza: number;
    reconocido: boolean;
    alerta_generada: boolean;
    fecha_reconocimiento: string;
    ip_origen: string;
    distancia_euclidiana: string;
    usuario_info?: {
        nombre: string;
        apellido: string;
        id_estudiante?: string;
        requisitoriado: boolean;
        tipo_requisitoria?: string | null;
    };
}

export interface EstadisticasReconocimiento {
    periodo: {
        dias: number;
        fecha_inicio: string;
        fecha_fin: string;
    };
    resumen: {
        total_reconocimientos: number;
        reconocimientos_exitosos: number;
        alertas_generadas: number;
        tasa_exito: number;
        confianza_promedio: number;
        promedio_diario: number;
    };
    por_dia: Record<string, {
        total: number;
        exitosos: number;
        alertas: number;
        tasa_exito: number;
    }>;
    distribucion_confianza: Record<string, number>;
    top_usuarios_reconocidos: Array<{
        usuario_id: number;
        nombre: string;
        id_estudiante?: string;
        total_reconocimientos: number;
        confianza_promedio: number;
        requisitoriado: boolean;
    }>;
}

export interface ModelInfo {
    model_loaded: boolean;
    training_status: string;
    last_training: string;
    total_persons: number;
    total_images: number;
    algorithms: string[];
    model_accuracy?: number;
    model_size_mb?: number;
}