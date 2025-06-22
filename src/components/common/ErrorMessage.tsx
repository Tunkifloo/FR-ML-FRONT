import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles}  from '@/theme';
import { typography } from '../../theme/typography';
import { colors } from '@/theme';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
                                                              message,
                                                              onRetry,
                                                              retryText = 'Reintentar'
                                                          }) => {
    return (
        <View style={globalStyles.errorContainer}>
            <View style={[globalStyles.row, globalStyles.alignCenter]}>
                <Ionicons name="alert-circle" size={24} color={colors.surface} />
                <Text style={[globalStyles.errorText, { marginLeft: 8, flex: 1 }]}>
                    {message}
                </Text>
            </View>
            {onRetry && (
                <TouchableOpacity
                    style={[globalStyles.secondaryButton, { marginTop: 12, backgroundColor: colors.surface }]}
                    onPress={onRetry}
                >
                    <Text style={[globalStyles.secondaryButtonText, { color: colors.secondary }]}>
                        {retryText}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};