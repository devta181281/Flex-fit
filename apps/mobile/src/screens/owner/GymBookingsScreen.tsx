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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';

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
    const { colors, isDark } = useTheme();
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { color: colors.success, icon: 'checkmark-circle' as const };
            case 'USED':
                return { color: colors.primary, icon: 'checkmark-done' as const };
            case 'CANCELLED':
                return { color: colors.error, icon: 'close-circle' as const };
            case 'EXPIRED':
                return { color: colors.textMuted, icon: 'time' as const };
            default:
                return { color: colors.textSecondary, icon: 'help-circle' as const };
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

    const styles = createStyles(colors, isDark);

    const filteredBookings = filterBookings();
    const todayCount = bookings.filter(b => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bd = new Date(b.bookingDate);
        bd.setHours(0, 0, 0, 0);
        return bd.getTime() === today.getTime();
    }).length;

    const renderBookingCard = ({ item }: { item: Booking }) => {
        const statusConfig = getStatusConfig(item.status);

        return (
            <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '18' }]}>
                        <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {item.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
                        <Text style={styles.userContact}>{item.user?.phone || item.user?.email}</Text>
                    </View>
                </View>

                <View style={styles.bookingFooter}>
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.bookingDate}>{formatDate(item.bookingDate)}</Text>
                    </View>
                    <Text style={styles.bookingAmount}>₹{item.amount}</Text>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Bookings</Text>
            <Text style={styles.emptySubtitle}>
                {filter === 'today' && 'No bookings for today'}
                {filter === 'upcoming' && 'No upcoming bookings'}
                {filter === 'past' && 'No past bookings'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
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
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>Bookings</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>{gymName}</Text>
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
                        <Ionicons
                            name={tab === 'today' ? 'today' : tab === 'upcoming' ? 'arrow-forward' : 'time'}
                            size={16}
                            color={filter === tab ? colors.white : colors.textMuted}
                        />
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
                        tintColor={colors.primary}
                    />
                }
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
        flexDirection: 'row',
        alignItems: 'center',
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
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    todayBadge: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignItems: 'center',
    },
    todayCount: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.white,
    },
    todayLabel: {
        fontSize: 10,
        color: colors.white,
        opacity: 0.9,
        fontWeight: '600',
    },
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 10,
    },
    filterTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
    },
    filterTextActive: {
        color: colors.white,
    },
    listContent: {
        paddingHorizontal: 16,
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
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    bookingCode: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: 1,
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
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    userContact: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookingDate: {
        fontSize: 14,
        color: colors.textMuted,
    },
    bookingAmount: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
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
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
});
