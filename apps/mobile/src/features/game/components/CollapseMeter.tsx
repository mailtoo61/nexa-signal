import { StyleSheet, Text, View } from 'react-native';
import { engineTuning } from '@nexa/game-engine';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';
import { GlassPanel } from '../../../presentation/ui/GlassPanel';
import { SignalGlassHighlight } from '../../../presentation/ui/SignalGlassHighlight';

interface CollapseMeterProps {
  locale: import('@nexa/types').Locale;
  stability: number;
}

export function CollapseMeter({ locale, stability }: CollapseMeterProps) {
  const warning = stability <= engineTuning.thresholds.collapseWarning;
  const danger = stability <= engineTuning.thresholds.collapseCritical;
  const widthPct = `${Math.max(0, Math.min(100, stability))}%` as const;
  const stableValue = Math.max(0, Math.min(100, Math.round(stability)));

  return (
    <GlassPanel compact style={styles.root}>
      <SignalGlassHighlight
        intensity={0.86}
        opacity={0.14}
        borderRadius={10}
        verticalOffset={-10}
      />
      <View style={styles.headerRow}>
        <Text style={styles.label}>{tr(locale, 'signalRisk')}</Text>
        <Text style={styles.value}>{stableValue}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: widthPct },
            warning && styles.warning,
            danger && styles.danger,
          ]}
        />
      </View>
      {warning ? (
        <Text style={[styles.text, danger && styles.dangerText]}>
          {tr(locale, danger ? 'signalLost' : 'signalFading')}
        </Text>
      ) : null}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#9DC2F4DB',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    color: '#CBE3FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1D2F53D0',
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: '#6EF2FFE6',
  },
  warning: { backgroundColor: '#F5CC71' },
  danger: { backgroundColor: '#F07B95' },
  text: { color: '#F1CC7D', fontSize: 11, fontWeight: '500' },
  dangerText: { color: '#F0A1B2' },
});
