import React, { memo, useMemo } from 'react';
import { Canvas, Circle, Group, Line } from '@shopify/react-native-skia';
import { useAmbientParticles } from '../particles/useAmbientParticles';
import { findNodePosition, layoutNodes } from '../scene/networkLayout';
import { getTheme } from '../themes/themes';
import { BackgroundLayer } from './BackgroundLayer';
import { LinkLayer } from './LinkLayer';
import { NodeLayer } from './NodeLayer';
import { ParticleLayer } from './ParticleLayer';
import type { SignalSceneProps } from './SignalScene.types';

function SignalSceneRaw({
  width,
  height,
  snapshot,
  themeId,
  reducedMotion,
  selectedNodeId = null,
  selectedLinkId = null,
  focusedNodeId = null,
  focusedLinkId = null,
  pulseNodeId = null,
  pulseLinkId = null,
  dragPreview = null,
}: SignalSceneProps) {
  const theme = getTheme(themeId);
  const nodes = useMemo(
    () => layoutNodes(snapshot, width, height),
    [snapshot, width, height],
  );
  const particles = useAmbientParticles(
    width,
    height,
    reducedMotion ? 10 : 22,
    reducedMotion,
  );
  const pulsePhase = reducedMotion ? 0.35 : (snapshot.tick % 10) / 10;
  const ambientPhase = reducedMotion ? 0.45 : (snapshot.tick % 120) / 120;
  const dragFrom = dragPreview
    ? findNodePosition(nodes, dragPreview.fromNodeId)
    : null;

  return (
    <Canvas style={{ width, height }}>
      <BackgroundLayer width={width} height={height} theme={theme} />
      <Group>
        <Circle
          cx={width * 0.5}
          cy={height * 0.52}
          r={Math.min(width, height) * (0.34 + ambientPhase * 0.02)}
          color={theme.colors.core}
          opacity={reducedMotion ? 0.03 : 0.045}
        />
        <Circle
          cx={width * 0.5}
          cy={height * 0.52}
          r={Math.min(width, height) * (0.45 + ambientPhase * 0.025)}
          color={theme.colors.link}
          opacity={reducedMotion ? 0.018 : 0.028}
        />
      </Group>
      <ParticleLayer particles={particles} color={theme.colors.core} />
      <LinkLayer
        snapshot={snapshot}
        nodes={nodes}
        theme={theme}
        selectedLinkId={selectedLinkId}
        focusedLinkId={focusedLinkId}
        pulseLinkId={pulseLinkId}
      />
      <NodeLayer
        nodes={nodes}
        theme={theme}
        pulsePhase={pulsePhase}
        selectedNodeId={selectedNodeId}
        focusedNodeId={focusedNodeId}
        pulseNodeId={pulseNodeId}
        dragHoverNodeId={dragPreview?.hoverNodeId ?? null}
      />
      {dragFrom && dragPreview ? (
        <Group>
          <Line
            p1={{ x: dragFrom.x, y: dragFrom.y }}
            p2={{ x: dragPreview.x, y: dragPreview.y }}
            color={theme.colors.core}
            strokeWidth={reducedMotion ? 1.5 : 2.5}
            opacity={0.72}
          />
          <Circle
            cx={dragPreview.x}
            cy={dragPreview.y}
            r={reducedMotion ? 4 : 6}
            color={theme.colors.core}
            opacity={0.6}
          />
        </Group>
      ) : null}
      <Group>
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={22 + pulsePhase * 5}
          color={theme.colors.core}
          opacity={0.5}
        />
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={12}
          color={theme.colors.core}
        />
      </Group>
    </Canvas>
  );
}

export const SignalScene = memo(SignalSceneRaw);
