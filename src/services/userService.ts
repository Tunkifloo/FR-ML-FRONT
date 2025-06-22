import { apiService } from './api';
import {
    ResponseWithData,
    ResponsePaginado,
    Usuario,
    UsuarioCreate,
    EstadisticasUsuarios,
    EstadoEntrenamiento
} from '../types';

export class UserService {
    // Crear nuevo usuario
    static async createUser(userData: UsuarioCreate, imageUris: string[]): Promise<ResponseWithData<Usuario>> {
        const formData = new FormData();

        // Añadir datos del usuario
        formData.append('nombre', userData.nombre);
        formData.append('apellido', userData.apellido);
        formData.append('email', userData.email);
        if (userData.id_estudiante) {
            formData.append('id_estudiante', userData.id_estudiante);
        }

        // Añadir imágenes
        imageUris.forEach((uri, index) => {
            formData.append('imagenes', {
                uri,
                type: 'image/jpeg',
                name: `image_${index}.jpg`,
            } as any);
        });

        const response = await apiService.axiosInstance.post('/usuarios/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    // Listar usuarios con filtros opcionales
    static async getUsers(
        pagina: number = 1,
        itemsPorPagina: number = 20,
        filters: {
            nombre?: string;
            apellido?: string;
            email?: string;
            requisitoriado?: boolean;
            activo?: boolean;
        } = {}
    ): Promise<ResponsePaginado<Usuario>> {
        const params = new URLSearchParams();

        // Parámetros básicos
        params.append('pagina', pagina.toString());
        params.append('items_por_pagina', itemsPorPagina.toString());
        params.append('incluir_imagen', 'true');

        // Agregar filtros si existen
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await apiService.axiosInstance.get(`/usuarios/?${params.toString()}`);
        return response.data;
    }

    // Obtener usuario por ID de estudiante
    static async getUserByStudentId(
        idEstudiante: string,
        incluirImagenes: boolean = true,
        incluirReconocimientos: boolean = false
    ): Promise<ResponseWithData<Usuario>> {
        const params = new URLSearchParams();
        params.append('incluir_imagenes', incluirImagenes.toString());
        params.append('incluir_reconocimientos', incluirReconocimientos.toString());

        const response = await apiService.axiosInstance.get(
            `/usuarios/estudiante/${idEstudiante}?${params.toString()}`
        );
        return response.data;
    }

    // Actualizar usuario
    static async updateUser(
        usuarioId: number,
        updateData: Partial<UsuarioCreate>
    ): Promise<ResponseWithData<Usuario>> {
        const formData = apiService.createFormData(updateData);

        const response = await apiService.axiosInstance.put(`/usuarios/${usuarioId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    // Eliminar usuario
    static async deleteUser(
        usuarioId: number,
        eliminarDefinitivo: boolean = false
    ): Promise<ResponseWithData> {
        const params = new URLSearchParams();
        params.append('eliminar_definitivo', eliminarDefinitivo.toString());

        const response = await apiService.axiosInstance.delete(`/usuarios/${usuarioId}?${params.toString()}`);
        return response.data;
    }

    // Añadir imágenes a usuario
    static async addUserImages(usuarioId: number, imageUris: string[]): Promise<ResponseWithData> {
        const formData = new FormData();

        imageUris.forEach((uri, index) => {
            formData.append('imagenes', {
                uri,
                type: 'image/jpeg',
                name: `additional_image_${index}.jpg`,
            } as any);
        });

        const response = await apiService.axiosInstance.post(
            `/usuarios/${usuarioId}/imagenes`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    // Obtener estadísticas de usuarios
    static async getUserStatistics(): Promise<ResponseWithData<EstadisticasUsuarios>> {
        const response = await apiService.axiosInstance.get('/usuarios/estadisticas/resumen');
        return response.data;
    }

    // Entrenar modelo
    static async trainModel(): Promise<ResponseWithData> {
        const response = await apiService.axiosInstance.post('/usuarios/entrenar-modelo');
        return response.data;
    }

    // Obtener estado del entrenamiento
    static async getTrainingStatus(): Promise<ResponseWithData<EstadoEntrenamiento>> {
        const response = await apiService.axiosInstance.get('/usuarios/entrenamiento/estado');
        return response.data;
    }
}