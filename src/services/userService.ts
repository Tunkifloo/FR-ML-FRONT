import { apiService } from './api';
import { handleApiError } from '../utils/errorHandler';
import {
    ResponseWithData,
    ResponsePaginado,
    Usuario,
    UsuarioCreate,
    EstadisticasUsuarios,
    TrainingStatus
} from '../types';

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

    // Obtener usuario por ID numérico (PK)
    static async getUserById(
        usuarioId: number,
        incluirImagenes: boolean = true,
        incluirReconocimientos: boolean = false
    ): Promise<ResponseWithData<Usuario>> {
        try {
            const params = new URLSearchParams();
            params.append('incluir_imagenes', incluirImagenes.toString());
            params.append('incluir_reconocimientos', incluirReconocimientos.toString());

            const response = await apiService.axiosInstance.get(
                `/usuarios/${usuarioId}?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error in getUserById:', error);
            throw new Error(handleApiError(error, 'Error al obtener usuario por ID'));
        }
    }

    // DEPRECADO: Obtener usuario por ID de estudiante - ENDPOINT NO OPERATIVO
    static async getUserByStudentId(
        idEstudiante: string,
        incluirImagenes: boolean = true,
        incluirReconocimientos: boolean = false
    ): Promise<ResponseWithData<Usuario>> {
        try {
            // MÉTODO ALTERNATIVO: Buscar a través del listado con filtro por ID de estudiante
            console.warn('⚠️ Endpoint /usuarios/estudiante/{id} no operativo. Usando búsqueda alternativa...');

            // Intentar buscar por ID de estudiante usando el listado con filtros
            const searchResponse = await this.getUsers(1, 100, {
                // Nota: El filtro por id_estudiante puede no estar disponible en el endpoint de listado
                // En ese caso, necesitaremos buscar manualmente
            });

            // Buscar manualmente en los resultados
            const foundUser = searchResponse.data.find(user =>
                user.id_estudiante === idEstudiante
            );

            if (!foundUser) {
                throw new Error(`Usuario con ID de estudiante '${idEstudiante}' no encontrado`);
            }

            // Si se encuentra, obtener los detalles completos usando el ID numérico
            if (incluirImagenes || incluirReconocimientos) {
                return await this.getUserById(foundUser.id, incluirImagenes, incluirReconocimientos);
            }

            // Si no se necesitan detalles adicionales, retornar el usuario encontrado
            return {
                success: true,
                message: `Usuario '${idEstudiante}' obtenido exitosamente`,
                data: foundUser,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error in getUserByStudentId:', error);
            throw new Error(handleApiError(error, 'Error al obtener usuario por ID de estudiante'));
        }
    }

    // NUEVO: Buscar usuario por ID de estudiante con búsqueda optimizada
    static async searchUserByStudentId(idEstudiante: string): Promise<Usuario | null> {
        try {
            console.log(`🔍 Buscando usuario con ID estudiante: ${idEstudiante}`);

            // Buscar en páginas hasta encontrar el usuario
            let page = 1;
            const pageSize = 50;
            let hasMore = true;

            while (hasMore) {
                const response = await this.getUsers(page, pageSize);

                // Buscar en los resultados actuales
                const foundUser = response.data.find(user =>
                    user.id_estudiante === idEstudiante
                );

                if (foundUser) {
                    console.log(`✅ Usuario encontrado: ${foundUser.nombre} ${foundUser.apellido} (ID: ${foundUser.id})`);
                    return foundUser;
                }

                // Verificar si hay más páginas
                hasMore = page < response.total_paginas;
                page++;

                // Límite de seguridad para evitar bucles infinitos
                if (page > 20) {
                    console.warn('⚠️ Límite de búsqueda alcanzado (20 páginas)');
                    break;
                }
            }

            console.log(`❌ Usuario con ID estudiante '${idEstudiante}' no encontrado`);
            return null;

        } catch (error) {
            console.error('Error in searchUserByStudentId:', error);
            throw new Error(handleApiError(error, 'Error al buscar usuario'));
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

    // Obtener estado del entrenamiento
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