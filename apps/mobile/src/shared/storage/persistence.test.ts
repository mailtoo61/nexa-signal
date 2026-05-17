import { describe, expect, it } from 'vitest';
import type { PostRunTuningReport } from '@nexa/types';
import {
  MAX_LOCAL_TUNING_REPORTS,
  sanitizeReportHistory,
  toBoundedReportHistory,
  upsertReportHistory,
} from './reportHistory';

function createReport(sessionId: string): PostRunTuningReport {
  return {
    schemaVersion: 1,
    tuningProfileTag: 'baseline',
    sessionId,
    seed: `seed-${sessionId}`,
    tuningVersion: 'v1.1.0',
    sessionProfile: 'standard',
    durationMs: 50_000,
    finalScore: 500,
    collapseReason: 'global_stability_depleted',
    averageRisk: 40,
    firstOverloadMs: 5000,
    firstCollapseWarningMs: 9000,
    firstSuccessfulStabilizeMs: 7000,
    firstSuccessfulRepairMs: 8000,
    tutorialCompletionMs: 12000,
    recommendationShownCount: 2,
    recommendationAcceptedCount: 1,
    recommendationAcceptanceRate: 0.5,
    nodeTypeEncounterTiming: {},
    invalidActionsCount: 1,
    invalidDragReleaseCount: 0,
    actionMix: { stabilizes: 2, repairs: 1, connects: 1 },
    nodeTypeMetrics: {
      relayConnectionsUsed: 1,
      amplifierBoosts: 0,
      stabilizerSaves: 0,
      decayerDamagePrevented: 0,
      coreRiskEvents: 0,
    },
    suggestedTuningFlags: ['healthy_run'],
  };
}

describe('post-run history helpers', () => {
  it('keeps bounded max history', () => {
    const many = Array.from(
      { length: MAX_LOCAL_TUNING_REPORTS + 5 },
      (_, index) => createReport(String(index)),
    );
    const bounded = toBoundedReportHistory(many);
    expect(bounded).toHaveLength(MAX_LOCAL_TUNING_REPORTS);
  });

  it('inserts newest report first', () => {
    const existing = [createReport('a'), createReport('b')];
    const next = upsertReportHistory(existing, createReport('new'));
    expect(next[0]?.sessionId).toBe('new');
  });

  it('supports clear by returning empty when bounded on empty array', () => {
    expect(toBoundedReportHistory([])).toEqual([]);
  });

  it('filters malformed reports safely', () => {
    const result = sanitizeReportHistory([
      { nope: true },
      createReport('ok'),
    ] as unknown[]);
    expect(result).toHaveLength(1);
    expect(result[0]?.sessionId).toBe('ok');
  });

  it('migrates old tagless reports to baseline tag', () => {
    const legacy = createReport('legacy') as unknown as {
      tuningProfileTag?: string;
    };
    delete legacy.tuningProfileTag;
    const result = sanitizeReportHistory([legacy]);
    expect(result[0]?.tuningProfileTag).toBe('baseline');
  });
});
