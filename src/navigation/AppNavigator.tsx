import React, {JSX} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RecognitionScreen from '../screens/RecognitionScreen';
import UsersScreen from '../screens/UsersScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecognitionHistoryScreen from '../screens/RecognitionHistoryScreen';
import AddUserScreen from '../screens/AddUserScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import EditUserScreen from '../screens/EditUserScreen';

// Tipos para navegación actualizados
export type RootStackParamList = {
    HomeTab: undefined;
    RecognitionTab: undefined;
    UsersTab: undefined;
    StatsTab: undefined;
    SettingsTab: undefined;
    Home: undefined;
    Recognition: undefined;
    Users: undefined;
    Statistics: undefined;
    Alerts: undefined;
    Settings: undefined;
    RecognitionHistory: undefined;
    AddUser: undefined;
    UserDetail: { userId: number };
    EditUser: { userId: number };
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Stack Navigator para Home
function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
                name="AddUser"
                component={AddUserScreen}
                options={{ title: 'Añadir Usuario' }}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator para Recognition
function RecognitionStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="Recognition"
                component={RecognitionScreen}
                options={{ title: 'Reconocimiento' }}
            />
            <Stack.Screen
                name="RecognitionHistory"
                component={RecognitionHistoryScreen}
                options={{ title: 'Historial' }}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator para Users
function UsersStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="Users"
                component={UsersScreen}
                options={{ title: 'Usuarios' }}
            />
            <Stack.Screen
                name="AddUser"
                component={AddUserScreen}
                options={{ title: 'Añadir Usuario' }}
            />
            <Stack.Screen
                name="UserDetail"
                component={UserDetailScreen}
                options={{ title: 'Detalles del Usuario' }}
            />
            <Stack.Screen
                name="EditUser"
                component={EditUserScreen}
                options={{ title: 'Editar Usuario' }}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator para Statistics
function StatisticsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.surface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="Statistics"
                component={StatisticsScreen}
                options={{ title: 'Estadísticas' }}
            />
            <Stack.Screen
                name="Alerts"
                component={AlertsScreen}
                options={{ title: 'Alertas' }}
            />
        </Stack.Navigator>
    );
}

// Función helper para obtener el nombre del icono
function getTabBarIcon(
    routeName: string,
    focused: boolean
): keyof typeof Ionicons.glyphMap {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
        case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
        case 'RecognitionTab':
            iconName = focused ? 'camera' : 'camera-outline';
            break;
        case 'UsersTab':
            iconName = focused ? 'people' : 'people-outline';
            break;
        case 'StatsTab':
            iconName = focused ? 'analytics' : 'analytics-outline';
            break;
        case 'SettingsTab':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
        default:
            iconName = 'ellipse-outline';
    }

    return iconName;
}

// Tab Navigator Principal
function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = getTabBarIcon(route.name, focused);
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{ title: 'Inicio' }}
            />
            <Tab.Screen
                name="RecognitionTab"
                component={RecognitionStack}
                options={{ title: 'Reconocer' }}
            />
            <Tab.Screen
                name="UsersTab"
                component={UsersStack}
                options={{ title: 'Usuarios' }}
            />
            <Tab.Screen
                name="StatsTab"
                component={StatisticsStack}
                options={{ title: 'Reportes' }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    title: 'Config',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.surface,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
        </Tab.Navigator>
    );
}

// Navegador Principal
export default function AppNavigator(): JSX.Element {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <TabNavigator />
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}