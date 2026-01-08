import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function OwnerProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, role, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        await clearAuth();
                        setLoading(false);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.name || 'Gym Owner'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>GYM OWNER</Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>📊</Text>
                    <Text style={styles.menuText}>Dashboard</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>📷</Text>
                    <Text style={styles.menuText}>QR Scanner</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>❓</Text>
                    <Text style={styles.menuText}>Help & Support</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>📋</Text>
                    <Text style={styles.menuText}>Terms & Conditions</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.error} />
                ) : (
                    <Text style={styles.logoutText}>🚪 Logout</Text>
                )}
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>FlexFit v1.0.0 (Gym Owner)</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    profileCard: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    menu: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    menuArrow: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    logoutButton: {
        marginHorizontal: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error + '50',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.error,
    },
    version: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        color: COLORS.textSecondary,
    },
});
