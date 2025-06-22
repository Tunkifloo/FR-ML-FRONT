import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { AlertBanner } from '../components/recognition/AlertBanner';
import { RecognitionService } from '../services/recognitionService';
import { AlertaSeguridad } from '../types/recognition';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

export default function AlertsScreen(): JSX.Element {
    const [alerts, setAlerts] = useState<AlertaSeguridad[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAlerts = async () => {
        try {
            setError(null);
            const response = await RecognitionService.getAlertsHistory(50);
            setAlerts(response.data.alertas);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar alertas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadAlerts();
    };

    const renderAlert = ({ item }: { item: AlertaSeguridad }) => (
        <AlertBanner alert={item} />
    );

    const renderHeader = () => (
        <Card>
            <View style={[globalStyles.row, globalStyles.alignCenter]}>
                <Ionicons name="alert-circle" size={24} color={colors.secondary} />
                <View style={{ marginLeft: 12 }}>
                    <Text style={typography.h3}>Historial de Alertas</Text>
                    <Text style={typography.body2}>
                        {alerts.length} alertas registradas
                    </Text>
                </View>
            </View>
        </Card>
    );

    const renderEmpty = () => (
        <Card>
            <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                <Ionicons name="shield-checkmark" size={48} color={colors.success} />
                <Text style={[typography.h4, globalStyles.marginTop16]}>
                    Sin Alertas
                </Text>
                <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                    No se han generado alertas de seguridad
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
                    data={alerts}
                    renderItem={renderAlert}
                    keyExtractor={(item) => item.alert_id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={!loading ? renderEmpty : null}
                    contentContainerStyle={globalStyles.paddingHorizontal16}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>
        </SafeAreaView>
    );
}