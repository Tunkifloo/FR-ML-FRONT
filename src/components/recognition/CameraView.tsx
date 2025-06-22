import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Camera, CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../theme/styles';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface CameraViewProps {
    onCapture: (imageUri: string) => void;
    onClose: () => void;
    isProcessing?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CameraView: React.FC<CameraViewProps> = ({
                                                          onCapture,
                                                          onClose,
                                                          isProcessing = false
                                                      }) => {
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const [permission, requestPermission] = useCameraPermissions();
    const [isReady, setIsReady] = useState(false);
    const cameraRef = useRef<ExpoCameraView>(null);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const takePicture = async () => {
        if (cameraRef.current && isReady && !isProcessing) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    skipProcessing: false,
                });
                if (photo) {
                    onCapture(photo.uri);
                }
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    if (!permission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={[typography.body1, { color: colors.surface }]}>
                    Solicitando permisos de cámara...
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={48} color={colors.surface} />
                <Text style={[typography.h4, { color: colors.surface, marginTop: 16 }]}>
                    Sin acceso a la cámara
                </Text>
                <Text style={[typography.body2, { color: colors.surface, marginTop: 8, textAlign: 'center' }]}>
                    Habilita los permisos de cámara en la configuración de tu dispositivo
                </Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Text style={[typography.button, { color: colors.surface }]}>
                        Cerrar
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ExpoCameraView
                style={styles.camera}
                facing={facing}
                flash={flash}
                ref={cameraRef}
                onCameraReady={() => setIsReady(true)}
            >
                {/* Header con controles */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color={colors.surface} />
                    </TouchableOpacity>

                    <Text style={[typography.h4, { color: colors.surface }]}>
                        Reconocimiento Facial
                    </Text>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleFlash}
                    >
                        <Ionicons
                            name={flash === 'on' ? "flash" : "flash-off"}
                            size={24}
                            color={colors.surface}
                        />
                    </TouchableOpacity>
                </View>

                {/* Overlay de guía para el rostro */}
                <View style={styles.overlay}>
                    <View style={styles.topOverlay} />
                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.faceFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>
                    <View style={styles.bottomOverlay}>
                        {/* Instrucciones */}
                        <Text style={[typography.body1, { color: colors.surface, textAlign: 'center', marginBottom: 20 }]}>
                            Centra tu rostro en el marco
                        </Text>
                        <Text style={[typography.caption, { color: colors.surface, textAlign: 'center', marginBottom: 30 }]}>
                            Mantén el dispositivo estable y asegúrate de tener buena iluminación
                        </Text>

                        {/* Controles inferiores */}
                        <View style={styles.controls}>
                            {/* Cambiar cámara */}
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={toggleCameraFacing}
                                disabled={isProcessing}
                            >
                                <Ionicons
                                    name="camera-reverse"
                                    size={24}
                                    color={isProcessing ? colors.textLight : colors.surface}
                                />
                            </TouchableOpacity>

                            {/* Botón de captura */}
                            <TouchableOpacity
                                style={[
                                    styles.captureButton,
                                    isProcessing && styles.captureButtonDisabled
                                ]}
                                onPress={takePicture}
                                disabled={!isReady || isProcessing}
                            >
                                {isProcessing ? (
                                    <View style={styles.processingIndicator}>
                                        <Text style={[typography.caption, { color: colors.surface }]}>
                                            Procesando...
                                        </Text>
                                    </View>
                                ) : (
                                    <Ionicons name="camera" size={32} color={colors.primary} />
                                )}
                            </TouchableOpacity>

                            {/* Galería */}
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => {/* Implementar selección de galería */}}
                                disabled={isProcessing}
                            >
                                <Ionicons
                                    name="images"
                                    size={24}
                                    color={isProcessing ? colors.textLight : colors.surface}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ExpoCameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.text,
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    middleRow: {
        flexDirection: 'row',
        height: 280,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    faceFrame: {
        width: 220,
        height: 280,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: colors.surface,
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    captureButtonDisabled: {
        backgroundColor: colors.border,
    },
    processingIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
    },
});