/**
 * Essor Design System Tokens
 * 
 * Central source of truth for all design values.
 * Ensures consistency across the entire application.
 * Based on Essor Brand Book v1.0 (May 2026)
 */

export const designTokens = {
  /**
   * Colors - Brand Palette
   */
  colors: {
    // Primary
    brand: {
      blue: '#2563EB',        // Electric Blue
      blueDark: '#1E40AF',    // Darker blue for gradients
      blueLight: '#60A5FA',   // Lighter blue
      bluePale: '#DBEAFE',    // Very light blue
      blueWash: '#EFF6FF',    // Almost white blue
    },
    coral: {
      base: '#FF6B4A',        // Coral accent
      dark: '#E25537',        // Darker coral
      light: '#FF8A6E',       // Lighter coral
      pale: '#FFE2D9',        // Very light coral
    },
    ink: {
      base: '#0B1220',        // Deep ink (primary text)
      medium: '#1E293B',      // Medium ink
      light: '#475569',       // Light ink
    },
    // Supporting colors
    lavender: {
      base: '#7C5CFF',
      dark: '#5B3FE6',
      light: '#A78BFA',
      pale: '#EDE9FE',
    },
    sky: {
      base: '#22D3EE',
      dark: '#0891B2',
      pale: '#CFFAFE',
    },
    // UI colors
    mist: '#F3F5F9',          // Light background
    white: '#FFFFFF',
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  /**
   * Typography
   */
  typography: {
    fontFamily: {
      display: '"Manrope", "Inter", system-ui, -apple-system, sans-serif',
      body: '"Inter", system-ui, -apple-system, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.1',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * Spacing Scale
   */
  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
  },

  /**
   * Border Radius
   */
  radius: {
    none: '0',
    sm: '0.375rem',    // 6px
    base: '0.5rem',    // 8px
    md: '0.75rem',     // 12px
    lg: '1rem',        // 16px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    '3xl': '3rem',     // 48px
    full: '9999px',
  },

  /**
   * Shadows
   */
  shadow: {
    sm: '0 1px 2px 0 rgb(11 18 32 / 0.05)',
    base: '0 1px 3px 0 rgb(11 18 32 / 0.1), 0 1px 2px -1px rgb(11 18 32 / 0.1)',
    md: '0 4px 6px -1px rgb(11 18 32 / 0.1), 0 2px 4px -2px rgb(11 18 32 / 0.1)',
    lg: '0 10px 15px -3px rgb(11 18 32 / 0.1), 0 4px 6px -4px rgb(11 18 32 / 0.1)',
    xl: '0 20px 25px -5px rgb(11 18 32 / 0.1), 0 8px 10px -6px rgb(11 18 32 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(11 18 32 / 0.25)',
    // Branded shadows
    brand: '0 8px 30px -10px rgb(37 99 235 / 0.3)',
    brandLg: '0 20px 60px -20px rgb(37 99 235 / 0.4)',
  },

  /**
   * Card Styles - Standardized
   */
  card: {
    base: {
      background: '#FFFFFF',
      border: '1px solid rgb(11 18 32 / 0.08)',
      borderRadius: '1.5rem',  // 24px
      padding: '2rem',          // 32px
      shadow: '0 4px 6px -1px rgb(11 18 32 / 0.1), 0 2px 4px -2px rgb(11 18 32 / 0.1)',
    },
    hover: {
      borderColor: 'rgb(37 99 235 / 0.3)',
      shadow: '0 20px 25px -5px rgb(11 18 32 / 0.1), 0 8px 10px -6px rgb(11 18 32 / 0.1)',
      transform: 'translateY(-2px)',
    },
    dark: {
      background: '#0B1220',
      border: '1px solid rgb(255 255 255 / 0.1)',
    },
  },

  /**
   * Button Styles - Standardized
   */
  button: {
    primary: {
      background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
      color: '#FFFFFF',
      padding: '1rem 2rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      shadow: '0 8px 30px -10px rgb(37 99 235 / 0.4)',
      hover: {
        shadow: '0 20px 60px -20px rgb(37 99 235 / 0.5)',
        transform: 'translateY(-2px) scale(1.02)',
      },
    },
    secondary: {
      background: '#FFFFFF',
      color: '#0B1220',
      border: '1px solid rgb(11 18 32 / 0.15)',
      padding: '1rem 2rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      shadow: '0 1px 3px 0 rgb(11 18 32 / 0.1)',
      hover: {
        borderColor: 'rgb(37 99 235 / 0.3)',
        background: '#F8FAFC',
      },
    },
    ghost: {
      background: 'transparent',
      color: '#0B1220',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      hover: {
        background: 'rgb(37 99 235 / 0.05)',
      },
    },
  },

  /**
   * Layout
   */
  layout: {
    container: {
      maxWidth: '1280px',
      padding: {
        mobile: '1rem',
        tablet: '2rem',
        desktop: '3rem',
      },
    },
    section: {
      padding: {
        mobile: '3rem 0',
        tablet: '5rem 0',
        desktop: '8rem 0',
      },
    },
  },

  /**
   * Animation
   */
  animation: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  /**
   * Breakpoints
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * Utility function to get design token values
 */
export function getToken(path: string): string {
  const keys = path.split('.');
  let value: any = designTokens;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return '';
  }
  
  return value;
}

/**
 * CSS-in-JS helper for card styles
 */
export const cardStyles = {
  base: `
    background: ${designTokens.card.base.background};
    border: ${designTokens.card.base.border};
    border-radius: ${designTokens.card.base.borderRadius};
    padding: ${designTokens.card.base.padding};
    box-shadow: ${designTokens.card.base.shadow};
    transition: all ${designTokens.animation.duration.base} ${designTokens.animation.easing.default};
  `,
  hover: `
    border-color: ${designTokens.card.hover.borderColor};
    box-shadow: ${designTokens.card.hover.shadow};
    transform: ${designTokens.card.hover.transform};
  `,
};

/**
 * Tailwind class helpers
 */
export const tw = {
  card: {
    base: 'bg-white rounded-3xl p-8 border border-ink/8 shadow-md transition-all duration-250',
    hover: 'hover:border-brand/30 hover:shadow-xl hover:-translate-y-0.5',
  },
  button: {
    primary: 'bg-gradient-to-br from-brand to-brand-dk text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-250',
    secondary: 'bg-white text-ink border border-ink/15 px-8 py-4 rounded-full text-sm font-semibold shadow-sm hover:border-brand/30 hover:bg-mist transition-all duration-250',
    ghost: 'bg-transparent text-ink px-6 py-3 text-sm font-semibold hover:bg-brand/5 rounded-lg transition-all duration-250',
  },
  section: {
    base: 'py-12 sm:py-20 lg:py-32',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },
};

export default designTokens;
