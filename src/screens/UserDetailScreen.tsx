import React, { useState, useEffect, JSX } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { UserService } from '../services/userService';
import { Usuario } from '../types/user';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

interface UserDetailScreenProps {
    navigation: {
        goBack: () => void;
        navigate: (screen: string, params?: any) => void;
    };
    route: {
        params: {
            userId: number;
        };
    };
}

export default function UserDetailScreen({ navigation, route }: UserDetailScreenProps): JSX.Element {
    const { userId } = route.params;
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingImages, setAddingImages] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUserDetails = async () => {
        try {
            setError(null);
            setLoading(true);

            // Primero intentamos buscar por ID numérico
            const response = await UserService.getUserByStudentId(userId.toString(), true, true);
            setUser(response.data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar detalles del usuario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserDetails();
    }, [userId]);

    const handleAddImages = async () => {
        try {
            if (!user) return;

            // Verificar límite de imágenes
            if (user.total_imagenes >= 5) {
                Alert.alert('Límite alcanzado', 'Un usuario puede tener máximo 5 imágenes');
                return;
            }

            const options = [
                { text: 'Cancelar', style: 'cancel' as const },
                { text: 'Tomar Foto', onPress: () => takePhoto() },
                { text: 'Elegir de Galería', onPress: () => pickFromGallery() }
            ];

            Alert.alert('Añadir Imagen', 'Selecciona una opción', options);
        } catch (error) {
            console.error('Error in handleAddImages:', error);
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos', 'Necesitamos permisos de cámara para tomar fotos');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await addImageToUser([result.assets[0].uri]);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo tomar la foto');
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as const,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: 5 - (user?.total_imagenes || 0),
            });

            if (!result.canceled && result.assets.length > 0) {
                const uris = result.assets.map(asset => asset.uri);
                await addImageToUser(uris);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const addImageToUser = async (imageUris: string[]) => {
        if (!user) return;

        try {
            setAddingImages(true);
            await UserService.addUserImages(user.id, imageUris);

            Alert.alert(
                'Éxito',
                `${imageUris.length} imagen${imageUris.length > 1 ? 'es' : ''} añadida${imageUris.length > 1 ? 's' : ''} exitosamente`,
                [{ text: 'OK' }]
            );

            // Recargar detalles del usuario
            await loadUserDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al añadir imágenes');
        } finally {
            setAddingImages(false);
        }
    };

    const handleEditUser = () => {
        navigation.navigate('EditUser', { userId: user?.id });
    };

    const handleDeleteUser = () => {
        if (!user) return;

        Alert.alert(
            '⚠️ Eliminar Usuario',
            `¿Estás seguro de eliminar a ${user.nombre} ${user.apellido}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await UserService.deleteUser(user.id, false);
                            Alert.alert('Éxito', 'Usuario eliminado exitosamente', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Error al eliminar usuario');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return <Loading message="Cargando detalles del usuario..." />;
    }

    if (error || !user) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={globalStyles.container}>
                    <ErrorMessage
                        message={error || 'Usuario no encontrado'}
                        onRetry={loadUserDetails}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {addingImages && <Loading message="Añadiendo imágenes..." />}

                <ScrollView style={globalStyles.content}>
                    {/* Información Básica */}
                    <Card title="Información Personal">
                        <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                            {/* Avatar */}
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: colors.border,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 16,
                            }}>
                                {user.imagen_principal?.imagen_base64 ? (
                                    <Image
                                        source={{ uri: user.imagen_principal.imagen_base64 }}
                                        style={{ width: 80, height: 80, borderRadius: 40 }}
                                    />
                                ) : (
                                    <Text style={[typography.h2, { color: colors.textLight }]}>
                                        {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                                    </Text>
                                )}
                            </View>

                            {/* Info básica */}
                            <View style={globalStyles.flex1}>
                                <Text style={typography.h3}>
                                    {user.nombre} {user.apellido}
                                </Text>
                                <Text style={typography.body2}>
                                    {user.email}
                                </Text>
                                {user.id_estudiante && (
                                    <Text style={typography.body2}>
                                        ID: {user.id_estudiante}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Estados */}
                        <View style={[globalStyles.row, globalStyles.marginBottom16]}>
                            {user.requisitoriado && (
                                <View style={[globalStyles.statusBadge, globalStyles.errorBadge, { marginRight: 8 }]}>
                                    <Text style={globalStyles.badgeText}>
                                        REQUISITORIADO: {user.tipo_requisitoria}
                                    </Text>
                                </View>
                            )}

                            <View style={[globalStyles.statusBadge, user.activo ? globalStyles.successBadge : globalStyles.warningBadge]}>
                                <Text style={globalStyles.badgeText}>
                                    {user.activo ? 'ACTIVO' : 'INACTIVO'}
                                </Text>
                            </View>
                        </View>

                        {/* Fechas */}
                        <Text style={typography.body2}>
                            📅 Registrado: {formatDate(user.fecha_registro)}
                        </Text>
                        {user.fecha_actualizacion && (
                            <Text style={typography.body2}>
                                🔄 Actualizado: {formatDate(user.fecha_actualizacion)}
                            </Text>
                        )}
                    </Card>

                    {/* Imágenes */}
                    <Card title={`Imágenes (${user.total_imagenes}/5)`}>
                        <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                            <Text style={typography.body2}>
                                {user.total_imagenes} imagen{user.total_imagenes !== 1 ? 'es' : ''} registrada{user.total_imagenes !== 1 ? 's' : ''}
                            </Text>

                            {user.total_imagenes < 5 && (
                                <TouchableOpacity
                                    style={globalStyles.primaryButton}
                                    onPress={handleAddImages}
                                    disabled={addingImages}
                                >
                                    <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                        <Ionicons name="camera-outline" size={16} color={colors.surface} />
                                        <Text style={[globalStyles.buttonText, { marginLeft: 4, fontSize: 14 }]}>
                                            Añadir
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Grid de imágenes */}
                        {user.imagenes && user.imagenes.length > 0 ? (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {user.imagenes.map((imagen, index) => (
                                    <View key={imagen.id} style={{ margin: 4, position: 'relative' }}>
                                        {imagen.imagen_base64 ? (
                                            <Image
                                                source={{ uri: imagen.imagen_base64 }}
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 8,
                                                    backgroundColor: colors.border,
                                                }}
                                            />
                                        ) : (
                                            <View style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 8,
                                                backgroundColor: colors.border,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                                <Ionicons name="image-outline" size={24} color={colors.textLight} />
                                            </View>
                                        )}

                                        {imagen.es_principal && (
                                            <View style={{
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                backgroundColor: colors.success,
                                                borderRadius: 8,
                                                paddingHorizontal: 4,
                                                paddingVertical: 2,
                                            }}>
                                                <Text style={{ color: colors.surface, fontSize: 10, fontWeight: 'bold' }}>
                                                    PRINCIPAL
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={[globalStyles.center, { paddingVertical: 20 }]}>
                                <Ionicons name="images-outline" size={32} color={colors.textLight} />
                                <Text style={[typography.body2, { marginTop: 8, textAlign: 'center' }]}>
                                    No hay imágenes registradas
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Estadísticas de Reconocimiento */}
                    {user.estadisticas_reconocimiento && (
                        <Card title="Estadísticas de Reconocimiento">
                            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h3, { color: colors.primary }]}>
                                        {user.estadisticas_reconocimiento.total_reconocimientos}
                                    </Text>
                                    <Text style={typography.caption}>Total</Text>
                                </View>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h3, { color: colors.success }]}>
                                        {user.estadisticas_reconocimiento.reconocimientos_exitosos}
                                    </Text>
                                    <Text style={typography.caption}>Exitosos</Text>
                                </View>
                                <View style={globalStyles.alignCenter}>
                                    <Text style={[typography.h3, { color: colors.info }]}>
                                        {user.estadisticas_reconocimiento.tasa_exito.toFixed(1)}%
                                    </Text>
                                    <Text style={typography.caption}>Tasa Éxito</Text>
                                </View>
                            </View>
                        </Card>
                    )}

                    {/* Reconocimientos Recientes */}
                    {user.reconocimientos_recientes && user.reconocimientos_recientes.length > 0 && (
                        <Card title="Reconocimientos Recientes">
                            {user.reconocimientos_recientes.slice(0, 5).map((rec, index) => (
                                <View
                                    key={rec.id}
                                    style={[
                                        globalStyles.row,
                                        globalStyles.spaceBetween,
                                        globalStyles.alignCenter,
                                        globalStyles.paddingVertical8,
                                        index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }
                                    ]}
                                >
                                    <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                        <Ionicons
                                            name={rec.reconocido ? "checkmark-circle" : "close-circle"}
                                            size={16}
                                            color={rec.reconocido ? colors.success : colors.secondary}
                                        />
                                        <Text style={[typography.body2, { marginLeft: 8 }]}>
                                            {rec.confianza}% confianza
                                        </Text>
                                    </View>
                                    <Text style={typography.caption}>
                                        {formatDate(rec.fecha)}
                                    </Text>
                                </View>
                            ))}
                        </Card>
                    )}

                    {/* Acciones */}
                    <Card title="Acciones">
                        <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginBottom16]}>
                            <TouchableOpacity
                                style={[globalStyles.primaryButton, { flex: 0.48 }]}
                                onPress={handleEditUser}
                            >
                                <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                    <Ionicons name="create-outline" size={16} color={colors.surface} />
                                    <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>
                                        Editar
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[globalStyles.alertButton, { flex: 0.48 }]}
                                onPress={handleDeleteUser}
                            >
                                <View style={[globalStyles.row, globalStyles.alignCenter]}>
                                    <Ionicons name="trash-outline" size={16} color={colors.surface} />
                                    <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>
                                        Eliminar
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}