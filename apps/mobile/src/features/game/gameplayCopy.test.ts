import { describe, expect, it } from 'vitest';
import {
  mapActionSuccessToCopyKey,
  mapRiskLevelToCopyKey,
  resolveFocusTargets,
} from './gameplayCopy';
import { mapInvalidReasonToCopyKey } from './hooks/useGameInteractions';

describe('gameplay copy mappings', () => {
  it('prefers recommendation target for focus labels', () => {
    const focus = resolveFocusTargets(
      {
        actionType: 'repair',
        priority: 2,
        reason: 'because_link_weak',
        expectedEffect: 'restore_link_strength',
        targetType: 'link',
        targetId: 'l-2',
      },
      {
        riskLevel: 'high',
        mostCriticalNodeId: 'n-4',
        mostCriticalLinkId: 'l-9',
        collapseProximity: 0.7,
        overloadCount: 2,
        brokenLinkCount: 1,
        weakLinkCount: 2,
        urgentAction: 'repair',
      },
    );

    expect(focus.nodeId).toBe('n-4');
    expect(focus.linkId).toBe('l-2');
  });

  it('maps success feedback copy for supported actions', () => {
    expect(mapActionSuccessToCopyKey('stabilize')).toBe(
      'actionResultStabilize',
    );
    expect(mapActionSuccessToCopyKey('repair')).toBe('actionResultRepair');
    expect(mapActionSuccessToCopyKey('redirect')).toBe('actionResultRedirect');
  });

  it('maps risk levels to player-friendly labels', () => {
    expect(mapRiskLevelToCopyKey('low')).toBe('signalRisk_low');
    expect(mapRiskLevelToCopyKey('critical')).toBe('signalRisk_critical');
    expect(mapRiskLevelToCopyKey('unknown')).toBe('signalRisk_medium');
  });

  it('maps invalid action reasons to non-technical copy keys', () => {
    expect(mapInvalidReasonToCopyKey('already_stable')).toBe('alreadyStable');
    expect(mapInvalidReasonToCopyKey('max_connections_reached')).toBe(
      'maxConnectionsReached',
    );
    expect(mapInvalidReasonToCopyKey('invalid_target')).toBe('invalidTarget');
  });
});
