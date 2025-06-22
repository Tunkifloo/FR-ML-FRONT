import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { globalStyles } from '../../theme/styles';
import { colors } from '../../theme/colors';

interface LoadingProps {
    message?: string;
    size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
                                                    message = 'Cargando...',
                                                    size = 'large'
                                                }) => {
    return (
        <View style={globalStyles.loadingContainer}>
            <ActivityIndicator size={size} color={colors.primary} />
            <Text style={globalStyles.loadingText}>{message}</Text>
        </View>
    );
};