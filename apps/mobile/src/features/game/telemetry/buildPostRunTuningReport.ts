import type { SessionState } from '@nexa/game-engine';
import type { PostRunTuningReport, SessionSummary } from '@nexa/types';
import type { RunTelemetrySnapshot } from './runTelemetryAggregator';
import {
  defaultFlagThresholds,
  evaluateTuningFlags,
  type PostRunFlagThresholds,
} from './tuningFlags';

export function buildPostRunTuningReport(
  session: SessionState,
  summary: SessionSummary,
  runTelemetry: RunTelemetrySnapshot,
  tuningProfileTag: string,
  thresholds: PostRunFlagThresholds = defaultFlagThresholds,
): PostRunTuningReport {
  const base = {
    schemaVersion: 1 as const,
    tuningProfileTag,
    sessionId: session.sessionId,
    seed: session.seed,
    tuningVersion: session.tuningVersion,
    sessionProfile: session.profile,
    durationMs: summary.telemetry.sessionDurationMs,
    finalScore: summary.score,
    collapseReason: summary.collapseReason,
    averageRisk: summary.telemetry.averageRisk,
    firstOverloadMs: summary.telemetry.firstOverloadMs,
    firstCollapseWarningMs: summary.telemetry.firstCollapseWarningMs,
    firstSuccessfulStabilizeMs: summary.telemetry.firstSuccessfulStabilizeMs,
    firstSuccessfulRepairMs: summary.telemetry.firstSuccessfulRepairMs,
    tutorialCompletionMs: runTelemetry.tutorialCompletionMs,
    recommendationShownCount: runTelemetry.recommendationShownCount,
    recommendationAcceptedCount: runTelemetry.recommendationAcceptedCount,
    recommendationAcceptanceRate: runTelemetry.recommendationAcceptanceRate,
    nodeTypeEncounterTiming: runTelemetry.nodeTypeEncounterTiming,
    invalidActionsCount: summary.telemetry.invalidActions,
    invalidDragReleaseCount: runTelemetry.invalidDragReleaseCount,
    actionMix: {
      stabilizes: summary.telemetry.stabilizes,
      repairs: summary.telemetry.repairs,
      connects: summary.telemetry.connects,
    },
    nodeTypeMetrics: {
      relayConnectionsUsed: summary.relayConnectionsUsed,
      amplifierBoosts: summary.amplifierBoosts,
      stabilizerSaves: summary.stabilizerSaves,
      decayerDamagePrevented: summary.decayerDamagePrevented,
      coreRiskEvents: summary.coreRiskEvents,
    },
  };

  return {
    ...base,
    suggestedTuningFlags: evaluateTuningFlags(base, thresholds),
  };
}
