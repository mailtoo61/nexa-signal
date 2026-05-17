import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import type { PostRunTuningReport, SessionSummary } from '@nexa/types';
import { useGameStore } from '../../state/gameStore';
import { designTokens } from '../../shared/design/tokens';
import { SceneFade } from '../../presentation/transitions/SceneFade';
import { SignalScene } from '../../presentation/render/SignalScene';
import { toPresentationSnapshot } from '../../presentation/bridge/presentationBridge';
import { useReducedMotion } from '../../shared/accessibility/useReducedMotion';
import { GameHud } from './components/GameHud';
import { CollapseMeter } from './components/CollapseMeter';
import { SelectionPanel } from './components/SelectionPanel';
import { SessionSummaryPanel } from './components/SessionSummary';
import { DevPerformanceOverlay } from './components/DevPerformanceOverlay';
import { PlaytestLabPanel } from './components/PlaytestLabPanel';
import { TutorialHint } from './components/TutorialHint';
import { NodeLegend } from './components/NodeLegend';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameInteractions } from './hooks/useGameInteractions';
import { mapActionSuccessToCopyKey, resolveFocusTargets } from './gameplayCopy';
import { NetworkTouchLayer } from './components/NetworkTouchLayer';
import {
  onActionInvalid,
  onActionSuccess,
  onCollapseWarningShown,
  onConnectSuccess,
  onDragStart,
  onInvalidDragRelease,
  onSelectLink,
  onSelectNode,
  onSessionEnded,
  onSummaryViewed,
  onValidDragHover,
  type FeedbackSettings,
} from '../../presentation/effects/gameplayFeedback';
import {
  clearResumableSessionSnapshot,
  saveResumableSessionSnapshot,
  loadTutorialSeen,
  loadCurrentTuningProfileTag,
  loadSavedTuningProfileTags,
  loadExperimentNotesByTag,
  saveSavedTuningProfileTags,
  saveExperimentNoteByTag,
  saveCurrentTuningProfileTag,
  loadPostRunTuningReportHistory,
  clearPostRunTuningReportHistory,
  exportAllPostRunTuningReportsJson,
  loadSpecialHintsSeen,
  saveSpecialHintsSeen,
  saveTutorialSeen,
} from '../../shared/storage/persistence';
import { tr } from '../../shared/i18n/tr';
import { track } from '../../shared/analytics/analytics';
import { canConnect, getNetworkRiskSnapshot } from '@nexa/game-engine';
import { RunTelemetryAggregator } from './telemetry/runTelemetryAggregator';
import { DEFAULT_TUNING_PROFILE_TAG } from '../../shared/dev/tuningProfileTag';
import {
  decideResumableSnapshotSave,
  type SaveReason,
} from '../../shared/storage/resumeSavePolicy';
import { useAppSettingsStore } from '../../state/appSettingsStore';
import { getSignalAssetSource } from '../../shared/assets/registry';
import { shouldAutoStartSession } from './gameResumeWiring';

interface EndedPayload {
  summary: SessionSummary;
  report: PostRunTuningReport;
  isNewBest: boolean;
}

interface DragPreview {
  fromNodeId: string;
  x: number;
  y: number;
  hoverNodeId: string | null;
}

export function GameScreen(): React.JSX.Element {
  const locale = useAppSettingsStore((state) => state.selectedLanguage);
  const audioEnabled = useAppSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useAppSettingsStore((state) => state.hapticsEnabled);
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const startSession = useGameStore((state) => state.startSession);
  const tick = useGameStore((state) => state.tick);
  const session = useGameStore((state) => state.session);
  const endSession = useGameStore((state) => state.endSession);
  const bestScore = useGameStore((state) => state.bestScore);
  const registerCollapseWarning = useGameStore(
    (state) => state.registerCollapseWarning,
  );

  const [ended, setEnded] = useState<EndedPayload | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState(true);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [tutorialProgress, setTutorialProgress] = useState({
    tappedNode: false,
    stabilized: false,
    draggedConnect: false,
    repaired: false,
  });
  const [specialHintsSeen, setSpecialHintsSeen] = useState<string[]>([]);
  const [activeSpecialHintKey, setActiveSpecialHintKey] = useState<
    string | null
  >(null);
  const [legendCollapsed, setLegendCollapsed] = useState(true);
  const [actionFeedbackKey, setActionFeedbackKey] = useState<string | null>(
    null,
  );
  const [pulseNodeId, setPulseNodeId] = useState<string | null>(null);
  const [pulseLinkId, setPulseLinkId] = useState<string | null>(null);
  const [tutorialLoaded, setTutorialLoaded] = useState(false);
  const [playtestLabOpen, setPlaytestLabOpen] = useState(false);
  const [playtestReports, setPlaytestReports] = useState<PostRunTuningReport[]>(
    [],
  );
  const [summaryActionLocked, setSummaryActionLocked] = useState(false);
  const [activeTuningProfileTag, setActiveTuningProfileTag] = useState(
    DEFAULT_TUNING_PROFILE_TAG,
  );
  const [savedTuningTags, setSavedTuningTags] = useState<string[]>([
    DEFAULT_TUNING_PROFILE_TAG,
  ]);
  const [experimentNotesByTag, setExperimentNotesByTag] = useState<
    Record<string, string>
  >({});
  const warningTrackedRef = useRef(false);
  const startedSessionRef = useRef<string>('');
  const lastHoverRef = useRef<string | null>(null);
  const lastAmplifierBoostRef = useRef(0);
  const lastStabilizerSaveRef = useRef(0);
  const lastDecayerPreventedRef = useRef(0);
  const telemetryRef = useRef<RunTelemetryAggregator | null>(null);
  const lastSavedSnapshotRef = useRef<
    ReturnType<typeof decideResumableSnapshotSave>['snapshot'] | null
  >(null);
  const lastSavedFingerprintRef = useRef<string | null>(null);
  const pendingSaveReasonRef = useRef<SaveReason>('tick');
  const persistenceEpochRef = useRef(0);
  const sessionLifecycleIdRef = useRef<string | null>(null);
  const feedbackRise = useRef(new Animated.Value(0)).current;
  const invalidShake = useRef(new Animated.Value(0)).current;
  const focusGlow = useRef(new Animated.Value(0)).current;
  const entryAtmosphereFade = useRef(new Animated.Value(1)).current;
  const entryProgress = useRef(new Animated.Value(0)).current;

  const feedbackSettings: FeedbackSettings = useMemo(
    () => ({
      audioEnabled,
      hapticsEnabled,
      reducedFeedback: reducedMotion,
    }),
    [audioEnabled, hapticsEnabled, reducedMotion],
  );

  useEffect(() => {
    void Promise.all([
      loadTutorialSeen(),
      loadSpecialHintsSeen(),
      loadCurrentTuningProfileTag(),
      loadSavedTuningProfileTags(),
      loadExperimentNotesByTag(),
    ]).then(([seen, special, tag, savedTags, notes]) => {
      setTutorialSeen(seen);
      setSpecialHintsSeen(special);
      setActiveTuningProfileTag(tag);
      setSavedTuningTags(savedTags);
      setExperimentNotesByTag(notes);
      setTutorialLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (
      !shouldAutoStartSession({
        tutorialLoaded,
        session,
        endedVisible: Boolean(ended),
      })
    ) {
      return;
    }
    const seedPrefix = tutorialSeen ? 'run' : 'intro';
    startSession(`${seedPrefix}-${Date.now()}`, 'mainRun');
  }, [ended, session, startSession, tutorialLoaded, tutorialSeen]);

  useGameLoop(Boolean(session), reducedMotion ? 800 : 500, tick);

  useEffect(() => {
    if (!session) return;
    if (startedSessionRef.current !== session.sessionId) {
      startedSessionRef.current = session.sessionId;
      telemetryRef.current = new RunTelemetryAggregator(Date.now());
      track({ name: 'session_started', timestamp: Date.now() });
    }
    if (session.stability <= 40 && !warningTrackedRef.current) {
      warningTrackedRef.current = true;
      registerCollapseWarning();
      onCollapseWarningShown();
    }
  }, [registerCollapseWarning, session]);

  useEffect(() => {
    if (!session || !telemetryRef.current) return;
    for (const node of session.graph.nodes) {
      telemetryRef.current.onNodeTypeEncountered(node.type, Date.now());
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (session.metrics.amplifierBoosts > lastAmplifierBoostRef.current) {
      track({ name: 'amplifier_overload_event', timestamp: Date.now() });
      lastAmplifierBoostRef.current = session.metrics.amplifierBoosts;
    }
    if (session.metrics.stabilizerSaves > lastStabilizerSaveRef.current) {
      track({ name: 'stabilizer_save_event', timestamp: Date.now() });
      lastStabilizerSaveRef.current = session.metrics.stabilizerSaves;
    }
    if (
      session.metrics.decayerDamagePrevented > lastDecayerPreventedRef.current
    ) {
      track({ name: 'decayer_damage_event', timestamp: Date.now() });
      lastDecayerPreventedRef.current = session.metrics.decayerDamagePrevented;
    }
  }, [session]);

  useEffect(() => {
    if (!session?.collapsed) return;
    persistenceEpochRef.current += 1;
    const clearEpoch = persistenceEpochRef.current;
    void clearResumableSessionSnapshot();
    if (clearEpoch === persistenceEpochRef.current) {
      lastSavedSnapshotRef.current = null;
      lastSavedFingerprintRef.current = null;
    }
    const runTelemetry = telemetryRef.current?.buildSnapshot();
    if (!runTelemetry) return;
    const payload = endSession(runTelemetry, activeTuningProfileTag);
    if (!payload) return;
    if (
      payload.report.recommendationShownCount > 0 &&
      payload.report.recommendationAcceptedCount === 0
    ) {
      track({ name: 'recommendation_ignored', timestamp: Date.now() });
    }
    track({
      name: 'post_run_tuning_report_created',
      timestamp: Date.now(),
      payload: {
        flags: payload.report.suggestedTuningFlags.join(','),
        profile: payload.report.sessionProfile,
      },
    });
    track({
      name: 'session_ended',
      timestamp: Date.now(),
      payload: {
        durationSeconds: payload.summary.survivalSeconds,
        collapseReason: payload.summary.collapseReason ?? 'unknown',
        score: payload.summary.score,
        earlyFailure: payload.summary.survivalSeconds < 45 ? 'yes' : 'no',
      },
    });
    onSessionEnded();
    onSummaryViewed();
    setEnded(payload);
  }, [activeTuningProfileTag, endSession, session?.collapsed]);

  useEffect(() => {
    if (!session || session.collapsed) return;

    const decision = decideResumableSnapshotSave({
      reason: pendingSaveReasonRef.current,
      currentSession: session,
      lastSavedSnapshot: lastSavedSnapshotRef.current,
      lastSavedFingerprint: lastSavedFingerprintRef.current,
    });
    pendingSaveReasonRef.current = 'tick';
    if (!decision.shouldSave) return;

    const writeEpoch = persistenceEpochRef.current;
    void saveResumableSessionSnapshot(decision.snapshot).then(() => {
      if (writeEpoch !== persistenceEpochRef.current) return;
      lastSavedSnapshotRef.current = decision.snapshot;
      lastSavedFingerprintRef.current = decision.fingerprint;
    });
  }, [session]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'background') return;
      const activeSession = useGameStore.getState().session;
      if (!activeSession || activeSession.collapsed) return;
      const decision = decideResumableSnapshotSave({
        reason: 'background',
        currentSession: activeSession,
        lastSavedSnapshot: lastSavedSnapshotRef.current,
        lastSavedFingerprint: lastSavedFingerprintRef.current,
      });
      if (!decision.shouldSave) return;
      const writeEpoch = persistenceEpochRef.current;
      void saveResumableSessionSnapshot(decision.snapshot).then(() => {
        if (writeEpoch !== persistenceEpochRef.current) return;
        lastSavedSnapshotRef.current = decision.snapshot;
        lastSavedFingerprintRef.current = decision.fingerprint;
      });
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!activeSpecialHintKey) return;
    const id = setTimeout(() => setActiveSpecialHintKey(null), 3200);
    return () => clearTimeout(id);
  }, [activeSpecialHintKey]);

  useEffect(() => {
    if (!actionFeedbackKey) return;
    const isInvalid =
      actionFeedbackKey === 'chooseNodeFirst' ||
      actionFeedbackKey === 'invalidTarget';
    feedbackRise.setValue(0);
    if (!reducedMotion) {
      Animated.timing(feedbackRise, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      if (isInvalid) {
        invalidShake.setValue(0);
        Animated.sequence([
          Animated.timing(invalidShake, {
            toValue: 1,
            duration: 70,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(invalidShake, {
            toValue: -1,
            duration: 95,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(invalidShake, {
            toValue: 0,
            duration: 110,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    const id = setTimeout(() => setActionFeedbackKey(null), 1650);
    return () => clearTimeout(id);
  }, [actionFeedbackKey, feedbackRise, invalidShake, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      focusGlow.setValue(0.35);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(focusGlow, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(focusGlow, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [focusGlow, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      entryAtmosphereFade.setValue(0);
      entryProgress.setValue(1);
      return;
    }
    entryAtmosphereFade.setValue(1);
    entryProgress.setValue(0);
    Animated.parallel([
      Animated.timing(entryAtmosphereFade, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(entryProgress, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryAtmosphereFade, entryProgress, reducedMotion]);

  useEffect(() => {
    if (!pulseNodeId && !pulseLinkId) return;
    const id = setTimeout(() => {
      setPulseNodeId(null);
      setPulseLinkId(null);
    }, 900);
    return () => clearTimeout(id);
  }, [pulseLinkId, pulseNodeId]);

  const snapshot = useMemo(() => toPresentationSnapshot(session), [session]);
  const {
    selection,
    selectNode,
    selectLink,
    clearSelection,
    actions,
    recommendation,
    selectedNodeType,
    nodeTypeDescriptionKey,
  } = useGameInteractions(session);
  const riskSnapshot = useMemo(
    () => (session ? getNetworkRiskSnapshot(session) : null),
    [session],
  );
  const focusTargets = useMemo(
    () => resolveFocusTargets(recommendation, riskSnapshot),
    [recommendation, riskSnapshot],
  );

  const focusNodeLabel = useMemo(() => {
    if (!focusTargets.nodeId || !session) return null;
    const node = session.graph.nodes.find(
      (item) => item.id === focusTargets.nodeId,
    );
    if (!node) return null;
    return tr(locale, `nodeType_${node.type}`);
  }, [focusTargets.nodeId, locale, session]);

  useEffect(() => {
    if (!session) return;
    if (sessionLifecycleIdRef.current === session.sessionId) return;
    sessionLifecycleIdRef.current = session.sessionId;
    warningTrackedRef.current = false;
    clearSelection();
    setDragPreview(null);
    setPulseNodeId(null);
    setPulseLinkId(null);
    setActionFeedbackKey(null);
    setEnded(null);
    setSummaryActionLocked(false);
    pendingSaveReasonRef.current =
      lastSavedSnapshotRef.current === null
        ? 'session_start'
        : 'session_restart';
  }, [clearSelection, session]);

  useEffect(() => {
    telemetryRef.current?.onRecommendationShown(recommendation);
  }, [recommendation]);

  useEffect(() => {
    if (!__DEV__ || !playtestLabOpen) return;
    void loadPostRunTuningReportHistory().then((reports) => {
      setPlaytestReports(reports);
    });
  }, [playtestLabOpen]);

  useEffect(() => {
    if (!__DEV__ || !playtestLabOpen || Platform.OS !== 'web') return;
    const eventTarget = globalThis as unknown as {
      addEventListener?: (
        type: string,
        listener: (event: unknown) => void,
      ) => void;
      removeEventListener?: (
        type: string,
        listener: (event: unknown) => void,
      ) => void;
    };
    if (!eventTarget.addEventListener || !eventTarget.removeEventListener) {
      return;
    }
    const onKeyDown = (event: unknown) => {
      const key = (event as { key?: string }).key;
      if (key !== 'Escape') return;
      setPlaytestLabOpen(false);
    };
    eventTarget.addEventListener('keydown', onKeyDown);
    return () => eventTarget.removeEventListener?.('keydown', onKeyDown);
  }, [playtestLabOpen]);

  const tutorialStep: 0 | 1 | 2 | 3 = useMemo(() => {
    if (!tutorialProgress.tappedNode) return 0;
    if (!tutorialProgress.stabilized) return 1;
    if (!tutorialProgress.draggedConnect) return 2;
    if (!tutorialProgress.repaired) return 3;
    return 3;
  }, [tutorialProgress]);
  const onboardingHintKey = useMemo(() => {
    if (tutorialProgress.repaired) return null;
    if (!tutorialProgress.tappedNode) return 'tutorialTapNode';
    if (!tutorialProgress.stabilized) return 'tutorialStabilize';
    if (!tutorialProgress.draggedConnect) return 'tutorialDragConnect';
    return 'tutorialRepair';
  }, [tutorialProgress]);
  const showOnboardingGuidance =
    snapshot.elapsedMs < 22000 && !tutorialProgress.repaired;
  const sessionBooting = !session || snapshot.nodes.length === 0;
  const showCompactTutorialHint =
    !showOnboardingGuidance && !sessionBooting && !tutorialSeen;
  const isDesktopWeb = Platform.OS === 'web' && width >= 900;
  const frameWidth = isDesktopWeb ? Math.min(460, width - 48) : width;
  const frameHeight = isDesktopWeb ? Math.min(920, height - 40) : height;
  const feedbackTranslateY = feedbackRise.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 0],
  });
  const feedbackOpacity = feedbackRise.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const shakeX = invalidShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-4, 0, 4],
  });
  const focusHintOpacity = focusGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });
  const entryShellOpacity = entryProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });
  const entryShellTranslateY = entryProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 0],
  });
  const entryCoreEchoOpacity = entryProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0],
  });
  const hudEntryOpacity = entryProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  const hudEntryTranslateY = entryProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });
  const signalNodeGlow = getSignalAssetSource('signalNodeGlow');
  const sceneState: 'booting' | 'live' | 'summary' = ended
    ? 'summary'
    : sessionBooting
      ? 'booting'
      : 'live';

  const actionItems = useMemo(
    () =>
      actions.map((item) => ({
        key: item.key,
        labelKey: item.labelKey,
        expectedKey: item.expectedKey,
        disabled: item.disabled,
        reasonKey: item.reasonKey,
        recommended: item.recommended,
        onPress: async () => {
          if (item.disabled || !session) {
            setActionFeedbackKey(
              selection.type === 'none'
                ? 'chooseNodeFirst'
                : (item.reasonKey ?? 'invalidTarget'),
            );
            await onActionInvalid(feedbackSettings);
            return;
          }
          const targetId =
            item.action.type === 'stabilize'
              ? item.action.nodeId
              : item.action.type === 'repair' ||
                  item.action.type === 'disconnect' ||
                  item.action.type === 'redirect'
                ? item.action.linkId
                : item.action.from;
          const ok = useGameStore.getState().applyPlayerAction(item.action);
          if (!ok) {
            setActionFeedbackKey(
              selection.type === 'none'
                ? 'chooseNodeFirst'
                : (item.reasonKey ?? 'invalidTarget'),
            );
            await onActionInvalid(feedbackSettings);
            return;
          }
          const successKey = mapActionSuccessToCopyKey(item.action.type);
          if (successKey) {
            setActionFeedbackKey(successKey);
            if (item.action.type === 'stabilize') {
              track({ name: 'node_stabilized', timestamp: Date.now() });
            } else if (
              item.action.type === 'repair' ||
              item.action.type === 'redirect' ||
              item.action.type === 'disconnect'
            ) {
              track({ name: 'link_repaired', timestamp: Date.now() });
            }
          }
          if (item.action.type === 'stabilize') {
            setPulseNodeId(item.action.nodeId);
            setPulseLinkId(null);
          } else if (
            item.action.type === 'repair' ||
            item.action.type === 'redirect' ||
            item.action.type === 'disconnect'
          ) {
            setPulseLinkId(item.action.linkId);
            setPulseNodeId(null);
          } else if (item.action.type === 'connect') {
            setPulseNodeId(item.action.to);
            setPulseLinkId(null);
          }
          pendingSaveReasonRef.current = 'player_action';
          const accepted = telemetryRef.current?.onActionApplied(
            item.action.type,
            targetId,
          );
          if (accepted) {
            track({ name: 'recommendation_accepted', timestamp: Date.now() });
          }
          if (item.key === 'stabilize') {
            setTutorialProgress((prev) => ({ ...prev, stabilized: true }));
            await onActionSuccess(feedbackSettings, 'node_stabilized');
          } else if (item.key === 'repair') {
            setTutorialProgress((prev) => ({ ...prev, repaired: true }));
            await onActionSuccess(feedbackSettings, 'link_repaired');
            if (!tutorialSeen) {
              setTutorialSeen(true);
              telemetryRef.current?.onTutorialCompleted(Date.now());
              track({ name: 'tutorial_completed', timestamp: Date.now() });
              void saveTutorialSeen(true);
            }
          }
        },
      })),
    [actions, feedbackSettings, selection.type, session, tutorialSeen],
  );

  return (
    <SceneFade>
      <SafeAreaView style={styles.root}>
        <View
          style={[
            styles.sceneFrame,
            isDesktopWeb && styles.sceneFrameDesktop,
            { width: frameWidth, height: frameHeight },
          ]}
        >
          <SignalScene
            width={frameWidth}
            height={frameHeight}
            snapshot={snapshot}
            themeId="defaultSignal"
            reducedMotion={reducedMotion}
            selectedNodeId={selection.type === 'node' ? selection.id : null}
            selectedLinkId={selection.type === 'link' ? selection.id : null}
            focusedNodeId={focusTargets.nodeId}
            focusedLinkId={focusTargets.linkId}
            pulseNodeId={pulseNodeId}
            pulseLinkId={pulseLinkId}
            dragPreview={dragPreview}
          />

          <NetworkTouchLayer
            width={frameWidth}
            height={frameHeight}
            snapshot={snapshot}
            selectedNodeId={selection.type === 'node' ? selection.id : null}
            selectedLinkId={selection.type === 'link' ? selection.id : null}
            focusedNodeId={focusTargets.nodeId}
            focusedLinkId={focusTargets.linkId}
            selectedNodeGlowSource={signalNodeGlow}
            reducedMotion={reducedMotion}
            onNodePress={async (nodeId) => {
              setTutorialProgress((prev) => ({ ...prev, tappedNode: true }));
              selectNode(nodeId);
              const node = session?.graph.nodes.find(
                (item) => item.id === nodeId,
              );
              if (
                node &&
                !specialHintsSeen.includes(node.type) &&
                node.type !== 'core'
              ) {
                const next = [...specialHintsSeen, node.type];
                setSpecialHintsSeen(next);
                void saveSpecialHintsSeen(next);
                telemetryRef.current?.onLegendAutoShown();
                const keyMap: Record<string, string> = {
                  relay: 'tutorialSpecialRelay',
                  amplifier: 'tutorialSpecialAmplifier',
                  stabilizer: 'tutorialSpecialStabilizer',
                  decayer: 'tutorialSpecialDecayer',
                };
                setActiveSpecialHintKey(keyMap[node.type] ?? null);
                track({
                  name: 'special_node_seen',
                  timestamp: Date.now(),
                  payload: { nodeType: node.type },
                });
              }
              await onSelectNode(feedbackSettings);
            }}
            onLinkPress={async (linkId) => {
              selectLink(linkId);
              await onSelectLink(feedbackSettings);
            }}
            onDragStart={async () => {
              await onDragStart(feedbackSettings);
            }}
            onDragUpdate={async (drag) => {
              let nextDrag = drag;
              if (drag && drag.hoverNodeId && session) {
                const validity = canConnect(
                  session,
                  drag.fromNodeId,
                  drag.hoverNodeId,
                );
                if (!validity.valid) {
                  nextDrag = { ...drag, hoverNodeId: null };
                }
              }
              setDragPreview(nextDrag);
              if (
                nextDrag &&
                nextDrag.hoverNodeId &&
                lastHoverRef.current !== nextDrag.hoverNodeId
              ) {
                const valid =
                  session &&
                  canConnect(session, nextDrag.fromNodeId, nextDrag.hoverNodeId)
                    .valid;
                if (valid) {
                  lastHoverRef.current = nextDrag.hoverNodeId;
                  await onValidDragHover(feedbackSettings);
                }
              }
              if (!drag) {
                lastHoverRef.current = null;
              }
            }}
            onDragConnect={async (fromNodeId, toNodeId) => {
              if (!session) return;
              const validation = canConnect(session, fromNodeId, toNodeId);
              if (!validation.valid) {
                telemetryRef.current?.onInvalidDragRelease();
                track({ name: 'invalid_drag_release', timestamp: Date.now() });
                await onInvalidDragRelease(feedbackSettings);
                setDragPreview(null);
                return;
              }
              const ok = useGameStore.getState().applyPlayerAction({
                type: 'connect',
                from: fromNodeId,
                to: toNodeId,
              });
              if (ok) {
                pendingSaveReasonRef.current = 'player_action';
                telemetryRef.current?.onFirstDragConnect(Date.now());
                setTutorialProgress((prev) => ({
                  ...prev,
                  draggedConnect: true,
                }));
                const fromType = session?.graph.nodes.find(
                  (n) => n.id === fromNodeId,
                )?.type;
                const toType = session?.graph.nodes.find(
                  (n) => n.id === toNodeId,
                )?.type;
                if (fromType === 'relay' || toType === 'relay') {
                  track({
                    name: 'relay_connection_used',
                    timestamp: Date.now(),
                  });
                }
                await onConnectSuccess(feedbackSettings);
              } else {
                telemetryRef.current?.onInvalidDragRelease();
                track({ name: 'invalid_drag_release', timestamp: Date.now() });
                await onInvalidDragRelease(feedbackSettings);
              }
              setDragPreview(null);
            }}
            onDragCancel={async () => {
              if (dragPreview) {
                telemetryRef.current?.onInvalidDragRelease();
                track({ name: 'invalid_drag_release', timestamp: Date.now() });
                await onInvalidDragRelease(feedbackSettings);
              }
              setDragPreview(null);
            }}
          />

          <View pointerEvents="box-none" style={styles.overlay}>
            {!reducedMotion ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.entryCoreEcho,
                  { opacity: entryCoreEchoOpacity },
                ]}
              />
            ) : null}
            {__DEV__ ? (
              <DevPerformanceOverlay
                nodeCount={snapshot.nodes.length}
                linkCount={snapshot.links.length}
                reducedMotion={reducedMotion}
                sceneState={sceneState}
              />
            ) : null}
            {!reducedMotion ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.entryAtmosphereReveal,
                  { opacity: entryAtmosphereFade },
                ]}
              />
            ) : null}
            <View pointerEvents="none" style={styles.atmosphereVeilTop} />
            <View pointerEvents="none" style={styles.atmosphereVeilBottom} />
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.topStack,
                reducedMotion
                  ? undefined
                  : {
                      opacity: hudEntryOpacity,
                      transform: [{ translateY: hudEntryTranslateY }],
                    },
              ]}
            >
              {showOnboardingGuidance && !sessionBooting ? (
                <View pointerEvents="none" style={styles.onboardingGuide}>
                  <Text style={styles.onboardingLine}>
                    {tr(locale, onboardingHintKey ?? 'keepSignalAlive')}
                  </Text>
                </View>
              ) : null}

              <GameHud
                locale={locale}
                stability={snapshot.stability}
                signalStrength={snapshot.signalStrength}
                score={snapshot.score}
                survivalSeconds={Math.floor(snapshot.elapsedMs / 1000)}
              />

              <CollapseMeter locale={locale} stability={snapshot.stability} />
            </Animated.View>

            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.bottomStack,
                reducedMotion
                  ? undefined
                  : {
                      opacity: entryShellOpacity,
                      transform: [{ translateY: entryShellTranslateY }],
                    },
              ]}
            >
              {sessionBooting ? (
                <View style={styles.bootState}>
                  <Text style={styles.bootLine}>{tr(locale, 'appTitle')}</Text>
                  <Text style={styles.bootSubLine}>
                    {tr(locale, 'keepSignalAlive')}
                  </Text>
                </View>
              ) : null}
              <TutorialHint
                locale={locale}
                visible={showCompactTutorialHint}
                step={tutorialStep}
              />
              {activeSpecialHintKey ? (
                <TutorialHint
                  locale={locale}
                  visible
                  step={0}
                  overrideKey={activeSpecialHintKey}
                />
              ) : null}
              <NodeLegend
                locale={locale}
                knownTypes={specialHintsSeen}
                collapsed={legendCollapsed}
                onToggle={() =>
                  setLegendCollapsed((prev) => {
                    const next = !prev;
                    if (!next) {
                      telemetryRef.current?.onLegendOpened(Date.now());
                      track({ name: 'legend_opened', timestamp: Date.now() });
                    }
                    return next;
                  })
                }
              />

              <Animated.View
                pointerEvents="box-none"
                style={
                  reducedMotion
                    ? undefined
                    : {
                        transform: [{ translateX: shakeX }],
                      }
                }
              >
                <SelectionPanel
                  locale={locale}
                  title={
                    selection.type === 'node'
                      ? `${tr(locale, 'selectedNode')}: ${
                          selectedNodeType
                            ? tr(locale, `nodeType_${selectedNodeType}`)
                            : tr(locale, 'focusNode')
                        }`
                      : selection.type === 'link'
                        ? tr(locale, 'selectedLink')
                        : tr(locale, 'noSelection')
                  }
                  helperLine={
                    selection.type === 'none'
                      ? showOnboardingGuidance
                        ? null
                        : tr(locale, 'chooseNodeFirst')
                      : nodeTypeDescriptionKey
                        ? tr(locale, nodeTypeDescriptionKey)
                        : recommendation
                          ? tr(locale, recommendation.reason)
                          : tr(locale, 'objectiveKeepStability')
                  }
                  actions={actionItems}
                />
              </Animated.View>
              {actionFeedbackKey ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.actionFeedback,
                    reducedMotion
                      ? undefined
                      : {
                          opacity: feedbackOpacity,
                          transform: [{ translateY: feedbackTranslateY }],
                        },
                  ]}
                >
                  <Text style={styles.actionFeedbackText}>
                    {tr(locale, actionFeedbackKey)}
                  </Text>
                </Animated.View>
              ) : null}
              {riskSnapshot?.mostCriticalNodeId && !sessionBooting ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.focusHint,
                    reducedMotion ? undefined : { opacity: focusHintOpacity },
                  ]}
                >
                  <View pointerEvents="none" style={styles.focusGlyph}>
                    <View style={styles.focusGlyphOuter} />
                    <View style={styles.focusGlyphInner} />
                  </View>
                  <Text style={styles.criticalText}>
                    {tr(locale, 'focusNode')}:{' '}
                    {focusNodeLabel ?? tr(locale, 'focusNode')}
                  </Text>
                </Animated.View>
              ) : null}
            </Animated.View>
          </View>

          {ended ? (
            <SessionSummaryPanel
              locale={locale}
              summary={ended.summary}
              report={ended.report}
              bestScore={bestScore}
              isNewBest={ended.isNewBest}
              onRestart={async () => {
                if (summaryActionLocked) return;
                setSummaryActionLocked(true);
                track({ name: 'session_restarted', timestamp: Date.now() });
                persistenceEpochRef.current += 1;
                await clearResumableSessionSnapshot();
                lastSavedSnapshotRef.current = null;
                lastSavedFingerprintRef.current = null;
                warningTrackedRef.current = false;
                clearSelection();
                setDragPreview(null);
                setPulseNodeId(null);
                setPulseLinkId(null);
                setActionFeedbackKey(null);
                setEnded(null);
                setPlaytestLabOpen(false);
                telemetryRef.current = null;
                setTutorialProgress({
                  tappedNode: false,
                  stabilized: false,
                  draggedConnect: false,
                  repaired: false,
                });
                const seedPrefix = tutorialSeen ? 'run' : 'intro';
                useGameStore
                  .getState()
                  .startSession(`${seedPrefix}-${Date.now()}`, 'mainRun');
                await onDragStart(feedbackSettings);
                await onActionSuccess(feedbackSettings, 'session_restarted');
                setSummaryActionLocked(false);
              }}
              onHome={() => {
                if (summaryActionLocked) return;
                setSummaryActionLocked(true);
                persistenceEpochRef.current += 1;
                void clearResumableSessionSnapshot();
                lastSavedSnapshotRef.current = null;
                lastSavedFingerprintRef.current = null;
                router.replace('/');
              }}
              onOpenPlaytestLab={
                __DEV__
                  ? () => {
                      setPlaytestLabOpen(true);
                    }
                  : undefined
              }
            />
          ) : null}
          {__DEV__ && playtestLabOpen ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(locale, 'cancel')}
                style={styles.playtestBackdrop}
                onPress={() => setPlaytestLabOpen(false)}
              />
              <PlaytestLabPanel
                locale={locale}
                reports={playtestReports}
                runtimeVersion="dev-local-v1"
                activeTuningProfileTag={activeTuningProfileTag}
                savedTuningTags={savedTuningTags}
                experimentNotesByTag={experimentNotesByTag}
                onClose={() => setPlaytestLabOpen(false)}
                onClearReports={async () => {
                  await clearPostRunTuningReportHistory();
                  setPlaytestReports([]);
                }}
                onExportReports={async () =>
                  exportAllPostRunTuningReportsJson()
                }
                onChangeActiveTag={async (tag) => {
                  setActiveTuningProfileTag(tag);
                  await saveCurrentTuningProfileTag(tag);
                }}
                onSaveSavedTags={async (tags) => {
                  setSavedTuningTags(tags);
                  await saveSavedTuningProfileTags(tags);
                }}
                onSaveExperimentNote={async (tag, note) => {
                  const next = await saveExperimentNoteByTag(tag, note);
                  setExperimentNotesByTag(next);
                }}
              />
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </SceneFade>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneFrame: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#050B19',
  },
  sceneFrameDesktop: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#2B447033',
    shadowColor: '#57D8FF',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.lg,
    justifyContent: 'space-between',
    gap: designTokens.spacing.xs,
  },
  entryAtmosphereReveal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#78D7FF1F',
    zIndex: 8,
  },
  entryCoreEcho: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    alignSelf: 'center',
    top: '24%',
    backgroundColor: '#7AD9FF1A',
  },
  atmosphereVeilTop: {
    position: 'absolute',
    width: '122%',
    height: '44%',
    left: '-11%',
    top: '-9%',
    backgroundColor: '#1A2E571A',
  },
  atmosphereVeilBottom: {
    position: 'absolute',
    width: '128%',
    height: '56%',
    left: '-14%',
    bottom: '-18%',
    backgroundColor: '#0E1F3F20',
  },
  topStack: {
    gap: 10,
  },
  bottomStack: {
    gap: 9,
  },
  bootState: {
    alignSelf: 'center',
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#41658E88',
    backgroundColor: '#0C1831D8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 2,
  },
  bootLine: {
    color: '#D6EBFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  bootSubLine: {
    color: '#9BC0EA',
    fontSize: 11,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  onboardingGuide: {
    alignSelf: 'center',
    maxWidth: 320,
    backgroundColor: '#0D213AB8',
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#5781AA4A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 2,
  },
  onboardingLine: {
    color: '#D5EAFFD9',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.35,
  },
  focusHint: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F233AB8',
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#5E8FB34A',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  focusGlyph: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusGlyphOuter: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#7FE4FF96',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-12deg' }],
  },
  focusGlyphInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ADFFF',
    opacity: 0.9,
  },
  actionFeedback: {
    alignSelf: 'center',
    backgroundColor: '#12304AB3',
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#658FB04A',
    paddingVertical: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.sm,
  },
  actionFeedbackText: {
    color: '#D5ECFFDE',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  criticalText: {
    color: '#B8D5FAD9',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  playtestBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#040914A8',
    zIndex: 19,
  },
});
