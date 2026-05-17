export type Locale = 'en' | 'tr' | 'de' | 'es' | 'ja' | 'pt-BR';

export interface GameSettings {
  selectedLanguage: Locale;
  reducedMotionEnabled: boolean;
  hapticsEnabled: boolean;
  audioEnabled: boolean;
}

export interface SessionSummary {
  score: number;
  survivalSeconds: number;
  seed: string;
  endedAt: number;
  nodesStabilized: number;
  linksRepaired: number;
  connectionsCreated: number;
  criticalSaves: number;
  flowEfficiency: number;
  finalStability: number;
  signalGrade: 'A' | 'B' | 'C' | 'D';
  tuningVersion: string;
  collapseReason:
    | 'global_stability_depleted'
    | 'core_signal_depleted'
    | 'too_many_broken_links'
    | 'overload_cascade'
    | 'no_viable_route'
    | null;
  telemetry: {
    timeToFirstActionMs: number | null;
    firstOverloadMs: number | null;
    firstCollapseWarningMs: number | null;
    firstSuccessfulStabilizeMs: number | null;
    firstSuccessfulRepairMs: number | null;
    tutorialCompletionMs: number | null;
    invalidActions: number;
    stabilizes: number;
    repairs: number;
    connects: number;
    collapseWarningCount: number;
    nodeTypeEncounterTiming: Record<string, number>;
    averageRisk: number;
    recommendationAcceptanceRate: number;
    recommendationShownCount: number;
    recommendationAcceptedCount: number;
    legendOpenedCount: number;
    legendAutoShownCount: number;
    invalidDragReleaseCount: number;
    firstDragConnectMs: number | null;
    firstLegendOpenMs: number | null;
    sessionDurationMs: number;
    finalStability: number;
  };
  relayConnectionsUsed: number;
  amplifierBoosts: number;
  stabilizerSaves: number;
  decayerDamagePrevented: number;
  coreRiskEvents: number;
}

export type TuningFlag =
  | 'early_collapse_too_fast'
  | 'tutorial_not_completed'
  | 'recommendations_ignored'
  | 'too_many_invalid_actions'
  | 'decayer_seen_too_early'
  | 'amplifier_pressure_too_high'
  | 'low_repair_usage'
  | 'low_stabilize_usage'
  | 'healthy_run';

export interface PostRunTuningReport {
  schemaVersion: 1;
  tuningProfileTag: string;
  sessionId: string;
  seed: string;
  tuningVersion: string;
  sessionProfile: 'intro' | 'standard';
  durationMs: number;
  finalScore: number;
  collapseReason: SessionSummary['collapseReason'];
  averageRisk: number;
  firstOverloadMs: number | null;
  firstCollapseWarningMs: number | null;
  firstSuccessfulStabilizeMs: number | null;
  firstSuccessfulRepairMs: number | null;
  tutorialCompletionMs: number | null;
  recommendationShownCount: number;
  recommendationAcceptedCount: number;
  recommendationAcceptanceRate: number;
  nodeTypeEncounterTiming: Record<string, number>;
  invalidActionsCount: number;
  invalidDragReleaseCount: number;
  actionMix: {
    stabilizes: number;
    repairs: number;
    connects: number;
  };
  nodeTypeMetrics: {
    relayConnectionsUsed: number;
    amplifierBoosts: number;
    stabilizerSaves: number;
    decayerDamagePrevented: number;
    coreRiskEvents: number;
  };
  suggestedTuningFlags: TuningFlag[];
}

export type GameMode = 'mainRun' | 'zenFlow' | 'dailySignal';

export type AnalyticsEventName =
  | 'app_opened'
  | 'home_viewed'
  | 'session_started'
  | 'session_ended'
  | 'daily_started'
  | 'node_selected'
  | 'link_selected'
  | 'node_stabilized'
  | 'link_repaired'
  | 'action_invalid'
  | 'collapse_warning_shown'
  | 'summary_viewed'
  | 'session_restarted'
  | 'special_node_seen'
  | 'relay_connection_used'
  | 'amplifier_overload_event'
  | 'stabilizer_save_event'
  | 'decayer_damage_event'
  | 'post_run_tuning_report_created'
  | 'tutorial_completed'
  | 'recommendation_accepted'
  | 'recommendation_ignored'
  | 'legend_opened'
  | 'invalid_drag_release'
  | 'collapse_prevented'
  | 'theme_selected'
  | 'settings_changed';
