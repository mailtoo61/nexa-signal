import {
  canConnect,
  type ConnectInvalidReason,
} from '../validation/canConnect';
import { getNetworkRiskSnapshot } from '../risk/snapshot';
import type { PlayerAction, SessionState } from '../session/types';

export type TargetSelection =
  | { type: 'node'; id: string }
  | { type: 'link'; id: string }
  | { type: 'none' };

export interface AvailableAction {
  action: PlayerAction;
  actionType: PlayerAction['type'];
  valid: boolean;
  reason:
    | ConnectInvalidReason
    | 'already_stable'
    | 'link_too_damaged'
    | 'no_available_route'
    | 'invalid_target'
    | null;
  expectedEffect:
    | 'reduce_overload'
    | 'restore_link_strength'
    | 'redirect_flow'
    | 'create_connection'
    | 'remove_connection';
  targetType: 'node' | 'link';
  targetId: string;
}

export interface RecommendedAction {
  actionType: PlayerAction['type'];
  priority: number;
  reason:
    | 'because_overloaded'
    | 'because_link_weak'
    | 'because_collapse_risk_high'
    | 'because_amplifier_overload_risk'
    | 'because_decayer_nearby'
    | 'because_relay_route_viable';
  expectedEffect: AvailableAction['expectedEffect'];
  targetType: 'node' | 'link';
  targetId: string;
}

export function getAvailableActions(
  session: SessionState,
  selected: TargetSelection,
): AvailableAction[] {
  if (selected.type === 'node') {
    const node = session.graph.nodes.find((item) => item.id === selected.id);
    if (!node) return [];
    const peer = session.graph.nodes.find((item) => item.id !== node.id);
    const firstLink = session.graph.links.find((item) => item.from === node.id);
    const connectValidation = peer
      ? canConnect(session, node.id, peer.id)
      : { valid: false, reason: 'invalid_target' as const };

    return [
      {
        action: { type: 'stabilize', nodeId: node.id },
        actionType: 'stabilize',
        valid: node.overload >= 10,
        reason: node.overload < 10 ? 'already_stable' : null,
        expectedEffect: 'reduce_overload',
        targetType: 'node',
        targetId: node.id,
      },
      {
        action: { type: 'connect', from: node.id, to: peer?.id ?? node.id },
        actionType: 'connect',
        valid: Boolean(peer && connectValidation.valid),
        reason: peer ? connectValidation.reason : 'invalid_target',
        expectedEffect: 'create_connection',
        targetType: 'node',
        targetId: node.id,
      },
      {
        action: { type: 'disconnect', linkId: firstLink?.id ?? '' },
        actionType: 'disconnect',
        valid: Boolean(firstLink),
        reason: firstLink ? null : 'invalid_target',
        expectedEffect: 'remove_connection',
        targetType: 'node',
        targetId: node.id,
      },
    ];
  }

  if (selected.type === 'link') {
    const link = session.graph.links.find((item) => item.id === selected.id);
    if (!link) return [];
    const to = session.graph.nodes.find((item) => item.id !== link.to);
    return [
      {
        action: { type: 'repair', linkId: link.id },
        actionType: 'repair',
        valid: link.health <= 95 && !link.broken,
        reason: link.broken
          ? 'link_too_damaged'
          : link.health > 95
            ? 'already_stable'
            : null,
        expectedEffect: 'restore_link_strength',
        targetType: 'link',
        targetId: link.id,
      },
      {
        action: { type: 'redirect', linkId: link.id, to: to?.id ?? link.to },
        actionType: 'redirect',
        valid: Boolean(to),
        reason: to ? null : 'no_available_route',
        expectedEffect: 'redirect_flow',
        targetType: 'link',
        targetId: link.id,
      },
    ];
  }

  return [];
}

export function getRecommendedAction(
  session: SessionState,
  selected: TargetSelection,
): RecommendedAction | null {
  const actions = getAvailableActions(session, selected).filter(
    (item) => item.valid,
  );
  const risk = getNetworkRiskSnapshot(session);
  if (!actions.length) return null;

  const sorted = actions
    .map((action) => {
      let priority = 10;
      let reason: RecommendedAction['reason'] = 'because_link_weak';
      if (action.actionType === 'stabilize') {
        const node = session.graph.nodes.find((n) => n.id === action.targetId);
        const amplifierRisk = node?.type === 'amplifier' ? 18 : 0;
        priority =
          (node?.overload ?? 0) +
          amplifierRisk +
          (risk.riskLevel === 'critical' ? 40 : 0);
        reason =
          node?.type === 'amplifier'
            ? 'because_amplifier_overload_risk'
            : risk.riskLevel === 'critical'
              ? 'because_collapse_risk_high'
              : 'because_overloaded';
      } else if (action.actionType === 'repair') {
        const link = session.graph.links.find((l) => l.id === action.targetId);
        const from = session.graph.nodes.find((n) => n.id === link?.from);
        const to = session.graph.nodes.find((n) => n.id === link?.to);
        const decayerNearby =
          from?.type === 'decayer' || to?.type === 'decayer';
        priority =
          100 -
          (link?.health ?? 100) +
          (risk.riskLevel === 'critical' ? 30 : 0) +
          (decayerNearby ? 12 : 0);
        reason = decayerNearby
          ? 'because_decayer_nearby'
          : risk.riskLevel === 'critical'
            ? 'because_collapse_risk_high'
            : 'because_link_weak';
      } else if (action.actionType === 'connect') {
        const node = session.graph.nodes.find((n) => n.id === action.targetId);
        priority += node?.type === 'relay' ? 14 : 0;
        reason =
          node?.type === 'relay'
            ? 'because_relay_route_viable'
            : 'because_link_weak';
      } else if (risk.riskLevel === 'critical') {
        priority += 20;
        reason = 'because_collapse_risk_high';
      }

      return {
        actionType: action.actionType,
        priority,
        reason,
        expectedEffect: action.expectedEffect,
        targetType: action.targetType,
        targetId: action.targetId,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  return sorted[0] ?? null;
}
