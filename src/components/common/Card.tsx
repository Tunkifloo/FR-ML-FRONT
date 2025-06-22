import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { globalStyles}  from '@/theme';
import { typography } from '@/theme';
import { colors } from '../../theme/colors';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export const Card: React.FC<CardProps> = ({ title, children, style, titleStyle }) => {
    return (
        <View style={[globalStyles.card, style]}>
            {title && (
                <View style={globalStyles.cardHeader}>
                    <Text style={[typography.h4, titleStyle]}>{title}</Text>
                </View>
            )}
            {children}
        </View>
    );
};