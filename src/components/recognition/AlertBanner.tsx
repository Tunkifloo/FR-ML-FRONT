import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlertaSeguridad } from '../../types/recognition';
import { globalStyles } from '../../theme/styles';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface AlertBannerProps {
    alert: AlertaSeguridad;
    onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
    // FUNCIONES HELPER CON VERIFICACIONES DE SEGURIDAD
    const getAlertColor = (level: string) => {
        switch (level) {
            case 'HIGH': return colors.alert.high;
            case 'MEDIUM': return colors.alert.medium;
            case 'LOW': return colors.alert.low;
            default: return colors.secondary;
        }
    };

    const getAlertIcon = (level: string): keyof typeof Ionicons.glyphMap => {
        switch (level) {
            case 'HIGH': return 'warning';
            case 'MEDIUM': return 'alert-circle';
            case 'LOW': return 'information-circle';
            default: return 'alert-circle';
        }
    };

    const getAlertLevelText = (level: string) => {
        switch (level) {
            case 'HIGH': return 'CRÍTICA';
            case 'MEDIUM': return 'MEDIA';
            case 'LOW': return 'BAJA';
            default: return level || 'DESCONOCIDA';
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            if (!dateString) return 'Fecha no disponible';
            return new Date(dateString).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString || 'Fecha inválida';
        }
    };

    // VERIFICACIONES DE SEGURIDAD PARA PROPIEDADES
    const safeConfidence = typeof alert.confidence === 'number' ? alert.confidence : 0;
    const safeName = alert.person_name || 'Nombre no disponible';
    const safeLastName = alert.person_lastname || '';
    const safeRequisitionType = alert.requisition_type || 'Tipo no especificado';
    const safeLocation = alert.location || 'Ubicación no disponible';
    const safeAlertId = alert.alert_id || 'ID no disponible';
    const safeLevel = alert.alert_level || 'HIGH';

    const alertColor = getAlertColor(safeLevel);
    const alertIcon = getAlertIcon(safeLevel);
    const alertLevelText = getAlertLevelText(safeLevel);

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: alertColor,
                    marginVertical: 8,
                    marginHorizontal: 16,
                    borderRadius: 12,
                    padding: 16,
                    borderLeftWidth: 6,
                    borderLeftColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }
            ]}
        >
            {/* Header de la alerta */}
            <View style={[globalStyles.row, globalStyles.alignCenter, { marginBottom: 12 }]}>
                <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 20,
                    padding: 8,
                    marginRight: 12,
                }}>
                    <Ionicons
                        name={alertIcon}
                        size={24}
                        color={colors.surface}
                    />
                </View>
                <View style={globalStyles.flex1}>
                    <Text style={[
                        typography.h4,
                        {
                            color: colors.surface,
                            fontWeight: 'bold',
                            fontSize: 18,
                        }
                    ]}>
                        🚨 ALERTA {alertLevelText}
                    </Text>
                    <Text style={[
                        typography.caption,
                        {
                            color: colors.surface,
                            opacity: 0.9,
                            fontSize: 12,
                        }
                    ]}>
                        PERSONA REQUISITORIADA DETECTADA
                    </Text>
                </View>
            </View>

            {/* Información de la persona */}
            <View style={{ marginBottom: 12 }}>
                <Text style={[
                    typography.h3,
                    {
                        color: colors.surface,
                        fontWeight: 'bold',
                        fontSize: 20,
                        marginBottom: 4,
                    }
                ]}>
                    {safeName} {safeLastName}
                </Text>
                <Text style={[
                    typography.body1,
                    {
                        color: colors.surface,
                        opacity: 0.95,
                        marginBottom: 4,
                    }
                ]}>
                    Tipo de Requisitoria: {safeRequisitionType}
                </Text>
                <Text style={[
                    typography.body2,
                    {
                        color: colors.surface,
                        opacity: 0.9,
                    }
                ]}>
                    Confianza del Reconocimiento: {safeConfidence.toFixed(1)}%
                </Text>
            </View>

            {/* Información técnica */}
            <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
            }}>
                <Text style={[
                    typography.caption,
                    {
                        color: colors.surface,
                        opacity: 0.9,
                        marginBottom: 4,
                    }
                ]}>
                    📍 Ubicación: {safeLocation}
                </Text>
                <Text style={[
                    typography.caption,
                    {
                        color: colors.surface,
                        opacity: 0.9,
                        marginBottom: 4,
                    }
                ]}>
                    🕒 Fecha y Hora: {formatDate(alert.detection_timestamp)}
                </Text>
                <Text style={[
                    typography.caption,
                    {
                        color: colors.surface,
                        opacity: 0.9,
                    }
                ]}>
                    🆔 ID Alerta: {safeAlertId}
                </Text>
            </View>

            {/* Mensaje de acción */}
            <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 8,
                padding: 12,
            }}>
                <Text style={[
                    typography.body2,
                    {
                        color: colors.surface,
                        fontWeight: '600',
                        textAlign: 'center',
                    }
                ]}>
                    ⚠️ CONTACTE INMEDIATAMENTE A LAS AUTORIDADES
                </Text>
            </View>
        </Animated.View>
    );
};