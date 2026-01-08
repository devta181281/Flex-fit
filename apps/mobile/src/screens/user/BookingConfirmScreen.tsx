import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiService } from '../../services/api';
import { COLORS } from '../../constants';

type Props = NativeStackScreenProps<any, 'BookingConfirm'>;

export default function BookingConfirmScreen({ route, navigation }: Props) {
    const { gymId, gymName } = route.params;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    // Generate next 7 days
    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const formatDateForAPI = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const handleProceedToPayment = async () => {
        if (!selectedDate) {
            Alert.alert('Select Date', 'Please select a date for your visit');
            return;
        }

        setLoading(true);
        try {
            // Create payment order
            const response = await apiService.payments.createOrder(
                gymId,
                formatDateForAPI(selectedDate)
            );

            const { orderId, amount, currency } = response.data;

            // Navigate to payment screen
            navigation.navigate('Payment', {
                gymId,
                gymName,
                bookingDate: formatDateForAPI(selectedDate),
                orderId,
                amount,
                currency,
            });
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const dates = getAvailableDates();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Book Day Pass</Text>
                    <Text style={styles.gymName}>{gymName}</Text>
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <Text style={styles.sectionSubtitle}>
                        Choose when you want to visit
                    </Text>

                    <View style={styles.datesContainer}>
                        {dates.map((date, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateCard,
                                    selectedDate?.toDateString() === date.toDateString() &&
                                    styles.dateCardSelected,
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text
                                    style={[
                                        styles.dateDay,
                                        selectedDate?.toDateString() === date.toDateString() &&
                                        styles.dateTextSelected,
                                    ]}
                                >
                                    {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateNumber,
                                        selectedDate?.toDateString() === date.toDateString() &&
                                        styles.dateTextSelected,
                                    ]}
                                >
                                    {date.getDate()}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateMonth,
                                        selectedDate?.toDateString() === date.toDateString() &&
                                        styles.dateTextSelected,
                                    ]}
                                >
                                    {date.toLocaleDateString('en-IN', { month: 'short' })}
                                </Text>
                                {isToday(date) && (
                                    <View style={styles.todayBadge}>
                                        <Text style={styles.todayText}>Today</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* What's Included */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's Included</Text>
                    <View style={styles.includesList}>
                        <View style={styles.includeItem}>
                            <Text style={styles.includeIcon}>✓</Text>
                            <Text style={styles.includeText}>Full gym access for the day</Text>
                        </View>
                        <View style={styles.includeItem}>
                            <Text style={styles.includeIcon}>✓</Text>
                            <Text style={styles.includeText}>All equipment & machines</Text>
                        </View>
                        <View style={styles.includeItem}>
                            <Text style={styles.includeIcon}>✓</Text>
                            <Text style={styles.includeText}>Locker & shower access</Text>
                        </View>
                        <View style={styles.includeItem}>
                            <Text style={styles.includeIcon}>✓</Text>
                            <Text style={styles.includeText}>QR code for easy check-in</Text>
                        </View>
                    </View>
                </View>

                {/* Important Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Important Notes</Text>
                    <View style={styles.noteCard}>
                        <Text style={styles.noteText}>
                            • Show your QR code at the gym reception{'\n'}
                            • Booking is valid only for the selected date{'\n'}
                            • Carry a valid ID proof{'\n'}
                            • Follow gym rules and etiquette
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.proceedButton, !selectedDate && styles.buttonDisabled]}
                    onPress={handleProceedToPayment}
                    disabled={loading || !selectedDate}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.proceedButtonText}>
                            {selectedDate
                                ? `Proceed to Payment - ${formatDate(selectedDate)}`
                                : 'Select a Date'}
                        </Text>
                    )}
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
        marginBottom: 4,
    },
    gymName: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    datesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dateCard: {
        width: '13%',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dateCardSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    dateDay: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    dateMonth: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    dateTextSelected: {
        color: '#fff',
    },
    todayBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    todayText: {
        fontSize: 8,
        color: '#fff',
        fontWeight: '600',
    },
    includesList: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    includeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    includeIcon: {
        fontSize: 16,
        color: COLORS.success,
        marginRight: 12,
    },
    includeText: {
        fontSize: 15,
        color: COLORS.text,
    },
    noteCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
    },
    noteText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    bottomBar: {
        padding: 16,
        paddingBottom: 24,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    proceedButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    proceedButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
