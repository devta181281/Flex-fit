import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants';

// Screens
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import GymRegistrationScreen from '../screens/owner/GymRegistrationScreen';
import GymBookingsScreen from '../screens/owner/GymBookingsScreen';
import GymEditScreen from '../screens/owner/GymEditScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';

// QR Scanner placeholder (will be implemented in Phase 5)
import { View, StyleSheet } from 'react-native';
function QRScannerScreen() {
    return (
        <View style={placeholderStyles.container}>
            <Text style={placeholderStyles.text}>📷 QR Scanner</Text>
            <Text style={placeholderStyles.subtext}>Coming in Phase 5</Text>
        </View>
    );
}

const placeholderStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtext: {
        color: '#888',
        fontSize: 16,
    },
});

// Types
export type OwnerStackParamList = {
    OwnerTabs: undefined;
    GymRegistration: undefined;
    GymBookings: { gymId: string; gymName: string };
    GymEdit: { gymId: string };
};

export type OwnerTabParamList = {
    Dashboard: undefined;
    QRScanner: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<OwnerStackParamList>();
const Tab = createBottomTabNavigator<OwnerTabParamList>();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 64,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={OwnerDashboardScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>📊</Text>,
                }}
            />
            <Tab.Screen
                name="QRScanner"
                component={QRScannerScreen}
                options={{
                    tabBarLabel: 'Scan QR',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>📷</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={OwnerProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
}

export default function OwnerNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="OwnerTabs" component={TabNavigator} />
            <Stack.Screen name="GymRegistration" component={GymRegistrationScreen} />
            <Stack.Screen name="GymBookings" component={GymBookingsScreen} />
            <Stack.Screen name="GymEdit" component={GymEditScreen} />
        </Stack.Navigator>
    );
}
