export const theme = {
    colors: {
        primary: '#4C8BF5', // Light Blue
        primaryNeon: '#38E0D9', // Neon Cyan
        secondary: '#E5E9F2', // Very Light Gray
        background: '#0B1A33', // Dark Navy
        card: '#FFFFFF',
        text: '#FFFFFF', // Default text (on dark bg)
        textDark: '#0B1A33', // Text on white cards
        textSecondary: '#E5E9F2', // Secondary text (on dark bg)
        textSecondaryDark: '#7F8C8D', // Secondary text (on white cards)
        border: '#E5E9F2',
        error: '#E74C3C',
        success: '#2ECC71',
        white: '#FFFFFF',
        darkNavy: '#0B1A33',
        accent: '#F54C8B', // Pinkish neon
        surface: '#112240', // Lighter Navy for cards/inputs
    },
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
            elevation: 10, // Android glow approximation
            borderRadius: 24, // xl
            paddingVertical: 16, // m
            paddingHorizontal: 24, // l
            alignItems: 'center',
            justifyContent: 'center',
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#4C8BF5',
            borderRadius: 24, // xl
            paddingVertical: 14, // m - 2px border
            paddingHorizontal: 22, // l - 2px border
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
} as const;
