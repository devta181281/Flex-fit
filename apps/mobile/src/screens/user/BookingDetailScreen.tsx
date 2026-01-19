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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';

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

import { UserStackParamList } from '../../navigation/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'BookingDetail'>;

export default function BookingDetailScreen({ route, navigation }: Props) {
    const { colors, isDark } = useTheme();
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { color: colors.success, icon: 'checkmark-circle' as const, bg: colors.success };
            case 'PENDING':
                return { color: colors.warning, icon: 'time' as const, bg: colors.warning };
            case 'USED':
                return { color: colors.textMuted, icon: 'checkmark-done' as const, bg: colors.textMuted };
            case 'CANCELLED':
            case 'EXPIRED':
                return { color: colors.error, icon: 'close-circle' as const, bg: colors.error };
            default:
                return { color: colors.textSecondary, icon: 'help-circle' as const, bg: colors.textSecondary };
        }
    };

    const styles = createStyles(colors, isDark);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return null;
    }

    const isActive = booking.status === 'CONFIRMED' && new Date(booking.bookingDate) >= new Date();
    const statusConfig = getStatusConfig(booking.status);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Booking Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* QR Code Card */}
                {isActive && booking.qrCode && (
                    <View style={styles.qrCard}>
                        <View style={styles.qrHeader}>
                            <Ionicons name="ticket" size={20} color={colors.primary} />
                            <Text style={styles.qrTitle}>Your Entry Pass</Text>
                        </View>
                        <View style={styles.qrContainer}>
                            <Image
                                source={{ uri: booking.qrCode }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.bookingCode}>{booking.bookingCode}</Text>
                        <View style={styles.qrHint}>
                            <Ionicons name="scan-outline" size={16} color={colors.textMuted} />
                            <Text style={styles.qrHintText}>Show this QR code at the gym reception</Text>
                        </View>
                    </View>
                )}

                {/* Status Badge */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Ionicons name={statusConfig.icon} size={16} color={colors.white} />
                        <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                </View>

                {/* Gym Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>GYM</Text>
                    <View style={styles.gymCard}>
                        <View style={styles.gymIconContainer}>
                            <Ionicons name="fitness" size={22} color={colors.primary} />
                        </View>
                        <View style={styles.gymInfo}>
                            <Text style={styles.gymName}>{booking.gym.name}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                                <Text style={styles.gymAddress}>{booking.gym.address}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Booking Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DETAILS</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                            </View>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{formatDate(booking.bookingDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                            </View>
                            <Text style={styles.detailLabel}>Booking ID</Text>
                            <Text style={styles.detailValue}>{booking.bookingCode}</Text>
                        </View>
                        {booking.payment && (
                            <>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <Ionicons name="card-outline" size={18} color={colors.primary} />
                                    </View>
                                    <Text style={styles.detailLabel}>Amount Paid</Text>
                                    <Text style={styles.detailValuePrimary}>₹{booking.payment.amount}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Instructions */}
                {isActive && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
                        <View style={styles.instructionsCard}>
                            {[
                                { icon: 'walk-outline', text: 'Arrive at the gym during opening hours' },
                                { icon: 'qr-code-outline', text: 'Show this QR code at the reception' },
                                { icon: 'checkmark-circle-outline', text: 'Staff will scan and verify your booking' },
                                { icon: 'barbell-outline', text: 'Enjoy your workout!' },
                            ].map((item, index) => (
                                <View key={index} style={styles.instructionItem}>
                                    <View style={styles.instructionNumber}>
                                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{item.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Not Active Message */}
                {!isActive && (
                    <View style={styles.section}>
                        <View style={styles.expiredCard}>
                            <Ionicons name="information-circle" size={24} color={colors.textMuted} />
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

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    qrCard: {
        backgroundColor: colors.white,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    qrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.black,
    },
    qrContainer: {
        backgroundColor: colors.white,
        padding: 8,
        borderRadius: 12,
    },
    qrImage: {
        width: 180,
        height: 180,
    },
    bookingCode: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.black,
        letterSpacing: 3,
        marginTop: 16,
    },
    qrHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    qrHintText: {
        fontSize: 13,
        color: colors.textMuted,
    },
    statusCard: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    gymCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: isDark ? 0 : 2,
            },
        }),
    },
    gymIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    gymInfo: {
        flex: 1,
    },
    gymName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    gymAddress: {
        fontSize: 13,
        color: colors.textMuted,
        flex: 1,
    },
    detailsCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: isDark ? 0 : 2,
            },
        }),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textMuted,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    detailValuePrimary: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    instructionsCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: isDark ? 0 : 2,
            },
        }),
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    instructionNumberText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    },
    instructionText: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    expiredCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    expiredText: {
        fontSize: 14,
        color: colors.textMuted,
        flex: 1,
    },
});
