import React, {useState, useEffect, JSX} from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { UserCard } from '../components/users/UserCard';
import { UserService } from '../services/userService';
import { Usuario } from '../types/user';
import { globalStyles } from '../theme/styles';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

interface UsersScreenProps {
    navigation: {
        navigate: (screen: string, params?: any) => void;
    };
}

export default function UsersScreen({ navigation }: UsersScreenProps): JSX.Element {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);

    const loadUsers = async (pageNum: number = 1, refresh: boolean = false) => {
        try {
            if (refresh) {
                setError(null);
                setUsers([]);
                setPage(1);
                setHasMore(true);
            }

            const response = await UserService.getUsers(pageNum, 20);
            const newUsers = response.data;

            if (refresh || pageNum === 1) {
                setUsers(newUsers);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }

            setTotalUsers(response.total);
            setHasMore(pageNum < response.total_paginas);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers(1, true);
    };

    const loadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            setLoadingMore(true);
            loadUsers(page + 1);
        }
    };

    const handleUserPress = (user: Usuario) => {
        navigation.navigate('UserDetail', { userId: user.id });
    };

    const handleEditUser = (user: Usuario) => {
        navigation.navigate('EditUser', { userId: user.id });
    };

    const handleDeleteUser = (user: Usuario) => {
        Alert.alert(
            '⚠️ Eliminar Usuario',
            `¿Estás seguro de eliminar a ${user.nombre} ${user.apellido}?\n\nEsta acción desactivará al usuario pero mantendrá sus datos.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar Definitivamente',
                    style: 'destructive',
                    onPress: () => confirmDeleteUser(user, true)
                },
                {
                    text: 'Desactivar',
                    onPress: () => confirmDeleteUser(user, false)
                }
            ]
        );
    };

    const confirmDeleteUser = async (user: Usuario, eliminarDefinitivo: boolean) => {
        try {
            setLoading(true);
            await UserService.deleteUser(user.id, eliminarDefinitivo);

            Alert.alert(
                'Éxito',
                eliminarDefinitivo
                    ? `Usuario ${user.nombre} ${user.apellido} eliminado definitivamente`
                    : `Usuario ${user.nombre} ${user.apellido} desactivado`,
                [{ text: 'OK' }]
            );

            // Recargar lista
            onRefresh();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al eliminar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        navigation.navigate('AddUser');
    };

    const renderUser = ({ item }: { item: Usuario }) => (
        <UserCard
            user={item}
            onPress={() => handleUserPress(item)}
            onEdit={() => handleEditUser(item)}
            onDelete={() => handleDeleteUser(item)}
        />
    );

    const renderHeader = () => (
        <Card>
            <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                <View>
                    <Text style={typography.h3}>Usuarios Registrados</Text>
                    <Text style={typography.body2}>
                        {totalUsers} usuarios • {users.length} cargados
                    </Text>
                    {hasMore && (
                        <Text style={typography.caption}>
                            Página {page} • Toca al final para cargar más
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[globalStyles.primaryButton, { paddingHorizontal: 16 }]}
                    onPress={handleAddUser}
                    activeOpacity={0.7}
                >
                    <Ionicons name="person-add" size={20} color={colors.surface} />
                </TouchableOpacity>
            </View>

            {/* Estadísticas rápidas */}
            {users.length > 0 && (
                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginTop16]}>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.primary }]}>
                            {users.filter(u => u.activo).length}
                        </Text>
                        <Text style={typography.caption}>Activos</Text>
                    </View>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.secondary }]}>
                            {users.filter(u => u.requisitoriado).length}
                        </Text>
                        <Text style={typography.caption}>Requisitoriados</Text>
                    </View>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.info }]}>
                            {Math.round(users.reduce((sum, u) => sum + u.total_imagenes, 0) / users.length) || 0}
                        </Text>
                        <Text style={typography.caption}>Img/Usuario</Text>
                    </View>
                    <View style={globalStyles.alignCenter}>
                        <Text style={[typography.h3, { color: colors.warning }]}>
                            {users.filter(u => !u.activo).length}
                        </Text>
                        <Text style={typography.caption}>Inactivos</Text>
                    </View>
                </View>
            )}
        </Card>
    );

    const renderEmpty = () => (
        <Card>
            <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                <Ionicons name="people" size={48} color={colors.textLight} />
                <Text style={[typography.h4, globalStyles.marginTop16]}>
                    Sin usuarios
                </Text>
                <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                    No hay usuarios registrados en el sistema
                </Text>
                <TouchableOpacity
                    style={[globalStyles.primaryButton, globalStyles.marginTop16]}
                    onPress={handleAddUser}
                >
                    <View style={[globalStyles.row, globalStyles.alignCenter]}>
                        <Ionicons name="person-add" size={20} color={colors.surface} />
                        <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>
                            Añadir Primer Usuario
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={globalStyles.paddingVertical16}>
                <Loading message="Cargando más usuarios..." />
            </View>
        );
    };

    if (loading && users.length === 0) {
        return <Loading message="Cargando usuarios..." />;
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.container}>
                {error && (
                    <View style={globalStyles.paddingHorizontal16}>
                        <ErrorMessage message={error} onRetry={onRefresh} />
                    </View>
                )}

                <FlatList
                    data={users}
                    renderItem={renderUser}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={!loading ? renderEmpty : null}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={globalStyles.paddingHorizontal16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                />
            </View>
        </SafeAreaView>
    );
}