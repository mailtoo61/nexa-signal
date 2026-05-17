import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import type { PresentationSnapshot } from '../bridge/presentationBridge';
import { findNodePosition, type PositionedNode } from '../scene/networkLayout';
import type { ThemeTokens } from '../themes/themes';
import { GlowLine } from '../primitives/GlowLine';

interface LinkLayerProps {
  snapshot: PresentationSnapshot;
  nodes: PositionedNode[];
  theme: ThemeTokens;
  pulsePhase: number;
  selectedLinkId: string | null;
  focusedLinkId: string | null;
  pulseLinkId: string | null;
}

export function LinkLayer({
  snapshot,
  nodes,
  theme,
  pulsePhase,
  selectedLinkId,
  focusedLinkId,
  pulseLinkId,
}: LinkLayerProps) {
  return (
    <Group>
      {snapshot.links.map((link) => {
        const from = findNodePosition(nodes, link.from);
        const to = findNodePosition(nodes, link.to);
        if (!from || !to) return null;
        const isSelected = selectedLinkId === link.id;
        const isFocused = focusedLinkId === link.id;
        const isPulsing = pulseLinkId === link.id;
        const isEmphasized = isSelected || isFocused || isPulsing;
        const flow = isEmphasized ? pulsePhase : (pulsePhase * 0.75 + 0.1) % 1;
        const beadX = from.x + (to.x - from.x) * flow;
        const beadY = from.y + (to.y - from.y) * flow;
        return (
          <Group key={link.id}>
            <GlowLine
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              color={
                isEmphasized
                  ? theme.colors.core
                  : link.health < 35
                    ? theme.colors.linkWeak
                    : theme.colors.link
              }
              weak={link.health < 45}
              broken={link.broken}
              critical={link.health < 22 && !link.broken}
              highlight={isEmphasized}
            />
            {!link.broken ? (
              <Circle
                cx={beadX}
                cy={beadY}
                r={isEmphasized ? 1.8 : 1.3}
                color={theme.colors.core}
                opacity={isEmphasized ? 0.46 : 0.2}
              />
            ) : null}
          </Group>
        );
      })}
    </Group>
  );
}
