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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

interface Gym {
    id: string;
    name: string;
    address: string;
    status: 'PENDING' | 'APPROVED' | 'DISABLED';
    dayPassPrice: number;
    images: string[];
}

export default function OwnerDashboardScreen() {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return COLORS.success;
            case 'PENDING':
                return COLORS.warning;
            case 'DISABLED':
                return COLORS.error;
            default:
                return COLORS.textSecondary;
        }
    };

    const renderGymCard = ({ item }: { item: Gym }) => (
        <TouchableOpacity
            style={styles.gymCard}
            onPress={() => navigation.navigate('GymBookings', { gymId: item.id, gymName: item.name })}
        >
            <View style={styles.gymHeader}>
                <Text style={styles.gymName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.gymAddress} numberOfLines={1}>{item.address}</Text>
            <View style={styles.gymFooter}>
                <Text style={styles.gymPrice}>₹{item.dayPassPrice}/day</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('GymBookings', { gymId: item.id, gymName: item.name })}
                    >
                        <Text style={styles.actionText}>📋 Bookings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('GymEdit', { gymId: item.id })}
                    >
                        <Text style={styles.actionText}>✏️ Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No Gyms Yet</Text>
            <Text style={styles.emptySubtitle}>Register your first gym to start receiving bookings</Text>
            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('GymRegistration')}
            >
                <Text style={styles.registerButtonText}>+ Register New Gym</Text>
            </TouchableOpacity>
        </View>
    );

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
                <Text style={styles.title}>My Gyms</Text>
                {gyms.length > 0 && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('GymRegistration')}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Stats Bar */}
            {gyms.length > 0 && (
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{gyms.length}</Text>
                        <Text style={styles.statLabel}>Total Gyms</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{gyms.filter(g => g.status === 'APPROVED').length}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{gyms.filter(g => g.status === 'PENDING').length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>
            )}

            {/* Gym List */}
            <FlatList
                data={gyms}
                keyExtractor={(item) => item.id}
                renderItem={renderGymCard}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    gymCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    gymHeader: {
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
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    gymAddress: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    gymFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gymPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionText: {
        fontSize: 13,
        color: COLORS.text,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
