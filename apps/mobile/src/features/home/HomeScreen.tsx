import type { SessionState } from '@nexa/game-engine';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { PresentationSnapshot } from '../../presentation/bridge/presentationBridge';
import { runTouchRippleFeedback } from '../../presentation/effects/tactile';
import { SignalScene } from '../../presentation/render/SignalScene';
import { SceneFade } from '../../presentation/transitions/SceneFade';
import { GlowRing } from '../../presentation/ui/GlowRing';
import { SignalButton } from '../../presentation/ui/SignalButton';
import { SignalGlassHighlight } from '../../presentation/ui/SignalGlassHighlight';
import { useReducedMotion } from '../../shared/accessibility/useReducedMotion';
import { track } from '../../shared/analytics/analytics';
import { getSignalAssetSource } from '../../shared/assets/registry';
import { playUiTone } from '../../shared/audio/audioService';
import { designTokens } from '../../shared/design/tokens';
import { tr } from '../../shared/i18n/tr';
import {
  clearResumableSessionSnapshot,
  loadResumableSessionSnapshot,
  loadTutorialSeen,
} from '../../shared/storage/persistence';
import { useAppSettingsStore } from '../../state/appSettingsStore';
import { useGameStore } from '../../state/gameStore';
import {
  evaluateHomeRecoverySnapshot,
  resolveHomeContinueAction,
} from './homeResumeWiring';

function createHomeSnapshot(): PresentationSnapshot {
  return {
    sessionId: 'home-idle',
    stability: 100,
    signalStrength: 92,
    elapsedMs: 0,
    tick: 3,
    collapsed: false,
    score: 0,
    nodes: [
      {
        id: 'n0',
        type: 'core',
        position: { x: 0.5, y: 0.18 },
        health: 100,
        overload: 15,
        stabilized: true,
      },
      {
        id: 'n1',
        type: 'relay',
        position: { x: 0.74, y: 0.33 },
        health: 100,
        overload: 35,
        stabilized: false,
      },
      {
        id: 'n2',
        type: 'amplifier',
        position: { x: 0.74, y: 0.67 },
        health: 90,
        overload: 55,
        stabilized: false,
      },
      {
        id: 'n3',
        type: 'stabilizer',
        position: { x: 0.5, y: 0.82 },
        health: 100,
        overload: 25,
        stabilized: true,
      },
      {
        id: 'n4',
        type: 'decayer',
        position: { x: 0.26, y: 0.67 },
        health: 92,
        overload: 42,
        stabilized: false,
      },
      {
        id: 'n5',
        type: 'relay',
        position: { x: 0.26, y: 0.33 },
        health: 100,
        overload: 20,
        stabilized: false,
      },
    ],
    links: [
      { id: 'l0', from: 'n0', to: 'n1', health: 90, broken: false },
      { id: 'l1', from: 'n1', to: 'n2', health: 55, broken: false },
      { id: 'l2', from: 'n2', to: 'n3', health: 84, broken: false },
      { id: 'l3', from: 'n3', to: 'n4', health: 75, broken: false },
      { id: 'l4', from: 'n4', to: 'n5', health: 48, broken: false },
      { id: 'l5', from: 'n5', to: 'n0', health: 97, broken: false },
      { id: 'l6', from: 'n0', to: 'n3', health: 60, broken: false },
    ],
  };
}

interface SecondaryCard {
  key: 'daily' | 'zen' | 'archive';
  titleKey: string;
  subtitleKey: string;
  comingSoon: boolean;
}

export function HomeScreen(): React.JSX.Element {
  const locale = useAppSettingsStore((state) => state.selectedLanguage);
  const audioEnabled = useAppSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useAppSettingsStore((state) => state.hapticsEnabled);
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [resumableSession, setResumableSession] = useState<SessionState | null>(
    null,
  );
  const [moduleStatusKey, setModuleStatusKey] = useState<string | null>(null);
  const [enteringNetwork, setEnteringNetwork] = useState(false);
  const corePulse = useMemo(() => new Animated.Value(0), []);
  const coreDrift = useMemo(() => new Animated.Value(0), []);
  const enterTransitionGlow = useMemo(() => new Animated.Value(0), []);

  const cards = useMemo<SecondaryCard[]>(
    () => [
      {
        key: 'daily',
        titleKey: 'dailySignal',
        subtitleKey: 'homeDailySubtitle',
        comingSoon: true,
      },
      {
        key: 'zen',
        titleKey: 'zenFlow',
        subtitleKey: 'homeZenSubtitle',
        comingSoon: true,
      },
      {
        key: 'archive',
        titleKey: 'archive',
        subtitleKey: 'homeArchiveSubtitle',
        comingSoon: true,
      },
    ],
    [],
  );
  const snapshot = useMemo(() => createHomeSnapshot(), []);
  const hydratePersistence = useGameStore((state) => state.hydratePersistence);
  const restoreSession = useGameStore((state) => state.restoreSession);
  const recovery = useGameStore((state) => state.recovery);
  const recoveryCheck = useGameStore((state) => state.recoveryCheck);
  const recoveryValid = useGameStore((state) => state.recoveryValid);
  const recoveryRestoring = useGameStore((state) => state.recoveryRestoring);
  const recoveryRestored = useGameStore((state) => state.recoveryRestored);
  const recoveryInvalid = useGameStore((state) => state.recoveryInvalid);
  const recoveryExpired = useGameStore((state) => state.recoveryExpired);
  const recoveryCleared = useGameStore((state) => state.recoveryCleared);

  useEffect(() => {
    void hydratePersistence();
    void loadTutorialSeen();
    recoveryCheck();
    void loadResumableSessionSnapshot().then(async (snapshot) => {
      const result = evaluateHomeRecoverySnapshot(snapshot, recovery);
      if (result.shouldClearSnapshot) {
        await clearResumableSessionSnapshot();
      }
      setResumableSession(result.resumableSession);
      if (result.recovery.state === 'valid') recoveryValid();
      if (result.recovery.state === 'expired') recoveryExpired();
      if (result.recovery.state === 'cleared') {
        recoveryInvalid(result.recovery.devValidationReason ?? undefined);
        recoveryCleared();
      }
    });
    track({ name: 'home_viewed', timestamp: Date.now() });
  }, [
    hydratePersistence,
    recoveryCheck,
    recoveryCleared,
    recoveryExpired,
    recoveryInvalid,
    recoveryValid,
  ]);

  useEffect(() => {
    if (reducedMotion) {
      corePulse.setValue(0);
      coreDrift.setValue(0);
      return;
    }
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(corePulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(coreDrift, {
          toValue: 1,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(coreDrift, {
          toValue: 0,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    driftLoop.start();
    return () => {
      pulseLoop.stop();
      driftLoop.stop();
    };
  }, [coreDrift, corePulse, reducedMotion]);

  useEffect(() => {
    if (!moduleStatusKey) return;
    const id = setTimeout(() => setModuleStatusKey(null), 1600);
    return () => clearTimeout(id);
  }, [moduleStatusKey]);

  const pulseScale = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const pulseOpacity = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.34, 0.6],
  });
  const driftY = coreDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const driftX = coreDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [-1.5, 1.5],
  });
  const heroTilt = coreDrift.interpolate({
    inputRange: [0, 1],
    outputRange: ['-0.8deg', '0.8deg'],
  });
  const livingCtaOpacity = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });
  const navActiveGlowOpacity = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.46],
  });
  const navActiveGlowScale = corePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.03],
  });
  const isCompactLayout = width < 390;
  const isDesktopWeb = Platform.OS === 'web' && width >= 900;
  const frameWidth = isDesktopWeb ? Math.min(460, width - 48) : width;
  const frameHeight = isDesktopWeb ? Math.min(920, height - 40) : height;
  const heroVisualSize = Math.max(168, Math.min(196, frameWidth - 164));
  const heroHaloOuterSize = Math.max(192, heroVisualSize - 26);
  const heroHaloMidSize = Math.max(172, heroVisualSize - 52);
  const heroHaloInnerSize = Math.max(154, heroVisualSize - 78);
  const heroCoreSize = Math.max(138, heroVisualSize - 94);
  const ctaWidth = Math.max(248, Math.min(322, frameWidth - 44));
  const ctaRingWidth = ctaWidth + 12;
  const moduleCardMinWidth = frameWidth - designTokens.spacing.lg * 2;
  const navReservedHeight = 92;
  const heroZoneHeight = Math.floor(frameHeight * 0.28);
  const titleCtaZoneHeight = Math.floor(frameHeight * 0.24);
  const cardsZoneHeight = Math.floor(frameHeight * 0.3);
  const signalNoiseOverlay = getSignalAssetSource('signalNoiseOverlay');
  const signalRingGlow = getSignalAssetSource('signalRingGlow');
  const signalEnergyShell = getSignalAssetSource('signalEnergyShell');
  const signalHeroCore = getSignalAssetSource('signalHeroCore');
  const cardIconByKey = {
    daily: getSignalAssetSource('iconDailySignal'),
    zen: getSignalAssetSource('iconZenFlow'),
    archive: getSignalAssetSource('iconArchive'),
  } as const;

  return (
    <SceneFade>
      <SafeAreaView
        style={styles.container}
        accessibilityLabel={tr(locale, 'home')}
      >
        <View
          style={[
            styles.screenFrame,
            isDesktopWeb && styles.screenFrameDesktop,
            { width: frameWidth, height: frameHeight },
          ]}
        >
          <View style={styles.heroAtmosphereField} pointerEvents="none">
            <View style={styles.heroAtmosphereSceneWrap}>
              <SignalScene
                width={frameWidth}
                height={frameHeight}
                snapshot={snapshot}
                themeId="defaultSignal"
                reducedMotion={reducedMotion}
              />
            </View>
          </View>
          <View style={styles.networkField}>
            <View style={styles.ambientVeilTop} />
            <View style={styles.ambientVeilBottom} />
            {signalNoiseOverlay ? (
              <Image
                source={signalNoiseOverlay}
                resizeMode="cover"
                style={styles.noiseOverlay}
              />
            ) : null}
          </View>
          <View style={styles.overlay}>
            {!reducedMotion ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.enterTransitionVeil,
                  { opacity: enterTransitionGlow },
                ]}
              />
            ) : null}
            <View
              style={[
                styles.contentStack,
                { paddingBottom: navReservedHeight },
              ]}
            >
              <View style={[styles.heroZone, { minHeight: heroZoneHeight }]}>
                <Animated.View
                  style={[
                    styles.heroVisual,
                    { width: heroVisualSize, height: heroVisualSize },
                    reducedMotion
                      ? null
                      : {
                          transform: [
                            { translateY: driftY },
                            { translateX: driftX },
                            { rotate: heroTilt },
                          ],
                        },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.heroHaloOuter,
                      {
                        width: heroHaloOuterSize,
                        height: heroHaloOuterSize,
                        borderRadius: heroHaloOuterSize / 2,
                      },
                      reducedMotion
                        ? null
                        : {
                            transform: [{ scale: pulseScale }],
                            opacity: pulseOpacity,
                          },
                    ]}
                  />
                  {signalEnergyShell ? (
                    <Image
                      source={signalEnergyShell}
                      resizeMode="contain"
                      style={[
                        styles.heroAssetEnergyShell,
                        {
                          width: heroHaloOuterSize + 44,
                          height: heroHaloOuterSize + 44,
                        },
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.heroShellAtmosphereVeil,
                      {
                        width: heroHaloOuterSize + 56,
                        height: heroHaloOuterSize + 56,
                        borderRadius: (heroHaloOuterSize + 56) / 2,
                      },
                    ]}
                  />
                  {signalRingGlow ? (
                    <Image
                      source={signalRingGlow}
                      resizeMode="contain"
                      style={[
                        styles.heroAssetRingGlow,
                        {
                          width: heroHaloInnerSize + 40,
                          height: heroHaloInnerSize + 40,
                        },
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.heroGlowCyan,
                      {
                        width: heroHaloOuterSize + 36,
                        height: heroHaloOuterSize + 36,
                        borderRadius: (heroHaloOuterSize + 36) / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.heroGlowViolet,
                      {
                        width: heroHaloInnerSize + 30,
                        height: heroHaloInnerSize + 30,
                        borderRadius: (heroHaloInnerSize + 30) / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.heroHaloInner,
                      {
                        width: heroHaloInnerSize,
                        height: heroHaloInnerSize,
                        borderRadius: heroHaloInnerSize / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.heroHaloMid,
                      {
                        width: heroHaloMidSize,
                        height: heroHaloMidSize,
                        borderRadius: heroHaloMidSize / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.heroSignatureArcOuter,
                      {
                        width: heroHaloMidSize + 14,
                        height: heroHaloMidSize + 14,
                        borderRadius: (heroHaloMidSize + 14) / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.heroSignatureArcInner,
                      {
                        width: heroHaloInnerSize + 10,
                        height: heroHaloInnerSize + 10,
                        borderRadius: (heroHaloInnerSize + 10) / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.heroCore,
                      {
                        width: heroCoreSize,
                        height: heroCoreSize,
                        borderRadius: heroCoreSize / 2,
                      },
                    ]}
                  >
                    {signalHeroCore ? (
                      <Image
                        source={signalHeroCore}
                        resizeMode="contain"
                        style={styles.heroCoreAsset}
                      />
                    ) : null}
                  </View>
                </Animated.View>
              </View>

              <View
                style={[styles.titleCtaZone, { minHeight: titleCtaZoneHeight }]}
              >
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroTitle}>{tr(locale, 'appTitle')}</Text>
                  <Text style={styles.heroSubtitle}>
                    {tr(locale, 'keepSignalAlive')}
                  </Text>
                </View>

                <View style={styles.ctaWrap}>
                  <Animated.View
                    style={[
                      styles.ctaPulseRing,
                      {
                        width: ctaRingWidth,
                        height: 82,
                      },
                      reducedMotion
                        ? null
                        : {
                            transform: [{ scale: pulseScale }],
                            opacity: pulseOpacity,
                          },
                    ]}
                  >
                    <GlowRing
                      size={ctaRingWidth}
                      color="#6FE5FF"
                      opacity={0.9}
                      borderWidth={1.3}
                    />
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.ctaSurface,
                      { width: ctaWidth + 8 },
                      reducedMotion ? null : { opacity: livingCtaOpacity },
                    ]}
                  >
                    <SignalGlassHighlight
                      intensity={1}
                      opacity={0.22}
                      borderRadius={designTokens.radii.round}
                      verticalOffset={-10}
                    />
                  </Animated.View>
                  <SignalButton
                    accessibilityRole="button"
                    accessibilityLabel={tr(locale, 'enterNetwork')}
                    disabled={enteringNetwork}
                    style={[styles.ctaButton, { minWidth: ctaWidth }]}
                    onPress={async () => {
                      if (enteringNetwork) return;
                      enterTransitionGlow.setValue(0);
                      setEnteringNetwork(true);
                      try {
                        await runTouchRippleFeedback({
                          enabled: hapticsEnabled,
                          reducedFeedback: reducedMotion,
                        });
                        await playUiTone({
                          enabled: audioEnabled,
                          reducedFeedback: reducedMotion,
                        });
                        const continueResult = resolveHomeContinueAction({
                          resumableSession,
                          recovery,
                          shouldShowContinueCta: Boolean(resumableSession),
                        });
                        if (
                          continueResult.shouldRestoreSession &&
                          continueResult.restoredSession
                        ) {
                          recoveryRestoring(
                            continueResult.restoredSession.sessionId,
                          );
                          restoreSession(
                            continueResult.restoredSession,
                            'mainRun',
                          );
                          recoveryRestored(
                            continueResult.restoredSession.sessionId,
                          );
                        }
                        setResumableSession(continueResult.resumableSession);
                        if (!reducedMotion) {
                          await new Promise<void>((resolve) => {
                            Animated.timing(enterTransitionGlow, {
                              toValue: 1,
                              duration: 180,
                              easing: Easing.out(Easing.cubic),
                              useNativeDriver: true,
                            }).start(() => resolve());
                          });
                        }
                        track({
                          name: 'session_started',
                          timestamp: Date.now(),
                        });
                        router.push('/game');
                      } finally {
                        setEnteringNetwork(false);
                      }
                    }}
                    label={tr(locale, 'enterNetwork')}
                  />
                </View>
              </View>

              <View style={[styles.cardsZone, { minHeight: cardsZoneHeight }]}>
                <View
                  style={[
                    styles.modules,
                    isCompactLayout && styles.modulesStacked,
                  ]}
                >
                  {cards.map((card) => (
                    <Pressable
                      key={card.key}
                      accessibilityRole="button"
                      accessibilityLabel={tr(locale, card.titleKey)}
                      accessibilityState={{ disabled: card.comingSoon }}
                      style={({ pressed }) => [
                        styles.moduleCard,
                        styles.moduleCardStacked,
                        { minWidth: moduleCardMinWidth },
                        pressed && styles.moduleCardPressed,
                      ]}
                      onPress={async () => {
                        await runTouchRippleFeedback({
                          enabled: hapticsEnabled,
                          reducedFeedback: reducedMotion,
                        });
                        await playUiTone({
                          enabled: audioEnabled,
                          reducedFeedback: reducedMotion,
                        });
                        if (card.comingSoon) {
                          setModuleStatusKey('linkComingSoonTitle');
                          return;
                        }
                        track({ name: 'daily_started', timestamp: Date.now() });
                      }}
                    >
                      <SignalGlassHighlight
                        intensity={0.9}
                        opacity={0.18}
                        borderRadius={designTokens.radii.md}
                        verticalOffset={-8}
                      />
                      {cardIconByKey[card.key] ? (
                        <Image
                          source={cardIconByKey[card.key]}
                          resizeMode="contain"
                          style={styles.cardIcon}
                        />
                      ) : null}
                      <Text style={styles.moduleTitle}>
                        {tr(locale, card.titleKey)}
                      </Text>
                      <Text numberOfLines={1} style={styles.moduleSubtitle}>
                        {tr(locale, card.subtitleKey)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {moduleStatusKey ? (
                  <View style={styles.moduleStatus}>
                    <Text style={styles.moduleStatusText}>
                      {tr(locale, moduleStatusKey)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.breathingSpace} />
            </View>

            <View
              style={[
                styles.bottomNav,
                isDesktopWeb && styles.bottomNavDesktop,
              ]}
              accessible
              accessibilityLabel={tr(locale, 'home')}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(locale, 'home')}
                accessibilityState={{ selected: true }}
                style={({ pressed }) => [
                  styles.bottomPillBase,
                  styles.bottomPillActive,
                  pressed && styles.bottomPillPressed,
                ]}
                onPress={async () => {
                  await runTouchRippleFeedback({
                    enabled: hapticsEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  await playUiTone({
                    enabled: audioEnabled,
                    reducedFeedback: reducedMotion,
                  });
                }}
              >
                {!reducedMotion ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.bottomPillActiveGlow,
                      {
                        opacity: navActiveGlowOpacity,
                        transform: [{ scale: navActiveGlowScale }],
                      },
                    ]}
                  />
                ) : null}
                <Text
                  style={[styles.bottomPillText, styles.bottomPillActiveText]}
                >
                  {tr(locale, 'home')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(locale, 'networks')}
                accessibilityState={{ disabled: true }}
                style={({ pressed }) => [
                  styles.bottomPillBase,
                  pressed && styles.bottomPillPressed,
                ]}
                onPress={async () => {
                  await runTouchRippleFeedback({
                    enabled: hapticsEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  await playUiTone({
                    enabled: audioEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  setModuleStatusKey('linkComingSoonTitle');
                }}
              >
                <Text style={[styles.bottomPillText]}>
                  {tr(locale, 'networks')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(locale, 'themes')}
                accessibilityState={{ disabled: true }}
                style={({ pressed }) => [
                  styles.bottomPillBase,
                  pressed && styles.bottomPillPressed,
                ]}
                onPress={async () => {
                  await runTouchRippleFeedback({
                    enabled: hapticsEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  await playUiTone({
                    enabled: audioEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  setModuleStatusKey('linkComingSoonTitle');
                }}
              >
                <Text style={[styles.bottomPillText]}>
                  {tr(locale, 'themes')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(locale, 'profile')}
                accessibilityState={{ selected: false }}
                style={({ pressed }) => [
                  styles.bottomPillBase,
                  pressed && styles.bottomPillPressed,
                ]}
                onPress={async () => {
                  await runTouchRippleFeedback({
                    enabled: hapticsEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  await playUiTone({
                    enabled: audioEnabled,
                    reducedFeedback: reducedMotion,
                  });
                  router.push('/settings');
                }}
              >
                <Text style={[styles.bottomPillText]}>
                  {tr(locale, 'profile')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SceneFade>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenFrame: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#050B19',
  },
  screenFrameDesktop: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#2B447033',
    shadowColor: '#57D8FF',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  heroAtmosphereField: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: 0,
    height: '22%',
    overflow: 'hidden',
    opacity: 0.18,
  },
  heroAtmosphereSceneWrap: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.82 }],
  },
  networkField: {
    ...StyleSheet.absoluteFillObject,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  ambientVeilTop: {
    position: 'absolute',
    width: '120%',
    height: '48%',
    left: '-10%',
    top: '-8%',
    backgroundColor: '#1A2E5714',
  },
  ambientVeilBottom: {
    position: 'absolute',
    width: '130%',
    height: '54%',
    left: '-15%',
    bottom: '-18%',
    backgroundColor: '#10234418',
  },
  networkLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#72D8FF0A',
  },
  networkNode: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8DE9FF42',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.xl + 2,
    paddingBottom: designTokens.spacing.lg,
  },
  enterTransitionVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7BD9FF14',
    zIndex: 16,
  },
  contentStack: {
    flex: 1,
  },
  heroZone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCtaZone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsZone: {
    justifyContent: 'flex-start',
  },
  breathingSpace: { flex: 1 },
  heroVisual: { alignItems: 'center', justifyContent: 'center' },
  heroAssetEnergyShell: {
    position: 'absolute',
    opacity: 0.84,
    zIndex: 1,
  },
  heroShellAtmosphereVeil: {
    position: 'absolute',
    backgroundColor: '#69D8FF10',
    borderWidth: 1,
    borderColor: '#8A84FF1A',
    zIndex: 1,
  },
  heroAssetRingGlow: {
    position: 'absolute',
    opacity: 1,
    zIndex: 2,
  },
  heroHaloOuter: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#66DFFF',
    zIndex: 3,
  },
  heroHaloMid: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#7ED8FF88',
  },
  heroHaloInner: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#806EFF',
    opacity: 0.7,
  },
  heroSignatureArcOuter: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#78DFFF9A',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-18deg' }],
  },
  heroSignatureArcInner: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#8C7DFF90',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '24deg' }],
  },
  heroGlowCyan: {
    position: 'absolute',
    backgroundColor: '#3FD9FF08',
  },
  heroGlowViolet: {
    position: 'absolute',
    backgroundColor: '#9A83FF06',
  },
  heroCore: {
    borderWidth: 1,
    borderColor: '#8DDBFFED',
    backgroundColor: '#173465E8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 6,
  },
  heroCoreAsset: {
    width: '78%',
    height: '78%',
    opacity: 0.98,
    zIndex: 8,
  },
  heroTextBlock: {
    alignItems: 'center',
    marginTop: 12,
  },
  heroTitle: {
    color: '#E7F4FF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 3.4,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    color: '#A8C8F6D9',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 5,
  },
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  ctaSurface: {
    position: 'absolute',
    height: 76,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#7FAFD05E',
    backgroundColor: '#12284970',
    shadowColor: '#80CCFF',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaButton: {
    minWidth: 248,
    minHeight: 74,
    borderColor: '#A2E8FF',
    borderWidth: 1.6,
    backgroundColor: '#123068EE',
  },
  ctaPulseRing: {
    position: 'absolute',
    borderRadius: designTokens.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modules: {
    flexDirection: 'column',
    gap: designTokens.spacing.xs,
    justifyContent: 'flex-start',
    marginTop: designTokens.spacing.xs,
  },
  modulesStacked: {
    flexWrap: 'wrap',
  },
  moduleCard: {
    minHeight: 54,
    justifyContent: 'center',
    backgroundColor: '#132846A6',
    borderWidth: 1,
    borderColor: '#82ADD14D',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: designTokens.radii.md,
    overflow: 'hidden',
    shadowColor: '#73C5F5',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 15,
    height: 15,
    opacity: 0.48,
  },
  moduleCardStacked: {
    width: '100%',
  },
  moduleCardPressed: {
    opacity: 0.92,
    backgroundColor: '#14254AB3',
  },
  moduleTitle: {
    color: '#D4E7FF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  moduleSubtitle: {
    color: '#95B1D9',
    fontSize: 10,
    marginTop: 3,
  },
  moduleStatus: {
    alignItems: 'center',
    minHeight: 16,
  },
  moduleStatusText: {
    color: '#AFC7E8D0',
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  bottomNav: {
    position: 'absolute',
    left: designTokens.spacing.lg,
    right: designTokens.spacing.lg,
    bottom: 24,
    zIndex: 20,
    minHeight: 52,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#6C94BE66',
    backgroundColor: '#102440CC',
    shadowColor: '#6EBDEB',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    paddingHorizontal: designTokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
    marginTop: 0,
  },
  bottomNavDesktop: {
    marginBottom: 2,
  },
  bottomPillBase: {
    minHeight: 30,
    minWidth: 66,
    borderRadius: designTokens.radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  bottomPillActive: {
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#90DBFFCF',
    backgroundColor: '#1A3C68EE',
    shadowColor: '#6CE6FF',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  bottomPillActiveGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: designTokens.radii.round,
    backgroundColor: '#7CD8FF33',
  },
  bottomPillPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  bottomPillActiveText: {
    color: '#D9F4FF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bottomPillText: {
    color: '#87A4C6D9',
    fontSize: 11,
    letterSpacing: 0.7,
  },
});
