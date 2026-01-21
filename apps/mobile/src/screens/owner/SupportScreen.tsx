import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../constants';

export default function SupportScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();

    const styles = createStyles(colors, isDark);

    const contactOptions = [
        {
            icon: 'mail-outline' as const,
            title: 'Email Support',
            subtitle: 'support@flexfit.app',
            action: () => Linking.openURL('mailto:support@flexfit.app'),
        },
        {
            icon: 'call-outline' as const,
            title: 'Phone Support',
            subtitle: '+91 1800-XXX-XXXX',
            action: () => Linking.openURL('tel:+911800XXXXXXX'),
        },
        {
            icon: 'logo-whatsapp' as const,
            title: 'WhatsApp',
            subtitle: 'Chat with us',
            action: () => Linking.openURL('https://wa.me/911800XXXXXXX'),
        },
    ];

    const faqItems = [
        {
            question: 'How do I add a new gym?',
            answer: 'Go to Dashboard and tap the "+" button to register a new gym. Fill in all required details including photos, amenities, and pricing.',
        },
        {
            question: 'How do I verify a booking?',
            answer: 'Use the QR Scanner tab to scan the QR code shown on the user\'s app. The system will automatically validate the booking.',
        },
        {
            question: 'When do I receive my payments?',
            answer: 'Payments are processed weekly. You\'ll receive your earnings minus the platform commission every Monday.',
        },
        {
            question: 'How do I update my gym details?',
            answer: 'Go to Dashboard, select your gym, and tap the edit button to update details, photos, pricing, or availability.',
        },
        {
            question: 'What if a user doesn\'t show up?',
            answer: 'No-show bookings are still counted as completed. The user will not be eligible for a refund unless specified in your cancellation policy.',
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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="headset" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        We're here to assist you with any questions or issues
                    </Text>
                </View>

                {/* Contact Options */}
                <Text style={styles.sectionTitle}>CONTACT US</Text>
                <View style={styles.contactCard}>
                    {contactOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.contactItem,
                                index === contactOptions.length - 1 && styles.contactItemLast
                            ]}
                            onPress={option.action}
                        >
                            <View style={styles.contactIcon}>
                                <Ionicons name={option.icon} size={22} color={colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactTitle}>{option.title}</Text>
                                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
                <View style={styles.faqContainer}>
                    {faqItems.map((item, index) => (
                        <View key={index} style={styles.faqItem}>
                            <View style={styles.faqQuestion}>
                                <Ionicons name="help-circle" size={20} color={colors.primary} />
                                <Text style={styles.faqQuestionText}>{item.question}</Text>
                            </View>
                            <Text style={styles.faqAnswer}>{item.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* Support Hours */}
                <View style={styles.supportHours}>
                    <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                    <Text style={styles.supportHoursText}>
                        Support available: Mon-Sat, 9:00 AM - 6:00 PM IST
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
    heroSection: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 24,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    contactCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 24,
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
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    contactItemLast: {
        borderBottomWidth: 0,
    },
    contactIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    faqContainer: {
        gap: 12,
        marginBottom: 24,
    },
    faqItem: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 16,
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
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    faqAnswer: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 21,
        marginLeft: 30,
    },
    supportHours: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
    },
    supportHoursText: {
        fontSize: 13,
        color: colors.textMuted,
    },
});
