import type {
  getNetworkRiskSnapshot,
  getRecommendedAction,
} from '@nexa/game-engine';

type Recommendation = ReturnType<typeof getRecommendedAction>;
type RiskSnapshot = ReturnType<typeof getNetworkRiskSnapshot>;

export interface FocusTargets {
  nodeId: string | null;
  linkId: string | null;
}

export function resolveFocusTargets(
  recommendation: Recommendation,
  riskSnapshot: RiskSnapshot | null,
): FocusTargets {
  const recommendedNodeId =
    recommendation?.targetType === 'node' ? recommendation.targetId : null;
  const recommendedLinkId =
    recommendation?.targetType === 'link' ? recommendation.targetId : null;

  return {
    nodeId: recommendedNodeId ?? riskSnapshot?.mostCriticalNodeId ?? null,
    linkId: recommendedLinkId ?? riskSnapshot?.mostCriticalLinkId ?? null,
  };
}

export function mapActionSuccessToCopyKey(actionType: string): string | null {
  const map: Record<string, string> = {
    stabilize: 'actionResultStabilize',
    repair: 'actionResultRepair',
    redirect: 'actionResultRedirect',
    connect: 'actionResultRepair',
    disconnect: 'actionResultRedirect',
  };
  return map[actionType] ?? null;
}

export function mapRiskLevelToCopyKey(
  level: string | null | undefined,
): string {
  const map: Record<string, string> = {
    low: 'signalRisk_low',
    medium: 'signalRisk_medium',
    high: 'signalRisk_high',
    critical: 'signalRisk_critical',
  };
  return map[level ?? ''] ?? 'signalRisk_medium';
}
