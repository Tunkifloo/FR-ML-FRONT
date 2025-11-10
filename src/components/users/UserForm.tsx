import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';
import { UsuarioCreate } from '../../types/user';
import { globalStyles } from '../../theme/styles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Constantes y funciones helper
const USER_LIMITS = {
    MIN_IMAGES: 1,
    MAX_IMAGES: 15,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100,
};

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidName = (name: string): boolean => {
    return name.trim().length >= USER_LIMITS.NAME_MIN_LENGTH && name.trim().length <= USER_LIMITS.NAME_MAX_LENGTH;
};

const capitalizeWords = (text: string): string => {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const handleApiError = (error: any): string => {
    if (!error) return 'Error del servidor';

    if (error.response) {
        const message = error.response.data?.detail || error.response.data?.message;
        return message || 'Error del servidor';
    }

    return error.message || 'Error del servidor';
};

interface UserFormProps {
    initialData?: Partial<UsuarioCreate>;
    onSubmit: (userData: UsuarioCreate, imageUris: string[]) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
    loading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
                                                      initialData = {},
                                                      onSubmit,
                                                      onCancel,
                                                      isEditing = false,
                                                      loading = false,
                                                  }) => {
    const [formData, setFormData] = useState({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        email: initialData.email || '',
        id_estudiante: initialData.id_estudiante || '',
    });

    const [imageUris, setImageUris] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validar nombre
        if (!isValidName(formData.nombre)) {
            newErrors.nombre = `El nombre debe tener entre ${USER_LIMITS.NAME_MIN_LENGTH} y ${USER_LIMITS.NAME_MAX_LENGTH} caracteres`;
        }

        // Validar apellido
        if (!isValidName(formData.apellido)) {
            newErrors.apellido = `El apellido debe tener entre ${USER_LIMITS.NAME_MIN_LENGTH} y ${USER_LIMITS.NAME_MAX_LENGTH} caracteres`;
        }

        // Validar email
        if (!isValidEmail(formData.email)) {
            newErrors.email = 'Ingresa un email válido';
        }

        // Validar ID estudiante (opcional pero si se proporciona debe ser válido)
        if (formData.id_estudiante && formData.id_estudiante.trim().length < 2) {
            newErrors.id_estudiante = 'El ID de estudiante debe tener al menos 2 caracteres';
        }

        // Validar imágenes (solo para nuevos usuarios)
        if (!isEditing && imageUris.length < USER_LIMITS.MIN_IMAGES) {
            newErrors.images = `Debes añadir al menos ${USER_LIMITS.MIN_IMAGES} imagen`;
        }

        if (imageUris.length > USER_LIMITS.MAX_IMAGES) {
            newErrors.images = `Máximo ${USER_LIMITS.MAX_IMAGES} imágenes permitidas`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: 'nombre' | 'apellido' | 'email' | 'id_estudiante', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'nombre' || field === 'apellido' ? capitalizeWords(value) : value,
        }));

        // Limpiar error del campo al escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const pickImage = async () => {
        try {
            if (imageUris.length >= USER_LIMITS.MAX_IMAGES) {
                Alert.alert('Límite alcanzado', `Máximo ${USER_LIMITS.MAX_IMAGES} imágenes permitidas`);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as const,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUris(prev => [...prev, result.assets[0].uri]);

                // Limpiar error de imágenes
                if (errors.images) {
                    setErrors(prev => ({ ...prev, images: '' }));
                }
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const takePhoto = async () => {
        try {
            if (imageUris.length >= USER_LIMITS.MAX_IMAGES) {
                Alert.alert('Límite alcanzado', `Máximo ${USER_LIMITS.MAX_IMAGES} imágenes permitidas`);
                return;
            }

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
                setImageUris(prev => [...prev, result.assets[0].uri]);

                // Limpiar error de imágenes
                if (errors.images) {
                    setErrors(prev => ({ ...prev, images: '' }));
                }
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo tomar la foto');
        }
    };

    const removeImage = (index: number) => {
        setImageUris(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const userData: UsuarioCreate = {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: formData.email.trim().toLowerCase(),
                id_estudiante: formData.id_estudiante.trim() || undefined,
                imagenes: [], // No se usa en este contexto
            };

            await onSubmit(userData, imageUris);
        } catch (error) {
            const errorMessage = handleApiError(error);
            Alert.alert('Error', errorMessage);
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Añadir Imagen',
            'Selecciona una opción',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cámara', onPress: takePhoto },
                { text: 'Galería', onPress: pickImage },
            ]
        );
    };

    // Función helper para obtener el estilo del input con error
    const getInputStyle = (hasError: boolean) => {
        return [
            globalStyles.input,
            hasError ? { borderColor: colors.secondary } : undefined
        ].filter(Boolean);
    };

    return (
        <ScrollView style={globalStyles.content}>
            {loading && <Loading message="Guardando usuario..." />}

            <Card title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}>
                {/* Nombre */}
                <View style={globalStyles.marginBottom16}>
                    <Text style={globalStyles.inputLabel}>Nombre *</Text>
                    <TextInput
                        style={getInputStyle(!!errors.nombre)}
                        value={formData.nombre}
                        onChangeText={(value) => handleInputChange('nombre', value)}
                        placeholder="Ingresa el nombre"
                        autoCapitalize="words"
                        maxLength={USER_LIMITS.NAME_MAX_LENGTH}
                    />
                    {errors.nombre && (
                        <Text style={[typography.caption, { color: colors.secondary, marginTop: 4 }]}>
                            {errors.nombre}
                        </Text>
                    )}
                </View>

                {/* Apellido */}
                <View style={globalStyles.marginBottom16}>
                    <Text style={globalStyles.inputLabel}>Apellido *</Text>
                    <TextInput
                        style={getInputStyle(!!errors.apellido)}
                        value={formData.apellido}
                        onChangeText={(value) => handleInputChange('apellido', value)}
                        placeholder="Ingresa el apellido"
                        autoCapitalize="words"
                        maxLength={USER_LIMITS.NAME_MAX_LENGTH}
                    />
                    {errors.apellido && (
                        <Text style={[typography.caption, { color: colors.secondary, marginTop: 4 }]}>
                            {errors.apellido}
                        </Text>
                    )}
                </View>

                {/* Email */}
                <View style={globalStyles.marginBottom16}>
                    <Text style={globalStyles.inputLabel}>Email *</Text>
                    <TextInput
                        style={getInputStyle(!!errors.email)}
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="ejemplo@correo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={USER_LIMITS.EMAIL_MAX_LENGTH}
                    />
                    {errors.email && (
                        <Text style={[typography.caption, { color: colors.secondary, marginTop: 4 }]}>
                            {errors.email}
                        </Text>
                    )}
                </View>

                {/* ID Estudiante */}
                <View style={globalStyles.marginBottom16}>
                    <Text style={globalStyles.inputLabel}>ID Estudiante (Opcional)</Text>
                    <TextInput
                        style={getInputStyle(!!errors.id_estudiante)}
                        value={formData.id_estudiante}
                        onChangeText={(value) => handleInputChange('id_estudiante', value)}
                        placeholder="EST001"
                        autoCapitalize="characters"
                        maxLength={20}
                    />
                    {errors.id_estudiante && (
                        <Text style={[typography.caption, { color: colors.secondary, marginTop: 4 }]}>
                            {errors.id_estudiante}
                        </Text>
                    )}
                </View>
            </Card>

            {/* Sección de Imágenes */}
            <Card title="Imágenes del Usuario">
                <Text style={[typography.body2, globalStyles.marginBottom16]}>
                    {isEditing ? 'Añadir nuevas imágenes (opcional)' : `Añade entre ${USER_LIMITS.MIN_IMAGES} y ${USER_LIMITS.MAX_IMAGES} imágenes *`}
                </Text>

                {/* Grid de imágenes */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                    {imageUris.map((uri, index) => (
                        <View key={index} style={{ margin: 4, position: 'relative' }}>
                            <Image
                                source={{ uri }}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 8,
                                    backgroundColor: colors.border,
                                }}
                            />
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    backgroundColor: colors.secondary,
                                    borderRadius: 12,
                                    width: 24,
                                    height: 24,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => removeImage(index)}
                            >
                                <Ionicons name="close" size={16} color={colors.surface} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Botón añadir imagen */}
                    {imageUris.length < USER_LIMITS.MAX_IMAGES && (
                        <TouchableOpacity
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                backgroundColor: colors.border,
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: 4,
                                borderWidth: 2,
                                borderColor: colors.primary,
                                borderStyle: 'dashed',
                            }}
                            onPress={showImageOptions}
                        >
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {imageUris.length}/{USER_LIMITS.MAX_IMAGES} imágenes
                </Text>

                {errors.images && (
                    <Text style={[typography.caption, { color: colors.secondary, marginTop: 8 }]}>
                        {errors.images}
                    </Text>
                )}
            </Card>

            {/* Botones de acción */}
            <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginTop24]}>
                <TouchableOpacity
                    style={[globalStyles.secondaryButton, { flex: 0.48 }]}
                    onPress={onCancel}
                    disabled={loading}
                >
                    <Text style={globalStyles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.primaryButton, { flex: 0.48 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={globalStyles.buttonText}>
                        {isEditing ? 'Actualizar' : 'Crear Usuario'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};