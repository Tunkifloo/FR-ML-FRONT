import React, { useState, JSX } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserForm } from '../components/users/UserForm';
import { Loading } from '../components/common/Loading';
import { UserService } from '../services/userService';
import { UsuarioCreate } from '../types/user';
import { globalStyles } from '../theme/styles';
import { colors } from '../theme/colors';

interface AddUserScreenProps {
    navigation: {
        goBack: () => void;
        navigate: (screen: string, params?: any) => void;
    };
}

export default function AddUserScreen({ navigation }: AddUserScreenProps): JSX.Element {
    const [loading, setLoading] = useState(false);

    const handleCreateUser = async (userData: UsuarioCreate, imageUris: string[]) => {
        try {
            setLoading(true);

            // Validar que hay imágenes
            if (imageUris.length === 0) {
                Alert.alert('Error', 'Debes añadir al menos una imagen');
                return;
            }

            const response = await UserService.createUser(userData, imageUris);

            // Mostrar resultado
            Alert.alert(
                'Éxito',
                response.message,
                [
                    {
                        text: 'Ver Usuario',
                        onPress: () => {
                            navigation.navigate('UserDetail', { userId: response.data.id });
                        }
                    },
                    {
                        text: 'Crear Otro',
                        onPress: () => {
                            // Simplemente cerrar el alert, mantener en la pantalla actual
                        }
                    },
                    {
                        text: 'Ir a Usuarios',
                        onPress: () => {
                            navigation.navigate('Users');
                        }
                    }
                ]
            );

        } catch (error: any) {
            console.error('Error creating user:', error);
            Alert.alert(
                'Error',
                error.message || 'Error al crear usuario',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancelar',
            '¿Estás seguro de cancelar? Se perderán todos los datos ingresados.',
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

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {loading && (
                    <Loading message="Creando usuario y procesando imágenes..." />
                )}

                <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={handleCancel}
                    loading={loading}
                    isEditing={false}
                />
            </View>
        </SafeAreaView>
    );
}