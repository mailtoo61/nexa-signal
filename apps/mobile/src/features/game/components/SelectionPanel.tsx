import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';
import { GlassPanel } from '../../../presentation/ui/GlassPanel';
import { SignalGlassHighlight } from '../../../presentation/ui/SignalGlassHighlight';

interface ActionItem {
  key: string;
  labelKey: string;
  expectedKey?: string;
  disabled: boolean;
  reasonKey?: string;
  onPress: () => void;
  recommended?: boolean;
}

interface SelectionPanelProps {
  locale: import('@nexa/types').Locale;
  title: string;
  helperLine?: string | null;
  actions: ActionItem[];
}

export function SelectionPanel({
  locale,
  title,
  helperLine,
  actions,
}: SelectionPanelProps) {
  const hasActions = actions.length > 0;

  return (
    <GlassPanel
      pointerEvents="box-none"
      style={[styles.root, !hasActions && styles.rootCollapsed]}
      compact
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <SignalGlassHighlight
          intensity={0.94}
          opacity={0.17}
          borderRadius={10}
          verticalOffset={-9}
        />
      </View>
      <View pointerEvents="none" style={styles.copyBlock}>
        <Text style={styles.title}>{title}</Text>
        {helperLine ? (
          <Text style={styles.description}>{helperLine}</Text>
        ) : null}
      </View>
      {hasActions ? (
        <View style={styles.actionsRow}>
          {actions.map((action) => {
            const label =
              action.key === 'stabilize'
                ? 'BALANCE'
                : action.key === 'disconnect'
                  ? 'SEPARATE'
                  : action.key === 'connect'
                    ? 'CONNECT'
                    : tr(locale, action.labelKey).toUpperCase();
            return (
              <Pressable
                key={action.key}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.button,
                  action.recommended &&
                    !action.disabled &&
                    styles.buttonRecommended,
                  action.disabled && styles.disabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    action.disabled && styles.buttonTextDisabled,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 2,
    paddingHorizontal: 1,
    gap: 6,
    overflow: 'hidden',
  },
  rootCollapsed: {
    paddingVertical: designTokens.spacing.xs,
  },
  copyBlock: {
    gap: 6,
  },
  title: {
    color: '#D8EBFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  description: {
    color: '#9FBEE7D9',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: designTokens.radii.sm,
    borderWidth: 1,
    borderColor: '#4A6FA096',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: designTokens.spacing.sm,
    backgroundColor: '#13284DAF',
  },
  buttonRecommended: {
    borderColor: '#8FD7FFBC',
    backgroundColor: '#1A3A65D9',
    shadowColor: '#73CCFF',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  disabled: {
    borderColor: '#5A6E94AA',
    backgroundColor: '#111E38A6',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.987 }],
  },
  buttonText: {
    color: designTokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  buttonTextDisabled: {
    color: '#92A8C6',
  },
});
