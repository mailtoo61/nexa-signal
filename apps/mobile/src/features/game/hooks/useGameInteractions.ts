import { useCallback, useMemo, useState } from 'react';
import {
  getAvailableActions,
  getRecommendedAction,
  type PlayerAction,
  type SessionState,
} from '@nexa/game-engine';

export type SelectionState =
  | { type: 'none' }
  | { type: 'node'; id: string }
  | { type: 'link'; id: string };

export interface ActionDescriptor {
  key: string;
  labelKey: string;
  expectedKey?: string;
  action: PlayerAction;
  disabled: boolean;
  reasonKey?: string;
  recommended?: boolean;
}

export function mapInvalidReasonToCopyKey(
  reason: string | null | undefined,
): string | undefined {
  if (!reason) return undefined;
  const map: Record<string, string> = {
    out_of_range: 'targetOutOfRange',
    duplicate_connection: 'connectionAlreadyExists',
    self_connection_not_allowed: 'selfConnectionNotAllowed',
    max_connections_reached: 'maxConnectionsReached',
    not_enough_signal: 'notEnoughSignal',
    invalid_target: 'invalidTarget',
    already_stable: 'alreadyStable',
    link_too_damaged: 'linkTooDamaged',
    no_available_route: 'noAvailableRoute',
  };
  return map[reason] ?? 'invalidTarget';
}

export function mapExpectedEffectToCopyKey(effect: string): string {
  const map: Record<string, string> = {
    reduce_overload: 'effectStabilize',
    restore_link_strength: 'effectRepair',
    redirect_flow: 'effectRedirect',
    create_connection: 'effectConnect',
    remove_connection: 'effectDisconnect',
  };
  return map[effect] ?? 'effectStabilize';
}

export function useGameInteractions(session: SessionState | null) {
  const [selection, setSelection] = useState<SelectionState>({ type: 'none' });

  const selectNode = useCallback((id: string) => {
    setSelection({ type: 'node', id });
  }, []);

  const selectLink = useCallback((id: string) => {
    setSelection({ type: 'link', id });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ type: 'none' });
  }, []);

  const selectedTarget =
    selection.type === 'none' ? { type: 'none' as const } : selection;
  const selectedNodeType =
    selection.type === 'node'
      ? (session?.graph.nodes.find((node) => node.id === selection.id)?.type ??
        null)
      : null;
  const nodeTypeDescriptionKey = selectedNodeType
    ? `nodeTypeDesc_${selectedNodeType}`
    : null;

  const available = useMemo(() => {
    if (!session) return [];
    return getAvailableActions(session, selectedTarget);
  }, [selectedTarget, session]);

  const recommendation = useMemo(() => {
    if (!session) return null;
    return getRecommendedAction(session, selectedTarget);
  }, [selectedTarget, session]);

  const actions = useMemo<ActionDescriptor[]>(
    () =>
      available.map((item) => ({
        key: item.actionType,
        labelKey: item.actionType,
        expectedKey: mapExpectedEffectToCopyKey(item.expectedEffect),
        action: item.action,
        disabled: !item.valid,
        reasonKey: mapInvalidReasonToCopyKey(item.reason),
        recommended: recommendation?.actionType === item.actionType,
      })),
    [available, recommendation?.actionType],
  );

  return {
    selection,
    selectNode,
    selectLink,
    clearSelection,
    actions,
    recommendation,
    selectedNodeType,
    nodeTypeDescriptionKey,
  };
}
