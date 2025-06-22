import { colors } from './colors';

export const typography = {
    // Headers
    h1: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        lineHeight: 40,
        color: colors.text,
    },
    h2: {
        fontSize: 28,
        fontWeight: 'bold' as const,
        lineHeight: 36,
        color: colors.text,
    },
    h3: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
        color: colors.text,
    },
    h4: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
        color: colors.text,
    },

    // Body text
    body1: {
        fontSize: 16,
        fontWeight: 'normal' as const,
        lineHeight: 24,
        color: colors.text,
    },
    body2: {
        fontSize: 14,
        fontWeight: 'normal' as const,
        lineHeight: 20,
        color: colors.textSecondary,
    },

    // Captions
    caption: {
        fontSize: 12,
        fontWeight: 'normal' as const,
        lineHeight: 16,
        color: colors.textLight,
    },

    // Buttons
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
    },

    // Security specific
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold' as const,
        lineHeight: 24,
        color: colors.secondary,
    },
    confidenceScore: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        lineHeight: 24,
    },
};