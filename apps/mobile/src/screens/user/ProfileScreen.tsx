import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

interface UserProfile {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    age?: number;
    gender?: string;
    avatar?: string;
}

export default function ProfileScreen() {
    const { user, clearAuth } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiService.users.getProfile();
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

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
                        await clearAuth();
                    },
                },
            ]
        );
    };

    const menuItems = [
        { icon: '📋', title: 'Booking History', screen: 'Bookings' },
        { icon: '❓', title: 'Help & Support', screen: 'Support' },
        { icon: '📜', title: 'Terms & Conditions', screen: 'Terms' },
        { icon: '🔒', title: 'Privacy Policy', screen: 'Privacy' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {profile?.avatar ? (
                            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {(profile?.name || profile?.email || 'U')[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{profile?.name || 'FlexFit User'}</Text>
                        <Text style={styles.email}>{profile?.email || user?.email}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Total Visits</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Gyms Tried</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>₹0</Text>
                        <Text style={styles.statLabel}>Total Spent</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>FlexFit v1.0.0</Text>
            </ScrollView>
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
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    email: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    editButtonText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
    },
    menuContainer: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 20,
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
        marginRight: 16,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    menuArrow: {
        fontSize: 20,
        color: COLORS.textSecondary,
    },
    logoutButton: {
        marginHorizontal: 16,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        fontSize: 16,
        color: COLORS.error,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 30,
    },
});
