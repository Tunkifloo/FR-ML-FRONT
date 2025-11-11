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
    const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
    const [completeStats, setCompleteStats] = useState<EstadisticasCompletas | null>(null);
    const [confusionMatrix, setConfusionMatrix] = useState<MatrizConfusionVisual | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDays, setSelectedDays] = useState(30);

    useEffect(() => {
        loadAllStatistics();
    }, [selectedDays]);

    const loadAllStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`Cargando estadísticas para ${selectedDays} días...`);

            const [alertStatsResponse, completeStatsResponse, confusionMatrixResponse] = await Promise.allSettled([
                RecognitionService.getAlertsStatistics(),
                RecognitionService.getCompleteStatistics(selectedDays),
                RecognitionService.getConfusionMatrixVisual(selectedDays)
            ]);

            if (alertStatsResponse.status === 'fulfilled' && alertStatsResponse.value.success) {
                setAlertStats(alertStatsResponse.value.data);
            }

            if (completeStatsResponse.status === 'fulfilled' && completeStatsResponse.value.success) {
                setCompleteStats(completeStatsResponse.value.data);
            } else {
                throw new Error('No se pudieron cargar las estadísticas completas');
            }

            if (confusionMatrixResponse.status === 'fulfilled' && confusionMatrixResponse.value.success) {
                setConfusionMatrix(confusionMatrixResponse.value.data);
            } else {
                setConfusionMatrix(null);
            }

        } catch (err: any) {
            console.error('Error cargando estadísticas:', err);
            setError(err.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setConfusionMatrix(null);
        loadAllStatistics();
    };

    // Función auxiliar para convertir valores a números
    const toNumber = (value: any): number => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    // Configuración de gráficos
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
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: `rgba(31, 41, 55, 0.1)`,
            strokeWidth: 1
        },
        propsForLabels: {
            fontSize: 10,
        },
    };

    // Preparar datos para series temporales
    const getTimeSeriesData = () => {
        if (!completeStats ||
            !completeStats.visualizaciones.series_temporales ||
            completeStats.visualizaciones.series_temporales.labels.length === 0) {
            return null;
        }

        const series = completeStats.visualizaciones.series_temporales;

        // Convertir valores a números
        const totalData = series.datasets.total.map(toNumber);
        const exitososData = series.datasets.exitosos.map(toNumber);

        // Si hay muy pocos datos, no mostrar el gráfico
        if (totalData.length < 2) {
            return null;
        }

        // Formatear labels según la cantidad de días
        let formattedLabels: string[];
        if (series.labels.length <= 7) {
            // Mostrar día completo (ej: "Lun 8")
            formattedLabels = series.labels.map(dateStr => {
                const date = new Date(dateStr);
                const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                return `${dayNames[date.getDay()]} ${date.getDate()}`;
            });
        } else if (series.labels.length <= 15) {
            // Mostrar solo día del mes
            formattedLabels = series.labels.map(dateStr => {
                const date = new Date(dateStr);
                return date.getDate().toString();
            });
        } else {
            // Para 30+ días, mostrar cada N días
            const step = Math.ceil(series.labels.length / 10);
            formattedLabels = series.labels.map((dateStr, idx) => {
                if (idx % step === 0 || idx === series.labels.length - 1) {
                    const date = new Date(dateStr);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }
                return '';
            });
        }

        return {
            labels: formattedLabels,
            datasets: [
                {
                    data: totalData,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    strokeWidth: 2
                },
                {
                    data: exitososData,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    strokeWidth: 2
                }
            ],
            legend: ["Total", "Exitosos"]
        };
    };

    // Preparar datos para distribución de confianza
    const getConfidenceDistribution = () => {
        if (!completeStats || !completeStats.visualizaciones.distribucion_confianza) return [];

        return Object.entries(completeStats.visualizaciones.distribucion_confianza)
            .filter(([_, data]) => data.count > 0)
            .map(([range, data]) => ({
                name: range.replace('-', ' - ') + '%',
                population: data.count,
                color: data.color,
                legendFontColor: colors.text,
                legendFontSize: 11,
            }));
    };

    // Preparar datos para top usuarios
    const getTopUsersData = () => {
        if (!completeStats ||
            !completeStats.visualizaciones.top_usuarios ||
            completeStats.visualizaciones.top_usuarios.labels.length === 0) {
            return null;
        }

        const topUsers = completeStats.visualizaciones.top_usuarios;

        return {
            labels: topUsers.labels.map(label => {
                const words = label.split(' ');
                if (words.length > 1) {
                    return `${words[0]} ${words[1][0]}.`;
                }
                return words[0].length > 10 ? words[0].substring(0, 10) : words[0];
            }),
            datasets: [{
                data: topUsers.data.map(toNumber)
            }]
        };
    };

    // Preparar datos de alertas por nivel
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
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {error && (
                        <ErrorMessage message={error} onRetry={loadAllStatistics} />
                    )}

                    {/* Selector de Período */}
                    <Card title="Período de Análisis">
                        <View style={[globalStyles.row, { flexWrap: 'wrap', gap: 8 }]}>
                            {[7, 15, 30, 90].map((days) => (
                                <TouchableOpacity
                                    key={days}
                                    style={[
                                        {
                                            flex: 1,
                                            minWidth: '22%',
                                            paddingVertical: 10,
                                            paddingHorizontal: 12,
                                            borderRadius: 8,
                                            borderWidth: 2,
                                            borderColor: selectedDays === days ? colors.primary : colors.border,
                                            backgroundColor: selectedDays === days ? colors.primary : 'transparent',
                                            alignItems: 'center',
                                        }
                                    ]}
                                    onPress={() => setSelectedDays(days)}
                                >
                                    <Text style={[
                                        typography.body2,
                                        {
                                            color: selectedDays === days ? '#FFFFFF' : colors.text,
                                            fontWeight: selectedDays === days ? '600' : '400'
                                        }
                                    ]}>
                                        {days} días
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {completeStats && (
                        <>
                            {/* Resumen General */}
                            <Card title="Resumen General">
                                <View style={[globalStyles.row, globalStyles.spaceBetween, { flexWrap: 'wrap' }]}>
                                    <View style={[globalStyles.alignCenter, { width: '48%', marginBottom: 16 }]}>
                                        <Text style={[typography.h2, { color: colors.primary }]}>
                                            {completeStats.resumen.total_reconocimientos}
                                        </Text>
                                        <Text style={typography.caption}>Total Reconocimientos</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '48%', marginBottom: 16 }]}>
                                        <Text style={[typography.h2, { color: colors.success }]}>
                                            {completeStats.resumen.reconocimientos_exitosos}
                                        </Text>
                                        <Text style={typography.caption}>Exitosos</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '48%' }]}>
                                        <Text style={[typography.h2, { color: colors.secondary }]}>
                                            {completeStats.resumen.tasa_exito.toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Tasa de Éxito</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '48%' }]}>
                                        <Text style={[typography.h2, { color: colors.info }]}>
                                            {completeStats.resumen.confianza_promedio_exitosos.toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Confianza Promedio</Text>
                                    </View>
                                </View>
                            </Card>

                            {/* Métricas de ML */}
                            <Card title="Métricas de Machine Learning">
                                <View style={[globalStyles.row, globalStyles.spaceBetween, { flexWrap: 'wrap' }]}>
                                    <View style={[globalStyles.alignCenter, { width: '48%', marginBottom: 16 }]}>
                                        <Text style={[typography.h2, { color: colors.primary }]}>
                                            {(completeStats.metricas_ml.precision * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Precision</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '48%', marginBottom: 16 }]}>
                                        <Text style={[typography.h2, { color: colors.success }]}>
                                            {(completeStats.metricas_ml.recall * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Recall</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '48%' }]}>
                                        <Text style={[typography.h2, { color: colors.info }]}>
                                            {(completeStats.metricas_ml.f1_score * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>F1-Score</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '48%' }]}>
                                        <Text style={[typography.h2, { color: colors.warning }]}>
                                            {(completeStats.metricas_ml.accuracy * 100).toFixed(1)}%
                                        </Text>
                                        <Text style={typography.caption}>Accuracy</Text>
                                    </View>
                                </View>

                                <View style={[globalStyles.marginTop16, { backgroundColor: colors.background, padding: 12, borderRadius: 8 }]}>
                                    <Text style={typography.body2}>
                                        Muestras analizadas: {completeStats.metricas_ml.total_samples}
                                    </Text>
                                    <Text style={typography.body2}>
                                        Clases distintas: {completeStats.metricas_ml.num_classes}
                                    </Text>
                                </View>
                            </Card>

                            {/* Matriz de Confusión Visual */}
                            {confusionMatrix && (
                                <Card title="Matriz de Confusión">
                                    <Text style={[typography.body2, { marginBottom: 12, color: colors.textLight }]}>
                                        Visualización de predicciones vs realidad del sistema
                                    </Text>

                                    {confusionMatrix.image_base64 ? (
                                        <>
                                            <Image
                                                key={confusionMatrix.image_base64}
                                                source={{
                                                    uri: confusionMatrix.image_base64.startsWith('data:image')
                                                        ? confusionMatrix.image_base64
                                                        : `data:image/png;base64,${confusionMatrix.image_base64}`
                                                }}
                                                style={{
                                                    width: screenWidth - 64,
                                                    height: screenWidth - 64,
                                                    resizeMode: 'contain',
                                                    borderRadius: 8,
                                                    backgroundColor: colors.background,
                                                }}
                                                onError={(error) => {
                                                    console.error('Error cargando matriz:', error.nativeEvent.error);
                                                }}
                                            />

                                            {confusionMatrix.stats && (
                                                <View style={[globalStyles.marginTop16, {
                                                    backgroundColor: colors.background,
                                                    padding: 12,
                                                    borderRadius: 8
                                                }]}>
                                                    <Text style={typography.body2}>
                                                        Correctas: {confusionMatrix.stats.correct_predictions} / {confusionMatrix.stats.total_predictions}
                                                    </Text>
                                                    <Text style={typography.body2}>
                                                        Precisión: {(confusionMatrix.stats.accuracy * 100).toFixed(1)}%
                                                    </Text>
                                                    <Text style={typography.body2}>
                                                        Usuarios analizados: {confusionMatrix.stats.users_analyzed}
                                                    </Text>
                                                </View>
                                            )}
                                        </>
                                    ) : (
                                        <View style={[globalStyles.center, { padding: 20 }]}>
                                            <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
                                            <Text style={[typography.body2, { marginTop: 8, textAlign: 'center', color: colors.textLight }]}>
                                                Datos insuficientes para generar la matriz.
                                                Se requieren al menos 2 usuarios con reconocimientos.
                                            </Text>
                                        </View>
                                    )}
                                </Card>
                            )}

                            {/* Distribución de Confianza */}
                            {getConfidenceDistribution().length > 0 && (
                                <Card title="Distribución de Confianza">
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
                                        absolute
                                    />

                                    <View style={[globalStyles.marginTop8, { backgroundColor: colors.background, padding: 12, borderRadius: 8 }]}>
                                        {getConfidenceDistribution().map((item, idx) => (
                                            <View key={idx} style={[globalStyles.row, globalStyles.alignCenter, { marginBottom: 4 }]}>
                                                <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6, marginRight: 8 }} />
                                                <Text style={typography.caption}>{item.name}: {item.population} reconocimientos</Text>
                                            </View>
                                        ))}
                                    </View>
                                </Card>
                            )}

                            {/* Top Usuarios Reconocidos */}
                            {getTopUsersData() && (
                                <Card title="Top Usuarios Reconocidos">
                                    <BarChart
                                        data={getTopUsersData()!}
                                        width={screenWidth - 64}
                                        height={220}
                                        yAxisLabel=""
                                        yAxisSuffix=""
                                        chartConfig={{
                                            ...chartConfig,
                                            barPercentage: 0.7,
                                            decimalPlaces: 0,
                                        }}
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                        showValuesOnTopOfBars
                                        fromZero
                                    />

                                    <View style={[globalStyles.marginTop8, { backgroundColor: colors.background, padding: 12, borderRadius: 8 }]}>
                                        {completeStats.visualizaciones.top_usuarios.labels.map((label, idx) => (
                                            <Text key={idx} style={[typography.caption, { marginBottom: 4 }]}>
                                                {idx + 1}. {label}: {completeStats.visualizaciones.top_usuarios.data[idx]} reconocimientos
                                                {' '}(Conf: {completeStats.visualizaciones.top_usuarios.confidence[idx].toFixed(1)}%)
                                            </Text>
                                        ))}
                                    </View>
                                </Card>
                            )}

                            {/* Series Temporales */}
                            {getTimeSeriesData() && (
                                <Card title="Reconocimientos por Día">
                                    <LineChart
                                        data={getTimeSeriesData()!}
                                        width={screenWidth - 64}
                                        height={220}
                                        chartConfig={{
                                            ...chartConfig,
                                            propsForDots: {
                                                r: "4",
                                                strokeWidth: "2",
                                            },
                                            decimalPlaces: 0,
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

                                    <View style={[globalStyles.marginTop8, { backgroundColor: colors.background, padding: 12, borderRadius: 8 }]}>
                                        <View style={[globalStyles.row, { justifyContent: 'space-around' }]}>
                                            <View style={globalStyles.alignCenter}>
                                                <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                                    <View style={{ width: 12, height: 12, backgroundColor: 'rgba(59, 130, 246, 1)', borderRadius: 6, marginRight: 8 }} />
                                                    <Text style={typography.caption}>Total</Text>
                                                </View>
                                            </View>
                                            <View style={globalStyles.alignCenter}>
                                                <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                                    <View style={{ width: 12, height: 12, backgroundColor: 'rgba(16, 185, 129, 1)', borderRadius: 6, marginRight: 8 }} />
                                                    <Text style={typography.caption}>Exitosos</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Estadísticas de Alertas */}
                    {alertStats && (
                        <>
                            <Card title="Estadísticas de Alertas de Seguridad">
                                <View style={[globalStyles.row, globalStyles.spaceBetween, { flexWrap: 'wrap' }]}>
                                    <View style={[globalStyles.alignCenter, { width: '23%' }]}>
                                        <Text style={[typography.h2, { color: colors.secondary }]}>{alertStats.total_alerts}</Text>
                                        <Text style={typography.caption}>Total</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '23%' }]}>
                                        <Text style={[typography.h2, { color: colors.secondary }]}>{alertStats.by_level.HIGH || 0}</Text>
                                        <Text style={typography.caption}>Críticas</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '23%' }]}>
                                        <Text style={[typography.h2, { color: colors.warning }]}>{alertStats.by_level.MEDIUM || 0}</Text>
                                        <Text style={typography.caption}>Medias</Text>
                                    </View>
                                    <View style={[globalStyles.alignCenter, { width: '23%' }]}>
                                        <Text style={[typography.h2, { color: colors.info }]}>{alertStats.by_level.LOW || 0}</Text>
                                        <Text style={typography.caption}>Bajas</Text>
                                    </View>
                                </View>

                                <View style={[globalStyles.marginTop16, { backgroundColor: colors.background, padding: 12, borderRadius: 8 }]}>
                                    <Text style={typography.body2}>
                                        Promedio diario: {alertStats.daily_average.toFixed(2)} alertas
                                    </Text>
                                    <Text style={typography.body2}>
                                        Últimos 30 días: {alertStats.last_30_days} alertas
                                    </Text>
                                    <Text style={typography.body2}>
                                        Tipo más común: {alertStats.most_common_requisition}
                                    </Text>
                                </View>
                            </Card>

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
                                        absolute
                                    />
                                </Card>
                            )}
                        </>
                    )}

                    {/* Botón Ver Historial Completo - REPOSICIONADO */}
                    <View style={{ marginTop: 16, marginBottom: 16 }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.secondary,
                                paddingVertical: 16,
                                paddingHorizontal: 24,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                elevation: 3,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                            }}
                            onPress={() => navigation.navigate('Alerts')}
                        >
                            <Ionicons name="alert-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={[typography.button, { color: '#FFFFFF' }]}>
                                Ver Historial Completo de Alertas
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}