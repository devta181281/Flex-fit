import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
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

const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
];

export default function GymRegistrationScreen() {
    const navigation = useNavigation<any>();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [dayPassPrice, setDayPassPrice] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [openingHours, setOpeningHours] = useState<Record<string, string>>({
        mon: '6:00-22:00',
        tue: '6:00-22:00',
        wed: '6:00-22:00',
        thu: '6:00-22:00',
        fri: '6:00-22:00',
        sat: '8:00-20:00',
        sun: '8:00-18:00',
    });
    const [rules, setRules] = useState('');

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

    const validateStep = () => {
        switch (step) {
            case 1:
                if (!name.trim() || !address.trim()) {
                    Alert.alert('Required', 'Please fill in gym name and address');
                    return false;
                }
                return true;
            case 2:
                if (!latitude.trim() || !longitude.trim()) {
                    Alert.alert('Required', 'Please enter location coordinates');
                    return false;
                }
                if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
                    Alert.alert('Invalid', 'Coordinates must be valid numbers');
                    return false;
                }
                return true;
            case 3:
                if (!dayPassPrice.trim() || isNaN(parseFloat(dayPassPrice))) {
                    Alert.alert('Required', 'Please enter a valid price');
                    return false;
                }
                return true;
            case 4:
                if (selectedAmenities.length === 0) {
                    Alert.alert('Required', 'Please select at least one amenity');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const gymData = {
                name: name.trim(),
                description: description.trim(),
                address: address.trim(),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                dayPassPrice: parseFloat(dayPassPrice),
                amenities: selectedAmenities,
                images: PLACEHOLDER_IMAGES,
                openingHours,
                rules: rules.trim(),
            };

            await apiService.gyms.create(gymData);

            Alert.alert(
                'Success! 🎉',
                'Your gym has been submitted for approval. You will be notified once it is reviewed.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to register gym');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3, 4, 5].map((s) => (
                <View key={s} style={styles.stepRow}>
                    <View style={[styles.stepDot, s <= step && styles.stepDotActive]} />
                    {s < 5 && <View style={[styles.stepLine, s < step && styles.stepLineActive]} />}
                </View>
            ))}
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepSubtitle}>Step 1 of 5</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Gym Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., PowerFit Gym"
                    placeholderTextColor={COLORS.textSecondary}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your gym..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Address *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Street, Area, City, State"
                    placeholderTextColor={COLORS.textSecondary}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Location Coordinates</Text>
            <Text style={styles.stepSubtitle}>Step 2 of 5</Text>

            <Text style={styles.hint}>
                💡 You can get coordinates from Google Maps. Right-click on location → "What's here?"
            </Text>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Latitude *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 23.0300"
                        placeholderTextColor={COLORS.textSecondary}
                        value={latitude}
                        onChangeText={setLatitude}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={{ width: 12 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Longitude *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 72.5600"
                        placeholderTextColor={COLORS.textSecondary}
                        value={longitude}
                        onChangeText={setLongitude}
                        keyboardType="decimal-pad"
                    />
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pricing & Hours</Text>
            <Text style={styles.stepSubtitle}>Step 3 of 5</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Day Pass Price (₹) *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 299"
                    placeholderTextColor={COLORS.textSecondary}
                    value={dayPassPrice}
                    onChangeText={setDayPassPrice}
                    keyboardType="numeric"
                />
            </View>

            <Text style={styles.label}>Opening Hours</Text>
            <View style={styles.hoursContainer}>
                {DAYS.map((day) => (
                    <View key={day} style={styles.hourRow}>
                        <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
                        <TextInput
                            style={styles.hourInput}
                            placeholder="6:00-22:00"
                            placeholderTextColor={COLORS.textSecondary}
                            value={openingHours[day]}
                            onChangeText={(val) => updateHours(day, val)}
                        />
                    </View>
                ))}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Amenities</Text>
            <Text style={styles.stepSubtitle}>Step 4 of 5</Text>

            <Text style={styles.hint}>Select all amenities available at your gym</Text>

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
    );

    const renderStep5 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Gym Rules</Text>
            <Text style={styles.stepSubtitle}>Step 5 of 5</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Rules & Guidelines</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., Wear proper gym attire. Carry a towel. Re-rack weights after use."
                    placeholderTextColor={COLORS.textSecondary}
                    value={rules}
                    onChangeText={setRules}
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📋 Summary</Text>
                <Text style={styles.summaryItem}>• Name: {name}</Text>
                <Text style={styles.summaryItem}>• Price: ₹{dayPassPrice}/day</Text>
                <Text style={styles.summaryItem}>• Amenities: {selectedAmenities.length} selected</Text>
                <Text style={styles.summaryItem}>• Location: {latitude}, {longitude}</Text>
            </View>
        </View>
    );

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
                    <Text style={styles.headerTitle}>Register Gym</Text>
                </View>

                {renderStepIndicator()}

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </ScrollView>

                {/* Navigation Buttons */}
                <View style={styles.footer}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                            <Text style={styles.prevButtonText}>← Previous</Text>
                        </TouchableOpacity>
                    )}
                    {step < 5 ? (
                        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                            <Text style={styles.nextButtonText}>Next →</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.nextButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.nextButtonText}>Submit for Approval</Text>
                            )}
                        </TouchableOpacity>
                    )}
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
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.border,
    },
    stepDotActive: {
        backgroundColor: COLORS.primary,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: COLORS.border,
    },
    stepLineActive: {
        backgroundColor: COLORS.primary,
    },
    scrollView: {
        flex: 1,
    },
    stepContent: {
        paddingHorizontal: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    stepSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    hint: {
        fontSize: 14,
        color: COLORS.textSecondary,
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
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
    row: {
        flexDirection: 'row',
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
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    summaryItem: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    prevButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    prevButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    nextButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
