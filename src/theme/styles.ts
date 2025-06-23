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
        marginBottom: 16,
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

    // Spacing utilities - AGREGADAS LAS FALTANTES
    marginTop4: { marginTop: 4 },
    marginTop8: { marginTop: 8 },
    marginTop12: { marginTop: 12 },
    marginTop16: { marginTop: 16 },
    marginTop20: { marginTop: 20 },
    marginTop24: { marginTop: 24 },
    marginTop32: { marginTop: 32 },

    marginBottom4: { marginBottom: 4 },
    marginBottom8: { marginBottom: 8 },
    marginBottom12: { marginBottom: 12 },
    marginBottom16: { marginBottom: 16 },
    marginBottom20: { marginBottom: 20 },
    marginBottom24: { marginBottom: 24 },
    marginBottom32: { marginBottom: 32 },

    marginLeft4: { marginLeft: 4 },
    marginLeft8: { marginLeft: 8 },
    marginLeft12: { marginLeft: 12 },
    marginLeft16: { marginLeft: 16 },

    marginRight4: { marginRight: 4 },
    marginRight8: { marginRight: 8 },
    marginRight12: { marginRight: 12 },
    marginRight16: { marginRight: 16 },

    paddingHorizontal8: { paddingHorizontal: 8 },
    paddingHorizontal12: { paddingHorizontal: 12 },
    paddingHorizontal16: { paddingHorizontal: 16 },
    paddingHorizontal20: { paddingHorizontal: 20 },
    paddingHorizontal24: { paddingHorizontal: 24 },

    paddingVertical4: { paddingVertical: 4 },
    paddingVertical8: { paddingVertical: 8 },
    paddingVertical12: { paddingVertical: 12 },
    paddingVertical16: { paddingVertical: 16 },
    paddingVertical20: { paddingVertical: 20 },
    paddingVertical24: { paddingVertical: 24 },

    padding4: { padding: 4 },
    padding8: { padding: 8 },
    padding12: { padding: 12 },
    padding16: { padding: 16 },
    padding20: { padding: 20 },
    padding24: { padding: 24 },

    // Flex utilities
    row: { flexDirection: 'row' },
    column: { flexDirection: 'column' },
    center: { alignItems: 'center', justifyContent: 'center' },
    spaceBetween: { justifyContent: 'space-between' },
    spaceAround: { justifyContent: 'space-around' },
    spaceEvenly: { justifyContent: 'space-evenly' },
    alignCenter: { alignItems: 'center' },
    alignStart: { alignItems: 'flex-start' },
    alignEnd: { alignItems: 'flex-end' },
    justifyCenter: { justifyContent: 'center' },
    justifyStart: { justifyContent: 'flex-start' },
    justifyEnd: { justifyContent: 'flex-end' },
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    flex3: { flex: 3 },

    // Text utilities
    textCenter: { textAlign: 'center' },
    textLeft: { textAlign: 'left' },
    textRight: { textAlign: 'right' },

    // Border utilities
    borderTop: { borderTopWidth: 1, borderTopColor: colors.border },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: colors.border },
    borderLeft: { borderLeftWidth: 1, borderLeftColor: colors.border },
    borderRight: { borderRightWidth: 1, borderRightColor: colors.border },

    // Background utilities
    backgroundPrimary: { backgroundColor: colors.primary },
    backgroundSecondary: { backgroundColor: colors.secondary },
    backgroundSuccess: { backgroundColor: colors.success },
    backgroundWarning: { backgroundColor: colors.warning },
    backgroundInfo: { backgroundColor: colors.info },
    backgroundSurface: { backgroundColor: colors.surface },
    backgroundTransparent: { backgroundColor: 'transparent' },

    // Width and height utilities
    width100: { width: '100%' },
    width75: { width: '75%' },
    width50: { width: '50%' },
    width25: { width: '25%' },
    height100: { height: '100%' },
    height75: { height: '75%' },
    height50: { height: '50%' },
    height25: { height: '25%' },

    // Position utilities
    absolute: { position: 'absolute' },
    relative: { position: 'relative' },
    top0: { top: 0 },
    bottom0: { bottom: 0 },
    left0: { left: 0 },
    right0: { right: 0 },

    // Opacity utilities
    opacity50: { opacity: 0.5 },
    opacity75: { opacity: 0.75 },
    opacity90: { opacity: 0.9 },

    // Shadow utilities
    shadowSmall: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    shadowMedium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    shadowLarge: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});