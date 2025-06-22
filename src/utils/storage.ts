import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utilidades para AsyncStorage con tipado y manejo de errores
 */

const STORAGE_KEYS = {
    USER_PREFERENCES: 'user_preferences',
    RECENT_RECOGNITIONS: 'recent_recognitions',
    CACHED_STATISTICS: 'cached_statistics',
    CACHED_USER_STATS: 'cached_user_stats',
    CACHED_MODEL_INFO: 'cached_model_info',
    APP_SETTINGS: 'app_settings',
    OFFLINE_QUEUE: 'offline_queue',
    SEARCH_HISTORY: 'search_history',
    LAST_SYNC: 'last_sync',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Guarda datos en AsyncStorage con manejo de errores
 */
export const storeData = async <T>(key: StorageKey, data: T): Promise<boolean> => {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(STORAGE_KEYS[key], jsonValue);
        console.log(`✅ Data stored successfully for key: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Error storing data for key ${key}:`, error);
        return false;
    }
};

/**
 * Obtiene datos de AsyncStorage con manejo de errores
 */
export const getData = async <T>(key: StorageKey): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS[key]);
        if (jsonValue != null) {
            const parsedData = JSON.parse(jsonValue);
            console.log(`✅ Data retrieved successfully for key: ${key}`);
            return parsedData;
        }
        return null;
    } catch (error) {
        console.error(`❌ Error getting data for key ${key}:`, error);
        return null;
    }
};

/**
 * Elimina datos de AsyncStorage
 */
export const removeData = async (key: StorageKey): Promise<boolean> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS[key]);
        console.log(`🗑️ Data removed successfully for key: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Error removing data for key ${key}:`, error);
        return false;
    }
};

/**
 * Limpia todo el AsyncStorage
 */
export const clearAll = async (): Promise<boolean> => {
    try {
        await AsyncStorage.clear();
        console.log('🧹 AsyncStorage cleared successfully');
        return true;
    } catch (error) {
        console.error('❌ Error clearing AsyncStorage:', error);
        return false;
    }
};

/**
 * Obtiene todas las claves almacenadas
 */
export const getAllKeys = async (): Promise<string[]> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        return keys;
    } catch (error) {
        console.error('❌ Error getting all keys:', error);
        return [];
    }
};

/**
 * Obtiene información sobre el uso del storage
 */
export const getStorageInfo = async (): Promise<{
    totalKeys: number;
    totalSize: number;
    keys: string[];
}> => {
    try {
        const keys = await getAllKeys();
        let totalSize = 0;

        for (const key of keys) {
            try {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    totalSize += value.length;
                }
            } catch (error) {
                console.warn(`Error getting size for key ${key}:`, error);
            }
        }

        return {
            totalKeys: keys.length,
            totalSize,
            keys,
        };
    } catch (error) {
        console.error('❌ Error getting storage info:', error);
        return {
            totalKeys: 0,
            totalSize: 0,
            keys: [],
        };
    }
};

// ============================================================================
// TIPOS ESPECÍFICOS PARA LA APLICACIÓN
// ============================================================================

export interface UserPreferences {
    theme: 'light' | 'dark';
    defaultAlgorithm: 'eigenfaces' | 'lbp' | 'hybrid';
    autoRefresh: boolean;
    notificationsEnabled: boolean;
    confidenceThreshold: number;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    cameraFacing: 'front' | 'back';
    imageQuality: number;
}

export interface AppSettings {
    apiBaseUrl: string;
    timeout: number;
    maxRetries: number;
    cacheEnabled: boolean;
    offlineMode: boolean;
    debugMode: boolean;
    analyticsEnabled: boolean;
}

export interface CachedData<T = any> {
    data: T;
    timestamp: number;
    expiresAt: number;
    version: string;
}

export interface OfflineQueueItem {
    id: string;
    type: 'recognition' | 'user_create' | 'user_update' | 'user_delete' | 'add_images';
    data: any;
    timestamp: number;
    retries: number;
    maxRetries: number;
    lastError?: string;
}

export interface SearchHistoryItem {
    query: string;
    timestamp: number;
    type: 'user' | 'general';
    results: number;
}

export interface SyncInfo {
    lastSync: number;
    lastSuccessfulSync: number;
    pendingOperations: number;
    failedOperations: number;
}

// ============================================================================
// FUNCIONES ESPECÍFICAS PARA PREFERENCIAS DE USUARIO
// ============================================================================

/**
 * Obtiene preferencias de usuario con valores por defecto
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
    const preferences = await getData<UserPreferences>('USER_PREFERENCES');

    const defaultPreferences: UserPreferences = {
        theme: 'light',
        defaultAlgorithm: 'hybrid',
        autoRefresh: true,
        notificationsEnabled: true,
        confidenceThreshold: 70,
        soundEnabled: true,
        vibrationEnabled: true,
        cameraFacing: 'back',
        imageQuality: 0.8,
    };

    return {
        ...defaultPreferences,
        ...preferences,
    };
};

/**
 * Guarda preferencias de usuario (parciales)
 */
export const saveUserPreferences = async (preferences: Partial<UserPreferences>): Promise<boolean> => {
    const currentPreferences = await getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    return await storeData('USER_PREFERENCES', updatedPreferences);
};

/**
 * Resetea preferencias a valores por defecto
 */
export const resetUserPreferences = async (): Promise<boolean> => {
    return await removeData('USER_PREFERENCES');
};

// ============================================================================
// FUNCIONES ESPECÍFICAS PARA CONFIGURACIÓN DE LA APP
// ============================================================================

/**
 * Obtiene configuración de la app con valores por defecto
 */
export const getAppSettings = async (): Promise<AppSettings> => {
    const settings = await getData<AppSettings>('APP_SETTINGS');

    const defaultSettings: AppSettings = {
        apiBaseUrl: 'https://fr-ml-api-production.up.railway.app/api/v1',
        timeout: 30000,
        maxRetries: 3,
        cacheEnabled: true,
        offlineMode: false,
        debugMode: __DEV__,
        analyticsEnabled: true,
    };

    return {
        ...defaultSettings,
        ...settings,
    };
};

/**
 * Guarda configuración de la app
 */
export const saveAppSettings = async (settings: Partial<AppSettings>): Promise<boolean> => {
    const currentSettings = await getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    return await storeData('APP_SETTINGS', updatedSettings);
};

// ============================================================================
// FUNCIONES DE CACHÉ CON EXPIRACIÓN
// ============================================================================

/**
 * Guarda datos en caché con expiración automática
 */
export const cacheData = async <T>(
    key: StorageKey,
    data: T,
    expirationMinutes: number = 5,
    version: string = '1.0'
): Promise<boolean> => {
    const now = Date.now();
    const cached: CachedData<T> = {
        data,
        timestamp: now,
        expiresAt: now + (expirationMinutes * 60 * 1000),
        version,
    };

    return await storeData(key, cached);
};

/**
 * Obtiene datos del caché si no han expirado
 */
export const getCachedData = async <T>(
    key: StorageKey,
    currentVersion: string = '1.0'
): Promise<T | null> => {
    const cached = await getData<CachedData<T>>(key);

    if (!cached) {
        console.log(`📦 No cached data found for key: ${key}`);
        return null;
    }

    const now = Date.now();

    // Verificar versión
    if (cached.version !== currentVersion) {
        console.log(`🔄 Cache version mismatch for key ${key}. Removing outdated cache.`);
        await removeData(key);
        return null;
    }

    // Verificar expiración
    if (now > cached.expiresAt) {
        console.log(`⏰ Cache expired for key ${key}. Removing expired cache.`);
        await removeData(key);
        return null;
    }

    console.log(`✅ Valid cache hit for key: ${key}`);
    return cached.data;
};

/**
 * Verifica si el caché es válido sin obtener los datos
 */
export const isCacheValid = async (
    key: StorageKey,
    currentVersion: string = '1.0'
): Promise<boolean> => {
    const cached = await getData<CachedData>(key);

    if (!cached) return false;
    if (cached.version !== currentVersion) return false;
    if (Date.now() > cached.expiresAt) return false;

    return true;
};

// ============================================================================
// FUNCIONES ESPECÍFICAS PARA ESTADÍSTICAS
// ============================================================================

/**
 * Guarda estadísticas de reconocimiento en caché
 */
export const cacheRecognitionStatistics = async (data: any): Promise<boolean> => {
    return await cacheData('CACHED_STATISTICS', data, 5, '1.0');
};

/**
 * Obtiene estadísticas de reconocimiento del caché
 */
export const getCachedRecognitionStatistics = async (): Promise<any | null> => {
    return await getCachedData('CACHED_STATISTICS', '1.0');
};

/**
 * Guarda estadísticas de usuarios en caché
 */
export const cacheUserStatistics = async (data: any): Promise<boolean> => {
    return await cacheData('CACHED_USER_STATS', data, 10, '1.0');
};

/**
 * Obtiene estadísticas de usuarios del caché
 */
export const getCachedUserStatistics = async (): Promise<any | null> => {
    return await getCachedData('CACHED_USER_STATS', '1.0');
};

/**
 * Guarda información del modelo en caché
 */
export const cacheModelInfo = async (data: any): Promise<boolean> => {
    return await cacheData('CACHED_MODEL_INFO', data, 15, '1.0');
};

/**
 * Obtiene información del modelo del caché
 */
export const getCachedModelInfo = async (): Promise<any | null> => {
    return await getCachedData('CACHED_MODEL_INFO', '1.0');
};

// ============================================================================
// FUNCIONES PARA RECONOCIMIENTOS RECIENTES
// ============================================================================

/**
 * Guarda un reconocimiento reciente
 */
export const saveRecentRecognition = async (recognition: any): Promise<boolean> => {
    try {
        const recent = await getData<any[]>('RECENT_RECOGNITIONS') || [];

        // Añadir timestamp si no existe
        const recognitionWithTimestamp = {
            ...recognition,
            savedAt: Date.now(),
        };

        // Mantener solo los últimos 20 reconocimientos
        const updatedRecent = [recognitionWithTimestamp, ...recent].slice(0, 20);

        return await storeData('RECENT_RECOGNITIONS', updatedRecent);
    } catch (error) {
        console.error('❌ Error saving recent recognition:', error);
        return false;
    }
};

/**
 * Obtiene reconocimientos recientes
 */
export const getRecentRecognitions = async (): Promise<any[]> => {
    const recent = await getData<any[]>('RECENT_RECOGNITIONS');
    return recent || [];
};

/**
 * Limpia reconocimientos antiguos (más de X días)
 */
export const cleanOldRecognitions = async (daysToKeep: number = 7): Promise<boolean> => {
    try {
        const recent = await getRecentRecognitions();
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

        const filteredRecognitions = recent.filter(recognition => {
            const savedAt = recognition.savedAt || recognition.timestamp;
            return savedAt > cutoffTime;
        });

        return await storeData('RECENT_RECOGNITIONS', filteredRecognitions);
    } catch (error) {
        console.error('❌ Error cleaning old recognitions:', error);
        return false;
    }
};

// ============================================================================
// FUNCIONES PARA COLA OFFLINE
// ============================================================================

/**
 * Añade una operación a la cola offline
 */
export const addToOfflineQueue = async (
    item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>
): Promise<boolean> => {
    try {
        const queue = await getData<OfflineQueueItem[]>('OFFLINE_QUEUE') || [];

        const newItem: OfflineQueueItem = {
            ...item,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: item.maxRetries || 3,
        };

        queue.push(newItem);
        return await storeData('OFFLINE_QUEUE', queue);
    } catch (error) {
        console.error('❌ Error adding to offline queue:', error);
        return false;
    }
};

/**
 * Obtiene la cola offline
 */
export const getOfflineQueue = async (): Promise<OfflineQueueItem[]> => {
    const queue = await getData<OfflineQueueItem[]>('OFFLINE_QUEUE');
    return queue || [];
};

/**
 * Remueve item de la cola offline
 */
export const removeFromOfflineQueue = async (itemId: string): Promise<boolean> => {
    try {
        const queue = await getOfflineQueue();
        const filteredQueue = queue.filter(item => item.id !== itemId);
        return await storeData('OFFLINE_QUEUE', filteredQueue);
    } catch (error) {
        console.error('❌ Error removing from offline queue:', error);
        return false;
    }
};

/**
 * Actualiza un item en la cola offline (para manejar reintentos)
 */
export const updateOfflineQueueItem = async (
    itemId: string,
    updates: Partial<OfflineQueueItem>
): Promise<boolean> => {
    try {
        const queue = await getOfflineQueue();
        const updatedQueue = queue.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        return await storeData('OFFLINE_QUEUE', updatedQueue);
    } catch (error) {
        console.error('❌ Error updating offline queue item:', error);
        return false;
    }
};

/**
 * Limpia la cola offline
 */
export const clearOfflineQueue = async (): Promise<boolean> => {
    return await removeData('OFFLINE_QUEUE');
};

/**
 * Obtiene items de la cola que han excedido el máximo de reintentos
 */
export const getFailedOfflineItems = async (): Promise<OfflineQueueItem[]> => {
    const queue = await getOfflineQueue();
    return queue.filter(item => item.retries >= item.maxRetries);
};

// ============================================================================
// FUNCIONES PARA HISTORIAL DE BÚSQUEDA
// ============================================================================

/**
 * Guarda una búsqueda en el historial
 */
export const saveSearchHistory = async (
    query: string,
    type: 'user' | 'general' = 'general',
    results: number = 0
): Promise<boolean> => {
    try {
        if (query.trim().length < 2) return false;

        const history = await getData<SearchHistoryItem[]>('SEARCH_HISTORY') || [];

        // Evitar duplicados recientes
        const isDuplicate = history.some(item =>
            item.query.toLowerCase() === query.toLowerCase() &&
            Date.now() - item.timestamp < 60000 // Menos de 1 minuto
        );

        if (isDuplicate) return true;

        const searchItem: SearchHistoryItem = {
            query: query.trim(),
            timestamp: Date.now(),
            type,
            results,
        };

        // Mantener solo las últimas 50 búsquedas
        const updatedHistory = [searchItem, ...history].slice(0, 50);

        return await storeData('SEARCH_HISTORY', updatedHistory);
    } catch (error) {
        console.error('❌ Error saving search history:', error);
        return false;
    }
};

/**
 * Obtiene historial de búsqueda
 */
export const getSearchHistory = async (type?: 'user' | 'general'): Promise<SearchHistoryItem[]> => {
    const history = await getData<SearchHistoryItem[]>('SEARCH_HISTORY') || [];

    if (type) {
        return history.filter(item => item.type === type);
    }

    return history;
};

/**
 * Limpia historial de búsqueda
 */
export const clearSearchHistory = async (type?: 'user' | 'general'): Promise<boolean> => {
    try {
        if (type) {
            const history = await getSearchHistory();
            const filteredHistory = history.filter(item => item.type !== type);
            return await storeData('SEARCH_HISTORY', filteredHistory);
        } else {
            return await removeData('SEARCH_HISTORY');
        }
    } catch (error) {
        console.error('❌ Error clearing search history:', error);
        return false;
    }
};

// ============================================================================
// FUNCIONES PARA INFORMACIÓN DE SINCRONIZACIÓN
// ============================================================================

/**
 * Actualiza información de sincronización
 */
export const updateSyncInfo = async (info: Partial<SyncInfo>): Promise<boolean> => {
    try {
        const currentInfo = await getData<SyncInfo>('LAST_SYNC') || {
            lastSync: 0,
            lastSuccessfulSync: 0,
            pendingOperations: 0,
            failedOperations: 0,
        };

        const updatedInfo = { ...currentInfo, ...info };
        return await storeData('LAST_SYNC', updatedInfo);
    } catch (error) {
        console.error('❌ Error updating sync info:', error);
        return false;
    }
};

/**
 * Obtiene información de sincronización
 */
export const getSyncInfo = async (): Promise<SyncInfo> => {
    const info = await getData<SyncInfo>('LAST_SYNC');
    return info || {
        lastSync: 0,
        lastSuccessfulSync: 0,
        pendingOperations: 0,
        failedOperations: 0,
    };
};

// ============================================================================
// FUNCIONES DE UTILIDAD Y MANTENIMIENTO
// ============================================================================

/**
 * Limpia todos los cachés expirados
 */
export const cleanExpiredCaches = async (): Promise<{
    cleaned: number;
    errors: number;
}> => {
    let cleaned = 0;
    let errors = 0;

    const cacheKeys: StorageKey[] = [
        'CACHED_STATISTICS',
        'CACHED_USER_STATS',
        'CACHED_MODEL_INFO',
    ];

    for (const key of cacheKeys) {
        try {
            const isValid = await isCacheValid(key);
            if (!isValid) {
                const removed = await removeData(key);
                if (removed) cleaned++;
                else errors++;
            }
        } catch (error) {
            console.error(`❌ Error cleaning cache for key ${key}:`, error);
            errors++;
        }
    }

    return { cleaned, errors };
};

/**
 * Exporta todos los datos para backup
 */
export const exportAllData = async (): Promise<Record<string, any> | null> => {
    try {
        const allKeys = await getAllKeys();
        const exportData: Record<string, any> = {};

        for (const key of allKeys) {
            try {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    exportData[key] = JSON.parse(value);
                }
            } catch (error) {
                console.warn(`⚠️ Error exporting data for key ${key}:`, error);
            }
        }

        return exportData;
    } catch (error) {
        console.error('❌ Error exporting all data:', error);
        return null;
    }
};

/**
 * Importa datos desde backup
 */
export const importAllData = async (data: Record<string, any>): Promise<{
    imported: number;
    errors: number;
}> => {
    let imported = 0;
    let errors = 0;

    for (const [key, value] of Object.entries(data)) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
            imported++;
        } catch (error) {
            console.error(`❌ Error importing data for key ${key}:`, error);
            errors++;
        }
    }

    return { imported, errors };
};