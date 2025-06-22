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
        // Colores adicionales requeridos por react-native-paper v5
        onPrimary: colors.surface,
        onSecondary: colors.surface,
        onSurface: colors.text,
        onBackground: colors.text,
        outline: colors.border,
        inverseSurface: colors.text,
        inverseOnSurface: colors.surface,
        inversePrimary: colors.surface,
        shadow: colors.text,
        scrim: colors.text,
        surfaceVariant: colors.background,
        onSurfaceVariant: colors.textSecondary,
        outlineVariant: colors.border,
        error: colors.secondary,
        onError: colors.surface,
        errorContainer: colors.secondary,
        onErrorContainer: colors.surface,
        primaryContainer: colors.primary,
        onPrimaryContainer: colors.surface,
        secondaryContainer: colors.secondary,
        onSecondaryContainer: colors.surface,
        tertiary: colors.info,
        onTertiary: colors.surface,
        tertiaryContainer: colors.info,
        onTertiaryContainer: colors.surface,
        surfaceDisabled: colors.border,
        onSurfaceDisabled: colors.textLight,
    },
};

export default function App(): JSX.Element {
    return (
        <PaperProvider theme={paperTheme}>
            <StatusBar style="light" backgroundColor={colors.primary} />
            <AppNavigator />
        </PaperProvider>
    );
}