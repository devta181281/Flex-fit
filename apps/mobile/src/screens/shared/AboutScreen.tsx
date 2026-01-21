import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../constants';

export default function AboutScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();

    const styles = createStyles(colors, isDark);

    const socialLinks = [
        { icon: 'logo-instagram' as const, label: 'Instagram', url: 'https://instagram.com/flexfit' },
        { icon: 'logo-twitter' as const, label: 'Twitter', url: 'https://twitter.com/flexfit' },
        { icon: 'logo-linkedin' as const, label: 'LinkedIn', url: 'https://linkedin.com/company/flexfit' },
        { icon: 'globe-outline' as const, label: 'Website', url: 'https://flexfit.app' },
    ];

    const handleOpenLink = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* App Logo & Info */}
                <View style={styles.appInfo}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Ionicons name="fitness" size={48} color={colors.primary} />
                        </View>
                    </View>
                    <Text style={styles.appName}>FlexFit</Text>
                    <Text style={styles.tagline}>Your Gym, Your Way</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionText}>
                        FlexFit is India's first gym day pass booking platform.
                        Discover nearby gyms, book day passes instantly, and enjoy
                        flexible fitness without any long-term commitments.
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FEATURES</Text>
                    <View style={styles.featuresCard}>
                        {[
                            { icon: 'search', title: 'Discover Gyms', desc: 'Find gyms near you' },
                            { icon: 'calendar', title: 'Easy Booking', desc: 'Book passes instantly' },
                            { icon: 'qr-code', title: 'QR Check-in', desc: 'Seamless entry with QR' },
                            { icon: 'shield-checkmark', title: 'Secure Payments', desc: 'Safe & encrypted' },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
                                </View>
                                <View style={styles.featureInfo}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Social Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONNECT WITH US</Text>
                    <View style={styles.socialContainer}>
                        {socialLinks.map((social, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.socialButton}
                                onPress={() => handleOpenLink(social.url)}
                            >
                                <Ionicons name={social.icon} size={24} color={colors.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Legal */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>LEGAL</Text>
                    <View style={styles.legalCard}>
                        <TouchableOpacity
                            style={styles.legalItem}
                            onPress={() => (navigation as any).navigate('Terms')}
                        >
                            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.legalText}>Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.legalItem, styles.legalItemLast]}
                            onPress={() => (navigation as any).navigate('Privacy')}
                        >
                            <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.legalText}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Credits */}
                <View style={styles.credits}>
                    <Text style={styles.creditsText}>Made with ❤️ in India</Text>
                    <Text style={styles.copyrightText}>© 2026 FlexFit Technologies Pvt. Ltd.</Text>
                    <Text style={styles.copyrightText}>All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary + '30',
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    versionBadge: {
        backgroundColor: colors.surface,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    versionText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
    },
    descriptionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
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
    descriptionText: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    featuresCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 8,
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
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 13,
        color: colors.textMuted,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    legalCard: {
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
    legalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    legalItemLast: {
        borderBottomWidth: 0,
    },
    legalText: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    credits: {
        alignItems: 'center',
        paddingTop: 16,
    },
    creditsText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    copyrightText: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 2,
    },
});
