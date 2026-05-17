import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PostRunTuningReport, SessionSummary } from '@nexa/types';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';

interface SessionSummaryProps {
  locale: import('@nexa/types').Locale;
  summary: SessionSummary;
  report: PostRunTuningReport;
  bestScore: number;
  isNewBest: boolean;
  onRestart: () => void;
  onHome: () => void;
  onOpenPlaytestLab?: () => void;
}

export function SessionSummaryPanel({
  locale,
  summary,
  report,
  bestScore,
  isNewBest,
  onRestart,
  onHome,
  onOpenPlaytestLab,
}: SessionSummaryProps) {
  const stabilizedActions =
    summary.nodesStabilized +
    summary.linksRepaired +
    summary.connectionsCreated;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>{tr(locale, 'summary')}</Text>
        <Text style={styles.title}>{tr(locale, 'networkLostTitle')}</Text>
        <Text style={styles.subtitle}>{tr(locale, 'signalRecoveryReady')}</Text>

        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{tr(locale, 'finalScore')}</Text>
            <Text style={styles.statValue}>{summary.score}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{tr(locale, 'survivalTime')}</Text>
            <Text style={styles.statValue}>{summary.survivalSeconds}s</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>
              {tr(locale, 'stabilizedActions')}
            </Text>
            <Text style={styles.statValue}>{stabilizedActions}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{tr(locale, 'bestScore')}</Text>
          <Text style={styles.metaValue}>{bestScore}</Text>
        </View>
        <Text style={styles.insight}>
          {tr(
            locale,
            `tuningHint_${report.suggestedTuningFlags[0] ?? 'healthy_run'}`,
          )}
        </Text>
        {isNewBest ? (
          <Text style={styles.newBest}>{tr(locale, 'newBest')}</Text>
        ) : null}
        {__DEV__ ? (
          <View style={styles.devPanel}>
            <Text style={styles.devTitle}>{tr(locale, 'devTuningReport')}</Text>
            <Text style={styles.devLine}>
              {tr(locale, 'devRecommendationAcceptance')}:{' '}
              {(report.recommendationAcceptanceRate * 100).toFixed(0)}%
            </Text>
            <Text style={styles.devLine}>
              {tr(locale, 'devInvalidDragReleases')}:{' '}
              {report.invalidDragReleaseCount}
            </Text>
            <Text style={styles.devLine}>
              {tr(locale, 'devSuggestedFlags')}:{' '}
              {report.suggestedTuningFlags.join(', ')}
            </Text>
            {onOpenPlaytestLab ? (
              <Pressable style={styles.devButton} onPress={onOpenPlaytestLab}>
                <Text style={styles.devButtonText}>
                  {tr(locale, 'devOpenPlaytestLab')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <Pressable
          style={[styles.button, styles.buttonPrimary]}
          onPress={onRestart}
        >
          <Text style={styles.buttonText}>{tr(locale, 'retryNetwork')}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonSecondary]}
          onPress={onHome}
        >
          <Text style={styles.buttonText}>{tr(locale, 'backHome')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: designTokens.spacing.lg,
    right: designTokens.spacing.lg,
    top: '12%',
    bottom: '10%',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#5D88B833',
    backgroundColor: '#0A142BD9',
    padding: designTokens.spacing.lg,
    shadowColor: '#6BD8FF',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  scrollContent: {
    gap: designTokens.spacing.md,
    paddingBottom: 4,
  },
  kicker: {
    color: '#9BC3EE',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  title: {
    color: '#E8F4FF',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    color: '#B8D8F8',
    fontSize: 13,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5A84B64D',
    backgroundColor: '#0D1C38C7',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statLabel: {
    color: '#9CC1E8',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    textAlign: 'center',
  },
  statValue: {
    color: '#ECF7FF',
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#476D9952',
    backgroundColor: '#0A183197',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaLabel: {
    color: '#9DBEE5',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#E3F2FF',
    fontSize: 12,
    fontWeight: '700',
  },
  newBest: {
    color: designTokens.colors.cyan,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  insight: {
    color: '#A7C7EA',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  devPanel: {
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#35507A',
    padding: designTokens.spacing.sm,
    gap: 4,
    backgroundColor: '#0A1226CC',
  },
  devTitle: {
    color: '#8DB4F0',
    fontSize: 12,
    fontWeight: '700',
  },
  devLine: {
    color: '#BFD8FF',
    fontSize: 11,
  },
  devButton: {
    marginTop: 4,
    minHeight: 36,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#5E8CCD',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.sm,
  },
  devButtonText: {
    color: '#D7E8FF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    minHeight: 52,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#6BBCE7',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.md,
  },
  buttonPrimary: {
    backgroundColor: '#16376ACC',
    shadowColor: '#70D9FF',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonSecondary: {
    backgroundColor: '#0E1B349E',
    borderColor: '#55729B',
  },
  buttonText: {
    color: designTokens.colors.textPrimary,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});
