import React, { createContext, useContext, useState, ReactNode } from 'react';
import { theme, darkThemeColors, lightThemeColors, ThemeType, ColorsType } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

interface ThemeContextType {
    theme: ThemeType;
    colors: ColorsType;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    const activeColors = isDarkMode ? darkThemeColors : lightThemeColors;

    const activeTheme: ThemeType = {
        ...theme,
        colors: activeColors,
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ theme: activeTheme, colors: activeColors, isDarkMode, toggleTheme }}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
