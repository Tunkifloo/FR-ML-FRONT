export interface EstadisticasCompletas {
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
        confianza_promedio_exitosos: number;
        promedio_diario: number;
    };
    metricas_ml: {
        precision: number;
        recall: number;
        f1_score: number;
        accuracy: number;
        avg_confidence: number;
        total_samples: number;
        num_classes: number;
    };
    matriz_confusion: {
        matrix: number[][];
        labels: string[];
        user_ids: number[];
        shape: number[];
    };
    visualizaciones: {
        distribucion_confianza: {
            [key: string]: {
                min: number;
                max: number;
                count: number;
                color: string;
            };
        };
        series_temporales: {
            labels: string[];
            datasets: {
                total: (number | string)[];
                exitosos: (number | string)[];
                alertas: (number | string)[];
                confianza_promedio: (number | string)[];
            };
        };
        top_usuarios: {
            labels: string[];
            data: number[];
            confidence: number[];
        };
        distribucion_alertas: {
            [key: string]: number;
        };
        algoritmos: {
            [key: string]: {
                total: number;
                exitosos: number;
                confianza_promedio: number;
            };
        };
    };
}

export interface AlgoritmoStats {
    total: number;
    exitosos: number;
    confianza_promedio: number;
}

export interface MatrizConfusionVisual {
    image_base64: string;
    stats: {
        correct_predictions: number;
        total_predictions: number;
        accuracy: number;
        users_analyzed: number;
    };
    metadata: {
        dias_analizados: number;
        fecha_generacion: string;
        total_reconocimientos: number;
    };
}