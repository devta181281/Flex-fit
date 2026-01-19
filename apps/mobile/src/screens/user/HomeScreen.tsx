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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';
import { useAuthStore } from '../../store/authStore';
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
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationName, setLocationName] = useState('Locating...');

    const requestLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission',
                    'We need your location to show nearby gyms. Using default location.',
                );
                setLocation({ lat: 19.076, lng: 72.8777 });
                setLocationName('Mumbai');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
            });

            // Get location name
            try {
                const address = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                if (address[0]) {
                    setLocationName(address[0].city || address[0].district || 'Your Area');
                }
            } catch {
                setLocationName('Your Area');
            }
        } catch (error) {
            console.error('Location error:', error);
            setLocation({ lat: 19.076, lng: 72.8777 });
            setLocationName('Mumbai');
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const styles = createStyles(colors, isDark);

    const renderGym = ({ item }: { item: Gym }) => (
        <GymCard gym={item} onPress={() => handleGymPress(item)} />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Welcome Section */}
            <View style={styles.welcomeRow}>
                <View style={styles.welcomeText}>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'there'}</Text>
                </View>
                <TouchableOpacity style={styles.locationPill}>
                    <Ionicons name="location" size={14} color={colors.primary} />
                    <Text style={styles.locationText}>{locationName}</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search gyms by name or location..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {searchQuery ? 'SEARCH RESULTS' : 'NEARBY GYMS'}
                </Text>
                {filteredGyms.length > 0 && (
                    <Text style={styles.gymCount}>{filteredGyms.length} found</Text>
                )}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="fitness-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>
                {searchQuery ? 'No gyms match your search' : 'No gyms found nearby'}
            </Text>
            <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Try expanding your search area'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingIcon}>
                        <Ionicons name="compass" size={40} color={colors.primary} />
                    </View>
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
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
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
    loadingIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    welcomeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    welcomeText: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.text,
        marginTop: 2,
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '12',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingHorizontal: 14,
        marginBottom: 20,
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
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: colors.text,
    },
    clearButton: {
        padding: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.5,
    },
    gymCount: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
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
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
