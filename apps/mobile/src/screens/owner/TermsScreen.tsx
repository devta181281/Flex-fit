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

export default function TermsScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();

    const styles = createStyles(colors, isDark);

    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using the FlexFit application, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the application.',
        },
        {
            title: '2. Service Description',
            content: 'FlexFit provides a platform connecting gym owners with users seeking day passes for fitness facilities. As a gym owner, you can list your gym, manage bookings, and receive payments through our platform.',
        },
        {
            title: '3. Gym Owner Responsibilities',
            content: 'As a gym owner, you are responsible for:\n• Providing accurate information about your facility\n• Maintaining the quality and safety of your premises\n• Honoring all confirmed bookings\n• Ensuring proper verification of user passes via QR scanning\n• Adhering to all applicable local laws and regulations',
        },
        {
            title: '4. Booking & Payments',
            content: 'All bookings made through FlexFit are subject to availability. Payments are processed securely through our payment partners. Commission rates and payout schedules are as specified in your gym owner agreement.',
        },
        {
            title: '5. Cancellation Policy',
            content: 'Cancellations must be handled according to the cancellation policy set for your gym. Refunds, if applicable, will be processed within 5-7 business days.',
        },
        {
            title: '6. Limitation of Liability',
            content: 'FlexFit acts as an intermediary platform and is not liable for any injuries, damages, or disputes arising from the use of gym facilities. Gym owners must maintain appropriate insurance coverage.',
        },
        {
            title: '7. Modifications to Terms',
            content: 'FlexFit reserves the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the modified terms.',
        },
        {
            title: '8. Contact Information',
            content: 'For questions regarding these Terms and Conditions, please contact us through the Help & Support section or email us at support@flexfit.app',
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
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.updateInfo}>
                    <Ionicons name="information-circle" size={16} color={colors.primary} />
                    <Text style={styles.updateText}>Last updated: January 2026</Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By using FlexFit, you agree to these terms and conditions.
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
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 24,
    },
    updateText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '500',
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
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
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
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
