import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { findNodePosition, layoutNodes } from '../scene/networkLayout';
import { getTheme } from '../themes/themes';
import type { SignalSceneProps } from './SignalScene.types';

function SignalSceneWebRaw({
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
  const dragFrom = dragPreview
    ? findNodePosition(nodes, dragPreview.fromNodeId)
    : null;
  const hasPriorityFocus =
    selectedNodeId !== null || focusedNodeId !== null || pulseNodeId !== null;

  return (
    <View
      style={[
        styles.root,
        {
          width,
          height,
          backgroundColor: theme.colors.bgTop,
        },
      ]}
    >
      <View
        style={[
          styles.ambientFar,
          {
            backgroundColor: theme.colors.link,
          },
        ]}
      />
      <View
        style={[
          styles.ambientMid,
          {
            backgroundColor: theme.colors.core,
          },
        ]}
      />
      <View
        style={[
          styles.coreOuter,
          {
            left: width / 2 - 24,
            top: height / 2 - 24,
            borderColor: theme.colors.core,
            opacity: reducedMotion ? 0.4 : 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.coreInner,
          {
            left: width / 2 - 10,
            top: height / 2 - 10,
            backgroundColor: theme.colors.core,
          },
        ]}
      />

      {snapshot.links.map((link) => {
        const from = findNodePosition(nodes, link.from);
        const to = findNodePosition(nodes, link.to);
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const isSelected = selectedLinkId === link.id;
        const isFocused = focusedLinkId === link.id;
        const isPulsing = pulseLinkId === link.id;
        const isEmphasized = isSelected || isFocused || isPulsing;
        const strength = link.broken ? 0.22 : link.health >= 65 ? 0.6 : 0.42;

        return (
          <View
            key={link.id}
            style={[
              styles.link,
              {
                left: from.x,
                top: from.y,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
                borderTopColor: isEmphasized
                  ? theme.colors.core
                  : theme.colors.link,
                borderTopWidth: isPulsing ? 4 : isEmphasized ? 3 : 2,
                opacity: isPulsing ? 0.96 : isEmphasized ? 0.88 : strength,
              },
            ]}
          />
        );
      })}

      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isFocused = focusedNodeId === node.id;
        const isPulsing = pulseNodeId === node.id;
        const isEmphasized = isSelected || isFocused || isPulsing;
        const quietNonPriority = hasPriorityFocus && !isEmphasized;
        const isDragHover = dragPreview?.hoverNodeId === node.id;
        const size = isEmphasized ? 20 : 14;
        const color = isDragHover ? theme.colors.core : theme.colors.node;
        return (
          <React.Fragment key={node.id}>
            {isEmphasized ? (
              <View
                style={[
                  styles.nodeRing,
                  {
                    left: node.x - 16,
                    top: node.y - 16,
                    borderColor: theme.colors.core,
                    opacity: isPulsing ? 0.85 : quietNonPriority ? 0.34 : 0.52,
                  },
                ]}
              />
            ) : null}
            <View
              style={[
                styles.node,
                {
                  left: node.x - size / 2,
                  top: node.y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: isEmphasized ? theme.colors.core : color,
                  opacity: isEmphasized ? 1 : quietNonPriority ? 0.7 : 0.88,
                },
              ]}
            />
          </React.Fragment>
        );
      })}

      {dragFrom && dragPreview ? (
        <>
          <View
            style={[
              styles.link,
              {
                left: dragFrom.x,
                top: dragFrom.y,
                width: Math.hypot(
                  dragPreview.x - dragFrom.x,
                  dragPreview.y - dragFrom.y,
                ),
                transform: [
                  {
                    rotate: `${
                      (Math.atan2(
                        dragPreview.y - dragFrom.y,
                        dragPreview.x - dragFrom.x,
                      ) *
                        180) /
                      Math.PI
                    }deg`,
                  },
                ],
                borderTopColor: theme.colors.core,
                borderTopWidth: 2,
                opacity: 0.75,
              },
            ]}
          />
          <View
            style={[
              styles.dragDot,
              {
                left: dragPreview.x - 4,
                top: dragPreview.y - 4,
                backgroundColor: theme.colors.core,
              },
            ]}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  coreOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  coreInner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  ambientFar: {
    position: 'absolute',
    left: '-16%',
    top: '-20%',
    width: '132%',
    height: '34%',
    opacity: 0.035,
  },
  ambientMid: {
    position: 'absolute',
    left: '-6%',
    top: '44%',
    width: '112%',
    height: '32%',
    opacity: 0.04,
  },
  link: {
    position: 'absolute',
    transformOrigin: 'left center',
  },
  node: {
    position: 'absolute',
  },
  nodeRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  dragDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.85,
  },
});

export const SignalScene = memo(SignalSceneWebRaw);
