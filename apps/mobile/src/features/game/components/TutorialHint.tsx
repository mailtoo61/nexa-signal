import { StyleSheet, Text, View } from 'react-native';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';
import { GlassPanel } from '../../../presentation/ui/GlassPanel';

interface TutorialHintProps {
  locale: import('@nexa/types').Locale;
  visible: boolean;
  step: 0 | 1 | 2 | 3;
  overrideKey?: string;
}

const keys = [
  'tutorialTapNode',
  'tutorialStabilize',
  'tutorialDragConnect',
  'tutorialRepair',
] as const;

export function TutorialHint({
  locale,
  visible,
  step,
  overrideKey,
}: TutorialHintProps) {
  if (!visible) return null;
  return (
    <GlassPanel pointerEvents="none" compact style={styles.root}>
      <Text numberOfLines={1} style={styles.text}>
        {tr(locale, overrideKey ?? keys[step])}
      </Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'center',
    borderRadius: designTokens.radii.round,
  },
  text: {
    color: '#D5E9FFD9',
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
