import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../constants';

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
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Explore',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingsScreen}
                options={{
                    tabBarLabel: 'Bookings',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>📋</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
}

export default function UserNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
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
