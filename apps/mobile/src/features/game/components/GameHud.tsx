import { StyleSheet, Text, View } from 'react-native';
import { tr } from '../../../shared/i18n/tr';
import { GlassPanel } from '../../../presentation/ui/GlassPanel';
import { HudChip } from '../../../presentation/ui/HudChip';
import { SignalGlassHighlight } from '../../../presentation/ui/SignalGlassHighlight';

interface GameHudProps {
  locale: import('@nexa/types').Locale;
  stability: number;
  signalStrength: number;
  score: number;
  survivalSeconds: number;
}

export function GameHud({
  locale,
  stability,
  signalStrength,
  score,
  survivalSeconds,
}: GameHudProps) {
  const elapsed = `${survivalSeconds}s`;
  return (
    <GlassPanel pointerEvents="none" style={styles.root}>
      <SignalGlassHighlight
        intensity={0.9}
        opacity={0.18}
        borderRadius={16}
        verticalOffset={-6}
      />
      <View style={styles.topRow}>
        <HudChip
          label={tr(locale, 'stability')}
          value={stability}
          style={styles.stabilityChip}
        />
        <Text style={styles.objective}>{tr(locale, 'keepSignalAlive')}</Text>
      </View>
      <View style={styles.secondaryRow}>
        <Text
          style={styles.item}
        >{`${tr(locale, 'signalStrength').toUpperCase()} ${signalStrength}`}</Text>
        <Text
          style={styles.item}
        >{`${tr(locale, 'score').toUpperCase()} ${score}`}</Text>
        <Text
          style={styles.item}
        >{`${tr(locale, 'survivalTime').toUpperCase()} ${elapsed}`}</Text>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
    overflow: 'hidden',
    borderColor: '#92C9EA3A',
    backgroundColor: '#10253FAE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stabilityChip: {
    borderRadius: 14,
    backgroundColor: '#10365852',
    borderColor: '#A8D7F51F',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  item: {
    color: '#D7EAFFF0',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.45,
  },
  objective: {
    color: '#A7C9E8D4',
    fontSize: 10,
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },
});
