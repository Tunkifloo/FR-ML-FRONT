import React, { useState, useEffect, JSX } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserForm } from '../components/users/UserForm';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { UserService } from '../services/userService';
import { UsuarioCreate, Usuario } from '../types/user';
import { globalStyles } from '../theme/styles';

interface EditUserScreenProps {
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

export default function EditUserScreen({ navigation, route }: EditUserScreenProps): JSX.Element {
    const { userId } = route.params;
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUser = async () => {
        try {
            setError(null);
            const response = await UserService.getUserByStudentId(userId.toString());
            setUser(response.data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar usuario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [userId]);

    const handleUpdateUser = async (userData: UsuarioCreate, imageUris: string[]) => {
        if (!user) return;

        try {
            setUpdating(true);

            // Actualizar datos básicos del usuario
            await UserService.updateUser(user.id, {
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: userData.email,
                id_estudiante: userData.id_estudiante,
            });

            // Si hay nuevas imágenes, añadirlas
            if (imageUris.length > 0) {
                await UserService.addUserImages(user.id, imageUris);
            }

            Alert.alert(
                'Éxito',
                'Usuario actualizado exitosamente',
                [
                    {
                        text: 'Ver Usuario',
                        onPress: () => {
                            navigation.navigate('UserDetail', { userId: user.id });
                        }
                    },
                    {
                        text: 'Volver a Usuarios',
                        onPress: () => {
                            navigation.navigate('Users');
                        }
                    }
                ]
            );

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al actualizar usuario');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancelar',
            '¿Estás seguro de cancelar? Se perderán los cambios no guardados.',
            [
                { text: 'Continuar Editando', style: 'cancel' },
                {
                    text: 'Cancelar',
                    style: 'destructive',
                    onPress: () => navigation.goBack()
                }
            ]
        );
    };

    if (loading) {
        return <Loading message="Cargando datos del usuario..." />;
    }

    if (error || !user) {
        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={globalStyles.container}>
                    <ErrorMessage
                        message={error || 'Usuario no encontrado'}
                        onRetry={loadUser}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {updating && (
                    <Loading message="Actualizando usuario..." />
                )}

                <UserForm
                    initialData={{
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        id_estudiante: user.id_estudiante,
                    }}
                    onSubmit={handleUpdateUser}
                    onCancel={handleCancel}
                    loading={updating}
                    isEditing={true}
                />
            </View>
        </SafeAreaView>
    );
}