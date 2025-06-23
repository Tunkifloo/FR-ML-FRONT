import React, {useState, useEffect, JSX} from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { RecognitionService } from '../services/recognitionService';
import { AlertStats } from '../types';
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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAlertStatistics = async () => {
        try {
            setError(null);
            const response = await RecognitionService.getAlertsStatistics();
            setAlertStats(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Error al cargar estadísticas de alertas';
            setError(errorMessage);
            console.error('Error loading alert statistics:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAlertStatistics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadAlertStatistics();
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

    // Preparar datos para gráfico de alertas por nivel
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

    // Preparar datos para gráfico de tipos de requisitoria
    const getRequisitionTypeDistribution = () => {
        if (!alertStats || !alertStats.by_requisition_type) return [];

        const typeColors = [colors.secondary, colors.warning, colors.info, colors.primary];

        return Object.entries(alertStats.by_requisition_type)
            .filter(([_, count]) => count > 0)
            .map(([type, count], index) => ({
                name: type,
                population: count,
                color: typeColors[index % typeColors.length],
                legendFontColor: colors.text,
                legendFontSize: 11,
            }));
    };

    if (loading && !alertStats) {
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
                        <ErrorMessage message={error} onRetry={loadAlertStatistics} />
                    )}

                    {/* Herramientas en Desarrollo */}
                    <Card>
                        <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                            <Ionicons name="construct" size={24} color={colors.warning} />
                            <Text style={[typography.h3, { marginLeft: 8 }]}>Estadísticas Generales</Text>
                        </View>

                        <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                            <Ionicons name="build" size={48} color={colors.textLight} />
                            <Text style={[typography.h4, globalStyles.marginTop16]}>
                                🚧 En Desarrollo
                            </Text>
                            <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                                Las estadísticas completas de reconocimiento están siendo desarrolladas.
                                Por ahora puedes ver las estadísticas de alertas de seguridad.
                            </Text>
                        </View>
                    </Card>

                    {/* Estadísticas de Alertas */}
                    {alertStats && (
                        <>
                            {/* Resumen de Alertas */}
                            <Card title="Resumen de Alertas de Seguridad">
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
                                <Card title="Distribución por Nivel">
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

                            {/* Distribución por Tipo de Requisitoria */}
                            {getRequisitionTypeDistribution().length > 0 && (
                                <Card title="Tipos de Requisitorias">
                                    <PieChart
                                        data={getRequisitionTypeDistribution()}
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

                            {/* Desglose por Tipo */}
                            <Card title="Desglose por Tipo de Requisitoria">
                                {Object.entries(alertStats.by_requisition_type).map(([type, count], index) => (
                                    <View
                                        key={type}
                                        style={[
                                            globalStyles.row,
                                            globalStyles.spaceBetween,
                                            globalStyles.alignCenter,
                                            globalStyles.paddingVertical8,
                                            index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }
                                        ]}
                                    >
                                        <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                            <Ionicons name="warning" size={20} color={colors.secondary} />
                                            <Text style={[typography.body1, { marginLeft: 8 }]}>
                                                {type}
                                            </Text>
                                        </View>
                                        <View style={globalStyles.alignCenter}>
                                            <Text style={[typography.h3, { color: colors.secondary }]}>
                                                {count}
                                            </Text>
                                            <Text style={typography.caption}>
                                                {((count / alertStats.total_alerts) * 100).toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </Card>
                        </>
                    )}

                    {/* Mensaje cuando no hay alertas */}
                    {alertStats && alertStats.total_alerts === 0 && (
                        <Card>
                            <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                                <Ionicons name="shield-checkmark" size={48} color={colors.success} />
                                <Text style={[typography.h4, globalStyles.marginTop16]}>
                                    Sin Alertas
                                </Text>
                                <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                                    No se han generado alertas de seguridad. El sistema está funcionando normalmente.
                                </Text>
                            </View>
                        </Card>
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

                    {/* Información sobre Estadísticas Completas */}
                    <Card title="Próximamente">
                        <View style={[globalStyles.row, globalStyles.alignCenter]}>
                            <Ionicons name="time" size={20} color={colors.info} />
                            <Text style={[typography.body2, { marginLeft: 8, flex: 1 }]}>
                                Las estadísticas completas de reconocimiento, gráficos de tendencias y métricas de precisión estarán disponibles en una próxima actualización.
                            </Text>
                        </View>
                    </Card>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}