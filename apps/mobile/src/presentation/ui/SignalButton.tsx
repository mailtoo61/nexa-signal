import React from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { designTokens } from '../../shared/design/tokens';
import { surfaceElevation } from './visualSystem';

interface SignalButtonProps extends PressableProps {
  label: string;
}

export function SignalButton({
  label,
  style,
  ...rest
}: SignalButtonProps): React.JSX.Element {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.button,
        surfaceElevation.medium,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 68,
    minWidth: 276,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.lg,
    borderRadius: designTokens.radii.round,
    borderWidth: 1.4,
    borderColor: '#8BD9FA',
    backgroundColor: '#112B5CE6',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.986 }],
    backgroundColor: '#173063E3',
  },
  text: {
    color: designTokens.colors.textPrimary,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
