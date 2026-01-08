import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';
import GymCard from '../../components/GymCard';

interface Gym {
    id: string;
    name: string;
    address: string;
    dayPassPrice: number;
    rating: number;
    images: string[];
    amenities: string[];
    distance?: number;
}

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const requestLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission',
                    'We need your location to show nearby gyms. Using default location.',
                );
                // Default to Mumbai coordinates
                setLocation({ lat: 19.076, lng: 72.8777 });
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
            });
        } catch (error) {
            console.error('Location error:', error);
            setLocation({ lat: 19.076, lng: 72.8777 });
        }
    };

    const fetchGyms = useCallback(async () => {
        if (!location) return;

        try {
            const response = await apiService.gyms.getNearby(location.lat, location.lng, 50);
            setGyms(response.data);
        } catch (error) {
            console.error('Error fetching gyms:', error);
            Alert.alert('Error', 'Failed to load gyms. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [location]);

    useEffect(() => {
        requestLocation();
    }, []);

    useEffect(() => {
        if (location) {
            fetchGyms();
        }
    }, [location, fetchGyms]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGyms();
    };

    const handleGymPress = (gym: Gym) => {
        navigation.navigate('GymDetail', { gymId: gym.id });
    };

    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderGym = ({ item }: { item: Gym }) => (
        <GymCard gym={item} onPress={() => handleGymPress(item)} />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.greeting}>Find Your Gym 💪</Text>
            <Text style={styles.subtitle}>Book a day pass at gyms near you</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search gyms..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.sectionTitle}>
                {searchQuery ? `Results (${filteredGyms.length})` : 'Nearby Gyms'}
            </Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>No gyms found nearby</Text>
            <Text style={styles.emptySubtext}>Try expanding your search area</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Finding gyms near you...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <FlatList
                data={filteredGyms}
                renderItem={renderGym}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
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
    loadingText: {
        marginTop: 16,
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 24,
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.text,
    },
    clearIcon: {
        fontSize: 16,
        color: COLORS.textSecondary,
        padding: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
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
    },
});
