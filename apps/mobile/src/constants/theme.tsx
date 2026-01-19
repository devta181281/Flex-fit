import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme color definitions
export const LightTheme = {
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',

    // Text
    text: '#020617',
    textSecondary: '#475569',
    textMuted: '#64748B',

    // Buttons
    primary: '#202A44',
    primaryHover: '#1A2238',
    secondary: '#F1F5F9',
    secondaryText: '#020617',

    // States
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',

    // Extra
    white: '#FFFFFF',
    black: '#000000',
};

export const DarkTheme = {
    // Backgrounds
    background: '#0B1220',
    surface: '#111827',
    card: '#0F172A',
    border: '#1F2937',

    // Text
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',

    // Buttons
    primary: '#FF6B35',
    primaryHover: '#E55A28',
    secondary: '#1F2937',
    secondaryText: '#F8FAFC',

    // States
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',

    // Extra
    white: '#FFFFFF',
    black: '#000000',
};

export type ThemeColors = typeof LightTheme;
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    colors: ThemeColors;
    isDark: boolean;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@flexfit_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
                    setModeState(savedMode as ThemeMode);
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

    // Determine if dark mode
    const isDark = mode === 'system'
        ? systemColorScheme === 'dark'
        : mode === 'dark';

    const colors = isDark ? DarkTheme : LightTheme;

    const setMode = async (newMode: ThemeMode) => {
        setModeState(newMode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = isDark ? 'light' : 'dark';
        setMode(newMode);
    };

    if (!isLoaded) {
        return null; // Or a loading screen
    }

    return (
        <ThemeContext.Provider value={{ colors, isDark, mode, setMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// For backwards compatibility with existing COLORS usage
export const COLORS = DarkTheme;
