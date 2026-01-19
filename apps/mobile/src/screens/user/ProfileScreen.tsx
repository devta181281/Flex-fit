import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';

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
    const { colors, isDark, toggleTheme } = useTheme();
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

    const styles = createStyles(colors, isDark);

    const menuItems = [
        { icon: 'time-outline' as const, title: 'Booking History', screen: 'Bookings' },
        { icon: 'help-circle-outline' as const, title: 'Help & Support', screen: 'Support' },
        { icon: 'document-text-outline' as const, title: 'Terms & Conditions', screen: 'Terms' },
        { icon: 'shield-checkmark-outline' as const, title: 'Privacy Policy', screen: 'Privacy' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarGradientRing}>
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
                    </View>
                    <Text style={styles.name}>{profile?.name || 'FlexFit User'}</Text>
                    <Text style={styles.email}>{profile?.email || user?.email}</Text>
                    <TouchableOpacity style={styles.editProfileButton}>
                        <Ionicons name="pencil" size={14} color={colors.primary} />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Visits</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Gyms</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>₹0</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>APPEARANCE</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
                            <View style={styles.menuIconContainer}>
                                <Ionicons
                                    name={isDark ? 'sunny-outline' : 'moon-outline'}
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.menuTitle}>
                                {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            </Text>
                            <View style={styles.themeIndicator}>
                                <View style={[styles.themeToggle, isDark && styles.themeToggleDark]}>
                                    <Ionicons
                                        name={isDark ? 'moon' : 'sunny'}
                                        size={12}
                                        color={colors.white}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SETTINGS</Text>
                    <View style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    index === menuItems.length - 1 && styles.menuItemLast
                                ]}
                            >
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.version}>FlexFit v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        marginBottom: 16,
    },
    avatarGradientRing: {
        padding: 3,
        borderRadius: 50,
        backgroundColor: colors.primary,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        borderColor: colors.background,
    },
    avatarPlaceholder: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.background,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        gap: 6,
    },
    editProfileText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: isDark ? 0 : 2,
            },
        }),
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    menuCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: isDark ? 0 : 2,
            },
        }),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTitle: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        fontWeight: '500',
    },
    themeIndicator: {
        marginLeft: 8,
    },
    themeToggle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.warning,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeToggleDark: {
        backgroundColor: colors.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        backgroundColor: colors.error + '12',
        borderRadius: 14,
        padding: 16,
        gap: 8,
        marginBottom: 16,
    },
    logoutText: {
        fontSize: 16,
        color: colors.error,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.textMuted,
    },
});
