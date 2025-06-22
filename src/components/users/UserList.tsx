import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';
import { UserCard } from './UserCard';
import { UserService } from '../../services/userService';
import { Usuario } from '../../types/user';
import { globalStyles } from '../../theme/styles';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Funciones helper
const handleApiError = (error: any): string => {
    if (!error) return 'Error del servidor';

    if (error.response) {
        const message = error.response.data?.detail || error.response.data?.message;
        return message || 'Error del servidor';
    }

    return error.message || 'Error del servidor';
};

const debounce = <T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), waitMs);
    };
};

const UI_CONFIG = {
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
    },
};

interface UserListProps {
    onUserPress?: (user: Usuario) => void;
    onUserEdit?: (user: Usuario) => void;
    onUserDelete?: (user: Usuario) => void;
    onAddUser?: () => void;
    showAddButton?: boolean;
    searchable?: boolean;
    selectable?: boolean;
    selectedUsers?: number[];
    onSelectionChange?: (selectedIds: number[]) => void;
}

interface Filters {
    nombre?: string;
    apellido?: string;
    email?: string;
    requisitoriado?: boolean;
    activo?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
                                                      onUserPress,
                                                      onUserEdit,
                                                      onUserDelete,
                                                      onAddUser,
                                                      showAddButton = true,
                                                      searchable = true,
                                                      selectable = false,
                                                      selectedUsers = [],
                                                      onSelectionChange,
                                                  }) => {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filtros y búsqueda
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<Filters>({ activo: true });
    const [showFilters, setShowFilters] = useState(false);

    // Estadísticas
    const [totalUsers, setTotalUsers] = useState(0);

    const loadUsers = useCallback(async (
        page: number = 1,
        refresh: boolean = false,
        searchQuery?: string,
        currentFilters?: Filters
    ) => {
        try {
            if (refresh) {
                setError(null);
                setUsers([]);
                setCurrentPage(1);
                setHasMore(true);
            }

            const appliedFilters = currentFilters || filters;
            const query = searchQuery !== undefined ? searchQuery : searchText;

            // Construir filtros para la API
            const apiFilters: any = { ...appliedFilters };

            if (query.trim()) {
                // Si hay búsqueda, aplicar a nombre, apellido o email
                if (query.includes('@')) {
                    apiFilters.email = query;
                } else {
                    // Buscar por nombre o apellido
                    apiFilters.nombre = query;
                }
            }

            const response = await UserService.getUsers(
                page,
                UI_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
                apiFilters
            );

            const newUsers = response.data;
            setTotalUsers(response.total);
            setTotalPages(response.total_paginas);
            setHasMore(page < response.total_paginas);

            if (refresh || page === 1) {
                setUsers(newUsers);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }

            setCurrentPage(page);
        } catch (err: any) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [filters, searchText]);

    // Debounced search para optimizar búsquedas
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setLoading(true);
            loadUsers(1, true, query);
        }, 500),
        [loadUsers]
    );

    useEffect(() => {
        loadUsers(1, true);
    }, []);

    useEffect(() => {
        if (searchText.length > 0) {
            debouncedSearch(searchText);
        } else if (searchText.length === 0) {
            // Si se borra la búsqueda, recargar sin filtros de texto
            setLoading(true);
            loadUsers(1, true, '');
        }
    }, [searchText, debouncedSearch]);

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers(1, true);
    };

    const loadMore = () => {
        if (!loading && !loadingMore && hasMore && currentPage < totalPages) {
            setLoadingMore(true);
            loadUsers(currentPage + 1, false);
        }
    };

    const handleUserPress = (user: Usuario) => {
        if (selectable) {
            handleSelection(user.id);
        } else if (onUserPress) {
            onUserPress(user);
        }
    };

    const handleSelection = (userId: number) => {
        if (!onSelectionChange) return;

        const newSelection = selectedUsers.includes(userId)
            ? selectedUsers.filter(id => id !== userId)
            : [...selectedUsers, userId];

        onSelectionChange(newSelection);
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
                            setLoading(true);
                            await UserService.deleteUser(user.id);
                            onRefresh();

                            if (onUserDelete) {
                                onUserDelete(user);
                            }
                        } catch (err: any) {
                            const errorMessage = handleApiError(err);
                            Alert.alert('Error', errorMessage);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const applyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setLoading(true);
        loadUsers(1, true, searchText, newFilters);
        setShowFilters(false);
    };

    const clearFilters = () => {
        const defaultFilters = { activo: true };
        setFilters(defaultFilters);
        setSearchText('');
        setLoading(true);
        loadUsers(1, true, '', defaultFilters);
    };

    const renderHeader = () => (
        <View>
            {/* Header con estadísticas */}
            <Card>
                <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.alignCenter]}>
                    <View>
                        <Text style={typography.h3}>Usuarios</Text>
                        <Text style={typography.body2}>
                            {loading ? 'Cargando...' : `${totalUsers} usuarios registrados`}
                        </Text>
                    </View>

                    {showAddButton && onAddUser && (
                        <TouchableOpacity
                            style={[globalStyles.primaryButton, { paddingHorizontal: 16 }]}
                            onPress={onAddUser}
                        >
                            <Ionicons name="person-add" size={20} color={colors.surface} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Selección múltiple info */}
                {selectable && selectedUsers.length > 0 && (
                    <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginTop16]}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[typography.body2, { marginLeft: 8 }]}>
                            {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </Card>

            {/* Barra de búsqueda */}
            {searchable && (
                <Card>
                    <View style={[globalStyles.row, globalStyles.alignCenter]}>
                        <View style={[globalStyles.flex1, globalStyles.row, globalStyles.alignCenter]}>
                            <Ionicons name="search" size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[globalStyles.input, { marginLeft: 12, flex: 1, marginBottom: 0 }]}
                                placeholder="Buscar por nombre, apellido o email..."
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[{
                                padding: 8,
                                marginLeft: 12,
                                borderRadius: 8,
                                backgroundColor: colors.border
                            }]}
                            onPress={() => setShowFilters(!showFilters)}
                        >
                            <Ionicons
                                name="filter"
                                size={20}
                                color={Object.keys(filters).length > 1 ? colors.primary : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Panel de filtros */}
                    {showFilters && (
                        <View style={[globalStyles.marginTop16, { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <Text style={[typography.h4, globalStyles.marginBottom16]}>Filtros</Text>

                            {/* Estado activo */}
                            <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                                <Text style={[typography.body1, { flex: 1 }]}>Estado:</Text>
                                <View style={globalStyles.row}>
                                    <TouchableOpacity
                                        style={[
                                            globalStyles.secondaryButton,
                                            { marginRight: 8, paddingHorizontal: 12, paddingVertical: 6 },
                                            filters.activo === true && { backgroundColor: colors.primary }
                                        ]}
                                        onPress={() => setFilters(prev => ({ ...prev, activo: true }))}
                                    >
                                        <Text style={[
                                            globalStyles.secondaryButtonText,
                                            { fontSize: 12 },
                                            filters.activo === true && { color: colors.surface }
                                        ]}>
                                            Activos
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            globalStyles.secondaryButton,
                                            { paddingHorizontal: 12, paddingVertical: 6 },
                                            filters.activo === false && { backgroundColor: colors.primary }
                                        ]}
                                        onPress={() => setFilters(prev => ({ ...prev, activo: false }))}
                                    >
                                        <Text style={[
                                            globalStyles.secondaryButtonText,
                                            { fontSize: 12 },
                                            filters.activo === false && { color: colors.surface }
                                        ]}>
                                            Inactivos
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Estado requisitoriado */}
                            <View style={[globalStyles.row, globalStyles.alignCenter, globalStyles.marginBottom16]}>
                                <Text style={[typography.body1, { flex: 1 }]}>Requisitoriados:</Text>
                                <View style={globalStyles.row}>
                                    <TouchableOpacity
                                        style={[
                                            globalStyles.secondaryButton,
                                            { marginRight: 8, paddingHorizontal: 12, paddingVertical: 6 },
                                            filters.requisitoriado === true && { backgroundColor: colors.secondary }
                                        ]}
                                        onPress={() => setFilters(prev => ({ ...prev, requisitoriado: true }))}
                                    >
                                        <Text style={[
                                            globalStyles.secondaryButtonText,
                                            { fontSize: 12 },
                                            filters.requisitoriado === true && { color: colors.surface }
                                        ]}>
                                            Sí
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            globalStyles.secondaryButton,
                                            { paddingHorizontal: 12, paddingVertical: 6 },
                                            filters.requisitoriado === false && { backgroundColor: colors.primary }
                                        ]}
                                        onPress={() => setFilters(prev => ({ ...prev, requisitoriado: false }))}
                                    >
                                        <Text style={[
                                            globalStyles.secondaryButtonText,
                                            { fontSize: 12 },
                                            filters.requisitoriado === false && { color: colors.surface }
                                        ]}>
                                            No
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Botones de acción */}
                            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
                                <TouchableOpacity
                                    style={[globalStyles.secondaryButton, { flex: 0.48 }]}
                                    onPress={clearFilters}
                                >
                                    <Text style={globalStyles.secondaryButtonText}>Limpiar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[globalStyles.primaryButton, { flex: 0.48 }]}
                                    onPress={() => applyFilters(filters)}
                                >
                                    <Text style={globalStyles.buttonText}>Aplicar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Card>
            )}
        </View>
    );

    const renderUser = ({ item }: { item: Usuario }) => (
        <UserCard
            user={item}
            onPress={() => handleUserPress(item)}
            onEdit={onUserEdit ? () => onUserEdit(item) : undefined}
            onDelete={onUserDelete ? () => handleDeleteUser(item) : undefined}
            isSelected={selectable ? selectedUsers.includes(item.id) : undefined}
            selectable={selectable}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={globalStyles.paddingVertical16}>
                <Loading message="Cargando más usuarios..." />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <Card>
                <View style={[globalStyles.center, globalStyles.paddingVertical16]}>
                    <Ionicons
                        name={searchText ? "search" : "people"}
                        size={48}
                        color={colors.textLight}
                    />
                    <Text style={[typography.h4, globalStyles.marginTop16]}>
                        {searchText ? 'Sin resultados' : 'Sin usuarios'}
                    </Text>
                    <Text style={[typography.body2, globalStyles.marginTop8, { textAlign: 'center' }]}>
                        {searchText
                            ? `No se encontraron usuarios que coincidan con "${searchText}"`
                            : 'No hay usuarios registrados en el sistema'
                        }
                    </Text>

                    {showAddButton && onAddUser && !searchText && (
                        <TouchableOpacity
                            style={[globalStyles.primaryButton, globalStyles.marginTop16]}
                            onPress={onAddUser}
                        >
                            <Text style={globalStyles.buttonText}>Añadir Usuario</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Card>
        );
    };

    if (loading && users.length === 0) {
        return <Loading message="Cargando usuarios..." />;
    }

    return (
        <View style={globalStyles.flex1}>
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
                ListEmptyComponent={renderEmpty}
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
                getItemLayout={(data, index) => ({
                    length: 120, // Altura estimada de cada UserCard
                    offset: 120 * index,
                    index,
                })}
            />
        </View>
    );
};