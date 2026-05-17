import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { panelStyles } from './visualSystem';

interface GlassPanelProps extends ViewProps {
  compact?: boolean;
}

export function GlassPanel({
  style,
  compact = false,
  children,
  ...rest
}: GlassPanelProps): React.JSX.Element {
  return (
    <View
      {...rest}
      style={[
        panelStyles.glass,
        compact ? styles.compact : styles.regular,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  regular: {
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
});
