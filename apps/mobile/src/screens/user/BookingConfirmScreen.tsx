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
import { useTheme } from '../../constants';
import { UserStackParamList } from '../../navigation/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'BookingConfirm'>;

export default function BookingConfirmScreen({ route, navigation }: Props) {
    const { colors } = useTheme();
    const { gymId, gymName } = route.params;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

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
            // DEV MODE: Skip payment and create test booking directly
            const bookingResponse = await apiService.bookings.createTestBooking(
                gymId,
                formatDateForAPI(selectedDate)
            );

            // Navigate to success screen
            navigation.navigate('BookingSuccess', {
                bookingId: bookingResponse.data.id,
                gymName,
                bookingDate: formatDateForAPI(selectedDate),
                bookingCode: bookingResponse.data.bookingCode,
                qrCode: bookingResponse.data.qrCode,
            });
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const dates = getAvailableDates();
    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Book Day Pass</Text>
                    <Text style={styles.gymName}>{gymName}</Text>
                </View>

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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's Included</Text>
                    <View style={styles.includesList}>
                        {[
                            'Full gym access for the day',
                            'All equipment & machines',
                            'Locker & shower access',
                            'QR code for easy check-in',
                        ].map((item, index) => (
                            <View key={index} style={styles.includeItem}>
                                <View style={styles.checkCircle}>
                                    <Text style={styles.includeIcon}>✓</Text>
                                </View>
                                <Text style={styles.includeText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

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
                                ? `Proceed - ${formatDate(selectedDate)}`
                                : 'Select a Date'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
    },
    backButton: {
        fontSize: 16,
        color: colors.primary,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    gymName: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    datesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dateCard: {
        width: '13%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dateCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dateDay: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    dateMonth: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    dateTextSelected: {
        color: colors.white,
    },
    todayBadge: {
        backgroundColor: colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    todayText: {
        fontSize: 8,
        color: colors.white,
        fontWeight: '600',
    },
    includesList: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
    },
    includeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    includeIcon: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '700',
    },
    includeText: {
        fontSize: 15,
        color: colors.text,
    },
    noteCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    noteText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    bottomBar: {
        padding: 16,
        paddingBottom: 24,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    proceedButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    proceedButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
