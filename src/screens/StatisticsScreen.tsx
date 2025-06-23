import React, {useState, useEffect, JSX} from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { RecognitionService } from '../services/recognitionService';
import { EstadisticasReconocimiento } from '../types/recognition';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

// Tipos de navegación
interface NavigationProps {
    navigation: {
        navigate: (screenName: string) => void;
    };
}

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen({ navigation }: NavigationProps): JSX.Element {
    const [stats, setStats] = useState<EstadisticasReconocimiento | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState(30);

    const loadStatistics = async () => {
        try {
            setError(null);
            const response = await RecognitionService.getRecognitionStatistics(selectedPeriod);
            setStats(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStatistics();
    }, [selectedPeriod]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStatistics();
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
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.primary
        }
    };

    // Preparar datos para gráficos
    const getWeeklyData = () => {
        if (!stats) return { labels: [], datasets: [{ data: [0] }] };

        const dailyStats = stats.por_dia;
        const last7Days = Object.keys(dailyStats)
            .sort()
            .slice(-7)
            .map(date => ({
                date,
                total: dailyStats[date].total,
                exitosos: dailyStats[date].exitosos,
            }));

        if (last7Days.length === 0) {
            return { labels: ['Sin datos'], datasets: [{ data: [0] }] };
        }

        return {
            labels: last7Days.map(day => new Date(day.date).getDate().toString()),
            datasets: [
                {
                    data: last7Days.map(day => day.total),
                    color: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
                    strokeWidth: 2,
                },
                {
                    data: last7Days.map(day => day.exitosos),
                    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
                    strokeWidth: 2,
                },
            ],
            legend: ['Total', 'Exitosos'],
        };
    };

    const getConfidenceDistribution = () => {
        if (!stats) return [];

        const distribution = stats.distribucion_confianza;
        const colors_pie = [colors.secondary, colors.warning, colors.info, colors.success];

        return Object.keys(distribution).map((level, index) => ({
            name: level,
            population: distribution[level],
            color: colors_pie[index % colors_pie.length],
            legendFontColor: colors.text,
            legendFontSize: 12,
        }));
    };

    if (loading && !stats) {
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
                        <ErrorMessage message={error} onRetry={loadStatistics} />
                    )}

                    {/* Selector de Período */}
                    <Card title="Período">
                        <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                            {[7, 30, 90].map(days => (
                                <TouchableOpacity
                                    key={days}
                                    style={[
                                        globalStyles.secondaryButton,
                                        { flex: 0.3 },
                                        selectedPeriod === days && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setSelectedPeriod(days)}
                                >
                                    <Text style={[
                                        globalStyles.secondaryButtonText,
                                        selectedPeriod === days && { color: colors.surface }
                                    ]}>
                                        {days} días
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Resumen Ejecutivo */}
                    {stats && (
                        <Card title="Resumen Ejecutivo">
                            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h2, { color: colors.primary }]}>
                                        {stats.resumen.total_reconocimientos}
                                    </Text>
                                    <Text style={typography.caption}>Total</Text>
                                </View>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h2, { color: colors.success }]}>
                                        {stats.resumen.tasa_exito.toFixed(1)}%
                                    </Text>
                                    <Text style={typography.caption}>Tasa Éxito</Text>
                                </View>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h2, { color: colors.secondary }]}>
                                        {stats.resumen.alertas_generadas}
                                    </Text>
                                    <Text style={typography.caption}>Alertas</Text>
                                </View>
                            </View>

                            <View style={globalStyles.marginTop16}>
                                <Text style={typography.body2}>
                                    📊 Confianza promedio: {stats.resumen.confianza_promedio.toFixed(1)}%
                                </Text>
                                <Text style={typography.body2}>
                                    📈 Promedio diario: {stats.resumen.promedio_diario.toFixed(1)} reconocimientos
                                </Text>
                            </View>
                        </Card>
                    )}

                    {/* Gráfico de Tendencia Semanal */}
                    {stats && (
                        <Card title="Tendencia Últimos 7 Días">
                            <LineChart
                                data={getWeeklyData()}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
                            />
                        </Card>
                    )}

                    {/* Distribución de Confianza */}
                    {stats && getConfidenceDistribution().length > 0 && (
                        <Card title="Distribución por Confianza">
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

                    {/* Top Usuarios */}
                    {stats && stats.top_usuarios_reconocidos.length > 0 && (
                        <Card title="Usuarios Más Reconocidos">
                            {stats.top_usuarios_reconocidos.slice(0, 5).map((user, index) => (
                                <View
                                    key={user.usuario_id}
                                    style={[
                                        globalStyles.row,
                                        globalStyles.spaceBetween,
                                        globalStyles.alignCenter,
                                        globalStyles.paddingVertical8,
                                        index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }
                                    ]}
                                >
                                    <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                        <View style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: colors.primary,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 12,
                                        }}>
                                            <Text style={[typography.caption, { color: colors.surface }]}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={typography.body1}>{user.nombre}</Text>
                                            <Text style={typography.caption}>
                                                ID: {user.id_estudiante}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={globalStyles.alignCenter}>
                                        <Text style={[typography.body1, { color: colors.primary }]}>
                                            {user.total_reconocimientos}
                                        </Text>
                                        <Text style={typography.caption}>
                                            {user.confianza_promedio.toFixed(1)}%
                                        </Text>
                                    </View>
                                    {user.requisitoriado && (
                                        <Ionicons name="warning" size={16} color={colors.secondary} />
                                    )}
                                </View>
                            ))}
                        </Card>
                    )}

                    {/* Botón para ver Alertas */}
                    <TouchableOpacity
                        style={[globalStyles.alertButton, globalStyles.marginTop16]}
                        onPress={() => navigation.navigate('Alerts')}
                    >
                        <View style={[globalStyles.row, globalStyles.alignCenter]}>
                            <Ionicons name="alert-circle" size={20} color={colors.surface} />
                            <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>
                                Ver Historial de Alertas
                            </Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}