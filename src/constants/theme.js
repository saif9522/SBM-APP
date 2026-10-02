/**
 * Design tokens for the whole app.
 *
 * Direction (from brief): India-green primary, calm white / light-gray
 * surfaces, restraint over colour. The one accent (saffron) is reserved
 * for genuinely urgent/emergency semantics — never decoration.
 *
 * Status colours are copied verbatim from the Django models' status_color()
 * so the app and the website always agree on what a status looks like.
 */

export const colors = {
  // Brand
  primary: '#138808',        // India green (brief-specified)
  primaryDark: '#0E6606',
  primaryLight: '#E7F4E6',   // tinted surface / selected states
  primarySoft: '#F2F9F1',

  // Accent — used ONLY for emergency/urgent (ambulance, urgent blood)
  accent: '#FF6B00',         // saffron
  accentLight: '#FFF1E6',

  // Neutrals
  bg: '#EFF6ED',             // app background (soft green tint, theme jaisa)
  surface: '#FFFFFF',        // cards
  surfaceAlt: '#FAFAFA',

  text: '#1A1D1A',           // primary text (not pure black)
  textMuted: '#5B615B',
  textFaint: '#9AA09A',
  onPrimary: '#FFFFFF',

  border: '#E6E8E6',
  divider: '#EFF1EF',

  // Semantic (aligned with backend status_color())
  pending: '#FF6B00',
  processing: '#0047AB',
  success: '#138808',
  danger: '#D32F2F',
  warning: '#F0A500',
  info: '#0047AB',

  overlay: 'rgba(20, 25, 20, 0.45)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const typography = {
  // sizes
  h1: 26,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
  // weights (RN accepts string weights)
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadow = {
  // Cross-platform elevation. iOS uses shadow*, Android uses elevation.
  card: {
    shadowColor: '#0B120B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B120B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  none: {
    shadowColor: 'transparent',
    elevation: 0,
  },
};

export default { colors, spacing, radius, typography, shadow };
