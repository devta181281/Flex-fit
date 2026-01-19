import React, { useState, useRef, useEffect } from 'react';
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
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOTP'>;

const OTP_LENGTH = 8;

export default function VerifyOTPScreen({ route, navigation }: Props) {
    const { colors } = useTheme();
    const { email, role } = route.params;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const { setAuth } = useAuthStore();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) {
            const pastedOtp = value.slice(0, OTP_LENGTH).split('');
            const newOtp = [...otp];
            pastedOtp.forEach((char, i) => {
                if (index + i < OTP_LENGTH) {
                    newOtp[index + i] = char;
                }
            });
            setOtp(newOtp);
            inputRefs.current[Math.min(index + pastedOtp.length, OTP_LENGTH - 1)]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== OTP_LENGTH) {
            Alert.alert('Error', 'Please enter the complete OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiService.auth.verifyOTP(email, otpString, role);
            const { user, accessToken, role: userRole } = response.data;
            await setAuth(user, accessToken, userRole);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            await apiService.auth.sendOTP(email, role);
            setCountdown(60);
            Alert.alert('Success', 'OTP sent successfully');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Verify Your Email</Text>
                        <Text style={styles.subtitle}>
                            Enter the 8-digit code sent to{'\n'}
                            <Text style={styles.email}>{email}</Text>
                        </Text>
                    </View>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[styles.otpInput, digit && styles.otpInputFilled]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!isLoading}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                            <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>Change Email</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    email: {
        color: colors.primary,
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    otpInput: {
        width: 38,
        height: 48,
        marginHorizontal: 4,
        backgroundColor: colors.surface,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    otpInputFilled: {
        borderColor: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    resendText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    resendLink: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    resendDisabled: {
        color: colors.textMuted,
    },
    backButton: {
        alignItems: 'center',
    },
    backText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
});
