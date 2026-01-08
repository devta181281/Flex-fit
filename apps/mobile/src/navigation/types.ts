import { UserRole } from '../store/authStore';

// Auth Stack
export type AuthStackParamList = {
    Login: undefined;
    VerifyOTP: { email: string; role: UserRole };
};

// User Tab Navigator
export type UserTabParamList = {
    Home: undefined;
    Bookings: undefined;
    Profile: undefined;
};

// User Stack (inside tabs or modals)
export type UserStackParamList = {
    GymDetail: { gymId: string };
    BookingConfirm: { gymId: string; date: string };
    Payment: { gymId: string; date: string; orderId: string };
    BookingSuccess: { bookingId: string };
    EditProfile: undefined;
};

// Owner Tab Navigator
export type OwnerTabParamList = {
    Dashboard: undefined;
    QRScanner: undefined;
    GymSettings: undefined;
};

// Owner Stack
export type OwnerStackParamList = {
    RegisterGym: undefined;
    EditGym: { gymId: string };
    BookingDetails: { bookingId: string };
};

// Root Stack
export type RootStackParamList = {
    Auth: undefined;
    UserApp: undefined;
    OwnerApp: undefined;
};
