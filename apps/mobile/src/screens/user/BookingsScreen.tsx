import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';

interface Booking {
    id: string;
    bookingCode: string;
    bookingDate: string;
    status: 'PENDING' | 'CONFIRMED' | 'USED' | 'CANCELLED' | 'EXPIRED';
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
}

export default function BookingsScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const fetchBookings = async () => {
        try {
            const response = await apiService.bookings.getMy();
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const isUpcoming = (booking: Booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today && booking.status !== 'USED' && booking.status !== 'CANCELLED' && booking.status !== 'EXPIRED';
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { color: colors.success, icon: 'checkmark-circle' as const };
            case 'PENDING':
                return { color: colors.warning, icon: 'time' as const };
            case 'USED':
                return { color: colors.textMuted, icon: 'checkmark-done' as const };
            case 'CANCELLED':
            case 'EXPIRED':
                return { color: colors.error, icon: 'close-circle' as const };
            default:
                return { color: colors.textSecondary, icon: 'help-circle' as const };
        }
    };

    const upcomingBookings = bookings.filter(isUpcoming);
    const pastBookings = bookings.filter((b) => !isUpcoming(b));

    const handleBookingPress = (booking: Booking) => {
        navigation.navigate('BookingDetail', { bookingId: booking.id });
    };

    const styles = createStyles(colors, isDark);

    const renderBooking = ({ item }: { item: Booking }) => {
        const statusConfig = getStatusConfig(item.status);
        const isActive = item.status === 'CONFIRMED' && isUpcoming(item);

        return (
            <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => handleBookingPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.gymInfo}>
                        <Text style={styles.gymName} numberOfLines={1}>{item.gym.name}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                            <Text style={styles.address} numberOfLines={1}>{item.gym.address}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '18' }]}>
                        <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                        <Text style={styles.dateText}>{formatDate(item.bookingDate)}</Text>
                    </View>
                    {item.payment && (
                        <Text style={styles.amount}>₹{item.payment.amount}</Text>
                    )}
                </View>

                {isActive && (
                    <View style={styles.qrHint}>
                        <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                        <Text style={styles.qrHintText}>Tap to view QR code</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons
                    name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
                    size={48}
                    color={colors.textMuted}
                />
            </View>
            <Text style={styles.emptyText}>
                {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </Text>
            <Text style={styles.emptySubtext}>
                {activeTab === 'upcoming'
                    ? 'Book a day pass to get started!'
                    : 'Your booking history will appear here'}
            </Text>
            {activeTab === 'upcoming' && (
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="compass" size={18} color={colors.white} />
                    <Text style={styles.exploreButtonText}>Explore Gyms</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Bookings</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Ionicons
                        name="calendar"
                        size={18}
                        color={activeTab === 'upcoming' ? colors.white : colors.textMuted}
                    />
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
                        Upcoming ({upcomingBookings.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.tabActive]}
                    onPress={() => setActiveTab('past')}
                >
                    <Ionicons
                        name="time"
                        size={18}
                        color={activeTab === 'past' ? colors.white : colors.textMuted}
                    />
                    <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
                        Past ({pastBookings.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bookings List */}
            <FlatList
                data={activeTab === 'upcoming' ? upcomingBookings : pastBookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.surface,
        gap: 6,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
    },
    tabTextActive: {
        color: colors.white,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    bookingCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    gymInfo: {
        flex: 1,
        marginRight: 12,
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
    address: {
        fontSize: 13,
        color: colors.textMuted,
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    qrHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        gap: 6,
    },
    qrHintText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    exploreButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
