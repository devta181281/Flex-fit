import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants';

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
    const { colors, isDark } = useTheme();
    const formatPrice = (price: number) => `₹${price}`;
    const formatDistance = (km?: number) => km ? `${km.toFixed(1)} km` : '';

    const styles = createStyles(colors, isDark);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {/* Image with Overlay */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: gym.images[0] || 'https://via.placeholder.com/300x200' }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {/* Price Badge */}
                <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{formatPrice(gym.dayPassPrice)}</Text>
                    <Text style={styles.priceLabel}>/day</Text>
                </View>
                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.ratingText}>{gym.rating.toFixed(1)}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{gym.name}</Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.address} numberOfLines={1}>{gym.address}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.amenitiesRow}>
                        {gym.amenities.slice(0, 2).map((amenity, index) => (
                            <View key={index} style={styles.amenityTag}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        ))}
                        {gym.amenities.length > 2 && (
                            <Text style={styles.moreAmenities}>+{gym.amenities.length - 2}</Text>
                        )}
                    </View>
                    {gym.distance !== undefined && (
                        <View style={styles.distanceBadge}>
                            <Ionicons name="navigate-outline" size={12} color={colors.primary} />
                            <Text style={styles.distance}>{formatDistance(gym.distance)}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.4 : 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: isDark ? 0 : 4,
            },
        }),
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 160,
    },
    priceBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    priceText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
    priceLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 1,
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
    content: {
        padding: 14,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    address: {
        fontSize: 13,
        color: colors.textMuted,
        flex: 1,
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
        gap: 6,
    },
    amenityTag: {
        backgroundColor: colors.primary + '12',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    amenityText: {
        fontSize: 11,
        color: colors.primary,
        fontWeight: '600',
    },
    moreAmenities: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '600',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distance: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
    },
});
