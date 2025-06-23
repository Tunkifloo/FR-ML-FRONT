export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    id_estudiante?: string;
    requisitoriado: boolean;
    tipo_requisitoria?: string;
    fecha_registro: string;
    fecha_actualizacion?: string;
    activo: boolean;
    imagen_principal?: {
        id: number;
        nombre_archivo: string;
        imagen_base64?: string;
        imagen_url?: string;
        es_principal: boolean;
        formato?: string;
        fecha_subida?: string;
    };
    total_imagenes: number;
    imagenes?: Array<{
        id: number;
        nombre_archivo: string;
        es_principal: boolean;
        formato: string;
        tamano_bytes: number;
        ancho?: number;
        alto?: number;
        fecha_subida: string;
        imagen_base64?: string;
        imagen_url?: string;
    }>;
    reconocimientos_recientes?: Array<{
        id: number;
        confianza: number;
        reconocido: boolean;
        alerta_generada: boolean;
        fecha: string;
        ip_origen: string;
        distancia_euclidiana: string;
    }>;
    estadisticas_reconocimiento?: {
        total_reconocimientos: number;
        reconocimientos_exitosos: number;
        tasa_exito: number;
    };
    caracteristicas_ml?: Array<{
        id: number;
        imagen_id: number;
        algoritmo_version: string;
        calidad_deteccion: number;
        fecha_procesamiento: string;
        tiene_eigenfaces: boolean;
        tiene_lbp: boolean;
        eigenfaces_size: number;
        lbp_size: number;
    }>;
}

export interface UsuarioCreate {
    nombre: string;
    apellido: string;
    email: string;
    id_estudiante?: string;
    imagenes: string[]; // Base64 images o URIs
}

export interface UsuarioUpdate {
    nombre?: string;
    apellido?: string;
    email?: string;
    id_estudiante?: string;
    activo?: boolean;
}

export interface UsuarioDetallado extends Usuario {
    imagenes: Array<{
        id: number;
        nombre_archivo: string;
        es_principal: boolean;
        formato: string;
        tamano_bytes: number;
        ancho?: number;
        alto?: number;
        fecha_subida: string;
        imagen_base64?: string;
        imagen_url?: string;
    }>;
    reconocimientos_recientes?: Array<{
        id: number;
        confianza: number;
        reconocido: boolean;
        alerta_generada: boolean;
        fecha: string;
        ip_origen: string;
        distancia_euclidiana: string;
    }>;
    estadisticas_reconocimiento?: {
        total_reconocimientos: number;
        reconocimientos_exitosos: number;
        tasa_exito: number;
    };
    caracteristicas_ml?: Array<{
        id: number;
        imagen_id: number;
        algoritmo_version: string;
        calidad_deteccion: number;
        fecha_procesamiento: string;
        tiene_eigenfaces: boolean;
        tiene_lbp: boolean;
        eigenfaces_size: number;
        lbp_size: number;
    }>;
}

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

export interface ImagenFacial {
    id: number;
    usuario_id: number;
    nombre_archivo: string;
    ruta_archivo: string;
    es_principal: boolean;
    formato: string;
    tamano_bytes: number;
    ancho?: number;
    alto?: number;
    fecha_subida: string;
    activa: boolean;
    imagen_base64?: string;
    imagen_url?: string;
}

export interface CaracteristicasFaciales {
    id: number;
    usuario_id: number;
    imagen_id: number;
    eigenfaces_vector?: number[];
    lbp_histogram?: number[];
    algoritmo_version: string;
    calidad_deteccion: number;
    fecha_procesamiento: string;
    activa: boolean;
}