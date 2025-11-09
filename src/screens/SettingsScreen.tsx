import React, {useState, useEffect, JSX} from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { UserService } from '../services/userService';
import { RecognitionService } from '../services/recognitionService';
import { TrainingStatus, DetailedModelInfo } from '../types';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

export default function SettingsScreen(): JSX.Element {
    const [modelInfo, setModelInfo] = useState<DetailedModelInfo | null>(null);
    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
    const [loading, setLoading] = useState(false);

    const loadSystemInfo = async () => {
        try {
            const [modelResponse, trainingResponse] = await Promise.all([
                RecognitionService.getModelInfo(),
                UserService.getTrainingStatus(),
            ]);

            setModelInfo(modelResponse.data);
            setTrainingStatus(trainingResponse.data);
        } catch (err) {
            console.error('Error loading system info:', err);
        }
    };

    useEffect(() => {
        loadSystemInfo();
    }, []);

    const handleTrainModel = async () => {
        Alert.alert(
            'Entrenar Modelo',
            '¿Deseas entrenar el modelo con todos los usuarios registrados? Este proceso puede tomar varios minutos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Entrenar',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await UserService.trainModel();
                            Alert.alert('Éxito', 'Modelo entrenado exitosamente');
                            await loadSystemInfo();
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.detail || 'Error al entrenar modelo');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleReloadModel = async () => {
        try {
            setLoading(true);
            await loadSystemInfo();
            Alert.alert('Éxito', 'Información del modelo actualizada');
        } catch (err: any) {
            Alert.alert('Error', 'Error al recargar información del modelo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <ScrollView style={globalStyles.content}>
                {loading && <Loading message="Procesando..." />}

                {/* Estado del Sistema */}
                <Card title="Estado del Sistema">
                    <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                        <Ionicons
                            name={trainingStatus?.model_trained ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={trainingStatus?.model_trained ? colors.success : colors.secondary}
                        />
                        <Text style={[typography.body1, { marginLeft: 8 }]}>
                            Modelo {trainingStatus?.model_trained ? 'Entrenado' : 'Sin Entrenar'}
                        </Text>
                    </View>

                    {trainingStatus && (
                        <View>
                            <Text style={typography.body2}>
                                📊 Versión: {trainingStatus.model_version}
                            </Text>
                            <Text style={typography.body2}>
                                👥 Usuarios con imágenes: {trainingStatus.training_requirements.users_with_images}
                            </Text>
                            <Text style={typography.body2}>
                                📷 Total imágenes: {trainingStatus.training_requirements.total_images}
                            </Text>
                            <Text style={typography.body2}>
                                📋 Mínimo requerido: {trainingStatus.training_requirements.min_required} usuarios
                            </Text>
                            <Text style={typography.body2}>
                                🤖 Entrenamiento automático: {trainingStatus.auto_training_enabled ? 'Activado' : 'Desactivado'}
                            </Text>
                            <Text style={typography.body2}>
                                🔧 Estado sistema: {trainingStatus.system_ready ? 'Listo' : 'Requiere configuración'}
                            </Text>
                        </View>
                    )}

                    {/* Recomendación del sistema */}
                    {trainingStatus && (
                        <View style={[
                            globalStyles.statusBadge,
                            trainingStatus.system_ready ? globalStyles.successBadge : globalStyles.warningBadge,
                            globalStyles.marginTop8
                        ]}>
                            <Text style={globalStyles.badgeText}>
                                {trainingStatus.recommendation}
                            </Text>
                        </View>
                    )}

                    {/* Estado de correcciones */}
                    {trainingStatus && (
                        <Text style={[typography.caption, globalStyles.marginTop8]}>
                            {trainingStatus.fixes_status}
                        </Text>
                    )}
                </Card>

                {/* Información de Algoritmos */}
                {modelInfo && (
                    <>
                        {/* Eigenfaces */}
                        <Card title="Eigenfaces (PCA)">
                            <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom8]}>
                                <Ionicons
                                    name={modelInfo.eigenfaces_info.is_trained ? "checkmark-circle" : "close-circle"}
                                    size={20}
                                    color={modelInfo.eigenfaces_info.is_trained ? colors.success : colors.secondary}
                                />
                                <Text style={[typography.body1, { marginLeft: 8 }]}>
                                    {modelInfo.eigenfaces_info.is_trained ? 'Entrenado' : 'Sin entrenar'}
                                </Text>
                            </View>

                            <Text style={typography.body2}>
                                🧮 Componentes: {modelInfo.eigenfaces_info.n_components}
                            </Text>
                            <Text style={typography.body2}>
                                📐 Tamaño imagen: {modelInfo.eigenfaces_info.image_size.join('x')}
                            </Text>
                            <Text style={typography.body2}>
                                👥 Personas únicas: {modelInfo.eigenfaces_info.unique_persons}
                            </Text>
                            <Text style={typography.body2}>
                                📊 Total embeddings: {modelInfo.eigenfaces_info.total_embeddings}
                            </Text>
                            <Text style={typography.body2}>
                                📈 Varianza explicada: {(modelInfo.eigenfaces_info.variance_explained * 100).toFixed(2)}%
                            </Text>
                            <Text style={typography.body2}>
                                🎯 Umbral distancia: {modelInfo.eigenfaces_info.threshold_distance}
                            </Text>
                            <Text style={typography.body2}>
                                ✅ Estabilidad: {(modelInfo.eigenfaces_info.stability_diagnostics.stability_ratio * 100).toFixed(1)}%
                            </Text>

                            {/* Diagnósticos de estabilidad */}
                            <View style={[globalStyles.marginTop8, { backgroundColor: colors.background, padding: 8, borderRadius: 6 }]}>
                                <Text style={[typography.caption, { fontWeight: 'bold', marginBottom: 4 }]}>
                                    Diagnósticos de Estabilidad:
                                </Text>
                                <Text style={typography.caption}>
                                    • Embeddings estables: {modelInfo.eigenfaces_info.stability_diagnostics.stable_embeddings}
                                </Text>
                                <Text style={typography.caption}>
                                    • Embeddings infinitos: {modelInfo.eigenfaces_info.stability_diagnostics.infinite_embeddings}
                                </Text>
                                <Text style={typography.caption}>
                                    • Embeddings NaN: {modelInfo.eigenfaces_info.stability_diagnostics.nan_embeddings}
                                </Text>
                            </View>
                        </Card>

                        {/* LBP */}
                        <Card title="Local Binary Patterns (LBP)">
                            <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom8]}>
                                <Ionicons
                                    name={modelInfo.lbp_info.is_trained ? "checkmark-circle" : "close-circle"}
                                    size={20}
                                    color={modelInfo.lbp_info.is_trained ? colors.success : colors.secondary}
                                />
                                <Text style={[typography.body1, { marginLeft: 8 }]}>
                                    {modelInfo.lbp_info.is_trained ? 'Entrenado' : 'Sin entrenar'}
                                </Text>
                            </View>

                            <Text style={typography.body2}>
                                📐 Radio: {modelInfo.lbp_info.radius}, Puntos: {modelInfo.lbp_info.n_points}
                            </Text>
                            <Text style={typography.body2}>
                                🔢 Vector características: {modelInfo.lbp_info.feature_vector_size}
                            </Text>
                            <Text style={typography.body2}>
                                👥 Personas únicas: {modelInfo.lbp_info.unique_persons}
                            </Text>
                            <Text style={typography.body2}>
                                📊 Total características: {modelInfo.lbp_info.total_features}
                            </Text>
                            <Text style={typography.body2}>
                                🎯 Umbral similitud: {modelInfo.lbp_info.threshold_similarity}
                            </Text>
                            <Text style={typography.body2}>
                                📊 Grid: {modelInfo.lbp_info.grid_size.join('x')}
                            </Text>
                            <Text style={typography.body2}>
                                🔧 Método: {modelInfo.lbp_info.method}
                            </Text>
                            <Text style={typography.body2}>
                                🏗️ Tamaño imagen: {modelInfo.lbp_info.image_size.join('x')}
                            </Text>

                            {/* Pasos de preprocesamiento */}
                            <View style={[globalStyles.marginTop8, { backgroundColor: colors.background, padding: 8, borderRadius: 6 }]}>
                                <Text style={[typography.caption, { fontWeight: 'bold', marginBottom: 4 }]}>
                                    Pasos de Preprocesamiento:
                                </Text>
                                {modelInfo.lbp_info.preprocessing_steps.map((step, index) => (
                                    <Text key={index} style={typography.caption}>
                                        • {step}
                                    </Text>
                                ))}
                            </View>
                        </Card>

                        {/* Sistema Híbrido */}
                        <Card title="Sistema Híbrido">
                            <Text style={typography.body2}>
                                🔄 Método combinación: {modelInfo.system_info.combination_method}
                            </Text>
                            <Text style={typography.body2}>
                                ⚖️ Peso Eigenfaces: {(modelInfo.weights.eigenfaces * 100).toFixed(0)}%
                            </Text>
                            <Text style={typography.body2}>
                                ⚖️ Peso LBP: {(modelInfo.weights.lbp * 100).toFixed(0)}%
                            </Text>
                            <Text style={typography.body2}>
                                🎯 Umbral confianza: {modelInfo.system_info.confidence_threshold}%
                            </Text>
                            <Text style={typography.body2}>
                                🎓 Sesiones entrenamiento: {modelInfo.system_info.training_sessions}
                            </Text>
                            <Text style={typography.body2}>
                                🛠️ Manejo tipos datos: {modelInfo.system_info.data_type_handling}
                            </Text>
                            {modelInfo.last_training && (
                                <Text style={typography.body2}>
                                    📅 Último entrenamiento: {new Date(modelInfo.last_training).toLocaleString('es-ES')}
                                </Text>
                            )}
                        </Card>
                    </>
                )}

                {/* Botones de acción */}
                <Card title="Acciones del Sistema">
                    <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginBottom16]}>
                        <TouchableOpacity
                            style={[globalStyles.primaryButton, { flex: 0.48 }]}
                            onPress={handleTrainModel}
                            disabled={loading}
                        >
                            <Text style={globalStyles.buttonText}>Entrenar Modelo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[globalStyles.secondaryButton, { flex: 0.48 }]}
                            onPress={handleReloadModel}
                            disabled={loading}
                        >
                            <Text style={globalStyles.secondaryButtonText}>Actualizar Info</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón para forzar reentrenamiento */}
                    {trainingStatus?.model_trained && (
                        <TouchableOpacity
                            style={[globalStyles.alertButton, globalStyles.marginTop8]}
                            onPress={() => {
                                Alert.alert(
                                    'Forzar Reentrenamiento',
                                    '¿Deseas forzar un reentrenamiento completo del modelo? Esto puede tomar varios minutos.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Forzar',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    setLoading(true);
                                                    await UserService.forceRetrain();
                                                    Alert.alert('Éxito', 'Reentrenamiento completado');
                                                    await loadSystemInfo();
                                                } catch (err: any) {
                                                    Alert.alert('Error', err.response?.data?.detail || 'Error en reentrenamiento');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={loading}
                        >
                            <Text style={globalStyles.buttonText}>Forzar Reentrenamiento</Text>
                        </TouchableOpacity>
                    )}
                </Card>

                {/* Configuración de la App */}
                <Card title="Configuración">
                    <View>
                        <TouchableOpacity style={[globalStyles.listItem, { paddingHorizontal: 0 }]}>
                            <Ionicons name="server" size={20} color={colors.textSecondary} />
                            <View style={[globalStyles.flex1, { marginLeft: 12 }]}>
                                <Text style={typography.body1}>Servidor API</Text>
                                <Text style={typography.caption}>
                                    fr-ml-api-production.up.railway.app
                                </Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.listItem, { paddingHorizontal: 0 }]}>
                            <Ionicons name="camera" size={20} color={colors.textSecondary} />
                            <View style={[globalStyles.flex1, { marginLeft: 12 }]}>
                                <Text style={typography.body1}>Algoritmo por Defecto</Text>
                                <Text style={typography.caption}>Híbrido (Eigenfaces + LBP)</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[globalStyles.listItem, { paddingHorizontal: 0 }]}>
                            <Ionicons name="time" size={20} color={colors.textSecondary} />
                            <View style={[globalStyles.flex1, { marginLeft: 12 }]}>
                                <Text style={typography.body1}>Timeout de Reconocimiento</Text>
                                <Text style={typography.caption}>30 segundos</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Mejoras Aplicadas */}
                {modelInfo && modelInfo.fixes_applied && modelInfo.fixes_applied.length > 0 && (
                    <Card title="Mejoras del Sistema">
                        {modelInfo.fixes_applied.map((fix, index) => (
                            <View key={index} style={[globalStyles.row, globalStyles.marginBottom8]}>
                                <Ionicons name="checkmark" size={16} color={colors.success} />
                                <Text style={[typography.body2, { marginLeft: 8, flex: 1 }]}>
                                    {fix}
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* Información de la App */}
                <Card title="Información">
                    <View>
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
                            🔒 Enfocado en seguridad y control de acceso
                        </Text>
                        <Text style={typography.body2}>
                            🏗️ Arquitectura: Eigenfaces + LBP + Fusión Híbrida
                        </Text>
                    </View>
                </Card>

                {/* Acciones de Mantenimiento */}
                <Card title="Mantenimiento">
                    <TouchableOpacity
                        style={[globalStyles.secondaryButton, globalStyles.marginBottom16]}
                        onPress={() => Alert.alert('Info', 'Funcionalidad de limpieza en desarrollo')}
                    >
                        <Text style={globalStyles.secondaryButtonText}>Limpiar Caché</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[globalStyles.secondaryButton, globalStyles.marginBottom16]}
                        onPress={() => Alert.alert('Info', 'Funcionalidad de exportación en desarrollo')}
                    >
                        <Text style={globalStyles.secondaryButtonText}>Exportar Logs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={globalStyles.alertButton}
                        onPress={() =>
                            Alert.alert(
                                'Reiniciar Sistema',
                                'Esta acción reiniciará la aplicación. ¿Continuar?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Reiniciar',
                                        style: 'destructive',
                                        onPress: () => {
                                            // En una app real, aquí se reiniciaría la app
                                            Alert.alert('Info', 'Funcionalidad de reinicio en desarrollo');
                                        }
                                    },
                                ]
                            )
                        }
                    >
                        <Text style={globalStyles.buttonText}>Reiniciar Sistema</Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}