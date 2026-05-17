import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SignalGlassHighlightProps {
  intensity?: number;
  opacity?: number;
  borderRadius?: number;
  verticalOffset?: number;
}

export function SignalGlassHighlight({
  intensity = 1,
  opacity = 0.2,
  borderRadius = 14,
  verticalOffset = -8,
}: SignalGlassHighlightProps): React.JSX.Element {
  const clampedIntensity = Math.max(0.2, Math.min(1.6, intensity));
  const clampedOpacity = Math.max(0.04, Math.min(0.34, opacity));

  return (
    <View
      pointerEvents="none"
      style={[
        styles.root,
        {
          borderRadius,
          top: verticalOffset,
          opacity: clampedOpacity,
        },
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(0,0,0,0)',
          `rgba(122,229,255,${0.08 * clampedIntensity})`,
          `rgba(162,134,255,${0.1 * clampedIntensity})`,
          `rgba(122,229,255,${0.06 * clampedIntensity})`,
          'rgba(0,0,0,0)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.band}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          `rgba(184,236,255,${0.08 * clampedIntensity})`,
          `rgba(127,209,255,${0.03 * clampedIntensity})`,
          'rgba(0,0,0,0)',
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.falloff}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    overflow: 'hidden',
  },
  band: {
    ...StyleSheet.absoluteFillObject,
  },
  falloff: {
    ...StyleSheet.absoluteFillObject,
  },
});
