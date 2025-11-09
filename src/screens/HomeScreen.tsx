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
                    </Card>

                        {/* Información del Modelo */}
                        {modelInfo && (
                            <Card title="Información del Modelo">
                                <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                                    <Ionicons
                                        name={modelInfo.system_info.is_trained ? "shield-checkmark" : "shield-outline"}
                                        size={24}
                                        color={modelInfo.system_info.is_trained ? colors.success : colors.textLight}
                                    />
                                    <Text style={[typography.body1, { marginLeft: 8 }]}>
                                        {modelInfo.system_info.is_trained ? "Sistema Entrenado" : "Sistema Sin Entrenar"}
                                    </Text>
                                </View>

                                {modelInfo.system_info.is_trained && (
                                    <>
                                        <Text style={typography.body2}>
                                            🧠 Versión: {modelInfo.system_info.model_version}
                                        </Text>
                                        <Text style={typography.body2}>
                                            🔀 Método: {modelInfo.system_info.combination_method}
                                        </Text>
                                        <Text style={typography.body2}>
                                            🎯 Umbral de confianza: {modelInfo.system_info.confidence_threshold}%
                                        </Text>
                                        <Text style={typography.body2}>
                                            📊 Sesiones de entrenamiento: {modelInfo.system_info.training_sessions}
                                        </Text>

                                        <View style={[globalStyles.marginTop16, {
                                            backgroundColor: colors.background,
                                            padding: 12,
                                            borderRadius: 8
                                        }]}>
                                            <Text style={[typography.body2, {fontWeight: 'bold', marginBottom: 8}]}>
                                                📈 Algoritmos Activos:
                                            </Text>
                                            <Text style={typography.body2}>
                                                • Eigenfaces: {modelInfo.eigenfaces_info.n_components} componentes
                                            </Text>
                                            <Text style={typography.body2}>
                                                • LBP: Radio {modelInfo.lbp_info.radius}, {modelInfo.lbp_info.n_points} puntos
                                            </Text>
                                            <Text style={typography.body2}>
                                                • Embeddings: {modelInfo.eigenfaces_info.total_embeddings} totales
                                            </Text>
                                            <Text style={typography.body2}>
                                                • Personas únicas: {modelInfo.eigenfaces_info.unique_persons}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </Card>
                        )}

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
                                    name={trainingStatus.model_trained ? "checkmark-circle" : "alert-circle"}
                                    size={24}
                                    color={trainingStatus.model_trained ? colors.success : colors.warning}
                                />
                                <Text style={[typography.body1, { marginLeft: 8, flex: 1 }]}>
                                    {trainingStatus.model_trained
                                        ? "✅ Modelo Entrenado"
                                        : "⚠️ Entrenamiento Requerido"}
                                </Text>
                            </View>

                            <View style={globalStyles.marginTop8}>
                                <Text style={typography.body2}>
                                    👥 Usuarios con imágenes: {trainingStatus.training_requirements.users_with_images}
                                </Text>
                                <Text style={typography.body2}>
                                    📸 Total de imágenes: {trainingStatus.training_requirements.total_images}
                                </Text>
                                <Text style={typography.body2}>
                                    📋 Mínimo requerido: {trainingStatus.training_requirements.min_required} usuarios
                                </Text>
                                <Text style={typography.body2}>
                                    🔄 Entrenamiento automático: {trainingStatus.auto_training_enabled ? "Activado" : "Desactivado"}
                                </Text>
                                <Text style={typography.body2}>
                                    📌 Versión del modelo: {trainingStatus.model_version}
                                </Text>
                            </View>

                            {trainingStatus.training_requirements.can_train && !trainingStatus.model_trained && (
                                <View style={[globalStyles.marginTop16, {
                                    backgroundColor: colors.info + '20',
                                    padding: 12,
                                    borderRadius: 8,
                                    borderLeftWidth: 4,
                                    borderLeftColor: colors.info
                                }]}>
                                    <Text style={[typography.body2, {color: colors.info, fontWeight: 'bold'}]}>
                                        💡 {trainingStatus.recommendation}
                                    </Text>
                                </View>
                            )}

                            {!trainingStatus.training_requirements.can_train && (
                                <View style={[globalStyles.marginTop16, {
                                    backgroundColor: colors.warning + '20',
                                    padding: 12,
                                    borderRadius: 8,
                                    borderLeftWidth: 4,
                                    borderLeftColor: colors.warning
                                }]}>
                                    <Text style={[typography.body2, {color: colors.warning}]}>
                                        ⚠️ Usuarios pendientes: {trainingStatus.training_requirements.pending_users}
                                    </Text>
                                    <Text style={[typography.caption, {marginTop: 4, color: colors.textLight}]}>
                                        Se necesitan al menos {trainingStatus.training_requirements.min_required} usuarios con imágenes para entrenar el modelo
                                    </Text>
                                </View>
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
                            📱 Face Recognition Security v2.0
                        </Text>
                        <Text style={typography.body2}>
                            🤖 Sistema ML implementado desde cero
                        </Text>
                        <Text style={typography.body2}>
                            ⚡ Powered by React Native + Expo
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