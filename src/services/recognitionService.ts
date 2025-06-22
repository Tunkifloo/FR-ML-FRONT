import { apiService } from './api';
import {
    ResponseWithData,
    RecognitionResult,
    HistorialReconocimiento,
    EstadisticasReconocimiento,
    ModelInfo,
    AlertaSeguridad
} from '../types';

export class RecognitionService {
    // Identificar persona en imagen
    static async identifyPerson(
        imageUri: string,
        algoritmo: 'eigenfaces' | 'lbp' | 'hybrid' = 'hybrid',
        incluirDetalles: boolean = true
    ): Promise<ResponseWithData<RecognitionResult>> {
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
    }

    // Obtener estadísticas de reconocimientos
    static async getRecognitionStatistics(dias: number = 30): Promise<ResponseWithData<EstadisticasReconocimiento>> {
        const params = new URLSearchParams();
        params.append('dias', dias.toString());

        const response = await apiService.axiosInstance.get(`/reconocimiento/estadisticas?${params.toString()}`);
        return response.data;
    }

    // Obtener información del modelo
    static async getModelInfo(): Promise<ResponseWithData<ModelInfo>> {
        const response = await apiService.axiosInstance.get('/reconocimiento/modelo/info');
        return response.data;
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
        const params = new URLSearchParams();
        params.append('limite', limite.toString());

        if (nivel) {
            params.append('nivel', nivel);
        }

        const response = await apiService.axiosInstance.get(`/reconocimiento/alertas/historial?${params.toString()}`);
        return response.data;
    }
}