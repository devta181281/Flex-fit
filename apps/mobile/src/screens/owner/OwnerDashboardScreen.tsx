import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';
import { useAuthStore } from '../../store/authStore';

interface Gym {
    id: string;
    name: string;
    address: string;
    status: 'PENDING' | 'APPROVED' | 'DISABLED';
    dayPassPrice: number;
    images: string[];
}

export default function OwnerDashboardScreen() {
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGyms = useCallback(async () => {
        try {
            const response = await apiService.gyms.getMyGyms();
            setGyms(response.data);
        } catch (error: any) {
            console.error('Error fetching gyms:', error);
            Alert.alert('Error', 'Failed to load your gyms');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGyms();
        }, [fetchGyms])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchGyms();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return colors.success;
            case 'PENDING':
                return colors.warning;
            case 'DISABLED':
                return colors.error;
            default:
                return colors.textSecondary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'checkmark-circle';
            case 'PENDING':
                return 'time';
            case 'DISABLED':
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    const styles = createStyles(colors, isDark);

    const renderGymCard = ({ item }: { item: Gym }) => (
        <TouchableOpacity
            style={styles.gymCard}
            onPress={() => navigation.navigate('GymBookings', { gymId: item.id, gymName: item.name })}
            activeOpacity={0.7}
        >
            <View style={styles.gymCardHeader}>
                <View style={styles.gymInfo}>
                    <Text style={styles.gymName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.gymAddress} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Ionicons
                        name={getStatusIcon(item.status)}
                        size={12}
                        color={getStatusColor(item.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.gymCardFooter}>
                <View style={styles.priceTag}>
                    <Text style={styles.priceValue}>₹{item.dayPassPrice}</Text>
                    <Text style={styles.priceLabel}>/day</Text>
                </View>
                <View style={styles.gymActions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('GymBookings', { gymId: item.id, gymName: item.name })}
                    >
                        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('GymEdit', { gymId: item.id })}
                    >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="business-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Gyms Yet</Text>
            <Text style={styles.emptySubtitle}>
                Register your first gym to start receiving bookings
            </Text>
            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('GymRegistration')}
            >
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.registerButtonText}>Register New Gym</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Partner'}</Text>
                </View>
                {gyms.length > 0 && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('GymRegistration')}
                    >
                        <Ionicons name="add" size={22} color={colors.white} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick Stats */}
            {gyms.length > 0 && (
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBg, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="business" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.statValue}>{gyms.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBg, { backgroundColor: colors.success + '15' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        </View>
                        <Text style={styles.statValue}>{gyms.filter(g => g.status === 'APPROVED').length}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBg, { backgroundColor: colors.warning + '15' }]}>
                            <Ionicons name="time" size={20} color={colors.warning} />
                        </View>
                        <Text style={styles.statValue}>{gyms.filter(g => g.status === 'PENDING').length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>
            )}

            {/* Section Title */}
            {gyms.length > 0 && (
                <Text style={styles.sectionTitle}>YOUR GYMS</Text>
            )}
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
            <FlatList
                data={gyms}
                keyExtractor={(item) => item.id}
                renderItem={renderGymCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
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
    listContent: {
        paddingBottom: 24,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 24,
    },
    greeting: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginTop: 2,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
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
    statIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    gymCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
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
    gymCardHeader: {
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
    gymAddress: {
        fontSize: 13,
        color: colors.textSecondary,
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
    gymCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
    },
    priceLabel: {
        fontSize: 13,
        color: colors.textMuted,
        marginLeft: 2,
    },
    gymActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
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
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    registerButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
