import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { GlassPanel } from './GlassPanel';

interface HudChipProps extends ViewProps {
  label: string;
  value?: string | number;
}

export function HudChip({
  label,
  value,
  style,
  ...rest
}: HudChipProps): React.JSX.Element {
  return (
    <GlassPanel compact style={[styles.root, style]} {...rest}>
      <Text style={styles.label}>{label}</Text>
      {value !== undefined ? <Text style={styles.value}>{value}</Text> : null}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },
  label: {
    color: '#B7D6FFD9',
    fontSize: 10,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    color: '#E5F3FFEB',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
