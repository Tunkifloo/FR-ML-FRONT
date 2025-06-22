import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card  } from '@/components/common/Card';
import {  Loading } from '@/components/common/Loading';
import {  ErrorMessage } from '@/components/common/ErrorMessage';
import { UserService } from '@/services/userService';
import { RecognitionService } from '@/services/recognitionService';
import { EstadisticasUsuarios, ModelInfo, EstadoEntrenamiento } from '../types';
import { globalStyles}  from '@/theme';
import { typography } from '@/theme';
import { colors } from '@/theme';


export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userStats, setUserStats] = useState<EstadisticasUsuarios | null>(null);
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [trainingStatus, setTrainingStatus] = useState<EstadoEntrenamiento | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = async () => {
        try {
            setError(null);

            // Cargar datos en paralelo
            const [userStatsResponse, modelInfoResponse, trainingStatusResponse] = await Promise.all([
                UserService.getUserStatistics(),
                RecognitionService.getModelInfo(),
                UserService.getTrainingStatus(),
            ]);

            setUserStats(userStatsResponse.data);
            setModelInfo(modelInfoResponse.data);
            setTrainingStatus(trainingStatusResponse.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const handleTrainModel = async () => {
        try {
            setLoading(true);
            await UserService.trainModel();
            await loadDashboardData();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al entrenar modelo');
            setLoading(false);
        }
    };

    if (loading && !userStats) {
        return <Loading message="Cargando dashboard..." />;
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
                        <ErrorMessage message={error} onRetry={loadDashboardData} />
                    )}

                    {/* Estado del Sistema */}
                    <Card title="Estado del Sistema">
                        <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                            <View style={globalStyles.row}>
                                <Ionicons
                                    name={modelInfo?.model_loaded ? "checkmark-circle" : "close-circle"}
                                    size={24}
                                    color={modelInfo?.model_loaded ? colors.success : colors.secondary}
                                />
                                <Text style={[typography.body1, { marginLeft: 8 }]}>
                                    Modelo {modelInfo?.model_loaded ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                            {!modelInfo?.model_loaded && trainingStatus?.total_persons >= 2 && (
                                <TouchableOpacity
                                    style={globalStyles.primaryButton}
                                    onPress={handleTrainModel}
                                >
                                    <Text style={globalStyles.buttonText}>Entrenar</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {modelInfo && (
                            <View style={globalStyles.marginTop16}>
                                <Text style={typography.body2}>
                                    Algoritmos: {modelInfo.algorithms?.join(', ') || 'No disponible'}
                                </Text>
                                <Text style={typography.body2}>
                                    Última actualización: {modelInfo.last_training ?
                                    new Date(modelInfo.last_training).toLocaleString() : 'Nunca'}
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Estadísticas de Usuarios */}
                    {userStats && (
                        <Card title="Usuarios Registrados">
                            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h2, { color: colors.primary }]}>
                                        {userStats.usuarios.total}
                                    </Text>
                                    <Text style={typography.caption}>Total</Text>
                                </View>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h2, { color: colors.success }]}>
                                        {userStats.usuarios.activos}
                                    </Text>
                                    <Text style={typography.caption}>Activos</Text>
                                </View>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h2, { color: colors.secondary }]}>
                                        {userStats.usuarios.requisitoriados}
                                    </Text>
                                    <Text style={typography.caption}>Requisitoriados</Text>
                                </View>
                            </View>

                            <View style={globalStyles.marginTop16}>
                                <Text style={typography.body2}>
                                    📸 {userStats.imagenes.total} imágenes totales
                                </Text>
                                <Text style={typography.body2}>
                                    📊 {userStats.imagenes.promedio_por_usuario.toFixed(1)} imágenes por usuario
                                </Text>
                            </View>
                        </Card>
                    )}

                    {/* Estado del Entrenamiento */}
                    {trainingStatus && (
                        <Card title="Entrenamiento ML">
                            <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                                <Ionicons
                                    name={trainingStatus.is_trained ? "school" : "alert-circle"}
                                    size={24}
                                    color={trainingStatus.is_trained ? colors.success : colors.warning}
                                />
                                <Text style={[typography.body1, { marginLeft: 8 }]}>
                                    {trainingStatus.is_trained ? 'Modelo Entrenado' : 'Entrenamiento Requerido'}
                                </Text>
                            </View>

                            <Text style={typography.body2}>
                                👥 {trainingStatus.total_persons} personas en el modelo
                            </Text>
                            <Text style={typography.body2}>
                                📷 {trainingStatus.total_training_images} imágenes de entrenamiento
                            </Text>

                            {trainingStatus.model_accuracy && (
                                <Text style={typography.body2}>
                                    🎯 Precisión estimada: {trainingStatus.model_accuracy.toFixed(1)}%
                                </Text>
                            )}

                            {trainingStatus.next_training_suggested && (
                                <View style={[globalStyles.statusBadge, globalStyles.warningBadge, globalStyles.marginTop8]}>
                                    <Text style={globalStyles.badgeText}>
                                        Se recomienda reentrenar
                                    </Text>
                                </View>
                            )}
                        </Card>
                    )}

                    {/* Acciones Rápidas */}
                    <Card title="Acciones Rápidas">
                        <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                            <TouchableOpacity
                                style={[globalStyles.primaryButton, { flex: 0.48 }]}
                                onPress={() => {/* Navigate to Recognition */}}
                            >
                                <Ionicons name="camera" size={20} color={colors.surface} />
                                <Text style={[globalStyles.buttonText, { marginTop: 4 }]}>
                                    Reconocer
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[globalStyles.secondaryButton, { flex: 0.48 }]}
                                onPress={() => {/* Navigate to Users */}}
                            >
                                <Ionicons name="person-add" size={20} color={colors.primary} />
                                <Text style={[globalStyles.secondaryButtonText, { marginTop: 4 }]}>
                                    Añadir Usuario
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}