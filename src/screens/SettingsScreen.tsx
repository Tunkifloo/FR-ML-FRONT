import React, {useState, useEffect, JSX} from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { UserService } from '../services/userService';
import { RecognitionService } from '../services/recognitionService';
import { EstadoEntrenamiento, ModelInfo } from '../types';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

export default function SettingsScreen(): JSX.Element {
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [trainingStatus, setTrainingStatus] = useState<EstadoEntrenamiento | null>(null);
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
            // Recargar información del modelo
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

                {/* Información del Sistema */}
                <Card title="Estado del Sistema">
                    <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                        <Ionicons
                            name={modelInfo?.model_loaded ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={modelInfo?.model_loaded ? colors.success : colors.secondary}
                        />
                        <Text style={[typography.body1, { marginLeft: 8 }]}>
                            Modelo {modelInfo?.model_loaded ? 'Cargado' : 'No Cargado'}
                        </Text>
                    </View>

                    {modelInfo && (
                        <View>
                            <Text style={typography.body2}>
                                📊 Estado: {modelInfo.training_status}
                            </Text>
                            <Text style={typography.body2}>
                                👥 Personas en modelo: {modelInfo.total_persons}
                            </Text>
                            <Text style={typography.body2}>
                                📷 Imágenes totales: {modelInfo.total_images}
                            </Text>
                            <Text style={typography.body2}>
                                🧠 Algoritmos: {modelInfo.algorithms?.join(', ') || 'No disponible'}
                            </Text>
                            {modelInfo.model_accuracy && (
                                <Text style={typography.body2}>
                                    🎯 Precisión: {modelInfo.model_accuracy.toFixed(1)}%
                                </Text>
                            )}
                            {modelInfo.last_training && (
                                <Text style={typography.body2}>
                                    🕒 Último entrenamiento: {new Date(modelInfo.last_training).toLocaleString()}
                                </Text>
                            )}
                        </View>
                    )}
                </Card>

                {/* Estado del Entrenamiento */}
                <Card title="Entrenamiento ML">
                    <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                        <Ionicons
                            name={trainingStatus?.is_trained ? "school" : "alert-circle"}
                            size={24}
                            color={trainingStatus?.is_trained ? colors.success : colors.warning}
                        />
                        <Text style={[typography.body1, { marginLeft: 8 }]}>
                            {trainingStatus?.is_trained ? 'Modelo Entrenado' : 'Requiere Entrenamiento'}
                        </Text>
                    </View>

                    {trainingStatus && (
                        <View>
                            <Text style={typography.body2}>
                                👥 Personas: {trainingStatus.total_persons}
                            </Text>
                            <Text style={typography.body2}>
                                📸 Imágenes de entrenamiento: {trainingStatus.total_training_images}
                            </Text>
                            {trainingStatus.last_training_date && (
                                <Text style={typography.body2}>
                                    📅 Último entrenamiento: {new Date(trainingStatus.last_training_date).toLocaleString()}
                                </Text>
                            )}

                            {trainingStatus.next_training_suggested && (
                                <View style={[globalStyles.statusBadge, globalStyles.warningBadge, globalStyles.marginTop8]}>
                                    <Text style={globalStyles.badgeText}>
                                        Se recomienda reentrenar
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Botones de acción */}
                    <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginTop16]}>
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
                    </View>
                </Card>

                {/* Acciones del Sistema */}
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