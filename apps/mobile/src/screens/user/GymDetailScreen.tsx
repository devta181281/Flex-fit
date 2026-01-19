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
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiService } from '../../services/api';
import { useTheme } from '../../constants';

const { width } = Dimensions.get('window');

interface Gym {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    dayPassPrice: number;
    rating: number;
    images: string[];
    amenities: string[];
    openingHours: Record<string, string>;
    rules: string;
    owner?: {
        name: string;
        phone?: string;
    };
}

import { UserStackParamList } from '../../navigation/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'GymDetail'>;

export default function GymDetailScreen({ route, navigation }: Props) {
    const { colors } = useTheme();
    const { gymId } = route.params;
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchGymDetails();
    }, [gymId]);

    const fetchGymDetails = async () => {
        try {
            const response = await apiService.gyms.getById(gymId);
            setGym(response.data);
        } catch (error) {
            console.error('Error fetching gym:', error);
            Alert.alert('Error', 'Failed to load gym details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        navigation.navigate('BookingConfirm', { gymId, gymName: gym?.name || '' });
    };

    const formatPrice = (price: number) => `₹${price}`;

    const getDayName = (day: string) => {
        const days: Record<string, string> = {
            mon: 'Monday',
            tue: 'Tuesday',
            wed: 'Wednesday',
            thu: 'Thursday',
            fri: 'Friday',
            sat: 'Saturday',
            sun: 'Sunday',
        };
        return days[day] || day;
    };

    const styles = createStyles(colors);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!gym) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                    >
                        {gym.images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.indicators}>
                        {gym.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    index === currentImageIndex && styles.indicatorActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name}>{gym.name}</Text>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{gym.rating.toFixed(1)}</Text>
                            </View>
                        </View>
                        <Text style={styles.address}>{gym.address}</Text>
                    </View>

                    <View style={styles.priceCard}>
                        <View>
                            <Text style={styles.priceLabel}>Day Pass</Text>
                            <Text style={styles.price}>{formatPrice(gym.dayPassPrice)}</Text>
                        </View>
                        <Text style={styles.priceNote}>per day</Text>
                    </View>

                    {gym.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.description}>{gym.description}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {gym.amenities.map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <View style={styles.amenityCheck}>
                                        <Text style={styles.amenityIcon}>✓</Text>
                                    </View>
                                    <Text style={styles.amenityText}>{amenity}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Opening Hours</Text>
                        <View style={styles.hoursContainer}>
                            {Object.entries(gym.openingHours).map(([day, hours]) => (
                                <View key={day} style={styles.hourRow}>
                                    <Text style={styles.dayText}>{getDayName(day)}</Text>
                                    <Text style={styles.hoursText}>{hours}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {gym.rules && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Gym Rules</Text>
                            <Text style={styles.rulesText}>{gym.rules}</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={styles.bottomPrice}>
                    <Text style={styles.bottomPriceLabel}>Day Pass</Text>
                    <Text style={styles.bottomPriceValue}>{formatPrice(gym.dayPassPrice)}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width,
        height: 280,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        color: '#fff',
        fontSize: 24,
    },
    indicators: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    indicatorActive: {
        backgroundColor: '#fff',
        width: 24,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        flex: 1,
    },
    ratingBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    address: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    priceCard: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    priceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    price: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
    },
    priceNote: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 12,
    },
    amenityCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    amenityIcon: {
        fontSize: 12,
        color: colors.success,
        fontWeight: '700',
    },
    amenityText: {
        fontSize: 15,
        color: colors.text,
    },
    hoursContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dayText: {
        fontSize: 15,
        color: colors.text,
    },
    hoursText: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    rulesText: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    bottomPrice: {
        flex: 1,
    },
    bottomPriceLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    bottomPriceValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    bookButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    bookButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
});
