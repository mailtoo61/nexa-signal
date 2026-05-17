import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';
import { GlassPanel } from '../../../presentation/ui/GlassPanel';

interface NodeLegendProps {
  locale: import('@nexa/types').Locale;
  knownTypes: string[];
  collapsed: boolean;
  onToggle: () => void;
}

const typeKeys = ['relay', 'amplifier', 'stabilizer', 'decayer'] as const;

export function NodeLegend({
  locale,
  knownTypes,
  collapsed,
  onToggle,
}: NodeLegendProps) {
  const visibleTypes = typeKeys.filter((type) => knownTypes.includes(type));
  if (visibleTypes.length === 0 && collapsed) return null;

  return (
    <View style={styles.root}>
      <Pressable onPress={onToggle} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {tr(locale, collapsed ? 'legendShow' : 'legendHide')}
        </Text>
      </Pressable>
      {!collapsed ? (
        <View style={styles.chips}>
          {visibleTypes.map((type) => (
            <GlassPanel key={type} compact style={styles.chip}>
              <Text style={styles.chipTitle}>
                {tr(locale, `nodeType_${type}`)}
              </Text>
              <Text style={styles.chipDesc}>
                {tr(locale, `nodeTypeDesc_${type}`)}
              </Text>
            </GlassPanel>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  toggle: {
    alignSelf: 'flex-start',
    backgroundColor: '#0C1730C9',
    borderWidth: 1,
    borderColor: '#3B5E89A0',
    borderRadius: designTokens.radii.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleText: {
    color: '#A6C6F7',
    fontSize: 12,
    fontWeight: '600',
  },
  chips: {
    gap: 6,
  },
  chip: {
    borderRadius: designTokens.radii.md,
  },
  chipTitle: {
    color: designTokens.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipDesc: {
    color: designTokens.colors.textMuted,
    fontSize: 11,
  },
});
