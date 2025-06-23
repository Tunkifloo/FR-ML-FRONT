import React, {useState, useRef, useCallback, JSX} from 'react';
import { View, Text, TouchableOpacity, Image, Alert, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ResultCard } from '../components/recognition/ResultCard';
import { RecognitionService } from '../services/recognitionService';
import { RecognitionResult } from '../types/recognition';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

interface RecognitionScreenProps {
    navigation: {
        navigate: (screenName: string) => void;
    };
}

export default function RecognitionScreen({ navigation }: RecognitionScreenProps): JSX.Element {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [showCamera, setShowCamera] = useState(true);
    const cameraRef = useRef<CameraView>(null);

    // Manejar el enfoque de la pantalla
    useFocusEffect(
        useCallback(() => {
            // Al entrar a la pantalla
            setShowCamera(true);
            setIsCameraReady(false);
            setError(null);

            // Solicitar permisos si no los tenemos
            if (!permission?.granted) {
                requestPermission();
            }

            // Manejar botón de atrás en Android
            const onBackPress = () => {
                if (result || imageUri) {
                    resetRecognition();
                    return true; // Prevenir el comportamiento por defecto
                }
                return false; // Permitir salir de la pantalla
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                // Al salir de la pantalla
                setShowCamera(false);
                setIsCameraReady(false);
                backHandler.remove();
            };
        }, [permission, result, imageUri])
    );

    const takePicture = async () => {
        if (!cameraRef.current || !isCameraReady || loading) {
            return;
        }

        try {
            setLoading(true);
            console.log('📸 Tomando foto...');

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                skipProcessing: false,
            });

            if (photo && photo.uri) {
                console.log('✅ Foto tomada:', photo.uri);
                setImageUri(photo.uri);
                setShowCamera(false); // Ocultar cámara mientras procesamos
                await processImage(photo.uri);
            } else {
                throw new Error('No se pudo capturar la imagen');
            }
        } catch (err: any) {
            console.error('❌ Error tomando foto:', err);
            setError('Error al tomar la foto: ' + err.message);
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            setLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as const,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                console.log('✅ Imagen seleccionada:', result.assets[0].uri);
                setImageUri(result.assets[0].uri);
                setShowCamera(false);
                await processImage(result.assets[0].uri);
            } else {
                setLoading(false);
            }
        } catch (err: any) {
            console.error('❌ Error seleccionando imagen:', err);
            setError('Error al seleccionar imagen: ' + err.message);
            setLoading(false);
        }
    };

    const processImage = async (uri: string) => {
        try {
            console.log('🔄 Procesando imagen:', uri);
            setError(null);
            setResult(null);

            const response = await RecognitionService.identifyPerson(uri, 'hybrid', true);
            console.log('✅ Reconocimiento completado:', response.data);

            setResult(response.data);

            // MANEJO MEJORADO Y SEGURO DE ALERTAS DE SEGURIDAD
            if (response.data?.alerta_seguridad) {
                const alert = response.data.alerta_seguridad;
                const persona = response.data.persona_info;

                console.log('🚨 Alerta de seguridad detectada:', alert);

                // VERIFICACIONES DE SEGURIDAD PARA EVITAR ERRORES
                const safeAlert = {
                    person_name: alert.person_name || 'Nombre no disponible',
                    person_lastname: alert.person_lastname || '',
                    confidence: typeof alert.confidence === 'number' ? alert.confidence : 0,
                    requisition_type: alert.requisition_type || 'Tipo no especificado',
                };

                const safePersona = {
                    nombre: persona?.nombre || safeAlert.person_name,
                    apellido: persona?.apellido || safeAlert.person_lastname,
                    id_estudiante: persona?.id_estudiante || 'No disponible',
                    tipo_requisitoria: persona?.tipo_requisitoria || safeAlert.requisition_type,
                };

                // Mostrar alerta inmediata más detallada con datos seguros
                setTimeout(() => {
                    Alert.alert(
                        '🚨 ALERTA DE SEGURIDAD CRÍTICA',
                        `PERSONA REQUISITORIADA DETECTADA\n\n` +
                        `👤 Nombre: ${safePersona.nombre} ${safePersona.apellido}\n` +
                        `🆔 ID: ${safePersona.id_estudiante}\n` +
                        `⚠️ Tipo: ${safePersona.tipo_requisitoria}\n` +
                        `📊 Confianza: ${safeAlert.confidence.toFixed(1)}%\n\n` +
                        `🚨 CONTACTE INMEDIATAMENTE A LAS AUTORIDADES`,
                        [
                            {
                                text: 'Entendido',
                                style: 'default',
                                onPress: () => console.log('Alerta de seguridad reconocida')
                            }
                        ],
                        {
                            cancelable: false // No se puede cancelar
                        }
                    );
                }, 500); // Pequeño delay para asegurar que la UI esté lista
            }
        } catch (err: any) {
            console.error('❌ Error procesando imagen:', err);
            setError(err.message || 'Error al procesar la imagen');
        } finally {
            setLoading(false);
        }
    };

    const resetRecognition = () => {
        console.log('🔄 Reiniciando reconocimiento...');
        setImageUri(null);
        setResult(null);
        setError(null);
        setShowCamera(true);
        setIsCameraReady(false);
        setLoading(false);
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const onCameraReady = () => {
        console.log('📷 Cámara lista');
        setIsCameraReady(true);
    };

    // Si no tenemos permisos
    if (!permission) {
        return <Loading message="Solicitando permisos de cámara..." />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={globalStyles.container}>
                    <Card>
                        <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                            <Ionicons name="camera-outline" size={48} color={colors.textLight} />
                            <Text style={[typography.h4, globalStyles.marginTop16]}>
                                Sin acceso a la cámara
                            </Text>
                            <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                                Habilita los permisos de cámara en la configuración de tu dispositivo para usar el reconocimiento facial.
                            </Text>
                            <TouchableOpacity
                                style={[globalStyles.primaryButton, globalStyles.marginTop16]}
                                onPress={requestPermission}
                            >
                                <Text style={globalStyles.buttonText}>Solicitar Permisos</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {loading && (
                    <Loading message={imageUri ? "Procesando imagen..." : "Preparando cámara..."} />
                )}

                {/* Vista de Cámara */}
                {showCamera && !result && !imageUri && (
                    <View style={globalStyles.flex1}>
                        <CameraView
                            style={globalStyles.flex1}
                            facing={facing}
                            flash={flash}
                            ref={cameraRef}
                            onCameraReady={onCameraReady}
                        >
                            {/* Header con controles */}
                            <View style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                paddingTop: 50,
                                paddingHorizontal: 20,
                                paddingBottom: 20,
                            }}>
                                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                                    <TouchableOpacity
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onPress={() => navigation.navigate('RecognitionHistory')}
                                    >
                                        <Ionicons name="time" size={20} color={colors.surface} />
                                    </TouchableOpacity>

                                    <Text style={[typography.h4, { color: colors.surface }]}>
                                        Reconocimiento Facial
                                    </Text>

                                    <TouchableOpacity
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onPress={toggleFlash}
                                    >
                                        <Ionicons
                                            name={flash === 'on' ? "flash" : "flash-off"}
                                            size={20}
                                            color={colors.surface}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Overlay de guía para el rostro */}
                            <View style={globalStyles.flex1}>
                                <View style={globalStyles.flex1} />

                                {/* Marco para el rostro */}
                                <View style={[globalStyles.row, globalStyles.center]}>
                                    <View style={{
                                        width: 250,
                                        height: 300,
                                        borderWidth: 2,
                                        borderColor: isCameraReady ? colors.success : colors.warning,
                                        borderRadius: 125,
                                        backgroundColor: 'transparent',
                                    }} />
                                </View>

                                <View style={globalStyles.flex1} />

                                {/* Instrucciones y controles */}
                                <View style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    paddingBottom: 50,
                                    paddingTop: 30,
                                    alignItems: 'center',
                                }}>
                                    <Text style={[typography.body1, { color: colors.surface, textAlign: 'center', marginBottom: 10 }]}>
                                        {isCameraReady ? 'Centra tu rostro en el óvalo' : 'Preparando cámara...'}
                                    </Text>
                                    <Text style={[typography.caption, { color: colors.surface, textAlign: 'center', marginBottom: 30 }]}>
                                        Mantén el dispositivo estable y asegúrate de tener buena iluminación
                                    </Text>

                                    {/* Controles inferiores */}
                                    <View style={[globalStyles.row, globalStyles.spaceBetween, { width: '80%' }]}>
                                        {/* Galería */}
                                        <TouchableOpacity
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 25,
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={pickImage}
                                            disabled={loading}
                                        >
                                            <Ionicons
                                                name="images"
                                                size={24}
                                                color={loading ? colors.textLight : colors.surface}
                                            />
                                        </TouchableOpacity>

                                        {/* Botón de captura */}
                                        <TouchableOpacity
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 40,
                                                backgroundColor: isCameraReady && !loading ? colors.surface : colors.border,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.25,
                                                shadowRadius: 3.84,
                                                elevation: 5,
                                            }}
                                            onPress={takePicture}
                                            disabled={!isCameraReady || loading}
                                        >
                                            <Ionicons
                                                name="camera"
                                                size={32}
                                                color={isCameraReady && !loading ? colors.primary : colors.textLight}
                                            />
                                        </TouchableOpacity>

                                        {/* Cambiar cámara */}
                                        <TouchableOpacity
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 25,
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={toggleCameraFacing}
                                            disabled={loading}
                                        >
                                            <Ionicons
                                                name="camera-reverse"
                                                size={24}
                                                color={loading ? colors.textLight : colors.surface}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </CameraView>
                    </View>
                )}

                {/* Resultado del reconocimiento - MEJORADO CON SCROLL */}
                {(imageUri || result || error) && (
                    <ScrollView
                        style={globalStyles.flex1}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={globalStyles.content}>
                            {error && (
                                <ErrorMessage
                                    message={error}
                                    onRetry={imageUri ? () => processImage(imageUri) : undefined}
                                />
                            )}

                            {result && (
                                <ResultCard result={result} imageUri={imageUri || undefined} />
                            )}

                            {/* Imagen capturada sin resultado aún */}
                            {imageUri && !result && !loading && !error && (
                                <Card title="Imagen Capturada">
                                    <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={{
                                                width: 200,
                                                height: 200,
                                                borderRadius: 100,
                                                marginBottom: 16,
                                            }}
                                        />
                                        <Text style={typography.body1}>
                                            Imagen lista para procesar
                                        </Text>
                                    </View>
                                </Card>
                            )}

                            {/* Botones de acción */}
                            <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginTop16]}>
                                <TouchableOpacity
                                    style={[globalStyles.secondaryButton, { flex: 0.48 }]}
                                    onPress={resetRecognition}
                                    disabled={loading}
                                >
                                    <Text style={globalStyles.secondaryButtonText}>Nueva Foto</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[globalStyles.primaryButton, { flex: 0.48 }]}
                                    onPress={() => navigation.navigate('RecognitionHistory')}
                                    disabled={loading}
                                >
                                    <Text style={globalStyles.buttonText}>Ver Historial</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}