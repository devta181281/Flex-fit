import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { COLORS, AMENITIES } from '../../constants';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
};

export default function GymEditScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { gymId } = route.params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dayPassPrice, setDayPassPrice] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
    const [rules, setRules] = useState('');

    useEffect(() => {
        fetchGym();
    }, []);

    const fetchGym = async () => {
        try {
            const response = await apiService.gyms.getById(gymId);
            const gym = response.data;

            setName(gym.name || '');
            setDescription(gym.description || '');
            setDayPassPrice(String(gym.dayPassPrice || ''));
            setSelectedAmenities(gym.amenities || []);
            setOpeningHours(gym.openingHours || {});
            setRules(gym.rules || '');
        } catch (error) {
            Alert.alert('Error', 'Failed to load gym details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const updateHours = (day: string, hours: string) => {
        setOpeningHours({ ...openingHours, [day]: hours });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Gym name is required');
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                name: name.trim(),
                description: description.trim(),
                dayPassPrice: parseFloat(dayPassPrice) || 0,
                amenities: selectedAmenities,
                openingHours,
                rules: rules.trim(),
            };

            await apiService.gyms.update(gymId, updateData);
            Alert.alert('Success', 'Gym updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update gym');
        } finally {
            setSaving(false);
        }
    };

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
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Gym</Text>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gym Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Gym name"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe your gym..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Day Pass Price (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={dayPassPrice}
                                onChangeText={setDayPassPrice}
                                placeholder="299"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {AMENITIES.map((amenity) => (
                                <TouchableOpacity
                                    key={amenity}
                                    style={[
                                        styles.amenityChip,
                                        selectedAmenities.includes(amenity) && styles.amenityChipActive,
                                    ]}
                                    onPress={() => toggleAmenity(amenity)}
                                >
                                    <Text
                                        style={[
                                            styles.amenityText,
                                            selectedAmenities.includes(amenity) && styles.amenityTextActive,
                                        ]}
                                    >
                                        {amenity}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Opening Hours */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Opening Hours</Text>
                        <View style={styles.hoursContainer}>
                            {DAYS.map((day) => (
                                <View key={day} style={styles.hourRow}>
                                    <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
                                    <TextInput
                                        style={styles.hourInput}
                                        value={openingHours[day] || ''}
                                        onChangeText={(val) => updateHours(day, val)}
                                        placeholder="6:00-22:00"
                                        placeholderTextColor={COLORS.textSecondary}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Rules */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gym Rules</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={rules}
                            onChangeText={setRules}
                            placeholder="Enter gym rules..."
                            placeholderTextColor={COLORS.textSecondary}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 16,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    amenityChip: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    amenityChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    amenityText: {
        fontSize: 14,
        color: COLORS.text,
    },
    amenityTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    hoursContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dayLabel: {
        fontSize: 14,
        color: COLORS.text,
        width: 100,
    },
    hourInput: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: COLORS.text,
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
