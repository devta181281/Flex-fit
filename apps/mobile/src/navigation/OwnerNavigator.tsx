import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants';

// Screens
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import GymRegistrationScreen from '../screens/owner/GymRegistrationScreen';
import GymBookingsScreen from '../screens/owner/GymBookingsScreen';
import GymEditScreen from '../screens/owner/GymEditScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';
import QRScannerScreen from '../screens/owner/QRScannerScreen';
import TermsScreen from '../screens/owner/TermsScreen';
import SupportScreen from '../screens/owner/SupportScreen';
import PrivacyScreen from '../screens/owner/PrivacyScreen';
import EditProfileScreen from '../screens/owner/EditProfileScreen';
import AboutScreen from '../screens/shared/AboutScreen';

// Types
export type OwnerStackParamList = {
    OwnerTabs: undefined;
    GymRegistration: undefined;
    GymBookings: { gymId: string; gymName: string };
    GymEdit: { gymId: string };
    Terms: undefined;
    Support: undefined;
    Privacy: undefined;
    EditProfile: undefined;
    About: undefined;
};

export type OwnerTabParamList = {
    Dashboard: undefined;
    QRScanner: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<OwnerStackParamList>();
const Tab = createBottomTabNavigator<OwnerTabParamList>();

function TabNavigator() {
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 0.5,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 24,
                    height: Platform.OS === 'ios' ? 88 : 80,
                    elevation: 0,
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={OwnerDashboardScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'grid' : 'grid-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="QRScanner"
                component={QRScannerScreen}
                options={{
                    tabBarLabel: 'Scan QR',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'qr-code' : 'qr-code-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={OwnerProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function OwnerNavigator() {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="OwnerTabs" component={TabNavigator} />
            <Stack.Screen name="GymRegistration" component={GymRegistrationScreen} />
            <Stack.Screen name="GymBookings" component={GymBookingsScreen} />
            <Stack.Screen name="GymEdit" component={GymEditScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
}
