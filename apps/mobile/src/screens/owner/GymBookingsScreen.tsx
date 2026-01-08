import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

interface Booking {
    id: string;
    bookingCode: string;
    bookingDate: string;
    status: 'CONFIRMED' | 'USED' | 'CANCELLED' | 'EXPIRED';
    amount: number;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
}

export default function GymBookingsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { gymId, gymName } = route.params;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'today' | 'upcoming' | 'past'>('today');

    const fetchBookings = useCallback(async () => {
        try {
            const response = await apiService.gyms.getBookings(gymId);
            setBookings(response.data);
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [gymId]);

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [fetchBookings])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const filterBookings = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return bookings.filter((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            bookingDate.setHours(0, 0, 0, 0);

            switch (filter) {
                case 'today':
                    return bookingDate.getTime() === today.getTime();
                case 'upcoming':
                    return bookingDate.getTime() > today.getTime();
                case 'past':
                    return bookingDate.getTime() < today.getTime();
                default:
                    return true;
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return COLORS.success;
            case 'USED':
                return COLORS.primary;
            case 'CANCELLED':
                return COLORS.error;
            case 'EXPIRED':
                return COLORS.textSecondary;
            default:
                return COLORS.textSecondary;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const renderBookingCard = ({ item }: { item: Booking }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
                <Text style={styles.userContact}>{item.user?.phone || item.user?.email}</Text>
            </View>

            <View style={styles.bookingFooter}>
                <Text style={styles.bookingDate}>📅 {formatDate(item.bookingDate)}</Text>
                <Text style={styles.bookingAmount}>₹{item.amount}</Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Bookings</Text>
            <Text style={styles.emptySubtitle}>
                {filter === 'today' && 'No bookings for today'}
                {filter === 'upcoming' && 'No upcoming bookings'}
                {filter === 'past' && 'No past bookings'}
            </Text>
        </View>
    );

    const filteredBookings = filterBookings();
    const todayCount = bookings.filter(b => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bd = new Date(b.bookingDate);
        bd.setHours(0, 0, 0, 0);
        return bd.getTime() === today.getTime();
    }).length;

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Bookings</Text>
                    <Text style={styles.subtitle}>{gymName}</Text>
                </View>
                <View style={styles.todayBadge}>
                    <Text style={styles.todayCount}>{todayCount}</Text>
                    <Text style={styles.todayLabel}>Today</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                {(['today', 'upcoming', 'past'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.filterTab, filter === tab && styles.filterTabActive]}
                        onPress={() => setFilter(tab)}
                    >
                        <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bookings List */}
            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id}
                renderItem={renderBookingCard}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    backButton: {
        fontSize: 16,
        color: COLORS.primary,
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    todayBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
    },
    todayCount: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    todayLabel: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.9,
    },
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    filterTab: {
        flex: 1,
        backgroundColor: COLORS.surface,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    bookingCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookingCode: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    userInfo: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    userContact: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingDate: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    bookingAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
