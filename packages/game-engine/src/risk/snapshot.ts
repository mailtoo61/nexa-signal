import type { SessionState } from '../session/types';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface NetworkRiskSnapshot {
  riskLevel: RiskLevel;
  mostCriticalNodeId: string | null;
  mostCriticalLinkId: string | null;
  collapseProximity: number;
  overloadCount: number;
  brokenLinkCount: number;
  weakLinkCount: number;
  urgentAction: 'stabilize' | 'repair' | 'connect' | 'redirect' | null;
}

export function getNetworkRiskSnapshot(
  session: SessionState,
): NetworkRiskSnapshot {
  const overloaded = session.graph.nodes.filter((node) => node.overload >= 70);
  const weak = session.graph.links.filter(
    (link) => link.health < 45 && !link.broken,
  );
  const broken = session.graph.links.filter((link) => link.broken);

  const collapseProximity = Math.max(
    0,
    Math.min(
      1,
      1 - (session.stability * 0.6 + session.signalStrength * 0.4) / 100,
    ),
  );
  const riskLevel: RiskLevel =
    collapseProximity > 0.8
      ? 'critical'
      : collapseProximity > 0.55
        ? 'high'
        : collapseProximity > 0.3
          ? 'medium'
          : 'low';

  const criticalNode =
    session.graph.nodes
      .slice()
      .sort((a, b) => b.overload - a.overload || a.health - b.health)[0] ??
    null;
  const criticalLink =
    session.graph.links.slice().sort((a, b) => a.health - b.health)[0] ?? null;

  const urgentAction = broken.length
    ? 'repair'
    : overloaded.length
      ? 'stabilize'
      : weak.length
        ? 'repair'
        : session.signalStrength < 30
          ? 'connect'
          : null;

  return {
    riskLevel,
    mostCriticalNodeId: criticalNode?.id ?? null,
    mostCriticalLinkId: criticalLink?.id ?? null,
    collapseProximity,
    overloadCount: overloaded.length,
    brokenLinkCount: broken.length,
    weakLinkCount: weak.length,
    urgentAction,
  };
}
