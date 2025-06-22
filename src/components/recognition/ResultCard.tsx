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

    return (
        <View>
            {/* Alerta de seguridad si existe */}
            {result.alerta_seguridad && (
                <AlertBanner alert={result.alerta_seguridad} />
            )}

            <Card title="Resultado del Reconocimiento">
                <View style={globalStyles.recognitionResult}>
                    {/* Imagen procesada */}
                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                marginBottom: 16,
                            }}
                        />
                    )}

                    {/* Estado del reconocimiento */}
                    <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                        <Ionicons
                            name={getStatusIcon(result.reconocido)}
                            size={32}
                            color={getStatusColor(result.reconocido)}
                        />
                        <Text style={[typography.h3, { marginLeft: 8, color: getStatusColor(result.reconocido) }]}>
                            {result.reconocido ? 'RECONOCIDO' : 'NO RECONOCIDO'}
                        </Text>
                    </View>

                    {/* Círculo de confianza */}
                    <View
                        style={[
                            globalStyles.confidenceCircle,
                            { backgroundColor: getConfidenceColor(result.confianza) }
                        ]}
                    >
                        <Text style={[typography.confidenceScore, { color: colors.surface }]}>
                            {result.confianza.toFixed(1)}%
                        </Text>
                        <Text style={[typography.caption, { color: colors.surface }]}>
                            Confianza
                        </Text>
                    </View>

                    {/* Información de la persona */}
                    {result.persona_info && (
                        <View style={globalStyles.marginTop16}>
                            <Text style={typography.h4}>
                                {result.persona_info.nombre} {result.persona_info.apellido}
                            </Text>
                            {result.persona_info.id_estudiante && (
                                <Text style={[typography.body2, globalStyles.marginTop8]}>
                                    ID: {result.persona_info.id_estudiante}
                                </Text>
                            )}
                            {result.persona_info.requisitoriado && (
                                <View style={[globalStyles.statusBadge, globalStyles.errorBadge, globalStyles.marginTop8]}>
                                    <Text style={globalStyles.badgeText}>
                                        REQUISITORIADO: {result.persona_info.tipo_requisitoria}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Detalles técnicos */}
                    <View style={[globalStyles.marginTop24, globalStyles.paddingVertical16, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                        <Text style={[typography.body2, globalStyles.marginBottom8]}>
                            Algoritmo: {result.metodo}
                        </Text>
                        <Text style={[typography.body2, globalStyles.marginBottom8]}>
                            Tiempo: {result.tiempo_procesamiento.toFixed(2)}s
                        </Text>
                        <Text style={[typography.body2, globalStyles.marginBottom8]}>
                            Imagen: {result.imagen_info.dimensiones}
                        </Text>
                        <Text style={typography.caption}>
                            {new Date(result.timestamp).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </Card>
        </View>
    );
};