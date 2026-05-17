import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PostRunTuningReport, SessionSummary } from '@nexa/types';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';
import { useReducedMotion } from '../../../shared/accessibility/useReducedMotion';

interface SessionSummaryProps {
  locale: import('@nexa/types').Locale;
  summary: SessionSummary;
  report: PostRunTuningReport;
  bestScore: number;
  isNewBest: boolean;
  onRestart: () => void;
  onHome: () => void;
  onOpenPlaytestLab?: () => void;
}

export function SessionSummaryPanel({
  locale,
  summary,
  report,
  bestScore,
  isNewBest,
  onRestart,
  onHome,
  onOpenPlaytestLab,
}: SessionSummaryProps) {
  const [showDevReport, setShowDevReport] = useState(false);
  const reducedMotion = useReducedMotion();
  const orbPulse = useRef(new Animated.Value(0)).current;

  const stabilizedActions =
    summary.nodesStabilized +
    summary.linksRepaired +
    summary.connectionsCreated;

  const primaryInsight = useMemo(
    () =>
      tr(
        locale,
        `tuningHint_${report.suggestedTuningFlags[0] ?? 'healthy_run'}`,
      ),
    [locale, report.suggestedTuningFlags],
  );

  useEffect(() => {
    if (reducedMotion) {
      orbPulse.setValue(0.4);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse, reducedMotion]);

  const orbScale = orbPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const orbGlowOpacity = orbPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.38],
  });

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.backdropDim} />
      <View pointerEvents="none" style={styles.backdropHaze} />
      <View pointerEvents="none" style={styles.edgeFalloff} />
      <View pointerEvents="none" style={styles.centerIsolationGlow} />
      <View pointerEvents="none" style={styles.innerAtmosphereTop} />
      <View pointerEvents="none" style={styles.innerAtmosphereBottom} />
      <View pointerEvents="none" style={styles.lowerContinuationHaze} />
      <View pointerEvents="none" style={styles.titleGlow} />
      <View style={styles.content}>
        <View style={styles.topContent}>
          <Text style={styles.kicker}>{tr(locale, 'summary')}</Text>

          <View style={styles.titleWrap}>
            <Animated.View
              style={[
                styles.signalCoreAura,
                reducedMotion
                  ? styles.signalCoreAuraStatic
                  : {
                      opacity: orbGlowOpacity,
                      transform: [{ scale: orbScale }],
                    },
              ]}
            />
            <View style={styles.signalCoreShell}>
              <View style={styles.signalCoreOuter} />
              <View style={styles.signalCoreMid} />
              <View style={styles.signalCoreInner} />
            </View>
            <View style={styles.titleTextWrap}>
              <Text style={styles.title}>SIGNAL LOST</Text>
              <Text style={styles.subtitle}>Recovery window ready.</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.statChip, styles.statChipPrimary]}>
              <Text style={styles.statLabel}>{tr(locale, 'finalScore')}</Text>
              <Text style={styles.statValue}>{summary.score}</Text>
            </View>
            <View style={[styles.statChip, styles.statChipSecondary]}>
              <Text style={styles.statLabel}>{tr(locale, 'survivalTime')}</Text>
              <Text style={styles.statValue}>{summary.survivalSeconds}s</Text>
            </View>
            <View style={[styles.statChip, styles.statChipTertiary]}>
              <Text style={styles.statLabel}>
                {tr(locale, 'stabilizedActions')}
              </Text>
              <Text style={styles.statValue}>{stabilizedActions}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{tr(locale, 'bestScore')}</Text>
            <Text style={styles.metaValue}>{bestScore}</Text>
          </View>

          <Text style={styles.insight}>{primaryInsight}</Text>
          {isNewBest ? (
            <Text style={styles.newBest}>{tr(locale, 'newBest')}</Text>
          ) : null}

          <View style={styles.recoveryCoreZone}>
            <View pointerEvents="none" style={styles.recoveryBeam} />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.recoveryCoreAura,
                reducedMotion
                  ? styles.recoveryCoreAuraStatic
                  : {
                      opacity: orbGlowOpacity,
                      transform: [{ scale: orbScale }],
                    },
              ]}
            />
            <View pointerEvents="none" style={styles.recoveryRingOuter} />
            <View pointerEvents="none" style={styles.recoveryCoreOrb} />
          </View>

          {__DEV__ ? (
            <View style={styles.devSection}>
              <Pressable
                style={styles.devToggle}
                onPress={() => setShowDevReport((prev) => !prev)}
              >
                <Text style={styles.devToggleText}>
                  {showDevReport
                    ? 'Hide Developer Report'
                    : 'Open Developer Report'}
                </Text>
              </Pressable>
              {showDevReport ? (
                <View style={styles.devPanel}>
                  <Text style={styles.devTitle}>
                    {tr(locale, 'devTuningReport')}
                  </Text>
                  <Text style={styles.devLine}>
                    {tr(locale, 'devRecommendationAcceptance')}:{' '}
                    {(report.recommendationAcceptanceRate * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.devLine}>
                    {tr(locale, 'devInvalidDragReleases')}:{' '}
                    {report.invalidDragReleaseCount}
                  </Text>
                  <Text style={styles.devLine}>
                    {tr(locale, 'devSuggestedFlags')}:{' '}
                    {report.suggestedTuningFlags.join(', ')}
                  </Text>
                  {onOpenPlaytestLab ? (
                    <Pressable
                      style={styles.devButton}
                      onPress={onOpenPlaytestLab}
                    >
                      <Text style={styles.devButtonText}>
                        {tr(locale, 'devOpenPlaytestLab')}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <View pointerEvents="none" style={styles.actionZoneGlow} />
          <View pointerEvents="none" style={styles.actionBridgeHaze} />
          <View pointerEvents="none" style={styles.actionBridgeGlow} />
          <View pointerEvents="none" style={styles.actionBottomTaper} />
          <Pressable
            style={[styles.button, styles.buttonPrimary]}
            onPress={onRestart}
          >
            <Text style={styles.buttonText}>{tr(locale, 'retryNetwork')}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={onHome}
          >
            <Text style={styles.buttonText}>{tr(locale, 'backHome')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: designTokens.spacing.lg,
    right: designTokens.spacing.lg,
    top: '10%',
    bottom: '8%',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#6EA9D629',
    backgroundColor: '#081425EE',
    padding: designTokens.spacing.lg,
    shadowColor: '#5AD5FF',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 10,
    overflow: 'hidden',
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0409139A',
  },
  backdropHaze: {
    position: 'absolute',
    width: '136%',
    height: '70%',
    left: '-18%',
    bottom: '-24%',
    backgroundColor: '#1632501A',
  },
  edgeFalloff: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#6EA9D61F',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  centerIsolationGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    alignSelf: 'center',
    top: '28%',
    backgroundColor: '#68D2FF0D',
  },
  innerAtmosphereTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '46%',
    backgroundColor: '#6ECFFF08',
  },
  innerAtmosphereBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: '#08162B96',
  },
  lowerContinuationHaze: {
    position: 'absolute',
    left: '-6%',
    right: '-6%',
    bottom: '-10%',
    height: '44%',
    backgroundColor: '#63C7F80D',
  },
  titleGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    alignSelf: 'center',
    top: -158,
    backgroundColor: '#70D5FF1E',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 5,
  },
  topContent: {
    gap: 5,
  },
  kicker: {
    color: '#A3C9EE',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 0,
  },
  signalCoreAura: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#78DDFF42',
  },
  signalCoreAuraStatic: {
    opacity: 0.2,
  },
  signalCoreShell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102742B8',
  },
  signalCoreOuter: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#8DE5FF80',
  },
  signalCoreMid: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9B8DFF70',
  },
  signalCoreInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8FE6FF',
  },
  titleTextWrap: {
    alignItems: 'flex-start',
  },
  title: {
    color: '#EAF5FF',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#C9E1FB',
    fontSize: 12,
    letterSpacing: 0.25,
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 0,
  },
  statChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6FA8CC24',
    backgroundColor: '#0D2440BC',
    paddingVertical: 7,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  statChipPrimary: {
    backgroundColor: '#132F50C5',
    borderColor: '#8CD8FD33',
  },
  statChipSecondary: {
    backgroundColor: '#0F2643BC',
    borderColor: '#74ABCF29',
  },
  statChipTertiary: {
    backgroundColor: '#0C213CB2',
    borderColor: '#5D8CB31F',
  },
  statLabel: {
    color: '#9FC4E9D1',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  statValue: {
    color: '#F0F8FF',
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#50749D58',
    backgroundColor: '#0B1A3199',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  metaLabel: {
    color: '#A7C6E8',
    fontSize: 10,
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#E7F4FF',
    fontSize: 12,
    fontWeight: '700',
  },
  insight: {
    color: '#B2CDE9',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 1,
  },
  newBest: {
    color: designTokens.colors.cyan,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  devSection: {
    gap: 6,
  },
  devToggle: {
    minHeight: 32,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#4C6E9859',
    backgroundColor: '#0B1A3194',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  devToggleText: {
    color: '#ADC8E8',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  devPanel: {
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#37567E',
    padding: designTokens.spacing.sm,
    gap: 4,
    backgroundColor: '#0A1326CC',
  },
  devTitle: {
    color: '#91B7EE',
    fontSize: 12,
    fontWeight: '700',
  },
  devLine: {
    color: '#C2DCFF',
    fontSize: 11,
  },
  devButton: {
    marginTop: 4,
    minHeight: 34,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#5F90CF',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.sm,
  },
  devButtonText: {
    color: '#D9EAFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    marginTop: 'auto',
    paddingTop: 2,
    paddingBottom: 5,
    gap: 4,
    position: 'relative',
  },
  actionZoneGlow: {
    position: 'absolute',
    left: '2%',
    right: '-3%',
    bottom: -24,
    height: 220,
    backgroundColor: '#66CAFF0A',
  },
  actionBridgeGlow: {
    position: 'absolute',
    left: '16%',
    right: '13%',
    top: -26,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7ED8FF09',
  },
  actionBridgeHaze: {
    position: 'absolute',
    left: '22%',
    right: '18%',
    top: -42,
    height: 78,
    borderRadius: 34,
    backgroundColor: '#7FC9FF06',
  },
  actionBottomTaper: {
    position: 'absolute',
    left: '-10%',
    right: '-6%',
    bottom: -40,
    height: 112,
    backgroundColor: '#9BD7FF07',
  },
  button: {
    minHeight: 46,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#6DC6ED8A',
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.md,
  },
  buttonPrimary: {
    backgroundColor: '#255181BB',
    shadowColor: '#71D9FF',
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderColor: '#88DDFF61',
  },
  buttonSecondary: {
    backgroundColor: '#08132470',
    borderColor: '#42566F4D',
  },
  buttonText: {
    color: designTokens.colors.textPrimary,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  recoveryCoreZone: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
    marginBottom: -2,
  },
  recoveryBeam: {
    position: 'absolute',
    width: 8,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#72D8FF0F',
  },
  recoveryCoreAura: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#77DCFF1C',
  },
  recoveryCoreAuraStatic: {
    opacity: 0.18,
  },
  recoveryRingOuter: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#8FE1FF2C',
  },
  recoveryCoreOrb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9BE8FF',
  },
});
