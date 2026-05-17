import { describe, expect, it } from 'vitest';
import type { PostRunTuningReport } from '@nexa/types';
import {
  aggregatePlaytestReports,
  buildComparisonDelta,
  compareTagToTag,
  createComparisonSnapshot,
  deriveComparisonInsights,
  derivePlaytestInsights,
  exportAggregateSummaryJson,
  exportComparisonSnapshotJson,
  exportPlaytestBundleJson,
  summarizeTags,
} from './playtestLab';

function report(partial: Partial<PostRunTuningReport>): PostRunTuningReport {
  return {
    schemaVersion: 1,
    tuningProfileTag: partial.tuningProfileTag ?? 'baseline',
    sessionId: partial.sessionId ?? 's',
    seed: partial.seed ?? 'seed',
    tuningVersion: partial.tuningVersion ?? 'v1.1.0',
    sessionProfile: partial.sessionProfile ?? 'intro',
    durationMs: partial.durationMs ?? 30_000,
    finalScore: partial.finalScore ?? 400,
    collapseReason: partial.collapseReason ?? 'global_stability_depleted',
    averageRisk: partial.averageRisk ?? 50,
    firstOverloadMs: partial.firstOverloadMs ?? 5_000,
    firstCollapseWarningMs: partial.firstCollapseWarningMs ?? 9_000,
    firstSuccessfulStabilizeMs: partial.firstSuccessfulStabilizeMs ?? 7_000,
    firstSuccessfulRepairMs: partial.firstSuccessfulRepairMs ?? 8_000,
    tutorialCompletionMs:
      partial.tutorialCompletionMs === undefined
        ? 12_000
        : partial.tutorialCompletionMs,
    recommendationShownCount: partial.recommendationShownCount ?? 3,
    recommendationAcceptedCount: partial.recommendationAcceptedCount ?? 1,
    recommendationAcceptanceRate: partial.recommendationAcceptanceRate ?? 0.33,
    nodeTypeEncounterTiming: partial.nodeTypeEncounterTiming ?? {
      relay: 6_000,
    },
    invalidActionsCount: partial.invalidActionsCount ?? 2,
    invalidDragReleaseCount: partial.invalidDragReleaseCount ?? 1,
    actionMix: partial.actionMix ?? { stabilizes: 2, repairs: 1, connects: 1 },
    nodeTypeMetrics: partial.nodeTypeMetrics ?? {
      relayConnectionsUsed: 1,
      amplifierBoosts: 0,
      stabilizerSaves: 0,
      decayerDamagePrevented: 0,
      coreRiskEvents: 0,
    },
    suggestedTuningFlags: partial.suggestedTuningFlags ?? ['healthy_run'],
  };
}

describe('playtest lab aggregation', () => {
  it('aggregates totals and distributions', () => {
    const aggregate = aggregatePlaytestReports([
      report({
        sessionId: '1',
        durationMs: 20_000,
        collapseReason: 'overload_cascade',
      }),
      report({
        sessionId: '2',
        durationMs: 40_000,
        collapseReason: 'overload_cascade',
      }),
      report({
        sessionId: '3',
        durationMs: 60_000,
        collapseReason: 'core_signal_depleted',
      }),
    ]);

    expect(aggregate.totalRuns).toBe(3);
    expect(aggregate.averageDurationMs).toBe(40_000);
    expect(aggregate.medianDurationMs).toBe(40_000);
    expect(aggregate.collapseReasonDistribution.overload_cascade).toBe(2);
  });

  it('counts tuning flag frequency', () => {
    const aggregate = aggregatePlaytestReports([
      report({ suggestedTuningFlags: ['early_collapse_too_fast'] }),
      report({
        suggestedTuningFlags: ['early_collapse_too_fast', 'low_repair_usage'],
      }),
    ]);
    expect(aggregate.tuningFlagFrequency.early_collapse_too_fast).toBe(2);
    expect(aggregate.tuningFlagFrequency.low_repair_usage).toBe(1);
  });

  it('produces actionable insights for common risk patterns', () => {
    const aggregate = aggregatePlaytestReports([
      report({
        durationMs: 20_000,
        recommendationAcceptanceRate: 0,
        invalidDragReleaseCount: 3,
        suggestedTuningFlags: [
          'early_collapse_too_fast',
          'decayer_seen_too_early',
        ],
        collapseReason: 'overload_cascade',
      }),
    ]);
    const insights = derivePlaytestInsights(aggregate);
    expect(insights).toContain('devInsight_early_collapse');
    expect(insights).toContain('devInsight_low_recommendation_acceptance');
    expect(insights).toContain('devInsight_invalid_drag_high');
  });

  it('exports aggregate json', () => {
    const aggregate = aggregatePlaytestReports([report({})]);
    const json = exportAggregateSummaryJson(aggregate);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('groups latest and previous windows for comparison', () => {
    const reports = Array.from({ length: 11 }, (_, index) =>
      report({ sessionId: `${index}`, finalScore: index }),
    );
    const snapshot = createComparisonSnapshot(reports, 5);
    expect(snapshot.latest.reports).toHaveLength(5);
    expect(snapshot.previous.reports).toHaveLength(5);
    expect(snapshot.latest.reports[0]?.sessionId).toBe('0');
    expect(snapshot.previous.reports[0]?.sessionId).toBe('5');
  });

  it('handles malformed and few reports safely', () => {
    const malformed = { bad: true } as unknown as PostRunTuningReport;
    const snapshot = createComparisonSnapshot([malformed, report({})], 5);
    expect(snapshot.latest.reports).toHaveLength(1);
    expect(snapshot.previous.reports).toHaveLength(0);
    expect(buildComparisonDelta(snapshot)).toBeNull();
  });

  it('detects improved and worsened comparison trends', () => {
    const latest = [
      report({
        durationMs: 70_000,
        finalScore: 800,
        averageRisk: 35,
        recommendationAcceptanceRate: 0.5,
      }),
    ];
    const previous = [
      report({
        durationMs: 50_000,
        finalScore: 600,
        averageRisk: 60,
        recommendationAcceptanceRate: 0.8,
      }),
    ];
    const snapshot = createComparisonSnapshot([...latest, ...previous], 1);
    const delta = buildComparisonDelta(snapshot);
    expect(delta?.duration.trend).toBe('improved');
    expect(delta?.score.trend).toBe('improved');
    expect(delta?.risk.trend).toBe('improved');
    expect(delta?.recommendationAcceptance.trend).toBe('worsened');
  });

  it('builds comparison insights and export json', () => {
    const snapshot = createComparisonSnapshot(
      [
        report({
          durationMs: 70_000,
          recommendationAcceptanceRate: 0.1,
          invalidActionsCount: 8,
        }),
        report({
          durationMs: 40_000,
          recommendationAcceptanceRate: 0.7,
          invalidActionsCount: 2,
        }),
      ],
      1,
    );
    const delta = buildComparisonDelta(snapshot);
    const insights = deriveComparisonInsights(delta);
    expect(insights.length).toBeGreaterThan(0);
    const json = exportComparisonSnapshotJson(snapshot, delta);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('groups and summarizes reports by tuning profile tag', () => {
    const summaries = summarizeTags([
      report({ tuningProfileTag: 'baseline', sessionId: 'a' }),
      report({ tuningProfileTag: 'baseline', sessionId: 'b' }),
      report({ tuningProfileTag: 'v2-less-decayer', sessionId: 'c' }),
    ]);
    expect(summaries[0]?.tag).toBe('baseline');
    expect(summaries[0]?.aggregate.totalRuns).toBe(2);
  });

  it('compares selected tag vs baseline', () => {
    const delta = compareTagToTag(
      [
        report({
          tuningProfileTag: 'v1-soft-intro',
          durationMs: 60_000,
          finalScore: 800,
          averageRisk: 40,
        }),
        report({
          tuningProfileTag: 'baseline',
          durationMs: 45_000,
          finalScore: 500,
          averageRisk: 60,
        }),
      ],
      'v1-soft-intro',
      'baseline',
    );
    expect(delta?.duration.trend).toBe('improved');
    expect(delta?.score.trend).toBe('improved');
  });

  it('exports stable playtest bundle json', () => {
    const reports = [report({ tuningProfileTag: 'baseline' })];
    const snapshot = createComparisonSnapshot(reports, 5);
    const delta = buildComparisonDelta(snapshot);
    const bundle = exportPlaytestBundleJson({
      runtimeVersion: 'dev-local-v1',
      reports,
      aggregateSummary: aggregatePlaytestReports(reports),
      comparisonSnapshot: snapshot,
      comparisonDelta: delta,
      activeTuningProfileTag: 'baseline',
      savedTuningTags: ['baseline'],
      experimentNotesByTag: { baseline: 'test note' },
      tagSummaries: summarizeTags(reports),
      selectedTagReports: reports,
      selectedTagComparison: {
        baseline: null,
        previousTag: null,
        previousTagDelta: null,
        withinTag: delta,
      },
    });
    const parsed = JSON.parse(bundle) as {
      activeTuningProfileTag?: string;
      experimentNotesByTag?: Record<string, string>;
    };
    expect(parsed.activeTuningProfileTag).toBe('baseline');
    expect(parsed.experimentNotesByTag?.baseline).toBe('test note');
  });
});
