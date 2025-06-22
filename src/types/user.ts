export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    id_estudiante?: string;
    requisitoriado: boolean;
    tipo_requisitoria?: string;
    fecha_registro: string;
    activo: boolean;
    imagen_principal?: {
        id: number;
        nombre_archivo: string;
        imagen_base64?: string;
        es_principal: boolean;
    };
    total_imagenes: number;
}

export interface UsuarioCreate {
    nombre: string;
    apellido: string;
    email: string;
    id_estudiante?: string;
    imagenes: string[]; // Base64 images
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