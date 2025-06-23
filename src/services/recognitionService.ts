import { apiService } from './api';
import { handleApiError } from '../utils/errorHandler';
import {
    ResponseWithData,
    RecognitionResult,
    HistorialReconocimiento,
    EstadisticasReconocimiento,
    ModelInfo,
    AlertaSeguridad,
    DetailedModelInfo
} from '../types';

export class RecognitionService {
    // Identificar persona en imagen
    static async identifyPerson(
        imageUri: string,
        algoritmo: 'eigenfaces' | 'lbp' | 'hybrid' = 'hybrid',
        incluirDetalles: boolean = true
    ): Promise<ResponseWithData<RecognitionResult>> {
        try {
            const formData = apiService.createFormData({
                algoritmo,
                incluir_detalles: incluirDetalles,
            }, imageUri);

            const response = await apiService.axiosInstance.post('/reconocimiento/identificar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 segundos para reconocimiento
            });

            return response.data;
        } catch (error) {
            console.error('Error in identifyPerson:', error);
            throw new Error(handleApiError(error, 'Error al identificar persona'));
        }
    }

    // Obtener historial de reconocimientos
    static async getRecognitionHistory(
        pagina: number = 1,
        itemsPorPagina: number = 20,
        filters: {
            usuario_id?: number;
            reconocido?: boolean;
            alerta_generada?: boolean;
            confianza_minima?: number;
        } = {}
    ): Promise<ResponseWithData<{
        reconocimientos: HistorialReconocimiento[];
        paginacion: {
            total: number;
            pagina: number;
            items_por_pagina: number;
            total_paginas: number;
        };
    }>> {
        try {
            const params = new URLSearchParams();

            // Parámetros básicos
            params.append('pagina', pagina.toString());
            params.append('items_por_pagina', itemsPorPagina.toString());

            // Agregar filtros si existen
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });

            const response = await apiService.axiosInstance.get(`/reconocimiento/historial?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error in getRecognitionHistory:', error);
            throw new Error(handleApiError(error, 'Error al obtener historial de reconocimientos'));
        }
    }

    // Obtener estadísticas de reconocimientos
    static async getRecognitionStatistics(dias: number = 30): Promise<ResponseWithData<EstadisticasReconocimiento>> {
        try {
            const params = new URLSearchParams();
            params.append('dias', dias.toString());

            const response = await apiService.axiosInstance.get(`/reconocimiento/estadisticas?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error in getRecognitionStatistics:', error);
            throw new Error(handleApiError(error, 'Error al obtener estadísticas de reconocimiento'));
        }
    }

    // Obtener información del modelo
    static async getModelInfo(): Promise<ResponseWithData<DetailedModelInfo>> {
        try {
            const response = await apiService.axiosInstance.get('/reconocimiento/modelo/info');
            return response.data;
        } catch (error) {
            console.error('Error in getModelInfo:', error);
            throw new Error(handleApiError(error, 'Error al obtener información del modelo'));
        }
    }

    // Obtener historial de alertas
    static async getAlertsHistory(
        limite: number = 50,
        nivel?: 'HIGH' | 'MEDIUM' | 'LOW'
    ): Promise<ResponseWithData<{
        total_alertas: number;
        filtro_nivel?: string;
        alertas: AlertaSeguridad[];
    }>> {
        try {
            const params = new URLSearchParams();
            params.append('limite', limite.toString());

            if (nivel) {
                params.append('nivel', nivel);
            }

            const response = await apiService.axiosInstance.get(`/reconocimiento/alertas/historial?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error in getAlertsHistory:', error);
            throw new Error(handleApiError(error, 'Error al obtener historial de alertas'));
        }
    }

    // Obtener estadísticas de alertas
    static async getAlertsStatistics(): Promise<ResponseWithData<any>> {
        try {
            const response = await apiService.axiosInstance.get('/reconocimiento/alertas/estadisticas');
            return response.data;
        } catch (error) {
            console.error('Error in getAlertsStatistics:', error);
            throw new Error(handleApiError(error, 'Error al obtener estadísticas de alertas'));
        }
    }

    // Probar reconocimiento
    static async testRecognition(
        algoritmo: 'eigenfaces' | 'lbp' | 'hybrid' = 'hybrid'
    ): Promise<ResponseWithData<any>> {
        try {
            const formData = apiService.createFormData({
                algoritmo,
            });

            const response = await apiService.axiosInstance.post('/reconocimiento/test-reconocimiento', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error in testRecognition:', error);
            throw new Error(handleApiError(error, 'Error al probar reconocimiento'));
        }
    }

    // Recargar modelo
    static async reloadModel(): Promise<ResponseWithData<any>> {
        try {
            const response = await apiService.axiosInstance.post('/reconocimiento/modelo/recargar');
            return response.data;
        } catch (error) {
            console.error('Error in reloadModel:', error);
            throw new Error(handleApiError(error, 'Error al recargar modelo'));
        }
    }
}