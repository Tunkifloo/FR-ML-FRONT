import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
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

export default function RecognitionScreen(): JSX.Element {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    React.useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                if (photo) {
                    setImageUri(photo.uri);
                    await processImage(photo.uri);
                }
            } catch (err) {
                setError('Error al tomar la foto');
            }
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                await processImage(result.assets[0].uri);
            }
        } catch (err) {
            setError('Error al seleccionar imagen');
        }
    };

    const processImage = async (uri: string) => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const response = await RecognitionService.identifyPerson(uri, 'hybrid', true);
            setResult(response.data);

            // Si hay alerta de seguridad, mostrar notificación
            if (response.data.alerta_seguridad) {
                Alert.alert(
                    '🚨 ALERTA DE SEGURIDAD',
                    `Persona requisitoriada detectada:\n${response.data.persona_info?.nombre} ${response.data.persona_info?.apellido}\nTipo: ${response.data.persona_info?.tipo_requisitoria}`,
                    [{ text: 'Entendido', style: 'default' }]
                );
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al procesar la imagen');
        } finally {
            setLoading(false);
        }
    };

    const resetRecognition = () => {
        setImageUri(null);
        setResult(null);
        setError(null);
    };

    if (!permission) {
        return <Loading message="Solicitando permisos de cámara..." />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={globalStyles.container}>
                    <ErrorMessage
                        message="Sin acceso a la cámara. Habilita los permisos en configuración."
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {loading && <Loading message="Procesando imagen..." />}

                {!imageUri && !loading && (
                    <View style={globalStyles.flex1}>
                        {/* Vista de Cámara */}
                        <CameraView
                            style={globalStyles.flex1}
                            facing={facing}
                            ref={cameraRef}
                        >
                            <View style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                paddingBottom: 50,
                            }}>
                                {/* Overlay de guía */}
                                <View style={{
                                    position: 'absolute',
                                    top: '30%',
                                    left: '20%',
                                    right: '20%',
                                    height: 200,
                                    borderWidth: 2,
                                    borderColor: colors.surface,
                                    borderRadius: 100,
                                    backgroundColor: 'transparent',
                                }} />

                                <Text style={[typography.body1, { color: colors.surface, marginBottom: 30 }]}>
                                    Centra el rostro en el círculo
                                </Text>

                                {/* Controles */}
                                <View style={[globalStyles.row, globalStyles.spaceBetween, { width: '80%' }]}>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: colors.surface,
                                            padding: 15,
                                            borderRadius: 30,
                                        }}
                                        onPress={pickImage}
                                    >
                                        <Ionicons name="images" size={24} color={colors.primary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: colors.surface,
                                            padding: 20,
                                            borderRadius: 40,
                                        }}
                                        onPress={takePicture}
                                    >
                                        <Ionicons name="camera" size={30} color={colors.primary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: colors.surface,
                                            padding: 15,
                                            borderRadius: 30,
                                        }}
                                        onPress={() => setFacing(
                                            facing === 'back' ? 'front' : 'back'
                                        )}
                                    >
                                        <Ionicons name="camera-reverse" size={24} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </CameraView>
                    </View>
                )}

                {/* Resultado del reconocimiento */}
                {(imageUri || result || error) && (
                    <View style={globalStyles.content}>
                        {error && (
                            <ErrorMessage message={error} onRetry={() => imageUri && processImage(imageUri)} />
                        )}

                        {result && (
                            <ResultCard result={result} imageUri={imageUri || undefined} />
                        )}

                        {/* Botón para nueva foto */}
                        <TouchableOpacity
                            style={[globalStyles.primaryButton, globalStyles.marginTop16]}
                            onPress={resetRecognition}
                        >
                            <Text style={globalStyles.buttonText}>Nueva Foto</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}