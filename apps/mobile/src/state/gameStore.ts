import { create } from 'zustand';
import {
  applyAction,
  calculateFinalScore,
  createSession,
  engineTuning,
  getCollapseReason,
  stepSession,
} from '@nexa/game-engine';
import type { PlayerAction, SessionState } from '@nexa/game-engine';
import type {
  GameMode,
  PostRunTuningReport,
  SessionSummary,
} from '@nexa/types';
import {
  loadBestScore,
  loadLifetimeStats,
  savePostRunTuningReport,
  saveBestScore,
  saveLastSummary,
  saveLifetimeStats,
  type LifetimeStats,
} from '../shared/storage/persistence';
import type { RunTelemetrySnapshot } from '../features/game/telemetry/runTelemetryAggregator';
import { buildPostRunTuningReport } from '../features/game/telemetry/buildPostRunTuningReport';
import {
  initialRecoverySnapshot,
  reduceRecoveryState,
  type RecoverySnapshot,
} from './recoveryState';

interface EndedSessionPayload {
  summary: SessionSummary;
  report: PostRunTuningReport;
  isNewBest: boolean;
}

interface GameStore {
  mode: GameMode;
  session: SessionState | null;
  bestScore: number;
  stats: LifetimeStats;
  warningCount: number;
  recovery: RecoverySnapshot;
  startSession: (seed: string, mode: GameMode) => void;
  restoreSession: (session: SessionState, mode: GameMode) => void;
  recoveryCheck: () => void;
  recoveryValid: () => void;
  recoveryRestoring: (sessionId: string) => void;
  recoveryRestored: (sessionId: string) => void;
  recoveryInvalid: (reason?: string) => void;
  recoveryExpired: () => void;
  recoveryCleared: () => void;
  resetRecovery: () => void;
  tick: () => void;
  applyPlayerAction: (action: PlayerAction) => boolean;
  endSession: (
    runTelemetry: RunTelemetrySnapshot,
    tuningProfileTag: string,
  ) => EndedSessionPayload | null;
  hydratePersistence: () => Promise<void>;
  registerCollapseWarning: () => void;
}

function nowSeed(): string {
  return `seed-${Date.now()}`;
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 1200) return 'A';
  if (score >= 800) return 'B';
  if (score >= 450) return 'C';
  return 'D';
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'mainRun',
  session: null,
  bestScore: 0,
  stats: { totalSessionsPlayed: 0, totalNodesStabilized: 0 },
  warningCount: 0,
  recovery: initialRecoverySnapshot,

  startSession: (seed, mode) => {
    const resolvedSeed = seed.length > 0 ? seed : nowSeed();
    set({
      session: createSession(resolvedSeed),
      mode,
      warningCount: 0,
      recovery: reduceRecoveryState(get().recovery, { type: 'reset' }),
    });
  },

  restoreSession: (session, mode) => {
    set({ session, mode, warningCount: 0 });
  },
  recoveryCheck: () =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, { type: 'check' }),
    })),
  recoveryValid: () =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, { type: 'valid' }),
    })),
  recoveryRestoring: (sessionId) =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, {
        type: 'restoring',
        sessionId,
      }),
    })),
  recoveryRestored: (sessionId) =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, {
        type: 'restored',
        sessionId,
      }),
    })),
  recoveryInvalid: (reason) =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, {
        type: 'invalid',
        reason,
      }),
    })),
  recoveryExpired: () =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, { type: 'expired' }),
    })),
  recoveryCleared: () =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, { type: 'cleared' }),
    })),
  resetRecovery: () =>
    set((state) => ({
      recovery: reduceRecoveryState(state.recovery, { type: 'reset' }),
    })),

  tick: () => {
    const current = get().session;
    if (!current) return;
    set({ session: stepSession(current) });
  },

  applyPlayerAction: (action) => {
    const current = get().session;
    if (!current) return false;
    const next = applyAction(current, action);
    const isInvalid =
      next.metrics.invalidActions > current.metrics.invalidActions;
    set({ session: next });
    return !isInvalid;
  },

  endSession: (runTelemetry, tuningProfileTag) => {
    const session = get().session;
    if (!session) return null;
    const score = calculateFinalScore(session);
    const isNewBest = score > get().bestScore;
    const bestScore = Math.max(get().bestScore, score);
    const summary: SessionSummary = {
      score,
      seed: session.seed,
      endedAt: Date.now(),
      survivalSeconds: Math.floor(session.elapsedMs / 1000),
      nodesStabilized: session.metrics.nodesStabilized,
      linksRepaired: session.metrics.linksRepaired,
      connectionsCreated: session.metrics.connectionsCreated,
      criticalSaves: session.metrics.criticalSaves,
      flowEfficiency: session.signalStrength,
      finalStability: session.stability,
      signalGrade: scoreToGrade(score),
      tuningVersion: engineTuning.version,
      collapseReason: getCollapseReason(session),
      telemetry: {
        timeToFirstActionMs:
          session.metrics.firstActionTick === null
            ? null
            : session.metrics.firstActionTick * 500,
        firstOverloadMs:
          session.metrics.firstOverloadTick === null
            ? null
            : session.metrics.firstOverloadTick * 500,
        firstCollapseWarningMs:
          session.metrics.firstCollapseWarningTick === null
            ? null
            : session.metrics.firstCollapseWarningTick * 500,
        firstSuccessfulStabilizeMs:
          session.metrics.firstSuccessfulStabilizeTick === null
            ? null
            : session.metrics.firstSuccessfulStabilizeTick * 500,
        firstSuccessfulRepairMs:
          session.metrics.firstSuccessfulRepairTick === null
            ? null
            : session.metrics.firstSuccessfulRepairTick * 500,
        invalidActions: session.metrics.invalidActions,
        stabilizes: session.metrics.nodesStabilized,
        repairs: session.metrics.linksRepaired,
        connects: session.metrics.connectionsCreated,
        collapseWarningCount: get().warningCount,
        recommendationShownCount: runTelemetry.recommendationShownCount,
        recommendationAcceptedCount: runTelemetry.recommendationAcceptedCount,
        averageRisk:
          session.metrics.riskSamples === 0
            ? 0
            : session.metrics.riskSum / session.metrics.riskSamples,
        recommendationAcceptanceRate: runTelemetry.recommendationAcceptanceRate,
        legendOpenedCount: runTelemetry.legendOpenedCount,
        legendAutoShownCount: runTelemetry.legendAutoShownCount,
        invalidDragReleaseCount: runTelemetry.invalidDragReleaseCount,
        firstDragConnectMs: runTelemetry.firstDragConnectMs,
        firstLegendOpenMs: runTelemetry.firstLegendOpenMs,
        sessionDurationMs: session.elapsedMs,
        finalStability: session.stability,
        tutorialCompletionMs: runTelemetry.tutorialCompletionMs,
        nodeTypeEncounterTiming: runTelemetry.nodeTypeEncounterTiming,
      },
      relayConnectionsUsed: session.metrics.relayConnectionsUsed,
      amplifierBoosts: session.metrics.amplifierBoosts,
      stabilizerSaves: session.metrics.stabilizerSaves,
      decayerDamagePrevented: session.metrics.decayerDamagePrevented,
      coreRiskEvents: session.metrics.coreRiskEvents,
    };
    const nextStats: LifetimeStats = {
      totalSessionsPlayed: get().stats.totalSessionsPlayed + 1,
      totalNodesStabilized:
        get().stats.totalNodesStabilized + session.metrics.nodesStabilized,
    };
    const report = buildPostRunTuningReport(
      session,
      summary,
      runTelemetry,
      tuningProfileTag,
    );

    set({ session: null, bestScore, stats: nextStats });
    void saveBestScore(bestScore);
    void saveLastSummary(summary);
    void savePostRunTuningReport(report);
    void saveLifetimeStats(nextStats);

    return { summary, report, isNewBest };
  },

  hydratePersistence: async () => {
    const [bestScore, stats] = await Promise.all([
      loadBestScore(),
      loadLifetimeStats(),
    ]);
    set({ bestScore, stats });
  },

  registerCollapseWarning: () => {
    set((state) => ({ warningCount: state.warningCount + 1 }));
  },
}));
