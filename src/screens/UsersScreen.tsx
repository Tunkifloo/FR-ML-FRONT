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

export default function UsersScreen(): JSX.Element {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadUsers = async (pageNum: number = 1, refresh: boolean = false) => {
        try {
            if (refresh) {
                setError(null);
                setUsers([]);
                setPage(1);
            }

            const response = await UserService.getUsers(pageNum, 20);
            const newUsers = response.data;

            if (refresh) {
                setUsers(newUsers);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }

            setHasMore(pageNum < response.total_paginas);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
            setRefreshing(false);
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
        if (!loading && hasMore) {
            setLoading(true);
            loadUsers(page + 1);
        }
    };

    const handleDeleteUser = (user: Usuario) => {
        Alert.alert(
            'Eliminar Usuario',
            `¿Estás seguro de eliminar a ${user.nombre} ${user.apellido}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await UserService.deleteUser(user.id);
                            onRefresh();
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.detail || 'Error al eliminar usuario');
                        }
                    },
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: Usuario }) => (
        <UserCard
            user={item}
            onPress={() => {/* Navigate to user details */}}
            onEdit={() => {/* Navigate to edit user */}}
            onDelete={() => handleDeleteUser(item)}
        />
    );

    const renderHeader = () => (
        <Card>
            <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                <View>
                    <Text style={typography.h3}>Usuarios Registrados</Text>
                    <Text style={typography.body2}>{users.length} usuarios cargados</Text>
                </View>
                <TouchableOpacity
                    style={globalStyles.primaryButton}
                    onPress={() => {/* Navigate to add user */}}
                >
                    <Ionicons name="person-add" size={20} color={colors.surface} />
                </TouchableOpacity>
            </View>
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
                    onPress={() => {/* Navigate to add user */}}
                >
                    <Text style={globalStyles.buttonText}>Añadir Usuario</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

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
                    contentContainerStyle={globalStyles.paddingHorizontal16}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loading ? <Loading message="Cargando más usuarios..." /> : null
                    }
                />
            </View>
        </SafeAreaView>
    );
}