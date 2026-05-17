import { StyleSheet } from 'react-native';
import { designTokens } from '../../shared/design/tokens';

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export const surfaceElevation = StyleSheet.create({
  low: {
    shadowColor: '#63DDFF',
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },
  medium: {
    shadowColor: '#63DDFF',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
});

export const panelStyles = StyleSheet.create({
  glass: {
    backgroundColor: '#0C1730B8',
    borderWidth: 1,
    borderColor: '#3B5F8A66',
    borderRadius: designTokens.radii.lg,
  },
  divider: {
    borderColor: '#4E77A944',
    borderBottomWidth: 1,
  },
});
