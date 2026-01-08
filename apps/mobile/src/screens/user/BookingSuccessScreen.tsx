import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { COLORS } from '../../constants';

type Props = NativeStackScreenProps<any, 'BookingSuccess'>;

interface BookingSuccessParams {
    bookingId: string;
    gymName: string;
    bookingDate: string;
    bookingCode: string;
    qrCode: string;
}

export default function BookingSuccessScreen({ route, navigation }: Props) {
    const params = route.params as BookingSuccessParams;
    const { bookingId, gymName, bookingDate, bookingCode, qrCode } = params;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleViewBooking = () => {
        navigation.replace('BookingDetail', { bookingId });
    };

    const handleGoHome = () => {
        // Reset navigation to home
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            })
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon */}
                <View style={styles.successIcon}>
                    <Text style={styles.successEmoji}>🎉</Text>
                </View>

                {/* Success Message */}
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <Text style={styles.successSubtitle}>
                    Your day pass has been successfully booked
                </Text>

                {/* QR Code Card */}
                <View style={styles.qrCard}>
                    <Text style={styles.qrTitle}>Your Entry Pass</Text>

                    <View style={styles.qrContainer}>
                        {qrCode && qrCode.startsWith('data:') ? (
                            <Image
                                source={{ uri: qrCode }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.qrPlaceholder}>
                                <Text style={styles.qrPlaceholderText}>QR</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.bookingCode}>{bookingCode}</Text>
                    <Text style={styles.qrHint}>Show this QR code at the gym reception</Text>
                </View>

                {/* Booking Details */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Gym</Text>
                        <Text style={styles.detailValue}>{gymName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{formatDate(bookingDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pass Type</Text>
                        <Text style={styles.detailValue}>Day Pass</Text>
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
                    <Text style={styles.tipItem}>• Arrive during gym opening hours</Text>
                    <Text style={styles.tipItem}>• Carry a valid photo ID</Text>
                    <Text style={styles.tipItem}>• Bring your own towel (optional)</Text>
                    <Text style={styles.tipItem}>• Follow gym rules and etiquette</Text>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={handleViewBooking}
                >
                    <Text style={styles.viewButtonText}>View Booking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={handleGoHome}
                >
                    <Text style={styles.homeButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    successIcon: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successEmoji: {
        fontSize: 80,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    qrCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    qrTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    qrContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    qrPlaceholderText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#999',
    },
    bookingCode: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 4,
        marginBottom: 8,
    },
    qrHint: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    detailsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        textAlign: 'right',
    },
    tipsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.success,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    tipItem: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        lineHeight: 22,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 24,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 12,
    },
    viewButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    viewButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    homeButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
