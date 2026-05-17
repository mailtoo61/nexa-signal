import type { PostRunTuningReport, TuningFlag } from '@nexa/types';

export interface PostRunFlagThresholds {
  earlyCollapseMs: number;
  tutorialDeadlineMs: number;
  minRecommendationsForIgnoreFlag: number;
  highInvalidActionCount: number;
  introDecayerEarliestMs: number;
  earlyRiskWindowMs: number;
  earlyHighRiskThreshold: number;
  lowRepairThreshold: number;
  lowStabilizeThreshold: number;
  healthyRunMinDurationMs: number;
}

export const defaultFlagThresholds: PostRunFlagThresholds = {
  earlyCollapseMs: 30_000,
  tutorialDeadlineMs: 45_000,
  minRecommendationsForIgnoreFlag: 3,
  highInvalidActionCount: 6,
  introDecayerEarliestMs: 28_000,
  earlyRiskWindowMs: 35_000,
  earlyHighRiskThreshold: 62,
  lowRepairThreshold: 1,
  lowStabilizeThreshold: 1,
  healthyRunMinDurationMs: 60_000,
};

export function evaluateTuningFlags(
  report: Omit<PostRunTuningReport, 'suggestedTuningFlags'>,
  thresholds: PostRunFlagThresholds = defaultFlagThresholds,
): TuningFlag[] {
  const flags = new Set<TuningFlag>();

  if (report.durationMs < thresholds.earlyCollapseMs) {
    flags.add('early_collapse_too_fast');
  }

  if (
    report.tutorialCompletionMs === null ||
    report.tutorialCompletionMs > thresholds.tutorialDeadlineMs
  ) {
    flags.add('tutorial_not_completed');
  }

  if (
    report.recommendationShownCount >=
      thresholds.minRecommendationsForIgnoreFlag &&
    report.recommendationAcceptedCount === 0
  ) {
    flags.add('recommendations_ignored');
  }

  if (report.invalidActionsCount >= thresholds.highInvalidActionCount) {
    flags.add('too_many_invalid_actions');
  }

  const decayerFirstSeenMs = report.nodeTypeEncounterTiming.decayer;
  if (
    report.sessionProfile === 'intro' &&
    typeof decayerFirstSeenMs === 'number' &&
    decayerFirstSeenMs < thresholds.introDecayerEarliestMs
  ) {
    flags.add('decayer_seen_too_early');
  }

  if (
    report.durationMs <= thresholds.earlyRiskWindowMs &&
    report.averageRisk >= thresholds.earlyHighRiskThreshold
  ) {
    flags.add('amplifier_pressure_too_high');
  }

  if (report.actionMix.repairs <= thresholds.lowRepairThreshold) {
    flags.add('low_repair_usage');
  }

  if (report.actionMix.stabilizes <= thresholds.lowStabilizeThreshold) {
    flags.add('low_stabilize_usage');
  }

  if (
    report.durationMs >= thresholds.healthyRunMinDurationMs &&
    report.invalidActionsCount <= 3 &&
    report.recommendationAcceptanceRate >= 0.34
  ) {
    flags.add('healthy_run');
  }

  return [...flags];
}
