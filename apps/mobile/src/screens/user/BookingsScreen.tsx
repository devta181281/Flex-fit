import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

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
            year: 'numeric',
        });
    };

    const isUpcoming = (booking: Booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today && booking.status !== 'USED' && booking.status !== 'CANCELLED' && booking.status !== 'EXPIRED';
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

    const upcomingBookings = bookings.filter(isUpcoming);
    const pastBookings = bookings.filter((b) => !isUpcoming(b));

    const handleBookingPress = (booking: Booking) => {
        navigation.navigate('BookingDetail', { bookingId: booking.id });
    };

    const renderBooking = ({ item }: { item: Booking }) => (
        <TouchableOpacity
            style={styles.bookingCard}
            onPress={() => handleBookingPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.gymName}>{item.gym.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.address}>{item.gym.address}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>📅</Text>
                    <Text style={styles.dateText}>{formatDate(item.bookingDate)}</Text>
                </View>
                {item.payment && (
                    <Text style={styles.amount}>₹{item.payment.amount}</Text>
                )}
            </View>

            {item.status === 'CONFIRMED' && isUpcoming(item) && (
                <View style={styles.qrHint}>
                    <Text style={styles.qrHintText}>Tap to view QR code →</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
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
                    <Text style={styles.exploreButtonText}>Explore Gyms</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Bookings</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
                        Upcoming ({upcomingBookings.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.tabActive]}
                    onPress={() => setActiveTab('past')}
                >
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
                        tintColor={COLORS.primary}
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    bookingCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    gymName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    address: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 14,
        marginRight: 6,
    },
    dateText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    qrHint: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    qrHintText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
