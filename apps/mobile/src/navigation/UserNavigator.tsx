import React from 'react';
import { View, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants';

// Screens
import HomeScreen from '../screens/user/HomeScreen';
import GymDetailScreen from '../screens/user/GymDetailScreen';
import BookingConfirmScreen from '../screens/user/BookingConfirmScreen';
import PaymentScreen from '../screens/user/PaymentScreen';
import BookingSuccessScreen from '../screens/user/BookingSuccessScreen';
import BookingsScreen from '../screens/user/BookingsScreen';
import BookingDetailScreen from '../screens/user/BookingDetailScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

// Types
export type UserStackParamList = {
    MainTabs: undefined;
    GymDetail: { gymId: string };
    BookingConfirm: { gymId: string; gymName: string };
    Payment: { gymId: string; gymName: string; bookingDate: string; orderId: string; amount: number; currency: string };
    BookingSuccess: { bookingId: string; gymName: string; bookingDate: string; bookingCode: string; qrCode: string };
    BookingDetail: { bookingId: string };
};

export type UserTabParamList = {
    Home: undefined;
    Bookings: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<UserStackParamList>();
const Tab = createBottomTabNavigator<UserTabParamList>();

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
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'compass' : 'compass-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingsScreen}
                options={{
                    tabBarLabel: 'Bookings',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'calendar' : 'calendar-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
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

export default function UserNavigator() {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="GymDetail" component={GymDetailScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
        </Stack.Navigator>
    );
}
