import { describe, expect, it } from 'vitest';
import type { SessionState } from '@nexa/game-engine';
import type { SessionSummary } from '@nexa/types';
import { buildPostRunTuningReport } from './buildPostRunTuningReport';

const mockSession = {
  sessionId: 'session-1',
  seed: 'intro-1',
  profile: 'intro',
  tuningVersion: 'v1.1.0',
} as SessionState;

const mockSummary = {
  score: 780,
  survivalSeconds: 52,
  seed: 'intro-1',
  endedAt: 0,
  nodesStabilized: 3,
  linksRepaired: 2,
  connectionsCreated: 1,
  criticalSaves: 1,
  flowEfficiency: 80,
  finalStability: 25,
  signalGrade: 'C',
  tuningVersion: 'v1.1.0',
  collapseReason: 'overload_cascade',
  telemetry: {
    timeToFirstActionMs: 1000,
    firstOverloadMs: 12000,
    firstCollapseWarningMs: 18000,
    firstSuccessfulStabilizeMs: 6000,
    firstSuccessfulRepairMs: 9000,
    tutorialCompletionMs: 12000,
    invalidActions: 2,
    stabilizes: 3,
    repairs: 2,
    connects: 1,
    collapseWarningCount: 1,
    nodeTypeEncounterTiming: { relay: 4000 },
    averageRisk: 56,
    recommendationAcceptanceRate: 0.5,
    recommendationShownCount: 2,
    recommendationAcceptedCount: 1,
    legendOpenedCount: 1,
    legendAutoShownCount: 1,
    invalidDragReleaseCount: 1,
    firstDragConnectMs: 5000,
    firstLegendOpenMs: 3000,
    sessionDurationMs: 52000,
    finalStability: 25,
  },
  relayConnectionsUsed: 1,
  amplifierBoosts: 2,
  stabilizerSaves: 1,
  decayerDamagePrevented: 1,
  coreRiskEvents: 0,
} as SessionSummary;

describe('buildPostRunTuningReport', () => {
  it('builds stable schema payload with deterministic fields', () => {
    const report = buildPostRunTuningReport(
      mockSession,
      mockSummary,
      {
        tutorialCompletionMs: 12000,
        recommendationShownCount: 2,
        recommendationAcceptedCount: 1,
        recommendationAcceptanceRate: 0.5,
        nodeTypeEncounterTiming: { relay: 4000 },
        legendOpenedCount: 1,
        legendAutoShownCount: 1,
        invalidDragReleaseCount: 1,
        firstDragConnectMs: 5000,
        firstLegendOpenMs: 3000,
      },
      'baseline',
    );

    expect(report.schemaVersion).toBe(1);
    expect(report.tuningProfileTag).toBe('baseline');
    expect(report.sessionId).toBe('session-1');
    expect(report.actionMix.stabilizes).toBe(3);
    expect(Array.isArray(report.suggestedTuningFlags)).toBe(true);
  });
});
