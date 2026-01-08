import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

interface BookingDetail {
    id: string;
    bookingCode: string;
    bookingDate: string;
    status: string;
    qrCode: string;
    gym: {
        id: string;
        name: string;
        address: string;
    };
    payment?: {
        amount: number;
        status: string;
    };
    createdAt: string;
    expiresAt: string;
}

type Props = NativeStackScreenProps<any, 'BookingDetail'>;

export default function BookingDetailScreen({ route, navigation }: Props) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetail();
    }, [bookingId]);

    const fetchBookingDetail = async () => {
        try {
            const response = await apiService.bookings.getById(bookingId);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
            Alert.alert('Error', 'Failed to load booking details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return COLORS.success;
            case 'PENDING':
                return COLORS.warning;
            case 'USED':
                return COLORS.textSecondary;
            case 'CANCELLED':
            case 'EXPIRED':
                return COLORS.error;
            default:
                return COLORS.textSecondary;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return null;
    }

    const isActive = booking.status === 'CONFIRMED' && new Date(booking.bookingDate) >= new Date();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Booking Details</Text>
                </View>

                {/* QR Code Card */}
                {isActive && booking.qrCode && (
                    <View style={styles.qrCard}>
                        <Text style={styles.qrTitle}>Your Entry Pass</Text>
                        <View style={styles.qrContainer}>
                            <Image
                                source={{ uri: booking.qrCode }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.bookingCode}>{booking.bookingCode}</Text>
                        <Text style={styles.qrHint}>Show this QR code at the gym reception</Text>
                    </View>
                )}

                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                </View>

                {/* Gym Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gym</Text>
                    <View style={styles.gymCard}>
                        <Text style={styles.gymName}>{booking.gym.name}</Text>
                        <Text style={styles.gymAddress}>{booking.gym.address}</Text>
                    </View>
                </View>

                {/* Booking Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{formatDate(booking.bookingDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Booking ID</Text>
                            <Text style={styles.detailValue}>{booking.bookingCode}</Text>
                        </View>
                        {booking.payment && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Amount Paid</Text>
                                    <Text style={styles.detailValue}>₹{booking.payment.amount}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Payment Status</Text>
                                    <Text style={[styles.detailValue, { color: COLORS.success }]}>
                                        {booking.payment.status}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Instructions */}
                {isActive && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <View style={styles.instructionsCard}>
                            <Text style={styles.instruction}>1. Arrive at the gym during opening hours</Text>
                            <Text style={styles.instruction}>2. Show this QR code at the reception</Text>
                            <Text style={styles.instruction}>3. Staff will scan and verify your booking</Text>
                            <Text style={styles.instruction}>4. Enjoy your workout! 💪</Text>
                        </View>
                    </View>
                )}

                {/* Not Active Message */}
                {!isActive && (
                    <View style={styles.section}>
                        <View style={styles.expiredCard}>
                            <Text style={styles.expiredText}>
                                {booking.status === 'USED'
                                    ? 'This booking has already been used.'
                                    : booking.status === 'EXPIRED'
                                        ? 'This booking has expired.'
                                        : booking.status === 'CANCELLED'
                                            ? 'This booking was cancelled.'
                                            : 'This booking is no longer active.'}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
    },
    backButton: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    qrCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
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
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    bookingCode: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 4,
        marginTop: 16,
    },
    qrHint: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    statusCard: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statusBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    gymCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    gymName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    gymAddress: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    detailsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    instructionsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    instruction: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    expiredCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.textSecondary,
    },
    expiredText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
