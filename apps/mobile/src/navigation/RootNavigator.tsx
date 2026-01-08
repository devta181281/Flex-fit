import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import OwnerNavigator from './OwnerNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { isLoading, isAuthenticated, role, loadAuth } = useAuthStore();

    useEffect(() => {
        loadAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : role === 'OWNER' ? (
                    <Stack.Screen name="OwnerApp" component={OwnerNavigator} />
                ) : (
                    <Stack.Screen name="UserApp" component={UserNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F0F0F',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
