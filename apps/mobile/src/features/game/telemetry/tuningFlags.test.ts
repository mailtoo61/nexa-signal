import { describe, expect, it } from 'vitest';
import { evaluateTuningFlags } from './tuningFlags';
import type { PostRunTuningReport } from '@nexa/types';

function baseReport(): Omit<PostRunTuningReport, 'suggestedTuningFlags'> {
  return {
    schemaVersion: 1,
    tuningProfileTag: 'baseline',
    sessionId: 's1',
    seed: 'intro-1',
    tuningVersion: 'v1.1.0',
    sessionProfile: 'intro',
    durationMs: 70_000,
    finalScore: 1000,
    collapseReason: 'global_stability_depleted',
    averageRisk: 40,
    firstOverloadMs: 12_000,
    firstCollapseWarningMs: 20_000,
    firstSuccessfulStabilizeMs: 9_000,
    firstSuccessfulRepairMs: 14_000,
    tutorialCompletionMs: 22_000,
    recommendationShownCount: 4,
    recommendationAcceptedCount: 2,
    recommendationAcceptanceRate: 0.5,
    nodeTypeEncounterTiming: { relay: 10_000, decayer: 40_000 },
    invalidActionsCount: 2,
    invalidDragReleaseCount: 1,
    actionMix: { stabilizes: 4, repairs: 3, connects: 2 },
    nodeTypeMetrics: {
      relayConnectionsUsed: 1,
      amplifierBoosts: 2,
      stabilizerSaves: 1,
      decayerDamagePrevented: 1,
      coreRiskEvents: 0,
    },
  };
}

describe('evaluateTuningFlags', () => {
  it('marks healthy_run for solid sessions', () => {
    const flags = evaluateTuningFlags(baseReport());
    expect(flags).toContain('healthy_run');
  });

  it('marks early collapse when duration is too short', () => {
    const flags = evaluateTuningFlags({ ...baseReport(), durationMs: 20_000 });
    expect(flags).toContain('early_collapse_too_fast');
  });

  it('marks tutorial_not_completed when tutorial is missing', () => {
    const flags = evaluateTuningFlags({
      ...baseReport(),
      tutorialCompletionMs: null,
    });
    expect(flags).toContain('tutorial_not_completed');
  });

  it('marks recommendations_ignored when shown but never accepted', () => {
    const flags = evaluateTuningFlags({
      ...baseReport(),
      recommendationShownCount: 5,
      recommendationAcceptedCount: 0,
      recommendationAcceptanceRate: 0,
    });
    expect(flags).toContain('recommendations_ignored');
  });
});
