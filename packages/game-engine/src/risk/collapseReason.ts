import type { SessionState } from '../session/types';

export type CollapseReason =
  | 'global_stability_depleted'
  | 'core_signal_depleted'
  | 'too_many_broken_links'
  | 'overload_cascade'
  | 'no_viable_route';

export function getCollapseReason(
  session: SessionState,
): CollapseReason | null {
  if (!session.collapsed) return null;
  const broken = session.graph.links.filter((link) => link.broken).length;
  const overloaded = session.graph.nodes.filter(
    (node) => node.overload >= 90,
  ).length;
  if (session.stability <= 0) return 'global_stability_depleted';
  if (session.signalStrength <= 0) return 'core_signal_depleted';
  if (broken >= Math.max(2, Math.floor(session.graph.links.length * 0.6))) {
    return 'too_many_broken_links';
  }
  if (overloaded >= Math.max(2, Math.floor(session.graph.nodes.length * 0.5))) {
    return 'overload_cascade';
  }
  return 'no_viable_route';
}
