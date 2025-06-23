import { apiService } from './api';
import { handleApiError } from '../utils/errorHandler';
import {
    ResponseWithData,
    ResponsePaginado,
    Usuario,
    UsuarioCreate,
    EstadisticasUsuarios
} from '../types';

// Tipo para el estado de entrenamiento real
interface TrainingStatus {
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

export class UserService {
    // Crear nuevo usuario
    static async createUser(userData: UsuarioCreate, imageUris: string[]): Promise<ResponseWithData<Usuario>> {
        try {
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
        } catch (error) {
            console.error('Error in createUser:', error);
            throw new Error(handleApiError(error, 'Error al crear usuario'));
        }
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
        try {
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
        } catch (error) {
            console.error('Error in getUsers:', error);
            throw new Error(handleApiError(error, 'Error al obtener usuarios'));
        }
    }

    // Obtener usuario por ID de estudiante
    static async getUserByStudentId(
        idEstudiante: string,
        incluirImagenes: boolean = true,
        incluirReconocimientos: boolean = false
    ): Promise<ResponseWithData<Usuario>> {
        try {
            const params = new URLSearchParams();
            params.append('incluir_imagenes', incluirImagenes.toString());
            params.append('incluir_reconocimientos', incluirReconocimientos.toString());

            const response = await apiService.axiosInstance.get(
                `/usuarios/estudiante/${idEstudiante}?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error in getUserByStudentId:', error);
            throw new Error(handleApiError(error, 'Error al obtener usuario por ID de estudiante'));
        }
    }

    // Actualizar usuario
    static async updateUser(
        usuarioId: number,
        updateData: Partial<UsuarioCreate>
    ): Promise<ResponseWithData<Usuario>> {
        try {
            const formData = apiService.createFormData(updateData);

            const response = await apiService.axiosInstance.put(`/usuarios/${usuarioId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error in updateUser:', error);
            throw new Error(handleApiError(error, 'Error al actualizar usuario'));
        }
    }

    // Eliminar usuario
    static async deleteUser(
        usuarioId: number,
        eliminarDefinitivo: boolean = false
    ): Promise<ResponseWithData> {
        try {
            const params = new URLSearchParams();
            params.append('eliminar_definitivo', eliminarDefinitivo.toString());

            const response = await apiService.axiosInstance.delete(`/usuarios/${usuarioId}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error in deleteUser:', error);
            throw new Error(handleApiError(error, 'Error al eliminar usuario'));
        }
    }

    // Añadir imágenes a usuario
    static async addUserImages(usuarioId: number, imageUris: string[]): Promise<ResponseWithData> {
        try {
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
        } catch (error) {
            console.error('Error in addUserImages:', error);
            throw new Error(handleApiError(error, 'Error al añadir imágenes'));
        }
    }

    // Obtener estadísticas de usuarios
    static async getUserStatistics(): Promise<ResponseWithData<EstadisticasUsuarios>> {
        try {
            const response = await apiService.axiosInstance.get('/usuarios/estadisticas/resumen');
            return response.data;
        } catch (error) {
            console.error('Error in getUserStatistics:', error);
            throw new Error(handleApiError(error, 'Error al obtener estadísticas de usuarios'));
        }
    }

    // Entrenar modelo
    static async trainModel(): Promise<ResponseWithData> {
        try {
            const response = await apiService.axiosInstance.post('/usuarios/entrenar-modelo');
            return response.data;
        } catch (error) {
            console.error('Error in trainModel:', error);
            throw new Error(handleApiError(error, 'Error al entrenar modelo'));
        }
    }

    // Obtener estado del entrenamiento (endpoint actualizado)
    static async getTrainingStatus(): Promise<ResponseWithData<TrainingStatus>> {
        try {
            const response = await apiService.axiosInstance.get('/usuarios/entrenamiento/estado');
            return response.data;
        } catch (error) {
            console.error('Error in getTrainingStatus:', error);
            throw new Error(handleApiError(error, 'Error al obtener estado del entrenamiento'));
        }
    }

    // Forzar reentrenamiento
    static async forceRetrain(): Promise<ResponseWithData> {
        try {
            const response = await apiService.axiosInstance.post('/usuarios/entrenamiento/forzar');
            return response.data;
        } catch (error) {
            console.error('Error in forceRetrain:', error);
            throw new Error(handleApiError(error, 'Error al forzar reentrenamiento'));
        }
    }
}