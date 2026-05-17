import type { PostRunTuningReport, TuningFlag } from '@nexa/types';
import {
  DEFAULT_TUNING_PROFILE_TAG,
  sanitizeTuningProfileTag,
} from '../../../shared/dev/tuningProfileTag';

export interface PlaytestAggregate {
  totalRuns: number;
  averageDurationMs: number;
  medianDurationMs: number;
  averageScore: number;
  averageRisk: number;
  averageRecommendationAcceptanceRate: number;
  averageInvalidActions: number;
  averageInvalidDragReleases: number;
  tutorialCompletionRate: number;
  collapseReasonDistribution: Record<string, number>;
  tuningFlagFrequency: Record<TuningFlag, number>;
  nodeTypeEncounterAverages: Record<string, number>;
  actionMixAverages: {
    stabilizes: number;
    repairs: number;
    connects: number;
  };
  actionMixTotals: {
    stabilizes: number;
    repairs: number;
    connects: number;
  };
}

export interface SnapshotBucket {
  reports: PostRunTuningReport[];
  aggregate: PlaytestAggregate;
}

export interface ComparisonSnapshot {
  latest: SnapshotBucket;
  previous: SnapshotBucket;
  windowSize: number;
}

export type DeltaTrend = 'improved' | 'worsened' | 'unchanged';

export interface MetricDelta {
  trend: DeltaTrend;
  latest: number;
  previous: number;
  delta: number;
}

export interface ComparisonDelta {
  duration: MetricDelta;
  score: MetricDelta;
  risk: MetricDelta;
  invalidActions: MetricDelta;
  tutorialCompletion: MetricDelta;
  recommendationAcceptance: MetricDelta;
}

export interface TagSummary {
  tag: string;
  aggregate: PlaytestAggregate;
  mostCommonCollapseReason: string | null;
  mostFrequentTuningFlags: Array<{ flag: TuningFlag; count: number }>;
}

const emptyFlagFrequency = (): Record<TuningFlag, number> => ({
  early_collapse_too_fast: 0,
  tutorial_not_completed: 0,
  recommendations_ignored: 0,
  too_many_invalid_actions: 0,
  decayer_seen_too_early: 0,
  amplifier_pressure_too_high: 0,
  low_repair_usage: 0,
  low_stabilize_usage: 0,
  healthy_run: 0,
});

export function aggregatePlaytestReports(
  reports: PostRunTuningReport[],
): PlaytestAggregate {
  if (!reports.length) {
    return {
      totalRuns: 0,
      averageDurationMs: 0,
      medianDurationMs: 0,
      averageScore: 0,
      averageRisk: 0,
      averageRecommendationAcceptanceRate: 0,
      averageInvalidActions: 0,
      averageInvalidDragReleases: 0,
      tutorialCompletionRate: 0,
      collapseReasonDistribution: {},
      tuningFlagFrequency: emptyFlagFrequency(),
      nodeTypeEncounterAverages: {},
      actionMixAverages: { stabilizes: 0, repairs: 0, connects: 0 },
      actionMixTotals: { stabilizes: 0, repairs: 0, connects: 0 },
    };
  }

  const collapseReasonDistribution: Record<string, number> = {};
  const tuningFlagFrequency = emptyFlagFrequency();
  const nodeTypeEncounterTotals: Record<
    string,
    { sum: number; count: number }
  > = {};
  const durations = reports
    .map((report) => report.durationMs)
    .sort((a, b) => a - b);

  let durationSum = 0;
  let scoreSum = 0;
  let riskSum = 0;
  let recommendationAcceptanceSum = 0;
  let invalidActionsSum = 0;
  let invalidDragReleaseSum = 0;
  let tutorialCompletedCount = 0;
  const actionMixTotals = { stabilizes: 0, repairs: 0, connects: 0 };

  for (const report of reports) {
    durationSum += report.durationMs;
    scoreSum += report.finalScore;
    riskSum += report.averageRisk;
    recommendationAcceptanceSum += report.recommendationAcceptanceRate;
    invalidActionsSum += report.invalidActionsCount;
    invalidDragReleaseSum += report.invalidDragReleaseCount;
    actionMixTotals.stabilizes += report.actionMix.stabilizes;
    actionMixTotals.repairs += report.actionMix.repairs;
    actionMixTotals.connects += report.actionMix.connects;

    if (report.tutorialCompletionMs !== null) {
      tutorialCompletedCount += 1;
    }

    const collapseKey = report.collapseReason ?? 'none';
    collapseReasonDistribution[collapseKey] =
      (collapseReasonDistribution[collapseKey] ?? 0) + 1;

    for (const flag of report.suggestedTuningFlags) {
      tuningFlagFrequency[flag] += 1;
    }

    for (const [nodeType, encounterMs] of Object.entries(
      report.nodeTypeEncounterTiming,
    )) {
      const existing = nodeTypeEncounterTotals[nodeType] ?? {
        sum: 0,
        count: 0,
      };
      nodeTypeEncounterTotals[nodeType] = {
        sum: existing.sum + encounterMs,
        count: existing.count + 1,
      };
    }
  }

  const midpoint = Math.floor(durations.length / 2);
  const medianDurationMs =
    durations.length % 2 === 0
      ? (durations[midpoint - 1] + durations[midpoint]) / 2
      : durations[midpoint];

  const nodeTypeEncounterAverages: Record<string, number> = {};
  for (const [nodeType, stats] of Object.entries(nodeTypeEncounterTotals)) {
    nodeTypeEncounterAverages[nodeType] = stats.sum / stats.count;
  }

  return {
    totalRuns: reports.length,
    averageDurationMs: durationSum / reports.length,
    medianDurationMs,
    averageScore: scoreSum / reports.length,
    averageRisk: riskSum / reports.length,
    averageRecommendationAcceptanceRate:
      recommendationAcceptanceSum / reports.length,
    averageInvalidActions: invalidActionsSum / reports.length,
    averageInvalidDragReleases: invalidDragReleaseSum / reports.length,
    tutorialCompletionRate: tutorialCompletedCount / reports.length,
    collapseReasonDistribution,
    tuningFlagFrequency,
    nodeTypeEncounterAverages,
    actionMixAverages: {
      stabilizes: actionMixTotals.stabilizes / reports.length,
      repairs: actionMixTotals.repairs / reports.length,
      connects: actionMixTotals.connects / reports.length,
    },
    actionMixTotals,
  };
}

export function groupReportsByTag(
  reports: PostRunTuningReport[],
): Record<string, PostRunTuningReport[]> {
  const grouped: Record<string, PostRunTuningReport[]> = {};
  for (const report of reports) {
    const tag = report.tuningProfileTag;
    if (!grouped[tag]) grouped[tag] = [];
    grouped[tag]?.push(report);
  }
  return grouped;
}

function isValidReportShape(
  report: PostRunTuningReport | null | undefined,
): report is PostRunTuningReport {
  return Boolean(
    report &&
    report.schemaVersion === 1 &&
    typeof report.sessionId === 'string' &&
    typeof report.durationMs === 'number' &&
    typeof report.finalScore === 'number' &&
    typeof report.averageRisk === 'number' &&
    typeof report.recommendationAcceptanceRate === 'number' &&
    typeof report.invalidActionsCount === 'number' &&
    typeof report.invalidDragReleaseCount === 'number' &&
    typeof report.actionMix?.stabilizes === 'number' &&
    typeof report.actionMix?.repairs === 'number' &&
    typeof report.actionMix?.connects === 'number',
  );
}

export function sanitizeReports(
  reports: Array<PostRunTuningReport | null | undefined>,
): PostRunTuningReport[] {
  return reports.filter(isValidReportShape).map((report) => ({
    ...report,
    tuningProfileTag: sanitizeTuningProfileTag(
      report.tuningProfileTag ?? DEFAULT_TUNING_PROFILE_TAG,
    ),
  }));
}

export function createComparisonSnapshot(
  reports: Array<PostRunTuningReport | null | undefined>,
  windowSize = 5,
): ComparisonSnapshot {
  const sanitized = sanitizeReports(reports);
  const latest = sanitized.slice(0, windowSize);
  const previous = sanitized.slice(windowSize, windowSize * 2);
  return {
    latest: { reports: latest, aggregate: aggregatePlaytestReports(latest) },
    previous: {
      reports: previous,
      aggregate: aggregatePlaytestReports(previous),
    },
    windowSize,
  };
}

function compareMetric(
  latest: number,
  previous: number,
  higherIsBetter: boolean,
  epsilon = 0.001,
): MetricDelta {
  const delta = latest - previous;
  if (Math.abs(delta) <= epsilon) {
    return { trend: 'unchanged', latest, previous, delta };
  }
  const improved = higherIsBetter ? delta > 0 : delta < 0;
  return {
    trend: improved ? 'improved' : 'worsened',
    latest,
    previous,
    delta,
  };
}

export function buildComparisonDelta(
  snapshot: ComparisonSnapshot,
): ComparisonDelta | null {
  if (
    snapshot.latest.reports.length === 0 ||
    snapshot.previous.reports.length === 0
  ) {
    return null;
  }
  return {
    duration: compareMetric(
      snapshot.latest.aggregate.averageDurationMs,
      snapshot.previous.aggregate.averageDurationMs,
      true,
    ),
    score: compareMetric(
      snapshot.latest.aggregate.averageScore,
      snapshot.previous.aggregate.averageScore,
      true,
    ),
    risk: compareMetric(
      snapshot.latest.aggregate.averageRisk,
      snapshot.previous.aggregate.averageRisk,
      false,
    ),
    invalidActions: compareMetric(
      snapshot.latest.aggregate.averageInvalidActions,
      snapshot.previous.aggregate.averageInvalidActions,
      false,
    ),
    tutorialCompletion: compareMetric(
      snapshot.latest.aggregate.tutorialCompletionRate,
      snapshot.previous.aggregate.tutorialCompletionRate,
      true,
    ),
    recommendationAcceptance: compareMetric(
      snapshot.latest.aggregate.averageRecommendationAcceptanceRate,
      snapshot.previous.aggregate.averageRecommendationAcceptanceRate,
      true,
    ),
  };
}

function mostFrequentKey(
  input: Record<string, number>,
): { key: string; count: number } | null {
  let winner: { key: string; count: number } | null = null;
  for (const [key, count] of Object.entries(input)) {
    if (!winner || count > winner.count) {
      winner = { key, count };
    }
  }
  return winner;
}

function topFlags(
  frequency: Record<TuningFlag, number>,
): Array<{ flag: TuningFlag; count: number }> {
  return (Object.entries(frequency) as Array<[TuningFlag, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([flag, count]) => ({ flag, count }));
}

export function summarizeTags(reports: PostRunTuningReport[]): TagSummary[] {
  const grouped = groupReportsByTag(reports);
  return Object.entries(grouped)
    .map(([tag, tagReports]) => {
      const aggregate = aggregatePlaytestReports(tagReports);
      const topCollapse = mostFrequentKey(aggregate.collapseReasonDistribution);
      return {
        tag,
        aggregate,
        mostCommonCollapseReason: topCollapse?.key ?? null,
        mostFrequentTuningFlags: topFlags(aggregate.tuningFlagFrequency),
      };
    })
    .sort((a, b) => b.aggregate.totalRuns - a.aggregate.totalRuns);
}

export function compareTagToTag(
  reports: PostRunTuningReport[],
  selectedTag: string,
  otherTag: string,
): ComparisonDelta | null {
  const selectedReports = reports.filter(
    (r) => r.tuningProfileTag === selectedTag,
  );
  const otherReports = reports.filter((r) => r.tuningProfileTag === otherTag);
  const snapshot: ComparisonSnapshot = {
    latest: {
      reports: selectedReports,
      aggregate: aggregatePlaytestReports(selectedReports),
    },
    previous: {
      reports: otherReports,
      aggregate: aggregatePlaytestReports(otherReports),
    },
    windowSize: Math.max(selectedReports.length, otherReports.length),
  };
  return buildComparisonDelta(snapshot);
}

export function derivePlaytestInsights(aggregate: PlaytestAggregate): string[] {
  if (aggregate.totalRuns === 0) {
    return ['devInsight_no_reports'];
  }

  const insights: string[] = [];
  if (aggregate.tuningFlagFrequency.early_collapse_too_fast > 0) {
    insights.push('devInsight_early_collapse');
  }
  if (aggregate.averageRecommendationAcceptanceRate < 0.25) {
    insights.push('devInsight_low_recommendation_acceptance');
  }
  if (aggregate.averageInvalidDragReleases >= 2) {
    insights.push('devInsight_invalid_drag_high');
  }
  if (aggregate.tuningFlagFrequency.decayer_seen_too_early > 0) {
    insights.push('devInsight_decayer_early');
  }
  if (
    aggregate.tuningFlagFrequency.healthy_run >=
    Math.max(1, Math.floor(aggregate.totalRuns * 0.4))
  ) {
    insights.push('devInsight_healthy');
  }

  const topCollapse = mostFrequentKey(aggregate.collapseReasonDistribution);
  if (topCollapse?.key === 'overload_cascade') {
    insights.push('devInsight_overload_cascade_common');
  }

  if (!insights.length) {
    insights.push('devInsight_neutral');
  }

  return insights;
}

export function deriveComparisonInsights(
  delta: ComparisonDelta | null,
): string[] {
  if (!delta) return ['devNoComparisonDataYet'];
  const insights: string[] = [];
  if (delta.duration.trend === 'improved') {
    insights.push('devInsight_compare_duration_up');
  }
  if (delta.tutorialCompletion.trend === 'improved') {
    insights.push('devInsight_compare_tutorial_up');
  }
  if (delta.recommendationAcceptance.trend === 'worsened') {
    insights.push('devInsight_compare_recommendation_down');
  }
  if (delta.invalidActions.trend === 'worsened') {
    insights.push('devInsight_compare_invalid_actions_up');
  }
  if (delta.risk.trend === 'worsened') {
    insights.push('devInsight_compare_risk_up');
  }
  if (!insights.length) insights.push('devInsight_compare_neutral');
  return insights;
}

export function exportAggregateSummaryJson(
  aggregate: PlaytestAggregate,
): string {
  return JSON.stringify(aggregate, null, 2);
}

export function exportComparisonSnapshotJson(
  snapshot: ComparisonSnapshot,
  delta: ComparisonDelta | null,
): string {
  return JSON.stringify({ snapshot, delta }, null, 2);
}

export function exportPlaytestBundleJson(input: {
  runtimeVersion: string;
  reports: PostRunTuningReport[];
  aggregateSummary: PlaytestAggregate;
  comparisonSnapshot: ComparisonSnapshot;
  comparisonDelta: ComparisonDelta | null;
  activeTuningProfileTag: string;
  savedTuningTags: string[];
  experimentNotesByTag: Record<string, string>;
  tagSummaries: TagSummary[];
  selectedTagReports: PostRunTuningReport[];
  selectedTagComparison: {
    baseline: ComparisonDelta | null;
    previousTag: string | null;
    previousTagDelta: ComparisonDelta | null;
    withinTag: ComparisonDelta | null;
  };
}): string {
  return JSON.stringify(
    {
      exportVersion: 1,
      generatedAtRuntimeVersion: input.runtimeVersion,
      tuningVersion: input.reports[0]?.tuningVersion ?? 'unknown',
      activeTuningProfileTag: input.activeTuningProfileTag,
      savedTuningTags: input.savedTuningTags,
      experimentNotesByTag: input.experimentNotesByTag,
      tagSummaries: input.tagSummaries,
      selectedTagReports: input.selectedTagReports,
      selectedTagComparison: input.selectedTagComparison,
      aggregateSummary: input.aggregateSummary,
      comparisonSnapshot: input.comparisonSnapshot,
      comparisonDelta: input.comparisonDelta,
      boundedReports: input.reports,
    },
    null,
    2,
  );
}
