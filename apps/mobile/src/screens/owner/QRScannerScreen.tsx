import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

interface ValidationResult {
    valid: boolean;
    message: string;
    booking?: any;
}

interface Gym {
    id: string;
    name: string;
}

export default function QRScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loadingGyms, setLoadingGyms] = useState(true);

    const scanLineAnim = useRef(new Animated.Value(0)).current;

    // Fetch owner's gyms on mount
    useEffect(() => {
        fetchOwnerGyms();
    }, []);

    // Animate scan line
    useEffect(() => {
        if (!scanned && !showManualInput) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanLineAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [scanned, showManualInput]);

    const fetchOwnerGyms = async () => {
        try {
            const response = await apiService.gyms.getMyGyms();
            const ownerGyms = response.data.filter((g: any) => g.status === 'APPROVED');
            setGyms(ownerGyms);
            if (ownerGyms.length === 1) {
                setSelectedGym(ownerGyms[0]);
            }
        } catch (error) {
            console.error('Failed to fetch gyms:', error);
            Alert.alert('Error', 'Failed to load your gyms');
        } finally {
            setLoadingGyms(false);
        }
    };

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        if (scanned || loading) return;
        setScanned(true);
        await validateBookingCode(data);
    };

    const validateBookingCode = async (code: string) => {
        if (!selectedGym) {
            Alert.alert('Select Gym', 'Please select a gym first');
            setScanned(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.bookings.validateQR(selectedGym.id, code);
            setResult(response.data);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Validation failed';
            setResult({
                valid: false,
                message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async () => {
        const code = manualCode.trim().toUpperCase();
        if (!code) {
            Alert.alert('Error', 'Please enter a booking code');
            return;
        }
        setScanned(true);
        await validateBookingCode(code);
    };

    const resetScanner = () => {
        setScanned(false);
        setResult(null);
        setManualCode('');
        setShowManualInput(false);
    };

    // Permission loading
    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    // Loading gyms
    if (loadingGyms) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading your gyms...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // No gyms
    if (gyms.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.noGymsIcon}>🏋️</Text>
                    <Text style={styles.noGymsTitle}>No Approved Gyms</Text>
                    <Text style={styles.noGymsText}>
                        You need at least one approved gym to scan QR codes.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.permissionIcon}>📷</Text>
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>
                        Allow camera access to scan QR codes
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.manualButton}
                        onPress={() => setShowManualInput(true)}
                    >
                        <Text style={styles.manualButtonText}>Enter Code Manually</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Result screen
    if (result) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.resultContainer}>
                    <View
                        style={[
                            styles.resultCard,
                            result.valid ? styles.successCard : styles.errorCard,
                        ]}
                    >
                        <Text style={styles.resultIcon}>{result.valid ? '✅' : '❌'}</Text>
                        <Text style={styles.resultTitle}>
                            {result.valid ? 'Check-in Successful!' : 'Invalid Booking'}
                        </Text>
                        <Text style={styles.resultMessage}>{result.message}</Text>

                        {result.booking && (
                            <View style={styles.bookingDetails}>
                                <Text style={styles.bookingCode}>{result.booking.bookingCode}</Text>
                                {result.booking.user && (
                                    <>
                                        <Text style={styles.userName}>
                                            {result.booking.user.name || 'Guest'}
                                        </Text>
                                        <Text style={styles.userEmail}>
                                            {result.booking.user.email}
                                        </Text>
                                    </>
                                )}
                                <Text style={styles.bookingDate}>
                                    {new Date(result.booking.bookingDate).toLocaleDateString('en-IN', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                    })}
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
                        <Text style={styles.scanAgainText}>Scan Another</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Manual input screen
    if (showManualInput) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.manualContainer}>
                    <Text style={styles.manualTitle}>Enter Booking Code</Text>
                    <Text style={styles.manualSubtitle}>
                        Enter the 10-character booking code (e.g., FLX-ABC123)
                    </Text>

                    {gyms.length > 1 && (
                        <View style={styles.gymSelector}>
                            <Text style={styles.gymSelectorLabel}>Select Gym:</Text>
                            <View style={styles.gymButtons}>
                                {gyms.map((gym) => (
                                    <TouchableOpacity
                                        key={gym.id}
                                        style={[
                                            styles.gymButton,
                                            selectedGym?.id === gym.id && styles.gymButtonActive,
                                        ]}
                                        onPress={() => setSelectedGym(gym)}
                                    >
                                        <Text
                                            style={[
                                                styles.gymButtonText,
                                                selectedGym?.id === gym.id && styles.gymButtonTextActive,
                                            ]}
                                        >
                                            {gym.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <TextInput
                        style={styles.codeInput}
                        placeholder="FLX-XXXXXX"
                        placeholderTextColor="#666"
                        value={manualCode}
                        onChangeText={setManualCode}
                        autoCapitalize="characters"
                        maxLength={10}
                    />

                    <TouchableOpacity
                        style={[styles.validateButton, (!manualCode || !selectedGym) && styles.disabledButton]}
                        onPress={handleManualSubmit}
                        disabled={!manualCode || !selectedGym || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.validateButtonText}>Validate Code</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setShowManualInput(false)}
                    >
                        <Text style={styles.switchButtonText}>📷 Use Camera Instead</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Camera scanner
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scan QR Code</Text>
                {selectedGym && (
                    <Text style={styles.headerSubtitle}>{selectedGym.name}</Text>
                )}
            </View>

            {/* Gym Selector if multiple gyms */}
            {gyms.length > 1 && (
                <View style={styles.gymSelectorRow}>
                    {gyms.map((gym) => (
                        <TouchableOpacity
                            key={gym.id}
                            style={[
                                styles.gymChip,
                                selectedGym?.id === gym.id && styles.gymChipActive,
                            ]}
                            onPress={() => setSelectedGym(gym)}
                        >
                            <Text
                                style={[
                                    styles.gymChipText,
                                    selectedGym?.id === gym.id && styles.gymChipTextActive,
                                ]}
                            >
                                {gym.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Camera View */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    {/* Scanner overlay */}
                    <View style={styles.overlay}>
                        <View style={styles.scannerFrame}>
                            {/* Corner markers */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />

                            {/* Animated scan line */}
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                        transform: [
                                            {
                                                translateY: scanLineAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, SCANNER_SIZE - 4],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </CameraView>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Validating...</Text>
                    </View>
                )}
            </View>

            {/* Manual entry button */}
            <TouchableOpacity
                style={styles.manualEntryButton}
                onPress={() => setShowManualInput(true)}
            >
                <Text style={styles.manualEntryText}>⌨️ Enter Code Manually</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 4,
    },
    gymSelectorRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    gymChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gymChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    gymChipText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    gymChipTextActive: {
        color: '#fff',
    },
    cameraContainer: {
        flex: 1,
        marginHorizontal: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scannerFrame: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 12,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 12,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 12,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 12,
    },
    scanLine: {
        position: 'absolute',
        left: 4,
        right: 4,
        height: 2,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    manualEntryButton: {
        margin: 16,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    manualEntryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Permission styles
    permissionIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    manualButton: {
        marginTop: 16,
        paddingVertical: 14,
    },
    manualButtonText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    // No gyms styles
    noGymsIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    noGymsTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    noGymsText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    // Manual input styles
    manualContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    manualTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    manualSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    gymSelector: {
        marginBottom: 24,
    },
    gymSelectorLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    gymButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gymButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gymButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    gymButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    gymButtonTextActive: {
        color: '#fff',
    },
    codeInput: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 18,
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 4,
        fontWeight: '700',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
    },
    validateButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    validateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    switchButton: {
        marginTop: 24,
        padding: 16,
        alignItems: 'center',
    },
    switchButtonText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    // Result styles
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    resultCard: {
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
    },
    successCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    errorCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    resultIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    resultMessage: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    bookingDetails: {
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    bookingCode: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 2,
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    bookingDate: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    scanAgainButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    scanAgainText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
