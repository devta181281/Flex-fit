import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants';

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

interface GymCardProps {
    gym: Gym;
    onPress: () => void;
}

export default function GymCard({ gym, onPress }: GymCardProps) {
    const formatPrice = (price: number) => `₹${price}`;
    const formatDistance = (km?: number) => km ? `${km.toFixed(1)} km` : '';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {/* Image */}
            <Image
                source={{ uri: gym.images[0] || 'https://via.placeholder.com/300x200' }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Price Badge */}
            <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{formatPrice(gym.dayPassPrice)}/day</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{gym.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{gym.rating.toFixed(1)}</Text>
                    </View>
                </View>

                <Text style={styles.address} numberOfLines={1}>{gym.address}</Text>

                <View style={styles.footer}>
                    <View style={styles.amenitiesRow}>
                        {gym.amenities.slice(0, 3).map((amenity, index) => (
                            <View key={index} style={styles.amenityTag}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        ))}
                        {gym.amenities.length > 3 && (
                            <Text style={styles.moreAmenities}>+{gym.amenities.length - 3}</Text>
                        )}
                    </View>
                    {gym.distance !== undefined && (
                        <Text style={styles.distance}>{formatDistance(gym.distance)}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 160,
    },
    priceBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    priceText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        fontSize: 14,
        marginRight: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    address: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amenitiesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    amenityTag: {
        backgroundColor: COLORS.border,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 6,
    },
    amenityText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    moreAmenities: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    distance: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
