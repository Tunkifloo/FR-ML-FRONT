import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Usuario } from '@/types/user';
import { Card } from '../common/Card';
import { globalStyles, colors, typography } from '@/theme';
import { getInitials, formatRelativeDate } from '@/utils/helpers';

interface UserCardProps {
    user: Usuario;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isSelected?: boolean;
    selectable?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
                                                      user,
                                                      onPress,
                                                      onEdit,
                                                      onDelete,
                                                      isSelected = false,
                                                      selectable = false
                                                  }) => {
    const cardStyle = [
        globalStyles.card,
        isSelected && {
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: colors.background
        }
    ];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View style={cardStyle}>
                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                    {/* Checkbox de selección */}
                    {selectable && (
                        <TouchableOpacity
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? colors.primary : 'transparent',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 12,
                            }}
                            onPress={onPress}
                        >
                            {isSelected && (
                                <Ionicons name="checkmark" size={16} color={colors.surface} />
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Imagen y información principal */}
                    <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.flex1]}>
                        {/* Avatar */}
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: colors.border,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                        }}>
                            {user.imagen_principal?.imagen_base64 ? (
                                <Image
                                    source={{ uri: user.imagen_principal.imagen_base64 }}
                                    style={{ width: 60, height: 60, borderRadius: 30 }}
                                />
                            ) : (
                                <Text style={[typography.h4, { color: colors.textLight }]}>
                                    {getInitials(user.nombre, user.apellido)}
                                </Text>
                            )}
                        </View>

                        {/* Información del usuario */}
                        <View style={globalStyles.flex1}>
                            <Text style={typography.h4}>
                                {user.nombre} {user.apellido}
                            </Text>

                            {user.id_estudiante && (
                                <Text style={[typography.body2, globalStyles.marginTop8]}>
                                    ID: {user.id_estudiante}
                                </Text>
                            )}

                            <Text style={[typography.caption, globalStyles.marginTop8]}>
                                {user.total_imagenes} imagen{user.total_imagenes !== 1 ? 'es' : ''} • {formatRelativeDate(user.fecha_registro)}
                            </Text>

                            {/* Estados */}
                            <View style={[globalStyles.row, globalStyles.marginTop8]}>
                                {user.requisitoriado && (
                                    <View style={[globalStyles.statusBadge, globalStyles.errorBadge, { marginRight: 8 }]}>
                                        <Text style={globalStyles.badgeText}>
                                            REQUISITORIADO
                                        </Text>
                                    </View>
                                )}

                                {!user.activo && (
                                    <View style={[globalStyles.statusBadge, { backgroundColor: colors.textLight }]}>
                                        <Text style={globalStyles.badgeText}>
                                            INACTIVO
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Acciones */}
                    {!selectable && (
                        <View style={globalStyles.row}>
                            {onEdit && (
                                <TouchableOpacity
                                    onPress={onEdit}
                                    style={{ padding: 8, marginRight: 8 }}
                                >
                                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                            {onDelete && (
                                <TouchableOpacity
                                    onPress={onDelete}
                                    style={{ padding: 8, marginRight: 8 }}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.secondary} />
                                </TouchableOpacity>
                            )}
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};