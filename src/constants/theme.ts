export const palette = {
    primary: '#4C8BF5', // Light Blue
    primaryNeon: '#38E0D9', // Neon Cyan
    secondary: '#E5E9F2', // Very Light Gray
    darkNavy: '#0B1A33', // Dark Navy
    surfaceDark: '#112240', // Lighter Navy
    surfaceLight: '#FFFFFF', // White
    backgroundLight: '#F5F7FA', // Light Gray-Blue
    textDark: '#FFFFFF',
    textLight: '#0B1A33',
    textSecondaryDark: '#E5E9F2',
    textSecondaryLight: '#7F8C8D',
    error: '#E74C3C',
    success: '#2ECC71',
    white: '#FFFFFF',
    accent: '#F54C8B',
};

export const darkThemeColors = {
    primary: palette.primary,
    primaryNeon: palette.primaryNeon,
    secondary: palette.secondary,
    background: palette.darkNavy,
    card: palette.white,
    text: palette.textDark,
    textDark: palette.darkNavy, // Text on white cards
    textSecondary: palette.textSecondaryDark,
    textSecondaryDark: palette.textSecondaryLight,
    border: palette.secondary,
    error: palette.error,
    success: palette.success,
    white: palette.white,
    darkNavy: palette.darkNavy,
    accent: palette.accent,
    surface: palette.surfaceDark,
};

export const lightThemeColors = {
    primary: palette.primary,
    primaryNeon: '#00B8D4', // Slightly darker cyan for visibility on light
    secondary: '#BDC3C7',
    background: palette.backgroundLight,
    card: palette.white,
    text: palette.textLight,
    textDark: palette.darkNavy,
    textSecondary: palette.textSecondaryLight,
    textSecondaryDark: palette.textSecondaryLight,
    border: '#BDC3C7',
    error: palette.error,
    success: palette.success,
    white: palette.white,
    darkNavy: palette.darkNavy,
    accent: palette.accent,
    surface: palette.surfaceLight,
};

// Default export remains for backward compatibility during refactor, defaulting to Dark
export const theme = {
    colors: darkThemeColors,
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 4,
        m: 8,
        l: 16,
        xl: 24,
    },
    typography: {
        h1: {
            fontSize: 28,
            fontWeight: 'bold',
        },
        h2: {
            fontSize: 24,
            fontWeight: '600',
        },
        body: {
            fontSize: 16,
            fontWeight: 'normal',
        },
        caption: {
            fontSize: 14,
            color: '#7F8C8D',
        },
    },
    buttonVariants: {
        neon: {
            backgroundColor: '#4C8BF5',
            shadowColor: '#4C8BF5',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 10,
            borderRadius: 24,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#4C8BF5',
            borderRadius: 24,
            paddingVertical: 14,
            paddingHorizontal: 22,
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
} as const;

export type ThemeType = typeof theme;
export type ColorsType = typeof darkThemeColors;
