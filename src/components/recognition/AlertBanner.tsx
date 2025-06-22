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

    return (
        <Animated.View
            style={[
                globalStyles.alertBanner,
                {
                    backgroundColor: getAlertColor(alert.alert_level),
                    borderLeftColor: colors.surface,
                }
            ]}
        >
            <View style={[globalStyles.row, globalStyles.alignCenter]}>
                <Ionicons
                    name={getAlertIcon(alert.alert_level)}
                    size={24}
                    color={colors.surface}
                />
                <View style={[globalStyles.flex1, { marginLeft: 12 }]}>
                    <Text style={[typography.alertTitle, { color: colors.surface }]}>
                        🚨 ALERTA {alert.alert_level}
                    </Text>
                    <Text style={[typography.body1, { color: colors.surface, marginTop: 4 }]}>
                        {alert.person_name}
                    </Text>
                    <Text style={[typography.body2, { color: colors.surface, marginTop: 2 }]}>
                        {alert.requisition_type} - Confianza: {alert.confidence}%
                    </Text>
                    <Text style={[typography.caption, { color: colors.surface, marginTop: 4 }]}>
                        {new Date(alert.timestamp).toLocaleString()}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};