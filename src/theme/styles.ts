import { StyleSheet } from 'react-native';
import { typography } from './typography';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.primary,
    },

    content: {
        flex: 1,
        padding: 16,
    },

    // Cards
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    // Buttons
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },

    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },

    alertButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },

    buttonText: {
        ...typography.button,
        color: colors.surface,
    },

    secondaryButtonText: {
        ...typography.button,
        color: colors.primary,
    },

    // Status indicators
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },

    successBadge: {
        backgroundColor: colors.success,
    },

    warningBadge: {
        backgroundColor: colors.warning,
    },

    errorBadge: {
        backgroundColor: colors.secondary,
    },

    badgeText: {
        ...typography.caption,
        color: colors.surface,
        fontWeight: '600',
    },

    // Lists
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    // Form elements
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: colors.surface,
        minHeight: 48,
    },

    inputLabel: {
        ...typography.body2,
        marginBottom: 8,
        fontWeight: '600',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },

    loadingText: {
        ...typography.body1,
        marginTop: 16,
        textAlign: 'center',
    },

    // Error states
    errorContainer: {
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
    },

    errorText: {
        ...typography.body1,
        color: colors.surface,
        textAlign: 'center',
    },

    // Security specific styles
    alertBanner: {
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.surface,
    },

    recognitionResult: {
        alignItems: 'center',
        padding: 20,
    },

    confidenceCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },

    // Tab bar
    tabBar: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: 8,
    },

    // Header
    header: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerTitle: {
        ...typography.h3,
        color: colors.surface,
    },

    // Spacing utilities
    marginTop8: { marginTop: 8 },
    marginTop16: { marginTop: 16 },
    marginTop24: { marginTop: 24 },
    marginBottom8: { marginBottom: 8 },
    marginBottom16: { marginBottom: 16 },
    marginBottom24: { marginBottom: 24 },

    paddingHorizontal16: { paddingHorizontal: 16 },
    paddingVertical8: { paddingVertical: 8 },
    paddingVertical16: { paddingVertical: 16 },

    // Flex utilities
    row: { flexDirection: 'row' },
    column: { flexDirection: 'column' },
    center: { alignItems: 'center', justifyContent: 'center' },
    spaceBetween: { justifyContent: 'space-between' },
    alignCenter: { alignItems: 'center' },
    flex1: { flex: 1 },
});