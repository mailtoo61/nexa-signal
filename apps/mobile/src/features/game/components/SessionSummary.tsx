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
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{tr(locale, 'summary')}</Text>
        <Text style={styles.retry}>
          {tr(locale, 'summaryCalmCollapseLine')}
        </Text>
        <Text style={styles.insight}>
          {tr(locale, `insight_${summary.collapseReason ?? 'default'}`)}
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{tr(locale, 'survivalTime')}</Text>
            <Text style={styles.statValue}>{summary.survivalSeconds}s</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{tr(locale, 'finalScore')}</Text>
            <Text style={styles.statValue}>{summary.score}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{tr(locale, 'bestScore')}</Text>
            <Text style={styles.statValue}>{bestScore}</Text>
          </View>
        </View>

        <Text style={styles.item}>
          {tr(locale, 'nodesStabilized')}: {summary.nodesStabilized}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'linksRepaired')}: {summary.linksRepaired}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'connectionsCreated')}: {summary.connectionsCreated}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'criticalSaves')}: {summary.criticalSaves}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'signalGrade')}: {summary.signalGrade}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'relayConnectionsUsed')}: {summary.relayConnectionsUsed}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'amplifierBoosts')}: {summary.amplifierBoosts}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'stabilizerSaves')}: {summary.stabilizerSaves}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'decayerDamagePrevented')}:{' '}
          {summary.decayerDamagePrevented}
        </Text>
        <Text style={styles.item}>
          {tr(locale, 'coreRiskEvents')}: {summary.coreRiskEvents}
        </Text>
        {summary.collapseReason ? (
          <Text style={styles.item}>
            {tr(locale, 'collapseReason')}: {tr(locale, summary.collapseReason)}
          </Text>
        ) : null}
        <Text style={styles.retry}>{tr(locale, 'retryEncouragement')}</Text>
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
          <Text style={styles.buttonText}>{tr(locale, 'restart')}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonSecondary]}
          onPress={onHome}
        >
          <Text style={styles.buttonText}>{tr(locale, 'home')}</Text>
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
    top: '16%',
    borderRadius: designTokens.radii.lg,
    backgroundColor: '#0E1735EE',
    padding: designTokens.spacing.lg,
    maxHeight: '72%',
  },
  scrollContent: {
    gap: designTokens.spacing.sm,
    paddingBottom: 2,
  },
  title: {
    color: designTokens.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  item: { color: designTokens.colors.textPrimary, fontSize: 15 },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flex: 1,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#3C5F8A88',
    backgroundColor: '#0A152EC9',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statLabel: {
    color: '#97BBE9',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  statValue: {
    color: '#E4F2FF',
    fontSize: 15,
    fontWeight: '700',
  },
  newBest: {
    color: designTokens.colors.cyan,
    fontSize: 14,
    fontWeight: '700',
  },
  insight: {
    color: '#A6C6F7',
    fontSize: 13,
  },
  retry: {
    color: '#CDE3FF',
    fontSize: 13,
    fontWeight: '600',
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
    minHeight: 50,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#75C7F8',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.md,
  },
  buttonPrimary: {
    backgroundColor: '#123067CC',
    shadowColor: '#73DCFF',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonSecondary: {
    backgroundColor: '#0D1936AA',
    borderColor: '#4A6A95',
  },
  buttonText: {
    color: designTokens.colors.textPrimary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
