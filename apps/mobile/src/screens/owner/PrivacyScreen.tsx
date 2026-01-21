import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../constants';

export default function PrivacyScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();

    const styles = createStyles(colors, isDark);

    const sections = [
        {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly, including:\n• Personal details (name, email, phone number)\n• Business information (gym details, location, pricing)\n• Payment information (processed securely via payment partners)\n• Booking and transaction history\n• Device information and usage analytics',
        },
        {
            title: '2. How We Use Your Information',
            content: 'Your information is used to:\n• Provide and improve our services\n• Process bookings and payments\n• Send important notifications about your bookings\n• Analyze usage patterns to enhance user experience\n• Communicate updates and promotional content (with your consent)',
        },
        {
            title: '3. Information Sharing',
            content: 'We share your information only with:\n• Users who book your gym (limited to necessary details)\n• Payment processors for transaction handling\n• Service providers who assist our operations\n• Legal authorities when required by law\n\nWe never sell your personal information to third parties.',
        },
        {
            title: '4. Data Security',
            content: 'We implement industry-standard security measures including:\n• Encryption of data in transit and at rest\n• Secure payment processing\n• Regular security audits\n• Access controls and authentication\n\nHowever, no system is 100% secure, and we cannot guarantee absolute security.',
        },
        {
            title: '5. Your Rights',
            content: 'You have the right to:\n• Access your personal data\n• Correct inaccurate information\n• Delete your account and associated data\n• Export your data\n• Opt-out of marketing communications\n\nContact us to exercise any of these rights.',
        },
        {
            title: '6. Data Retention',
            content: 'We retain your data for as long as your account is active or as needed to provide services. Booking records may be retained for legal and accounting purposes even after account deletion.',
        },
        {
            title: '7. Cookies and Tracking',
            content: 'Our app may use local storage and analytics tools to improve functionality and user experience. You can manage these preferences in your device settings.',
        },
        {
            title: '8. Children\'s Privacy',
            content: 'Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children.',
        },
        {
            title: '9. Changes to Privacy Policy',
            content: 'We may update this policy periodically. We will notify you of significant changes via app notification or email.',
        },
        {
            title: '10. Contact Us',
            content: 'For privacy-related inquiries:\n• Email: privacy@flexfit.app\n• Address: FlexFit Technologies Pvt. Ltd.\n\nData Protection Officer: dpo@flexfit.app',
        },
    ];

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
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.updateInfo}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                    <Text style={styles.updateText}>Your privacy is important to us</Text>
                </View>

                <View style={styles.lastUpdated}>
                    <Text style={styles.lastUpdatedText}>Last updated: January 2026</Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <View style={styles.footerIcon}>
                        <Ionicons name="lock-closed" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.footerTitle}>Your Data is Protected</Text>
                    <Text style={styles.footerText}>
                        We use industry-standard encryption and security practices to protect your information.
                    </Text>
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
    updateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.success + '15',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    updateText: {
        fontSize: 13,
        color: colors.success,
        fontWeight: '500',
    },
    lastUpdated: {
        marginBottom: 24,
    },
    lastUpdatedText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    footer: {
        marginTop: 16,
        padding: 20,
        backgroundColor: colors.surface,
        borderRadius: 16,
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
    footerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
