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
import { showRateAppDialog, shareApp } from '../../utils/appUtils';
import type { OwnerStackParamList } from '../../navigation/OwnerNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<OwnerStackParamList>;

export default function OwnerProfileScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const navigation = useNavigation<NavigationProp>();
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

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirm Deletion',
                            'Please contact support@flexfit.app to complete account deletion. This ensures proper handling of your gym listings and pending bookings.',
                            [{ text: 'OK' }]
                        );
                    },
                },
            ]
        );
    };

    const handleMenuPress = (screen: keyof OwnerStackParamList) => {
        navigation.navigate(screen as any);
    };

    const styles = createStyles(colors, isDark);

    const menuItems: { icon: keyof typeof Ionicons.glyphMap; title: string; screen: keyof OwnerStackParamList }[] = [
        { icon: 'help-circle-outline', title: 'Help & Support', screen: 'Support' },
        { icon: 'document-text-outline', title: 'Terms & Conditions', screen: 'Terms' },
        { icon: 'shield-checkmark-outline', title: 'Privacy Policy', screen: 'Privacy' },
        { icon: 'information-circle-outline', title: 'About FlexFit', screen: 'About' },
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
                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Ionicons name="pencil" size={14} color={colors.primary} />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
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
                                onPress={() => handleMenuPress(item.screen)}
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

                {/* Rate & Share Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SPREAD THE LOVE</Text>
                    <View style={styles.rateShareContainer}>
                        <TouchableOpacity
                            style={styles.rateShareButton}
                            onPress={showRateAppDialog}
                        >
                            <View style={[styles.rateShareIcon, { backgroundColor: colors.warning + '15' }]}>
                                <Ionicons name="star" size={22} color={colors.warning} />
                            </View>
                            <Text style={styles.rateShareText}>Rate App</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rateShareButton}
                            onPress={() => shareApp(true)}
                        >
                            <View style={[styles.rateShareIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="share-social" size={22} color={colors.primary} />
                            </View>
                            <Text style={styles.rateShareText}>Share App</Text>
                        </TouchableOpacity>
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

                {/* Delete Account */}
                <TouchableOpacity
                    style={styles.deleteAccountButton}
                    onPress={handleDeleteAccount}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                    <Text style={styles.deleteAccountText}>Delete Account</Text>
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
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        gap: 6,
        marginTop: 12,
    },
    editProfileText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
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
    deleteAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        marginBottom: 16,
    },
    deleteAccountText: {
        fontSize: 13,
        color: colors.textMuted,
    },
    rateShareContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    rateShareButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
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
    rateShareIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    rateShareText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.textMuted,
    },
});
