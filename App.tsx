import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

// Tema para React Native Paper
const paperTheme = {
    colors: {
        primary: colors.primary,
        accent: colors.secondary,
        background: colors.background,
        surface: colors.surface,
        text: colors.text,
        disabled: colors.textLight,
        placeholder: colors.textSecondary,
        backdrop: 'rgba(0, 0, 0, 0.5)',
    },
};

export default function App() {
    return (
        <PaperProvider theme={paperTheme}>
            <StatusBar style="light" backgroundColor={colors.primary} />
            <AppNavigator />
        </PaperProvider>
    );
}