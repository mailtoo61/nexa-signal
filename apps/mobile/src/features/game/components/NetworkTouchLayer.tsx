import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ImageSourcePropType,
  type PanResponderGestureState,
} from 'react-native';
import type { PresentationSnapshot } from '../../../presentation/bridge/presentationBridge';
import {
  findNodePosition,
  layoutNodes,
  type PositionedNode,
} from '../../../presentation/scene/networkLayout';

interface DragState {
  fromNodeId: string;
  x: number;
  y: number;
  hoverNodeId: string | null;
}

interface NetworkTouchLayerProps {
  width: number;
  height: number;
  snapshot: PresentationSnapshot;
  selectedNodeId: string | null;
  selectedLinkId: string | null;
  focusedNodeId?: string | null;
  focusedLinkId?: string | null;
  selectedNodeGlowSource?: ImageSourcePropType;
  reducedMotion?: boolean;
  onNodePress: (nodeId: string) => void;
  onLinkPress: (linkId: string) => void;
  onDragStart: () => void;
  onDragUpdate: (drag: DragState | null) => void;
  onDragConnect: (fromNodeId: string, toNodeId: string) => void;
  onDragCancel: () => void;
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared),
  );
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function findClosestNode(
  nodes: PositionedNode[],
  x: number,
  y: number,
  radius: number,
): PositionedNode | null {
  let best: PositionedNode | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const node of nodes) {
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < radius && dist < bestDist) {
      best = node;
      bestDist = dist;
    }
  }
  return best;
}

function linkTouchRects(
  nodes: PositionedNode[],
  snapshot: PresentationSnapshot,
) {
  return snapshot.links
    .map((link) => {
      const from = findNodePosition(nodes, link.from);
      const to = findNodePosition(nodes, link.to);
      if (!from || !to) return null;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const dist = distanceToSegment(midX, midY, from.x, from.y, to.x, to.y);
      return { id: link.id, x: midX, y: midY, dist };
    })
    .filter(
      (item): item is { id: string; x: number; y: number; dist: number } =>
        Boolean(item),
    );
}

export function NetworkTouchLayer({
  width,
  height,
  snapshot,
  selectedNodeId,
  selectedLinkId,
  focusedNodeId,
  focusedLinkId,
  selectedNodeGlowSource,
  reducedMotion = false,
  onNodePress,
  onLinkPress,
  onDragStart,
  onDragUpdate,
  onDragConnect,
  onDragCancel,
}: NetworkTouchLayerProps) {
  const nodes = useMemo(
    () => layoutNodes(snapshot, width, height),
    [height, snapshot, width],
  );
  const links = useMemo(
    () => linkTouchRects(nodes, snapshot),
    [nodes, snapshot],
  );
  const livePulse = useRef(new Animated.Value(0)).current;
  const ringScale = livePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.06],
  });
  const ringOpacity = livePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.34, 0.78],
  });

  useEffect(() => {
    if (reducedMotion) {
      livePulse.setValue(0.25);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [livePulse, reducedMotion]);

  const draggingRef = useRef<{
    fromNodeId: string;
    startedAt: number;
  } | null>(null);

  function updateDrag(
    event: GestureResponderEvent,
    _gesture: PanResponderGestureState,
  ) {
    const active = draggingRef.current;
    if (!active) return;
    const x = event.nativeEvent.locationX;
    const y = event.nativeEvent.locationY;
    const hover = findClosestNode(nodes, x, y, 34);
    onDragUpdate({
      fromNodeId: active.fromNodeId,
      x,
      y,
      hoverNodeId: hover && hover.id !== active.fromNodeId ? hover.id : null,
    });
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (event) => {
          const x = event.nativeEvent.locationX;
          const y = event.nativeEvent.locationY;
          const node = findClosestNode(nodes, x, y, 28);
          if (!node) return false;
          draggingRef.current = {
            fromNodeId: node.id,
            startedAt: Date.now(),
          };
          onDragStart();
          onDragUpdate({ fromNodeId: node.id, x, y, hoverNodeId: null });
          return true;
        },
        onPanResponderMove: updateDrag,
        onPanResponderRelease: (event) => {
          const active = draggingRef.current;
          if (!active) return;
          const x = event.nativeEvent.locationX;
          const y = event.nativeEvent.locationY;
          const hover = findClosestNode(nodes, x, y, 34);
          if (hover && hover.id !== active.fromNodeId) {
            onDragConnect(active.fromNodeId, hover.id);
          } else {
            onDragCancel();
          }
          draggingRef.current = null;
          onDragUpdate(null);
        },
        onPanResponderTerminate: () => {
          draggingRef.current = null;
          onDragCancel();
          onDragUpdate(null);
        },
      }),
    [nodes, onDragCancel, onDragConnect, onDragStart, onDragUpdate],
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
      <View
        style={StyleSheet.absoluteFillObject}
        {...panResponder.panHandlers}
      />
      {nodes.map((node) => (
        <View key={node.id}>
          {(() => {
            const isSelected = selectedNodeId === node.id;
            const isFocused = focusedNodeId === node.id;
            const isUnstable = node.overload >= 60;
            const showAura = isSelected || isFocused || isUnstable;
            if (!showAura) return null;
            return (
              <Animated.View
                style={[
                  styles.nodeAura,
                  {
                    left: node.x - 28,
                    top: node.y - 28,
                    borderColor: isSelected
                      ? '#75EAFF'
                      : isFocused
                        ? '#9B8CFF'
                        : '#FF9FB1',
                    opacity: reducedMotion ? 0.35 : ringOpacity,
                    transform: reducedMotion
                      ? undefined
                      : [{ scale: ringScale }],
                  },
                ]}
              >
                {selectedNodeGlowSource ? (
                  <Image
                    source={selectedNodeGlowSource}
                    resizeMode="contain"
                    style={[
                      styles.nodeGlowTexture,
                      isSelected
                        ? styles.nodeGlowSelected
                        : isFocused
                          ? styles.nodeGlowFocused
                          : styles.nodeGlowUnstable,
                    ]}
                  />
                ) : null}
              </Animated.View>
            );
          })()}
          <Pressable
            onPress={() => onNodePress(node.id)}
            hitSlop={6}
            style={[
              styles.node,
              {
                left: node.x - 22,
                top: node.y - 22,
                borderColor:
                  selectedNodeId === node.id ? '#9BE9FF' : 'transparent',
                backgroundColor:
                  focusedNodeId === node.id ? '#8DA2FF1C' : 'transparent',
              },
              selectedNodeId === node.id && styles.nodeSelected,
              focusedNodeId === node.id && styles.nodeFocused,
            ]}
          />
        </View>
      ))}
      {links.map((link) => (
        <Pressable
          key={link.id}
          onPress={() => onLinkPress(link.id)}
          hitSlop={8}
          style={[
            styles.link,
            {
              left: link.x - 18,
              top: link.y - 18,
              borderColor:
                selectedLinkId === link.id ? '#89B5FF' : 'transparent',
            },
            selectedLinkId === link.id && styles.linkSelected,
            focusedLinkId === link.id && styles.linkFocused,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  nodeAura: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeGlowTexture: {
    width: 74,
    height: 74,
    opacity: 0.54,
  },
  nodeGlowSelected: {
    opacity: 0.58,
  },
  nodeGlowFocused: {
    opacity: 0.44,
  },
  nodeGlowUnstable: {
    opacity: 0.36,
  },
  nodeSelected: {
    shadowColor: '#6EE9FF',
    shadowOpacity: 0.52,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 0 },
  },
  nodeFocused: {
    borderColor: '#8D7DFFA3',
    borderWidth: 1.5,
  },
  link: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  linkSelected: {
    shadowColor: '#86C7FF',
    shadowOpacity: 0.36,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  linkFocused: {
    borderColor: '#8D7DFF88',
  },
});
