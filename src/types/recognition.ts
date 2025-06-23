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
    alert_type?: string;
    person_name: string;
    person_lastname?: string;
    requisition_type: string;
    confidence: number;
    timestamp: string;
    location?: string;
    message?: string;
    detection_timestamp: string;
    image_path?: string;
    additional_info?: {
        algorithm?: string;
        processing_time?: number;
        client_ip?: string;
    };
}

// FUNCIONES HELPER PARA MANEJO SEGURO DE DATOS
export const createSafeAlert = (alert: Partial<AlertaSeguridad>): AlertaSeguridad => {
    return {
        alert_id: alert.alert_id || `alert_${Date.now()}`,
        alert_level: alert.alert_level || 'HIGH',
        alert_type: alert.alert_type || 'security',
        person_name: alert.person_name || 'Nombre no disponible',
        person_lastname: alert.person_lastname || '',
        requisition_type: alert.requisition_type || 'Tipo no especificado',
        confidence: typeof alert.confidence === 'number' ? alert.confidence : 0,
        timestamp: alert.timestamp || new Date().toISOString(),
        location: alert.location || 'Sistema de Reconocimiento Facial',
        message: alert.message || 'Persona requisitoriada detectada',
        detection_timestamp: alert.detection_timestamp || new Date().toISOString(),
        image_path: alert.image_path || '',
        additional_info: {
            algorithm: alert.additional_info?.algorithm || 'hybrid',
            processing_time: alert.additional_info?.processing_time || 0,
            client_ip: alert.additional_info?.client_ip || 'unknown',
        },
    };
};

export const createSafeRecognitionResult = (result: Partial<RecognitionResult>): RecognitionResult => {
    return {
        reconocido: result.reconocido ?? false,
        persona_id: result.persona_id,
        confianza: typeof result.confianza === 'number' ? result.confianza : 0,
        metodo: result.metodo || 'unknown',
        tiempo_procesamiento: typeof result.tiempo_procesamiento === 'number' ? result.tiempo_procesamiento : 0,
        timestamp: result.timestamp || new Date().toISOString(),
        imagen_info: {
            dimensiones: result.imagen_info?.dimensiones || 'No disponible',
            canales: typeof result.imagen_info?.canales === 'number' ? result.imagen_info.canales : 0,
            tamano_bytes: typeof result.imagen_info?.tamano_bytes === 'number' ? result.imagen_info.tamano_bytes : 0,
        },
        persona_info: result.persona_info ? {
            id: result.persona_info.id || 0,
            nombre: result.persona_info.nombre || 'Nombre no disponible',
            apellido: result.persona_info.apellido || '',
            id_estudiante: result.persona_info.id_estudiante,
            requisitoriado: result.persona_info.requisitoriado ?? false,
            tipo_requisitoria: result.persona_info.tipo_requisitoria,
        } : undefined,
        alerta_seguridad: result.alerta_seguridad ? createSafeAlert(result.alerta_seguridad) : undefined,
        detalles_tecnicos: result.detalles_tecnicos,
        historial_id: result.historial_id,
    };
};

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