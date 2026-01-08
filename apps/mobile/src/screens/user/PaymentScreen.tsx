import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

type Props = NativeStackScreenProps<any, 'Payment'>;

interface PaymentParams {
    gymId: string;
    gymName: string;
    bookingDate: string;
    orderId: string;
    amount: number;
    currency: string;
}

export default function PaymentScreen({ route, navigation }: Props) {
    const params = route.params as PaymentParams;
    const { gymId, gymName, bookingDate, orderId, amount, currency } = params;

    const [loading, setLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState('');

    const razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const generateCheckoutHTML = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                <style>
                    body {
                        background: #0F0F0F;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .loading {
                        color: #888;
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="loading">Opening payment gateway...</div>
                <script>
                    var options = {
                        "key": "${razorpayKeyId}",
                        "amount": "${amount * 100}",
                        "currency": "${currency}",
                        "name": "FlexFit",
                        "description": "Day Pass - ${gymName}",
                        "order_id": "${orderId}",
                        "handler": function (response) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'success',
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            }));
                        },
                        "modal": {
                            "ondismiss": function() {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'dismissed'
                                }));
                            }
                        },
                        "theme": {
                            "color": "#FF6B35"
                        }
                    };
                    var rzp = new Razorpay(options);
                    rzp.on('payment.failed', function (response) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'failed',
                            error: response.error
                        }));
                    });
                    rzp.open();
                </script>
            </body>
            </html>
        `;
    };

    const handleWebViewMessage = async (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'success') {
                setShowWebView(false);
                setLoading(true);

                // Verify payment
                await apiService.payments.verify({
                    razorpayOrderId: data.razorpay_order_id,
                    razorpayPaymentId: data.razorpay_payment_id,
                    razorpaySignature: data.razorpay_signature,
                    amount: amount,
                });

                // Create booking
                const bookingResponse = await apiService.bookings.create({
                    gymId,
                    bookingDate,
                    paymentId: data.razorpay_payment_id,
                });

                setLoading(false);

                // Navigate to success screen
                navigation.replace('BookingSuccess', {
                    bookingId: bookingResponse.data.id,
                    gymName,
                    bookingDate,
                    bookingCode: bookingResponse.data.bookingCode,
                    qrCode: bookingResponse.data.qrCode,
                });
            } else if (data.type === 'failed') {
                setShowWebView(false);
                Alert.alert(
                    'Payment Failed',
                    data.error?.description || 'Your payment could not be processed. Please try again.',
                    [{ text: 'OK' }]
                );
            } else if (data.type === 'dismissed') {
                setShowWebView(false);
            }
        } catch (error: any) {
            setShowWebView(false);
            setLoading(false);
            Alert.alert('Error', error.response?.data?.message || 'Payment verification failed');
        }
    };

    const handlePayNow = () => {
        setShowWebView(true);
    };

    if (showWebView) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <WebView
                    source={{ html: generateCheckoutHTML() }}
                    onMessage={handleWebViewMessage}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webviewLoading}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.webviewLoadingText}>Loading payment gateway...</Text>
                        </View>
                    )}
                />
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Processing your payment...</Text>
                    <Text style={styles.loadingSubtext}>Please don't close the app</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Payment</Text>
            </View>

            {/* Payment Summary */}
            <View style={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Gym</Text>
                        <Text style={styles.summaryValue}>{gymName}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>{formatDate(bookingDate)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Pass Type</Text>
                        <Text style={styles.summaryValue}>Day Pass</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{amount}</Text>
                    </View>
                </View>

                {/* Secure Payment Info */}
                <View style={styles.secureInfo}>
                    <Text style={styles.secureIcon}>🔒</Text>
                    <Text style={styles.secureText}>
                        Secured by Razorpay. Your payment information is encrypted and secure.
                    </Text>
                </View>
            </View>

            {/* Pay Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
                    <Text style={styles.payButtonText}>Pay ₹{amount}</Text>
                </TouchableOpacity>
            </View>
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
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    webview: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    webviewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    webviewLoadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    header: {
        padding: 20,
    },
    backButton: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
    },
    secureInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    secureIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    secureText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    bottomBar: {
        padding: 20,
        paddingBottom: 24,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    payButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
