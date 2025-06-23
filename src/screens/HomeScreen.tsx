import React, {useState, useEffect, JSX} from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { UserService } from '../services/userService';
import { RecognitionService } from '../services/recognitionService';
import { EstadisticasUsuarios, DetailedModelInfo, TrainingStatus, AlertStats } from '../types';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

interface HomeScreenProps {
    navigation: {
        navigate: (screen: string, params?: any) => void;
    };
}

export default function HomeScreen({ navigation }: HomeScreenProps): JSX.Element {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userStats, setUserStats] = useState<EstadisticasUsuarios | null>(null);
    const [modelInfo, setModelInfo] = useState<DetailedModelInfo | null>(null);
    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
    const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = async () => {
        try {
            setError(null);

            // Cargar datos en paralelo
            const [userStatsResponse, modelInfoResponse, trainingStatusResponse, alertStatsResponse] = await Promise.all([
                UserService.getUserStatistics(),
                RecognitionService.getModelInfo(),
                UserService.getTrainingStatus(),
                RecognitionService.getAlertsStatistics(),
            ]);

            setUserStats(userStatsResponse.data);
            setModelInfo(modelInfoResponse.data);
            setTrainingStatus(trainingStatusResponse.data);
            setAlertStats(alertStatsResponse.data);

        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Error al cargar datos del dashboard');
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

    // Funciones de navegación
    const navigateToRecognition = () => {
        navigation.navigate('RecognitionTab');
    };

    const navigateToAddUser = () => {
        navigation.navigate('AddUser');
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
                                    name={trainingStatus?.model_trained ? "checkmark-circle" : "close-circle"}
                                    size={24}
                                    color={trainingStatus?.model_trained ? colors.success : colors.secondary}
                                />
                                <Text style={[typography.body1, { marginLeft: 8 }]}>
                                    Modelo {trainingStatus?.model_trained ? 'Entrenado' : 'Sin Entrenar'}
                                </Text>
                            </View>
                            {!trainingStatus?.model_trained && trainingStatus?.training_requirements.can_train && (
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
                                    👥 Personas en modelo: {modelInfo.eigenfaces_info.unique_persons}
                                </Text>
                                <Text style={typography.body2}>
                                    📸 Imágenes procesadas: {modelInfo.eigenfaces_info.total_embeddings}
                                </Text>
                                <Text style={typography.body2}>
                                    🧠 Algoritmos: Eigenfaces + LBP
                                </Text>
                                <Text style={typography.body2}>
                                    📊 Versión: {modelInfo.system_info.model_version}
                                </Text>
                                <Text style={typography.body2}>
                                    🎯 Confianza mínima: {modelInfo.system_info.confidence_threshold}%
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
                                <Text style={typography.body2}>
                                    🎯 {userStats.usuarios.porcentaje_requisitoriados.toFixed(1)}% requisitoriados
                                </Text>
                            </View>
                        </Card>
                    )}

                    {/* Estado del Entrenamiento */}
                    {trainingStatus && (
                        <Card title="Entrenamiento ML">
                            <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                                <Ionicons
                                    name={trainingStatus.model_trained ? "school" : "alert-circle"}
                                    size={24}
                                    color={trainingStatus.model_trained ? colors.success : colors.warning}
                                />
                                <Text style={[typography.body1, { marginLeft: 8 }]}>
                                    {trainingStatus.model_trained ? 'Modelo Entrenado' : 'Entrenamiento Requerido'}
                                </Text>
                            </View>

                            <Text style={typography.body2}>
                                👥 {trainingStatus.training_requirements.users_with_images} usuarios con imágenes
                            </Text>
                            <Text style={typography.body2}>
                                📷 {trainingStatus.training_requirements.total_images} imágenes de entrenamiento
                            </Text>
                            <Text style={typography.body2}>
                                📊 Versión: {trainingStatus.model_version}
                            </Text>
                            <Text style={typography.body2}>
                                🤖 Entrenamiento automático: {trainingStatus.auto_training_enabled ? 'Activado' : 'Desactivado'}
                            </Text>
                            <Text style={typography.body2}>
                                📋 Mínimo requerido: {trainingStatus.training_requirements.min_required} usuarios
                            </Text>

                            {/* Recomendación del sistema */}
                            <View style={[
                                globalStyles.statusBadge,
                                trainingStatus.system_ready ? globalStyles.successBadge : globalStyles.warningBadge,
                                globalStyles.marginTop8
                            ]}>
                                <Text style={globalStyles.badgeText}>
                                    {trainingStatus.recommendation}
                                </Text>
                            </View>

                            {/* Estado de correcciones */}
                            <Text style={[typography.caption, globalStyles.marginTop8]}>
                                {trainingStatus.fixes_status}
                            </Text>

                            {!trainingStatus.model_trained && trainingStatus.training_requirements.can_train && (
                                <TouchableOpacity
                                    style={[globalStyles.primaryButton, globalStyles.marginTop16]}
                                    onPress={handleTrainModel}
                                >
                                    <Text style={globalStyles.buttonText}>Entrenar Modelo Ahora</Text>
                                </TouchableOpacity>
                            )}
                        </Card>
                    )}

                    {/* Estadísticas de Alertas */}
                    {alertStats && (
                        <Card title="Alertas de Seguridad">
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
                                        🚨 Más común: {alertStats.most_common_requisition}
                                    </Text>
                                )}
                            </View>
                        </Card>
                    )}

                    {/* Información del Sistema */}
                    <Card title="Información del Sistema">
                        <Text style={typography.body2}>
                            📱 Face Recognition Security v1.0.0
                        </Text>
                        <Text style={typography.body2}>
                            🤖 Sistema ML implementado desde cero
                        </Text>
                        <Text style={typography.body2}>
                            ⚡ Powered by React Native + Expo
                        </Text>
                        <Text style={typography.body2}>
                            🔒 API: fr-ml-api-production.up.railway.app
                        </Text>
                        <Text style={typography.body2}>
                            🌐 Entorno: Producción
                        </Text>
                        <Text style={typography.body2}>
                            ✅ Estado: Sistema Operativo
                        </Text>
                    </Card>

                    {/* Acciones Rápidas - FUNCIONALES */}
                    <Card title="Acciones Rápidas">
                        <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                            <TouchableOpacity
                                style={[globalStyles.primaryButton, { flex: 0.48 }]}
                                onPress={navigateToRecognition}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="camera" size={20} color={colors.surface} />
                                <Text style={[globalStyles.buttonText, { marginTop: 4 }]}>
                                    Reconocer
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[globalStyles.secondaryButton, { flex: 0.48 }]}
                                onPress={navigateToAddUser}
                                activeOpacity={0.7}
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