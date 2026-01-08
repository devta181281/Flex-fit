import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { apiService } from '../../services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<'USER' | 'OWNER'>('USER');

    const handleSendOTP = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            await apiService.auth.sendOTP(email.toLowerCase().trim(), role);
            navigation.navigate('VerifyOTP', { email: email.toLowerCase().trim(), role });
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Logo/Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>FlexFit</Text>
                        <Text style={styles.tagline}>Find. Book. Workout.</Text>
                    </View>

                    {/* Role Toggle */}
                    <View style={styles.roleToggle}>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'USER' && styles.roleButtonActive]}
                            onPress={() => setRole('USER')}
                        >
                            <Text style={[styles.roleText, role === 'USER' && styles.roleTextActive]}>
                                User
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'OWNER' && styles.roleButtonActive]}
                            onPress={() => setRole('OWNER')}
                        >
                            <Text style={[styles.roleText, role === 'OWNER' && styles.roleTextActive]}>
                                Gym Owner
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSendOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    {/* Info Text */}
                    <Text style={styles.infoText}>
                        We'll send you a one-time password to verify your email
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FF6B35',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 16,
        color: '#888',
        marginTop: 8,
    },
    roleToggle: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: '#FF6B35',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
    },
    roleTextActive: {
        color: '#fff',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    infoText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },
});
