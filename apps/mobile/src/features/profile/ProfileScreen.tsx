import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { tr } from '../../shared/i18n/tr';
import { designTokens } from '../../shared/design/tokens';
import { useAppSettingsStore } from '../../state/appSettingsStore';
import { MobileShell } from '../../presentation/layout/MobileShell';
import { useGameStore } from '../../state/gameStore';
import { getLocaleDisplayName } from '../../shared/i18n/localeDisplayName';

function formatStat(value: number | null, emptyLabel: string): string {
  if (value === null || value <= 0) return emptyLabel;
  return value.toString();
}

function formatToggle(
  value: boolean,
  onLabel: string,
  offLabel: string,
): string {
  return value ? onLabel : offLabel;
}

export function ProfileScreen(): React.JSX.Element {
  const locale = useAppSettingsStore((state) => state.selectedLanguage);
  const audioEnabled = useAppSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useAppSettingsStore((state) => state.hapticsEnabled);
  const reducedMotionEnabled = useAppSettingsStore(
    (state) => state.reducedMotionEnabled,
  );
  const bestScore = useGameStore((state) => state.bestScore);
  const stats = useGameStore((state) => state.stats);
  const showScrollIndicator = Platform.OS !== 'web';
  const statNotRecorded = tr(locale, 'profileNotRecordedYet');

  return (
    <MobileShell>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr(locale, 'backToHome')}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{tr(locale, 'back')}</Text>
          </Pressable>
          <Text style={styles.title}>{tr(locale, 'profile')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={showScrollIndicator}
          indicatorStyle="white"
        >
          <View style={styles.identityCard}>
            <View style={styles.avatarShell}>
              <View style={styles.avatarRingOuter} />
              <View style={styles.avatarRingInner} />
              <View style={styles.avatarCore} />
            </View>
            <View style={styles.identityMeta}>
              <Text style={styles.displayName}>
                {tr(locale, 'profileSignalKeeper')}
              </Text>
              <Text style={styles.statusLine}>
                {tr(locale, 'profileLocalProfile')}
              </Text>
              <View style={styles.rankChip}>
                <Text style={styles.rankChipText}>
                  {tr(locale, 'profileBetaNode')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {tr(locale, 'profileStatsSnapshot')}
            </Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                {tr(locale, 'profileTotalRuns')}
              </Text>
              <Text style={styles.rowValue}>
                {formatStat(stats.totalSessionsPlayed, statNotRecorded)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                {tr(locale, 'profileBestSignal')}
              </Text>
              <Text style={styles.rowValue}>
                {formatStat(bestScore, statNotRecorded)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                {tr(locale, 'profileNetworkStability')}
              </Text>
              <Text style={styles.rowValue}>{statNotRecorded}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {tr(locale, 'profilePreferencesSnapshot')}
            </Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{tr(locale, 'language')}</Text>
              <Text style={styles.rowValue}>
                {getLocaleDisplayName(locale, locale)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{tr(locale, 'reducedMotion')}</Text>
              <Text style={styles.rowValue}>
                {formatToggle(
                  reducedMotionEnabled,
                  tr(locale, 'on'),
                  tr(locale, 'off'),
                )}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{tr(locale, 'audio')}</Text>
              <Text style={styles.rowValue}>
                {formatToggle(
                  audioEnabled,
                  tr(locale, 'on'),
                  tr(locale, 'off'),
                )}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{tr(locale, 'haptics')}</Text>
              <Text style={styles.rowValue}>
                {formatToggle(
                  hapticsEnabled,
                  tr(locale, 'on'),
                  tr(locale, 'off'),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr(locale, 'settings')}
              style={styles.actionButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.actionButtonText}>
                {tr(locale, 'settings')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr(locale, 'home')}
              style={styles.secondaryButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.secondaryButtonText}>
                {tr(locale, 'home')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: designTokens.colors.bgPrimary,
  },
  header: {
    paddingTop: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
    gap: designTokens.spacing.sm,
  },
  backButton: {
    minHeight: 44,
    minWidth: 88,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#3E5D8F',
    backgroundColor: '#101A36D1',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: designTokens.spacing.md,
  },
  backButtonText: {
    color: designTokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: designTokens.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xl,
  },
  identityCard: {
    backgroundColor: '#101A36D1',
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#34598A',
    padding: designTokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    overflow: 'hidden',
  },
  avatarShell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102342',
  },
  avatarRingOuter: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#74DCFF66',
  },
  avatarRingInner: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#8E7CFF6E',
  },
  avatarCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34DFFF66',
  },
  identityMeta: {
    flex: 1,
    gap: 4,
  },
  displayName: {
    color: '#E6F5FF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statusLine: {
    color: '#A5C4E8',
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  rankChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#6FE4FF77',
    backgroundColor: '#12325A',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rankChipText: {
    color: '#C8EEFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#101A36D1',
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#2B4573',
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.xs,
  },
  sectionTitle: {
    color: '#B8D3FF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  row: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2F4A742E',
    paddingVertical: 2,
  },
  rowLabel: {
    color: '#A6C4E6',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  rowValue: {
    color: '#E4F3FF',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: designTokens.spacing.sm,
  },
  actionButton: {
    minHeight: 46,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#8FDFFF',
    backgroundColor: '#174070',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#EAF8FF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: designTokens.radii.round,
    borderWidth: 1,
    borderColor: '#466593',
    backgroundColor: '#0F1E39',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#BCD7F7',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
