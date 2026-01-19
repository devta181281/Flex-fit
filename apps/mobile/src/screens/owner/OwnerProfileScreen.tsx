import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../constants';

export default function OwnerProfileScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const navigation = useNavigation<any>();
    const { user, clearAuth } = useAuthStore();
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

    const styles = createStyles(colors, isDark);

    const menuItems = [
        { icon: 'grid-outline' as const, title: 'Dashboard', screen: 'Dashboard' },
        { icon: 'qr-code-outline' as const, title: 'QR Scanner', screen: 'QRScanner' },
        { icon: 'help-circle-outline' as const, title: 'Help & Support', screen: 'Support' },
        { icon: 'document-text-outline' as const, title: 'Terms & Conditions', screen: 'Terms' },
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
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.name}>{user?.name || 'Gym Owner'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons name="business" size={12} color={colors.primary} />
                        <Text style={styles.roleText}>GYM OWNER</Text>
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
                            <View style={[styles.themeToggle, isDark && styles.themeToggleDark]}>
                                <Ionicons
                                    name={isDark ? 'moon' : 'sunny'}
                                    size={12}
                                    color={colors.white}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
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
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.error} />
                    ) : (
                        <>
                            <Ionicons name="log-out-outline" size={20} color={colors.error} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.version}>FlexFit v1.0.0 (Business)</Text>
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
        marginBottom: 12,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 0.5,
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
