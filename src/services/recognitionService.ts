import { apiService } from './api';
import { handleApiError } from '../utils/errorHandler';
import {
    ResponseWithData,
    RecognitionResult,
    DetailedModelInfo,
    AlertStats,
    RecognitionHistoryData,
    AlertsData
} from '../types';
import {EstadisticasCompletas, MatrizConfusionVisual} from "@/types/statistics";

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
    ): Promise<ResponseWithData<RecognitionHistoryData>> {
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
    static async getRecognitionStatistics(dias: number = 30): Promise<ResponseWithData<any>> {
        try {
            // NOTA: Este endpoint no está operativo según las especificaciones
            // Se mantiene para compatibilidad pero debería mostrar mensaje de desarrollo
            console.warn('⚠️ Endpoint /reconocimiento/estadisticas no está operativo');

            const params = new URLSearchParams();
            params.append('dias', dias.toString());

            const response = await apiService.axiosInstance.get(`/reconocimiento/estadisticas?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error in getRecognitionStatistics (endpoint no operativo):', error);
            throw new Error('Las estadísticas de reconocimiento están en desarrollo');
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
    ): Promise<ResponseWithData<AlertsData>> {
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
    static async getAlertsStatistics(): Promise<ResponseWithData<AlertStats>> {
        try {
            const response = await apiService.axiosInstance.get('/reconocimiento/alertas/estadisticas');
            return response.data;
        } catch (error) {
            console.error('Error in getAlertsStatistics:', error);
            throw new Error(handleApiError(error, 'Error al obtener estadísticas de alertas'));
        }
    }

    /**
     * Obtener estadísticas completas del sistema
     */
    static async getCompleteStatistics(dias: number = 30): Promise<ResponseWithData<EstadisticasCompletas>> {
        try {
            const params = new URLSearchParams();
            params.append('dias', dias.toString());

            const response = await apiService.axiosInstance.get(
                `/reconocimiento/estadisticas-completas?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error in getCompleteStatistics:', error);
            throw new Error(handleApiError(error, 'Error al obtener estadísticas completas'));
        }
    }

    /**
     * Obtener matriz de confusión visual
     */
    static async getConfusionMatrixVisual(dias: number = 30): Promise<ResponseWithData<MatrizConfusionVisual>> {
        try {
            const params = new URLSearchParams();
            params.append('dias', dias.toString());

            const response = await apiService.axiosInstance.get(
                `/reconocimiento/matriz-confusion-visual?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error in getConfusionMatrixVisual:', error);
            throw new Error(handleApiError(error, 'Error al obtener matriz de confusión'));
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

    // Probar sistema de alertas
    static async testAlertSystem(): Promise<ResponseWithData<any>> {
        try {
            const response = await apiService.axiosInstance.post('/reconocimiento/alertas/test');
            return response.data;
        } catch (error) {
            console.error('Error in testAlertSystem:', error);
            throw new Error(handleApiError(error, 'Error al probar sistema de alertas'));
        }
    }

    // Limpiar historial antiguo
    static async clearOldHistory(diasMantener: number = 90): Promise<ResponseWithData<any>> {
        try {
            const params = new URLSearchParams();
            params.append('dias_mantener', diasMantener.toString());

            const response = await apiService.axiosInstance.delete(`/reconocimiento/historial/limpiar?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error in clearOldHistory:', error);
            throw new Error(handleApiError(error, 'Error al limpiar historial'));
        }
    }
}