import React, {useState, useEffect, JSX} from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { RecognitionService } from '../services/recognitionService';
import { RecognitionHistoryItem, RecognitionHistoryData } from '../types';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

export default function RecognitionHistoryScreen(): JSX.Element {
    const [historyData, setHistoryData] = useState<RecognitionHistoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadHistory = async (page: number = 1, refresh: boolean = false) => {
        try {
            if (refresh) {
                setError(null);
                setCurrentPage(1);
            }

            const response = await RecognitionService.getRecognitionHistory(page, 20);

            if (refresh || page === 1) {
                setHistoryData(response.data);
            } else {
                // Añadir nuevos elementos para paginación
                setHistoryData(prev => prev ? {
                    ...response.data,
                    reconocimientos: [...prev.reconocimientos, ...response.data.reconocimientos]
                } : response.data);
            }

            setCurrentPage(page);
        } catch (err: any) {
            setError(err.message || 'Error al cargar historial');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory(1, true);
    };

    const loadMore = () => {
        if (!loadingMore && historyData && currentPage < historyData.paginacion.total_paginas) {
            setLoadingMore(true);
            loadHistory(currentPage + 1);
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

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return colors.success;
        if (confidence >= 60) return colors.warning;
        return colors.secondary;
    };

    const renderHistoryItem = ({ item }: { item: RecognitionHistoryItem }) => {
        const confidenceColor = getConfidenceColor(item.confianza);

        return (
            <Card style={{ marginVertical: 4 }}>
                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter, { marginBottom: 12 }]}>
                    {/* Estado del reconocimiento */}
                    <View style={[globalStyles.row, globalStyles.alignCenter]}>
                        <Ionicons
                            name={item.reconocido ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={item.reconocido ? colors.success : colors.secondary}
                        />
                        <Text style={[typography.body1, { marginLeft: 8 }]}>
                            {item.reconocido ? 'Reconocido' : 'No Reconocido'}
                        </Text>
                    </View>

                    {/* Confianza */}
                    <View style={{
                        backgroundColor: confidenceColor,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                    }}>
                        <Text style={[typography.caption, { color: colors.surface }]}>
                            {item.confianza}%
                        </Text>
                    </View>
                </View>

                {/* Información del usuario */}
                {item.usuario_info && (
                    <View style={{ marginBottom: 12 }}>
                        <Text style={typography.h4}>
                            {item.usuario_info.nombre} {item.usuario_info.apellido}
                        </Text>
                        <Text style={typography.body2}>
                            ID: {item.usuario_info.id_estudiante}
                        </Text>
                        {item.usuario_info.requisitoriado && (
                            <View style={[globalStyles.statusBadge, globalStyles.errorBadge, { marginTop: 8 }]}>
                                <Text style={globalStyles.badgeText}>
                                    REQUISITORIADO: {item.usuario_info.tipo_requisitoria}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Alerta generada */}
                {item.alerta_generada && (
                    <View style={[globalStyles.row, globalStyles.alignCenter, { marginBottom: 8 }]}>
                        <Ionicons name="warning" size={16} color={colors.secondary} />
                        <Text style={[typography.body2, { marginLeft: 4, color: colors.secondary }]}>
                            Alerta de seguridad generada
                        </Text>
                    </View>
                )}

                {/* Detalles técnicos */}
                <View style={[{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
                    <Text style={typography.caption}>
                        🕒 {formatDate(item.fecha_reconocimiento)}
                    </Text>
                    <Text style={typography.caption}>
                        🌐 IP: {item.ip_origen}
                    </Text>
                    <Text style={typography.caption}>
                        📊 Distancia: {item.distancia_euclidiana}
                    </Text>
                    <Text style={typography.caption}>
                        🆔 ID de reconocimiento: {item.id}
                    </Text>
                </View>
            </Card>
        );
    };

    const renderHeader = () => (
        <Card>
            <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                <View>
                    <Text style={typography.h3}>Historial de Reconocimientos</Text>
                    <Text style={typography.body2}>
                        {historyData?.paginacion.total || 0} reconocimientos registrados
                    </Text>
                </View>
                <Ionicons name="time" size={32} color={colors.primary} />
            </View>

            {/* Estadísticas rápidas */}
            {historyData && (
                <View style={[globalStyles.row, globalStyles.spaceBetween, { marginTop: 16 }]}>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.primary }]}>
                            {historyData.paginacion.total}
                        </Text>
                        <Text style={typography.caption}>Total</Text>
                    </View>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.success }]}>
                            {historyData.reconocimientos.filter(r => r.reconocido).length}
                        </Text>
                        <Text style={typography.caption}>Exitosos</Text>
                    </View>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.secondary }]}>
                            {historyData.reconocimientos.filter(r => r.alerta_generada).length}
                        </Text>
                        <Text style={typography.caption}>Alertas</Text>
                    </View>
                </View>
            )}
        </Card>
    );

    const renderEmpty = () => (
        <Card>
            <View style={[globalStyles.center, { paddingVertical: 16 }]}>
                <Ionicons name="time" size={48} color={colors.textLight} />
                <Text style={[typography.h4, { marginTop: 16 }]}>
                    Sin Historial
                </Text>
                <Text style={[typography.body2, { marginTop: 8, textAlign: 'center' }]}>
                    No se han registrado reconocimientos en el sistema
                </Text>
            </View>
        </Card>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 16 }}>
                <Loading message="Cargando más..." />
            </View>
        );
    };

    if (loading) {
        return <Loading message="Cargando historial..." />;
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {error && (
                    <View style={{ paddingHorizontal: 16 }}>
                        <ErrorMessage message={error} onRetry={() => loadHistory(1, true)} />
                    </View>
                )}

                <FlatList
                    data={historyData?.reconocimientos || []}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={!loading ? renderEmpty : null}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}