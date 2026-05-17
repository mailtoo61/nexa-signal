import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface GlowRingProps {
  size: number;
  color?: string;
  opacity?: number;
  borderWidth?: number;
  style?: ViewStyle;
}

export function GlowRing({
  size,
  color = '#6FE5FF',
  opacity = 0.65,
  borderWidth = 1.5,
  style,
}: GlowRingProps): React.JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          borderWidth,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
  },
});
