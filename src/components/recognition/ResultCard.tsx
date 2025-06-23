import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecognitionResult } from '../../types/recognition';
import { Card } from '../common/Card';
import { AlertBanner } from './AlertBanner';
import { globalStyles } from '../../theme/styles';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface ResultCardProps {
    result: RecognitionResult;
    imageUri?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, imageUri }) => {
    // FUNCIONES HELPER CON VERIFICACIONES DE SEGURIDAD
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return colors.success;
        if (confidence >= 60) return colors.warning;
        return colors.secondary;
    };

    const getStatusIcon = (recognized: boolean): keyof typeof Ionicons.glyphMap => {
        return recognized ? 'checkmark-circle' : 'close-circle';
    };

    const getStatusColor = (recognized: boolean) => {
        return recognized ? colors.success : colors.secondary;
    };

    const formatTimestamp = (timestamp: string): string => {
        try {
            if (!timestamp) return 'Fecha no disponible';
            return new Date(timestamp).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return timestamp || 'Fecha inválida';
        }
    };

    // VERIFICACIONES DE SEGURIDAD PARA TODAS LAS PROPIEDADES
    const safeResult = {
        reconocido: result?.reconocido ?? false,
        confianza: typeof result?.confianza === 'number' ? result.confianza : 0,
        metodo: result?.metodo || 'Desconocido',
        tiempo_procesamiento: typeof result?.tiempo_procesamiento === 'number' ? result.tiempo_procesamiento : 0,
        timestamp: result?.timestamp || new Date().toISOString(),
        imagen_info: {
            dimensiones: result?.imagen_info?.dimensiones || 'No disponible',
            canales: typeof result?.imagen_info?.canales === 'number' ? result.imagen_info.canales : 0,
            tamano_bytes: typeof result?.imagen_info?.tamano_bytes === 'number' ? result.imagen_info.tamano_bytes : 0,
        },
        persona_info: result?.persona_info ? {
            nombre: result.persona_info.nombre || 'Nombre no disponible',
            apellido: result.persona_info.apellido || '',
            id_estudiante: result.persona_info.id_estudiante || null,
            requisitoriado: result.persona_info.requisitoriado ?? false,
            tipo_requisitoria: result.persona_info.tipo_requisitoria || null,
        } : null,
        alerta_seguridad: result?.alerta_seguridad || null,
        historial_id: result?.historial_id || null,
    };

    return (
        <View>
            {/* Alerta de seguridad si existe */}
            {safeResult.alerta_seguridad && (
                <AlertBanner alert={safeResult.alerta_seguridad} />
            )}

            <Card title="Resultado del Reconocimiento">
                <View style={globalStyles.recognitionResult}>
                    {/* Imagen procesada */}
                    {imageUri && (
                        <View style={{
                            alignItems: 'center',
                            marginBottom: 20,
                        }}>
                            <Image
                                source={{ uri: imageUri }}
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    borderWidth: 3,
                                    borderColor: getStatusColor(safeResult.reconocido),
                                }}
                            />
                        </View>
                    )}

                    {/* Estado del reconocimiento */}
                    <View style={[
                        globalStyles.row,
                        globalStyles.alignCenter,
                        globalStyles.center,
                        { marginBottom: 20 }
                    ]}>
                        <Ionicons
                            name={getStatusIcon(safeResult.reconocido)}
                            size={32}
                            color={getStatusColor(safeResult.reconocido)}
                        />
                        <Text style={[
                            typography.h3,
                            {
                                marginLeft: 12,
                                color: getStatusColor(safeResult.reconocido),
                                fontWeight: 'bold',
                            }
                        ]}>
                            {safeResult.reconocido ? 'RECONOCIDO' : 'NO RECONOCIDO'}
                        </Text>
                    </View>

                    {/* Círculo de confianza */}
                    <View
                        style={[
                            globalStyles.confidenceCircle,
                            {
                                backgroundColor: getConfidenceColor(safeResult.confianza),
                                marginBottom: 20,
                            }
                        ]}
                    >
                        <Text style={[
                            typography.confidenceScore,
                            {
                                color: colors.surface,
                                fontSize: 24,
                                fontWeight: 'bold',
                            }
                        ]}>
                            {safeResult.confianza.toFixed(1)}%
                        </Text>
                        <Text style={[
                            typography.caption,
                            {
                                color: colors.surface,
                                fontSize: 12,
                                fontWeight: '600',
                            }
                        ]}>
                            Confianza
                        </Text>
                    </View>

                    {/* Información de la persona */}
                    {safeResult.persona_info && (
                        <View style={{
                            width: '100%',
                            backgroundColor: colors.background,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 20,
                        }}>
                            <Text style={[
                                typography.h4,
                                {
                                    textAlign: 'center',
                                    marginBottom: 8,
                                }
                            ]}>
                                {safeResult.persona_info.nombre} {safeResult.persona_info.apellido}
                            </Text>

                            {safeResult.persona_info.id_estudiante && (
                                <Text style={[
                                    typography.body2,
                                    {
                                        textAlign: 'center',
                                        marginBottom: 8,
                                    }
                                ]}>
                                    ID Estudiante: {safeResult.persona_info.id_estudiante}
                                </Text>
                            )}

                            {safeResult.persona_info.requisitoriado && (
                                <View style={[
                                    globalStyles.statusBadge,
                                    globalStyles.errorBadge,
                                    {
                                        alignSelf: 'center',
                                        marginTop: 8,
                                    }
                                ]}>
                                    <Text style={[
                                        globalStyles.badgeText,
                                        { fontSize: 12, fontWeight: 'bold' }
                                    ]}>
                                        🚨 REQUISITORIADO: {safeResult.persona_info.tipo_requisitoria || 'Sin especificar'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Detalles técnicos */}
                    <View style={{
                        width: '100%',
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: 16,
                    }}>
                        <Text style={[
                            typography.h4,
                            {
                                textAlign: 'center',
                                marginBottom: 12,
                                color: colors.textSecondary,
                            }
                        ]}>
                            Detalles Técnicos
                        </Text>

                        <View style={{
                            backgroundColor: colors.background,
                            borderRadius: 8,
                            padding: 12,
                        }}>
                            <Text style={[
                                typography.body2,
                                { marginBottom: 6 }
                            ]}>
                                🧠 Algoritmo: {safeResult.metodo}
                            </Text>
                            <Text style={[
                                typography.body2,
                                { marginBottom: 6 }
                            ]}>
                                ⏱️ Tiempo: {safeResult.tiempo_procesamiento.toFixed(2)}s
                            </Text>
                            <Text style={[
                                typography.body2,
                                { marginBottom: 6 }
                            ]}>
                                📐 Imagen: {safeResult.imagen_info.dimensiones}
                            </Text>
                            <Text style={[
                                typography.body2,
                                { marginBottom: 6 }
                            ]}>
                                📊 Canales: {safeResult.imagen_info.canales}
                            </Text>
                            <Text style={[
                                typography.body2,
                                { marginBottom: 6 }
                            ]}>
                                💾 Tamaño: {safeResult.imagen_info.tamano_bytes > 0 ? (safeResult.imagen_info.tamano_bytes / 1024).toFixed(1) + ' KB' : 'No disponible'}
                            </Text>
                            <Text style={typography.caption}>
                                🕒 {formatTimestamp(safeResult.timestamp)}
                            </Text>
                            {safeResult.historial_id && (
                                <Text style={typography.caption}>
                                    🆔 ID Historial: #{safeResult.historial_id}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </Card>
        </View>
    );
};