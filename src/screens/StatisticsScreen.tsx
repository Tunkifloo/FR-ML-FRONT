import React, { useState, useEffect, JSX } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { RecognitionService } from '../services/recognitionService';
import { AlertStats, EstadisticasCompletas, MatrizConfusionVisual } from '../types';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

interface StatisticsScreenProps {
    navigation: {
        navigate: (screenName: string) => void;
    };
}

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen({ navigation }: StatisticsScreenProps): JSX.Element {
    // Estados existentes
    const [alertStats, setAlertStats] = useState<AlertStats | null>(null);

    // Estados nuevos
    const [completeStats, setCompleteStats] = useState<EstadisticasCompletas | null>(null);
    const [confusionMatrix, setConfusionMatrix] = useState<MatrizConfusionVisual | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDays, setSelectedDays] = useState(30);

    const loadAllStatistics = async () => {
        try {
            setError(null);

            // Cargar en paralelo
            const [alertsResponse, completeResponse] = await Promise.all([
                RecognitionService.getAlertsStatistics(),
                RecognitionService.getCompleteStatistics(selectedDays)
            ]);

            setAlertStats(alertsResponse.data);
            setCompleteStats(completeResponse.data);

            // Cargar matriz de confusión si hay datos
            if (completeResponse.data.resumen.reconocimientos_exitosos > 0) {
                try {
                    const matrixResponse = await RecognitionService.getConfusionMatrixVisual(selectedDays);
                    setConfusionMatrix(matrixResponse.data);
                } catch (matrixError) {
                    console.log('Matriz de confusión no disponible:', matrixError);
                }
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Error al cargar estadísticas';
            setError(errorMessage);
            console.error('Error loading statistics:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAllStatistics();
    }, [selectedDays]);

    const onRefresh = () => {
        setRefreshing(true);
        loadAllStatistics();
    };

    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    // Preparar datos para gráfico de distribución de confianza
    const getConfidenceDistribution = () => {
        if (!completeStats || !completeStats.visualizaciones.distribucion_confianza) return [];

        return Object.entries(completeStats.visualizaciones.distribucion_confianza)
            .filter(([_, data]) => data.count > 0)
            .map(([range, data]) => ({
                name: range,
                population: data.count,
                color: data.color,
                legendFontColor: colors.text,
                legendFontSize: 11,
            }));
    };

    // Preparar datos para alertas (existente)
    const getAlertLevelDistribution = () => {
        if (!alertStats || !alertStats.by_level) return [];

        const levelColors = {
            HIGH: colors.secondary,
            MEDIUM: colors.warning,
            LOW: colors.info,
        };

        return Object.entries(alertStats.by_level)
            .filter(([_, count]) => count > 0)
            .map(([level, count]) => ({
                name: level === 'HIGH' ? 'Críticas' : level === 'MEDIUM' ? 'Medias' : 'Bajas',
                population: count,
                color: levelColors[level as keyof typeof levelColors],
                legendFontColor: colors.text,
                legendFontSize: 12,
            }));
    };

    if (loading && !completeStats) {
        return <Loading message="Cargando estadísticas..." />;
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                <ScrollView
                    style={globalStyles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {error && (
                        <ErrorMessage message={error} onRetry={loadAllStatistics} />
                    )}

                    {/* Selector de Período */}
                    <Card title="📅 Período de Análisis">
                        <View style={[globalStyles.row, globalStyles.spaceBetween, {flexWrap: 'wrap'}]}>
                            {[7, 15, 30, 90].map((days) => (
                                <TouchableOpacity
                                    key={days}
                                    style={[
                                        {
                                            paddingVertical: 8,
                                            paddingHorizontal: 16,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: selectedDays === days ? colors.primary : colors.border,
                                            backgroundColor: selectedDays === days ? colors.primary : 'transparent',
                                            marginBottom: 8,
                                        }
                                    ]}
                                    onPress={() => setSelectedDays(days)}
                                >
                                    <Text style={[
                                        typography.body2,
                                        { color: selectedDays === days ? colors.surface : colors.text }
                                    ]}>
                                        {days} días
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Estadísticas Generales de Reconocimiento */}
                    {completeStats && (
                        <>
                            <Card title="📊 Resumen de Reconocimientos">
                                <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.primary }]}>
                                            {completeStats.resumen.total_reconocimientos}
                                        </Text>
                                        <Text style={typography.caption}>Total</Text>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.success }]}>
                                            {completeStats.resumen.reconocimientos_exitosos}
                                        </Text>
                                        <Text style={typography.caption}>Exitosos</Text>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.warning }]}>
                                            {completeStats.resumen.tasa_exito.toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Tasa Éxito</Text>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.info }]}>
                                            {completeStats.resumen.confianza_promedio_exitosos.toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Confianza</Text>
                                    </View>
                                </View>

                                <View style={globalStyles.marginTop16}>
                                    <Text style={typography.body2}>
                                        📈 Promedio diario: {completeStats.resumen.promedio_diario.toFixed(1)} reconocimientos
                                    </Text>
                                    <Text style={typography.body2}>
                                        🚨 Alertas generadas: {completeStats.resumen.alertas_generadas}
                                    </Text>
                                </View>
                            </Card>

                            {/* Métricas de Machine Learning */}
                            <Card title="🤖 Métricas de Machine Learning">
                                <View style={[globalStyles.row, globalStyles.spaceBetween, {flexWrap: 'wrap'}]}>
                                    <View style={[globalStyles.alignCenter, {width: '45%', marginBottom: 16}]}>
                                        <Text style={[typography.h2, { color: colors.primary }]}>
                                            {(completeStats.metricas_ml.precision * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Precisión</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, {width: '45%', marginBottom: 16}]}>
                                        <Text style={[typography.h2, { color: colors.success }]}>
                                            {(completeStats.metricas_ml.recall * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Recall</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, {width: '45%'}]}>
                                        <Text style={[typography.h2, { color: colors.info }]}>
                                            {(completeStats.metricas_ml.f1_score * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>F1-Score</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, {width: '45%'}]}>
                                        <Text style={[typography.h2, { color: colors.warning }]}>
                                            {(completeStats.metricas_ml.accuracy * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Accuracy</Text>
                                    </View>
                                </View>

                                <View style={[globalStyles.marginTop16, {backgroundColor: colors.background, padding: 12, borderRadius: 8}]}>
                                    <Text style={typography.body2}>
                                        📊 Muestras analizadas: {completeStats.metricas_ml.total_samples}
                                    </Text>
                                    <Text style={typography.body2}>
                                        👥 Clases distintas: {completeStats.metricas_ml.num_classes}
                                    </Text>
                                </View>
                            </Card>

                            {/* Matriz de Confusión Visual */}
                            {confusionMatrix && confusionMatrix.data && (
                                <Card title="🎯 Matriz de Confusión">
                                    <Text style={[typography.body2, {marginBottom: 12, color: colors.textLight}]}>
                                        {confusionMatrix.message || 'Visualización de predicciones vs realidad'}
                                    </Text>

                                    {confusionMatrix.data.image_base64 ? (
                                        <>
                                            <Image
                                                source={{
                                                    uri: confusionMatrix.data.image_base64.startsWith('data:image')
                                                        ? confusionMatrix.data.image_base64
                                                        : `data:image/png;base64,${confusionMatrix.data.image_base64}`
                                                }}
                                                style={{
                                                    width: screenWidth - 64,
                                                    height: screenWidth - 64,
                                                    resizeMode: 'contain',
                                                    borderRadius: 8,
                                                    backgroundColor: colors.background,
                                                }}
                                                onError={(error) => {
                                                    console.error('Error cargando matriz de confusión:', error.nativeEvent.error);
                                                }}
                                                onLoad={() => {
                                                    console.log('✅ Matriz de confusión cargada exitosamente');
                                                }}
                                            />

                                            {confusionMatrix.data.stats && (
                                                <View style={[globalStyles.marginTop16, {
                                                    backgroundColor: colors.background,
                                                    padding: 12,
                                                    borderRadius: 8
                                                }]}>
                                                    <Text style={typography.body2}>
                                                        ✅ Correctas: {confusionMatrix.data.stats.correct_predictions || 0} / {confusionMatrix.data.stats.total_predictions || 0}
                                                    </Text>
                                                    <Text style={typography.body2}>
                                                        📊 Precisión: {((confusionMatrix.data.stats.accuracy || 0) * 100).toFixed(1)}%
                                                    </Text>
                                                    <Text style={typography.body2}>
                                                        👥 Usuarios: {confusionMatrix.data.stats.users_analyzed || 0}
                                                    </Text>
                                                </View>
                                            )}
                                        </>
                                    ) : (
                                        <View style={[globalStyles.center, {padding: 20}]}>
                                            <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
                                            <Text style={[typography.body2, {marginTop: 8, textAlign: 'center', color: colors.textLight}]}>
                                                No hay suficientes datos para generar la matriz de confusión
                                            </Text>
                                        </View>
                                    )}
                                </Card>
                            )}

                            {/* Distribución de Confianza */}
                            {getConfidenceDistribution().length > 0 && (
                                <Card title="📈 Distribución de Confianza">
                                    <PieChart
                                        data={getConfidenceDistribution()}
                                        width={screenWidth - 64}
                                        height={220}
                                        chartConfig={chartConfig}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                        center={[10, 0]}
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                    />
                                </Card>
                            )}

                            {/* Top Usuarios Reconocidos */}
                            {completeStats.visualizaciones.top_usuarios.labels.length > 0 && (
                                <Card title="🏆 Top Usuarios Reconocidos">
                                    <BarChart
                                        data={{
                                            labels: completeStats.visualizaciones.top_usuarios.labels.map(l => l.split(' ')[0]),
                                            datasets: [{
                                                data: completeStats.visualizaciones.top_usuarios.data
                                            }]
                                        }}
                                        width={screenWidth - 64}
                                        height={220}
                                        yAxisLabel=""
                                        yAxisSuffix=""
                                        chartConfig={{
                                            ...chartConfig,
                                            barPercentage: 0.7,
                                        }}
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                        showValuesOnTopOfBars
                                    />
                                    <View style={globalStyles.marginTop8}>
                                        {completeStats.visualizaciones.top_usuarios.labels.map((label, idx) => (
                                            <Text key={idx} style={typography.caption}>
                                                {label}: {completeStats.visualizaciones.top_usuarios.data[idx]} reconocimientos
                                                (Conf: {completeStats.visualizaciones.top_usuarios.confidence[idx].toFixed(1)}%)
                                            </Text>
                                        ))}
                                    </View>
                                </Card>
                            )}

                            {/* Series Temporales */}
                            {completeStats.visualizaciones.series_temporales.labels.length > 0 && (
                                <Card title="📅 Reconocimientos por Día">
                                    <LineChart
                                        data={{
                                            labels: completeStats.visualizaciones.series_temporales.labels.map(d => {
                                                const date = new Date(d);
                                                return date.getDate().toString();
                                            }),
                                            datasets: [
                                                {
                                                    data: completeStats.visualizaciones.series_temporales.datasets.total.map(v => Number(v) || 0),
                                                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                                    strokeWidth: 2
                                                },
                                                {
                                                    data: completeStats.visualizaciones.series_temporales.datasets.exitosos.map(v => Number(v) || 0),
                                                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                                                    strokeWidth: 2
                                                }
                                            ],
                                            legend: ["Total", "Exitosos"]
                                        }}
                                        width={screenWidth - 64}
                                        height={220}
                                        chartConfig={{
                                            ...chartConfig,
                                            propsForDots: {
                                                r: "4",
                                                strokeWidth: "2",
                                            }
                                        }}
                                        bezier
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                        withInnerLines={true}
                                        withOuterLines={true}
                                        withVerticalLabels={true}
                                        withHorizontalLabels={true}
                                        fromZero={true}
                                    />
                                </Card>
                            )}
                        </>
                    )}

                    {/* Estadísticas de Alertas - MANTENER LO EXISTENTE */}
                    {alertStats && (
                        <>
                            <Card title="🚨 Estadísticas de Alertas de Seguridad">
                                <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.secondary }]}>
                                            {alertStats.total_alerts}
                                        </Text>
                                        <Text style={typography.caption}>Total</Text>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.secondary }]}>
                                            {alertStats.by_level.HIGH}
                                        </Text>
                                        <Text style={typography.caption}>Críticas</Text>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.warning }]}>
                                            {alertStats.by_level.MEDIUM}
                                        </Text>
                                        <Text style={typography.caption}>Medias</Text>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.h2, { color: colors.info }]}>
                                            {alertStats.by_level.LOW}
                                        </Text>
                                        <Text style={typography.caption}>Bajas</Text>
                                    </View>
                                </View>

                                <View style={globalStyles.marginTop16}>
                                    <Text style={typography.body2}>
                                        📊 Promedio diario: {alertStats.daily_average.toFixed(2)} alertas
                                    </Text>
                                    <Text style={typography.body2}>
                                        📅 Últimos 30 días: {alertStats.last_30_days} alertas
                                    </Text>
                                    {alertStats.most_common_requisition && (
                                        <Text style={typography.body2}>
                                            🚨 Tipo más común: {alertStats.most_common_requisition}
                                        </Text>
                                    )}
                                </View>
                            </Card>

                            {/* Distribución por Nivel de Alerta */}
                            {getAlertLevelDistribution().length > 0 && (
                                <Card title="Distribución por Nivel de Alerta">
                                    <PieChart
                                        data={getAlertLevelDistribution()}
                                        width={screenWidth - 64}
                                        height={220}
                                        chartConfig={chartConfig}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                        center={[10, 0]}
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                    />
                                </Card>
                            )}
                        </>
                    )}

                    {/* Botón para ver Historial de Alertas */}
                    <TouchableOpacity
                        style={[globalStyles.alertButton, globalStyles.marginTop16]}
                        onPress={() => navigation.navigate('Alerts')}
                    >
                        <View style={[globalStyles.row, globalStyles.alignCenter]}>
                            <Ionicons name="alert-circle" size={20} color={colors.surface} />
                            <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>
                                Ver Historial Completo de Alertas
                            </Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}