import React, {useState, useEffect, JSX} from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { RecognitionService } from '../services/recognitionService';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

interface AlertInfo {
    person_id: number;
    person_name: string;
    person_lastname: string;
    student_id: string;
    requisition_type: string;
    confidence: number;
    detection_timestamp: string;
    image_path: string;
    alert_level: 'HIGH' | 'MEDIUM' | 'LOW';
    location: string;
    additional_info: {
        algorithm: string;
        processing_time: number;
        client_ip: string;
    };
}

interface Alert {
    alert_id: string;
    alert_info: AlertInfo;
    logged_at: string;
    status: string;
}

interface AlertsData {
    total_alertas: number;
    filtro_nivel?: string;
    alertas: Alert[];
}

export default function AlertsScreen(): JSX.Element {
    const [alertsData, setAlertsData] = useState<AlertsData | null>(null); null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW' | null>(null);

    const loadAlerts = async () => {
        try {
            setError(null);
            const response = await RecognitionService.getAlertsHistory(50, selectedLevel || undefined);
            setAlertsData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar alertas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, [selectedLevel]);

    const onRefresh = () => {
        setRefreshing(true);
        loadAlerts();
    };

    const getAlertColor = (level: string) => {
        switch (level) {
            case 'HIGH': return colors.secondary;
            case 'MEDIUM': return colors.warning;
            case 'LOW': return colors.info;
            default: return colors.textSecondary;
        }
    };

    const getAlertIcon = (level: string): keyof typeof Ionicons.glyphMap => {
        switch (level) {
            case 'HIGH': return 'warning';
            case 'MEDIUM': return 'alert-circle';
            case 'LOW': return 'information-circle';
            default: return 'alert-circle';
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const renderAlert = ({ item }: { item: Alert }) => {
        const alertColor = getAlertColor(item.alert_info.alert_level);
        const alertIcon = getAlertIcon(item.alert_info.alert_level);

        return (
            <Card style={{ marginVertical: 4 }}>
                <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom12]}>
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: alertColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                    }}>
                        <Ionicons name={alertIcon} size={20} color={colors.surface} />
                    </View>
                    <View style={globalStyles.flex1}>
                        <Text style={[typography.h4, { color: alertColor }]}>
                            ALERTA {item.alert_info.alert_level}
                        </Text>
                        <Text style={typography.caption}>
                            {item.alert_id}
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: alertColor,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                    }}>
                        <Text style={[typography.caption, { color: colors.surface }]}>
                            {item.alert_info.confidence.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                {/* Información de la persona */}
                <View style={[globalStyles.marginBottom12]}>
                    <Text style={[typography.h4, { color: colors.text }]}>
                        {item.alert_info.person_name} {item.alert_info.person_lastname}
                    </Text>
                    <Text style={typography.body2}>
                        ID: {item.alert_info.student_id}
                    </Text>
                    <View style={[globalStyles.statusBadge, globalStyles.errorBadge, globalStyles.marginTop8]}>
                        <Text style={globalStyles.badgeText}>
                            {item.alert_info.requisition_type}
                        </Text>
                    </View>
                </View>

                {/* Detalles técnicos */}
                <View style={[{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
                    <Text style={typography.body2}>
                        📍 {item.alert_info.location}
                    </Text>
                    <Text style={typography.body2}>
                        🕒 {formatDate(item.alert_info.detection_timestamp)}
                    </Text>
                    <Text style={typography.body2}>
                        🧠 Algoritmo: {item.alert_info.additional_info.algorithm}
                    </Text>
                    <Text style={typography.body2}>
                        ⚡ Tiempo: {item.alert_info.additional_info.processing_time.toFixed(3)}s
                    </Text>
                    <Text style={typography.body2}>
                        🌐 IP: {item.alert_info.additional_info.client_ip}
                    </Text>
                </View>

                {/* Estado */}
                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter, globalStyles.marginTop8]}>
                    <View style={[globalStyles.statusBadge, { backgroundColor: colors.success }]}>
                        <Text style={globalStyles.badgeText}>
                            {item.status}
                        </Text>
                    </View>
                    <Text style={typography.caption}>
                        Registrado: {formatDate(item.logged_at)}
                    </Text>
                </View>
            </Card>
        );
    };

    const renderHeader = () => (
        <View>
            {/* Estadísticas generales */}
            <Card>
                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                    <View>
                        <Text style={typography.h3}>Historial de Alertas</Text>
                        <Text style={typography.body2}>
                            {alertsData?.total_alertas || 0} alertas registradas
                        </Text>
                    </View>
                    <Ionicons name="alert-circle" size={32} color={colors.secondary} />
                </View>
            </Card>

            {/* Filtros por nivel */}
            <Card title="Filtrar por Nivel">
                <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                    <TouchableOpacity
                        style={[
                            globalStyles.secondaryButton,
                            { flex: 0.22 },
                            selectedLevel === null && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setSelectedLevel(null)}
                    >
                        <Text style={[
                            globalStyles.secondaryButtonText,
                            { fontSize: 12 },
                            selectedLevel === null && { color: colors.surface }
                        ]}>
                            Todas
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            globalStyles.secondaryButton,
                            { flex: 0.22 },
                            selectedLevel === 'HIGH' && { backgroundColor: colors.secondary }
                        ]}
                        onPress={() => setSelectedLevel('HIGH')}
                    >
                        <Text style={[
                            globalStyles.secondaryButtonText,
                            { fontSize: 12 },
                            selectedLevel === 'HIGH' && { color: colors.surface }
                        ]}>
                            Alta
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            globalStyles.secondaryButton,
                            { flex: 0.22 },
                            selectedLevel === 'MEDIUM' && { backgroundColor: colors.warning }
                        ]}
                        onPress={() => setSelectedLevel('MEDIUM')}
                    >
                        <Text style={[
                            globalStyles.secondaryButtonText,
                            { fontSize: 12 },
                            selectedLevel === 'MEDIUM' && { color: colors.surface }
                        ]}>
                            Media
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            globalStyles.secondaryButton,
                            { flex: 0.22 },
                            selectedLevel === 'LOW' && { backgroundColor: colors.info }
                        ]}
                        onPress={() => setSelectedLevel('LOW')}
                    >
                        <Text style={[
                            globalStyles.secondaryButtonText,
                            { fontSize: 12 },
                            selectedLevel === 'LOW' && { color: colors.surface }
                        ]}>
                            Baja
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </View>
    );

    const renderEmpty = () => (
        <Card>
            <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                <Ionicons name="shield-checkmark" size={48} color={colors.success} />
                <Text style={[typography.h4, globalStyles.marginTop16]}>
                    Sin Alertas
                </Text>
                <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                    {selectedLevel ?
                        `No se han generado alertas de nivel ${selectedLevel}` :
                        'No se han generado alertas de seguridad'
                    }
                </Text>
            </View>
        </Card>
    );

    if (loading) {
        return <Loading message="Cargando alertas..." />;
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {error && (
                    <View style={globalStyles.paddingHorizontal16}>
                        <ErrorMessage message={error} onRetry={loadAlerts} />
                    </View>
                )}

                <FlatList
                    data={alertsData?.alertas || []}
                    renderItem={renderAlert}
                    keyExtractor={(item) => item.alert_id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={!loading ? renderEmpty : null}
                    contentContainerStyle={globalStyles.paddingHorizontal16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}