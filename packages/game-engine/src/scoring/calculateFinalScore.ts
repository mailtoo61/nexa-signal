import { engineTuning } from '../config/tuning';
import type { SessionState } from '../session/types';

export function calculateFinalScore(state: SessionState): number {
  const stabilizedNodes = state.metrics.nodesStabilized;
  const healthyLinks = state.graph.links.filter(
    (link) => link.health > 70,
  ).length;
  const survivalBonus = Math.floor(state.elapsedMs / 1000);
  const saveBonus =
    state.metrics.criticalSaves * engineTuning.scoring.criticalSaveBonus;
  const connectionBonus =
    state.metrics.connectionsCreated *
    engineTuning.scoring.connectionCreatedBonus;

  return (
    state.score +
    stabilizedNodes * engineTuning.scoring.stabilizedBonus +
    healthyLinks * engineTuning.scoring.healthyLinkBonus +
    state.tick * engineTuning.scoring.tickBonus +
    survivalBonus * engineTuning.scoring.survivalSecondBonus +
    saveBonus +
    connectionBonus
  );
}
