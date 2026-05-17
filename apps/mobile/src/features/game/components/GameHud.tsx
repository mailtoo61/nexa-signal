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
    <GlassPanel style={styles.root}>
      <SignalGlassHighlight
        intensity={1}
        opacity={0.24}
        borderRadius={10}
        verticalOffset={-10}
      />
      <View style={styles.topRow}>
        <HudChip label={tr(locale, 'stability')} value={stability} />
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
    gap: 5,
    overflow: 'hidden',
    borderColor: '#7EAED15A',
    backgroundColor: '#132846AE',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'space-between',
  },
  item: {
    color: '#D5E9FFDE',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  objective: {
    color: '#9EC2E8',
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});
