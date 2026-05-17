import React from 'react';
import { Group } from '@shopify/react-native-skia';
import type { PresentationSnapshot } from '../bridge/presentationBridge';
import { findNodePosition, type PositionedNode } from '../scene/networkLayout';
import type { ThemeTokens } from '../themes/themes';
import { GlowLine } from '../primitives/GlowLine';

interface LinkLayerProps {
  snapshot: PresentationSnapshot;
  nodes: PositionedNode[];
  theme: ThemeTokens;
  selectedLinkId: string | null;
  focusedLinkId: string | null;
  pulseLinkId: string | null;
}

export function LinkLayer({
  snapshot,
  nodes,
  theme,
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
        return (
          <GlowLine
            key={link.id}
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
        );
      })}
    </Group>
  );
}
