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
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useTheme, AMENITIES } from '../../constants';

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
    const { colors, isDark } = useTheme();
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
                'Success!',
                'Your gym has been submitted for approval. You will be notified once it is reviewed.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to register gym');
        } finally {
            setLoading(false);
        }
    };

    const styles = createStyles(colors, isDark);

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
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your gym..."
                    placeholderTextColor={colors.textMuted}
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
                    placeholderTextColor={colors.textMuted}
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

            <View style={styles.hint}>
                <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                <Text style={styles.hintText}>
                    You can get coordinates from Google Maps. Right-click on location → "What's here?"
                </Text>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Latitude *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 23.0300"
                        placeholderTextColor={colors.textMuted}
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
                        placeholderTextColor={colors.textMuted}
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
                    placeholderTextColor={colors.textMuted}
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
                            placeholderTextColor={colors.textMuted}
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

            <View style={styles.hint}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.hintText}>Select all amenities available at your gym</Text>
            </View>

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
                    placeholderTextColor={colors.textMuted}
                    value={rules}
                    onChangeText={setRules}
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Ionicons name="document-text" size={18} color={colors.primary} />
                    <Text style={styles.summaryTitle}>Summary</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Name</Text>
                    <Text style={styles.summaryValue}>{name}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Price</Text>
                    <Text style={styles.summaryValue}>₹{dayPassPrice}/day</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Amenities</Text>
                    <Text style={styles.summaryValue}>{selectedAmenities.length} selected</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Location</Text>
                    <Text style={styles.summaryValue}>{latitude}, {longitude}</Text>
                </View>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Register Gym</Text>
                    <View style={{ width: 40 }} />
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
                            <Ionicons name="arrow-back" size={20} color={colors.text} />
                            <Text style={styles.prevButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    {step < 5 ? (
                        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                            <Text style={styles.nextButtonText}>Next</Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.white} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.nextButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                                    <Text style={styles.nextButtonText}>Submit</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
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
        backgroundColor: colors.border,
    },
    stepDotActive: {
        backgroundColor: colors.primary,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.border,
    },
    stepLineActive: {
        backgroundColor: colors.primary,
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
        color: colors.text,
        marginBottom: 4,
    },
    stepSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 24,
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.primary + '12',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    hintText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    hoursContainer: {
        backgroundColor: colors.surface,
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
        color: colors.text,
        width: 100,
    },
    hourInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    amenityChip: {
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    amenityChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    amenityText: {
        fontSize: 14,
        color: colors.text,
    },
    amenityTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
    summaryCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
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
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textMuted,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    prevButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingVertical: 16,
        gap: 8,
    },
    prevButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    nextButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        gap: 8,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
