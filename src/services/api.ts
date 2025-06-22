import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://fr-ml-api-production.up.railway.app/api/v1';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: BASE_URL,
            timeout: 30000, // 30 segundos para reconocimiento
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor para requests
        this.api.interceptors.request.use(
            (config) => {
                console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Interceptor para responses
        this.api.interceptors.response.use(
            (response) => {
                console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('❌ API Response Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    // Método para crear FormData con imagen
    createFormData(data: Record<string, any>, imageUri?: string, imageName: string = 'imagen'): FormData {
        const formData = new FormData();

        // Añadir imagen si se proporciona
        if (imageUri) {
            formData.append(imageName, {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'image.jpg',
            } as any);
        }

        // Añadir otros campos
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        return formData;
    }

    get axiosInstance() {
        return this.api;
    }
}

export const apiService = new ApiService();

// src/services/userService.ts
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

    // Listar usuarios
    static async getUsers(
        pagina: number = 1,
        itemsPorPagina: number = 20,
        filters?: {
            nombre?: string;
            apellido?: string;
            email?: string;
            requisitoriado?: boolean;
            activo?: boolean;
        }
    ): Promise<ResponsePaginado<Usuario>> {
        const params = new URLSearchParams({
            pagina: pagina.toString(),
            items_por_pagina: itemsPorPagina.toString(),
            incluir_imagen: 'true',
            ...filters,
        });

        const response = await apiService.axiosInstance.get(`/usuarios/?${params}`);
        return response.data;
    }

    // Obtener usuario por ID de estudiante
    static async getUserByStudentId(
        idEstudiante: string,
        incluirImagenes: boolean = true,
        incluirReconocimientos: boolean = false
    ): Promise<ResponseWithData<Usuario>> {
        const params = new URLSearchParams({
            incluir_imagenes: incluirImagenes.toString(),
            incluir_reconocimientos: incluirReconocimientos.toString(),
        });

        const response = await apiService.axiosInstance.get(
            `/usuarios/estudiante/${idEstudiante}?${params}`
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
        const params = new URLSearchParams({
            eliminar_definitivo: eliminarDefinitivo.toString(),
        });

        const response = await apiService.axiosInstance.delete(`/usuarios/${usuarioId}?${params}`);
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