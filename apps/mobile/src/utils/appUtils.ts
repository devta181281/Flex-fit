import { Alert, Share, Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as Haptics from 'expo-haptics';

// App store links (update these with actual app store URLs when published)
const APP_STORE_LINK = 'https://apps.apple.com/app/flexfit/id123456789';
const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.flexfit.app';
const APP_DOWNLOAD_LINK = Platform.OS === 'ios' ? APP_STORE_LINK : PLAY_STORE_LINK;

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    try {
        switch (type) {
            case 'light':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'success':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'warning':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
            case 'error':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
        }
    } catch (error) {
        // Haptics not available on this device
        console.log('Haptics not available');
    }
};

/**
 * Request app store review (non-intrusive)
 */
export const requestReview = async () => {
    try {
        const hasAction = await StoreReview.hasAction();
        if (hasAction) {
            await StoreReview.requestReview();
            await triggerHaptic('success');
        } else {
            // Fallback: open app store link
            openAppStoreLink();
        }
    } catch (error) {
        console.error('Error requesting review:', error);
        // Fallback to opening store link
        openAppStoreLink();
    }
};

/**
 * Open app store link directly
 */
export const openAppStoreLink = () => {
    const url = Platform.OS === 'ios' ? APP_STORE_LINK : PLAY_STORE_LINK;
    Linking.openURL(url).catch((err) => {
        console.error('Error opening store link:', err);
        Alert.alert('Error', 'Could not open app store');
    });
};

/**
 * Share app with friends
 */
export const shareApp = async (isOwner: boolean = false) => {
    try {
        await triggerHaptic('light');

        const message = isOwner
            ? `🏋️ I use FlexFit to manage my gym and receive day pass bookings! Download it now: ${APP_DOWNLOAD_LINK}`
            : `🏋️ I found this amazing app for booking gym day passes! Try FlexFit: ${APP_DOWNLOAD_LINK}`;

        const result = await Share.share({
            message,
            title: 'Share FlexFit',
        });

        if (result.action === Share.sharedAction) {
            await triggerHaptic('success');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        Alert.alert('Error', 'Could not share the app');
    }
};

/**
 * Show rate app prompt with dialog
 */
export const showRateAppDialog = () => {
    triggerHaptic('light');

    Alert.alert(
        'Enjoying FlexFit?',
        'Would you like to rate us on the app store? Your feedback helps us improve!',
        [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Rate App', onPress: requestReview },
        ]
    );
};

/**
 * Show share app dialog
 */
export const showShareAppDialog = (isOwner: boolean = false) => {
    triggerHaptic('light');

    Alert.alert(
        'Share FlexFit',
        'Share this app with your friends and help them discover awesome gyms!',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share', onPress: () => shareApp(isOwner) },
        ]
    );
};
