import React from 'react';
import { Group } from '@shopify/react-native-skia';
import type { PositionedNode } from '../scene/networkLayout';
import type { ThemeTokens } from '../themes/themes';
import { NodeOrb } from '../primitives/NodeOrb';
import { PulseRing } from '../primitives/PulseRing';

interface NodeLayerProps {
  nodes: PositionedNode[];
  theme: ThemeTokens;
  pulsePhase: number;
  selectedNodeId: string | null;
  focusedNodeId: string | null;
  pulseNodeId: string | null;
  dragHoverNodeId: string | null;
}

export function NodeLayer({
  nodes,
  theme,
  pulsePhase,
  selectedNodeId,
  focusedNodeId,
  pulseNodeId,
  dragHoverNodeId,
}: NodeLayerProps) {
  const hasPriorityFocus =
    selectedNodeId !== null || focusedNodeId !== null || pulseNodeId !== null;

  return (
    <Group>
      {nodes.map((node) => {
        const overloadFactor = Math.min(1, node.overload / 100);
        const baseRadius =
          node.type === 'core' ? 13 : node.type === 'relay' ? 9 : 10;
        const r = baseRadius + overloadFactor * 6;
        const isSelected = selectedNodeId === node.id;
        const isFocused = focusedNodeId === node.id;
        const isPulsing = pulseNodeId === node.id;
        const isEmphasized = isSelected || isFocused || isPulsing;
        const quietNonPriority = hasPriorityFocus && !isEmphasized;
        const tone =
          node.type === 'decayer'
            ? '#9E8AC5'
            : node.type === 'amplifier'
              ? '#9FD8FF'
              : node.type === 'stabilizer'
                ? '#7CF7D4'
                : node.type === 'relay'
                  ? '#9ABFFF'
                  : theme.colors.node;
        return (
          <Group key={node.id}>
            <PulseRing
              x={node.x}
              y={node.y}
              radius={17 + pulsePhase * (node.type === 'core' ? 7 : 5.5)}
              color={
                node.overload > 75 ? theme.colors.danger : theme.colors.core
              }
              opacity={
                (0.15 + (1 - overloadFactor) * 0.14) *
                (quietNonPriority ? 0.7 : 1)
              }
            />
            {isFocused || isPulsing ? (
              <PulseRing
                x={node.x}
                y={node.y}
                radius={r + 8 + pulsePhase * 2.6}
                color={theme.colors.core}
                opacity={isPulsing ? 0.4 : 0.26}
              />
            ) : null}
            {node.type === 'relay' ? (
              <PulseRing
                x={node.x}
                y={node.y}
                radius={11 + pulsePhase * 2.5}
                color={tone}
                opacity={quietNonPriority ? 0.12 : 0.2}
              />
            ) : null}
            <NodeOrb
              x={node.x}
              y={node.y}
              radius={isEmphasized ? r + 2 : r}
              color={
                isEmphasized || dragHoverNodeId === node.id
                  ? theme.colors.core
                  : node.overload > 75
                    ? theme.colors.danger
                    : tone
              }
              glow={
                isEmphasized || dragHoverNodeId === node.id
                  ? 10
                  : node.type === 'amplifier'
                    ? 9
                    : node.type === 'stabilizer'
                      ? 7
                      : node.type === 'decayer'
                        ? 6
                        : node.stabilized
                          ? 8
                          : 4
              }
              alpha={
                (node.health < 35 ? 0.45 : 1) * (quietNonPriority ? 0.82 : 1)
              }
            />
          </Group>
        );
      })}
    </Group>
  );
}
