import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../constants';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface ProfileData {
    name: string;
    phone: string;
    age: string;
    gender: string;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function EditProfileScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const { user, setUser } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [formData, setFormData] = useState<ProfileData>({
        name: '',
        phone: '',
        age: '',
        gender: '',
    });

    const styles = createStyles(colors, isDark);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await apiService.users.getProfile();
            const profile = response.data;
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                age: profile.age?.toString() || '',
                gender: profile.gender || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Validation Error', 'Please enter your name');
            return;
        }

        const ageNum = parseInt(formData.age);
        if (formData.age && (isNaN(ageNum) || ageNum < 13 || ageNum > 120)) {
            Alert.alert('Validation Error', 'Please enter a valid age (13-120)');
            return;
        }

        setSaving(true);
        try {
            await apiService.users.updateProfile({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                age: formData.age ? parseInt(formData.age) : null,
                gender: formData.gender || null,
            });

            // Update the auth store with new user data
            if (user) {
                setUser({ ...user, name: formData.name.trim() });
            }

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof ProfileData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {formData.name.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.changeAvatarButton}>
                                <Ionicons name="camera" size={16} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.avatarHint}>Tap to change photo</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={colors.textMuted}
                                    value={formData.name}
                                    onChangeText={(text) => updateField('name', text)}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor={colors.textMuted}
                                    value={formData.phone}
                                    onChangeText={(text) => updateField('phone', text)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Age</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Age"
                                        placeholderTextColor={colors.textMuted}
                                        value={formData.age}
                                        onChangeText={(text) => updateField('age', text.replace(/[^0-9]/g, ''))}
                                        keyboardType="number-pad"
                                        maxLength={3}
                                    />
                                </View>
                            </View>

                            <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
                                <Text style={styles.inputLabel}>Gender</Text>
                                <TouchableOpacity
                                    style={styles.inputContainer}
                                    onPress={() => setShowGenderPicker(!showGenderPicker)}
                                >
                                    <Ionicons name="people-outline" size={20} color={colors.textMuted} />
                                    <Text style={[styles.input, !formData.gender && { color: colors.textMuted }]}>
                                        {formData.gender || 'Select gender'}
                                    </Text>
                                    <Ionicons
                                        name={showGenderPicker ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showGenderPicker && (
                            <View style={styles.genderPicker}>
                                {GENDER_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.genderOption,
                                            formData.gender === option && styles.genderOptionSelected
                                        ]}
                                        onPress={() => {
                                            updateField('gender', option);
                                            setShowGenderPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.genderOptionText,
                                            formData.gender === option && styles.genderOptionTextSelected
                                        ]}>
                                            {option}
                                        </Text>
                                        {formData.gender === option && (
                                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Email (Read-only) */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={[styles.inputContainer, styles.inputDisabled]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                                <Text style={styles.inputDisabledText}>{user?.email || 'N/A'}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                </View>
                            </View>
                            <Text style={styles.inputHint}>Email cannot be changed</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        color: colors.textMuted,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
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
    saveButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: 70,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.primary,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.primary,
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.background,
    },
    avatarHint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 12,
    },
    formSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.2 : 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: isDark ? 0 : 1,
            },
        }),
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        paddingVertical: 0,
    },
    inputDisabled: {
        backgroundColor: colors.background,
        borderColor: colors.border,
    },
    inputDisabledText: {
        flex: 1,
        fontSize: 15,
        color: colors.textSecondary,
    },
    inputHint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 6,
        marginLeft: 4,
    },
    verifiedBadge: {
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
    },
    genderPicker: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginTop: -8,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    genderOptionSelected: {
        backgroundColor: colors.primary + '10',
    },
    genderOptionText: {
        fontSize: 15,
        color: colors.text,
    },
    genderOptionTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
});
