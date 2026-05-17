import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import type { Locale } from '@nexa/types';
import { tr } from '../../shared/i18n/tr';
import { designTokens } from '../../shared/design/tokens';
import { useAppSettingsStore } from '../../state/appSettingsStore';
import { resetLocalProgress } from '../../shared/storage/persistence';
import { useGameStore } from '../../state/gameStore';
import {
  mobileRuntimeConfig,
  validateRuntimeConfig,
} from '../../shared/config/runtimeConfig';
import { getLocaleDisplayName } from '../../shared/i18n/localeDisplayName';
import {
  formatSettingsMetadata,
  unavailableLinkReason,
} from './settingsRuntime';

const SUPPORTED_LANGUAGES: Locale[] = ['en', 'tr', 'de', 'es', 'ja', 'pt-BR'];

export function SettingsScreen(): React.JSX.Element {
  const selectedLanguage = useAppSettingsStore(
    (state) => state.selectedLanguage,
  );
  const audioEnabled = useAppSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useAppSettingsStore((state) => state.hapticsEnabled);
  const reducedMotionEnabled = useAppSettingsStore(
    (state) => state.reducedMotionEnabled,
  );
  const setAudioEnabled = useAppSettingsStore((state) => state.setAudioEnabled);
  const setHapticsEnabled = useAppSettingsStore(
    (state) => state.setHapticsEnabled,
  );
  const setReducedMotionEnabled = useAppSettingsStore(
    (state) => state.setReducedMotionEnabled,
  );
  const setSelectedLanguage = useAppSettingsStore(
    (state) => state.setSelectedLanguage,
  );
  const applyPostReset = useAppSettingsStore((state) => state.applyPostReset);

  const [busy, setBusy] = useState(false);

  const locale = selectedLanguage;
  const configValidation = useMemo(
    () => validateRuntimeConfig(mobileRuntimeConfig),
    [],
  );
  const metadataLines = useMemo(
    () => formatSettingsMetadata(locale, mobileRuntimeConfig),
    [locale],
  );

  const legalItems = useMemo(
    () => [
      {
        key: 'privacy',
        title: tr(locale, 'privacyPolicy'),
        url: mobileRuntimeConfig.privacyPolicyUrl,
      },
      {
        key: 'terms',
        title: tr(locale, 'termsOfUse'),
        url: mobileRuntimeConfig.termsUrl,
      },
      {
        key: 'support',
        title: tr(locale, 'support'),
        url: mobileRuntimeConfig.supportUrl,
      },
    ],
    [locale],
  );

  const askReset = (includeSettings: boolean) => {
    Alert.alert(
      tr(locale, 'resetLocalProgressTitle'),
      includeSettings
        ? tr(locale, 'resetLocalProgressWithSettingsBody')
        : tr(locale, 'resetLocalProgressBody'),
      [
        {
          text: tr(locale, 'cancel'),
          style: 'cancel',
        },
        {
          text: tr(locale, 'resetNow'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            await resetLocalProgress({ includeSettings });
            await applyPostReset({ includeSettings });
            useGameStore.setState({
              session: null,
              warningCount: 0,
            });
            setBusy(false);
            Alert.alert(
              tr(locale, 'resetCompleteTitle'),
              tr(locale, 'resetCompleteBody'),
            );
          },
        },
      ],
    );
  };

  const openLink = async (url: string | null) => {
    if (!url) {
      Alert.alert(
        tr(locale, 'linkUnavailableTitle'),
        unavailableLinkReason(locale, configValidation),
      );
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        tr(locale, 'linkUnavailableTitle'),
        tr(locale, 'linkUnavailableBody'),
      );
      return;
    }
    await Linking.openURL(url);
  };

  return (
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
        <Text style={styles.title}>{tr(locale, 'settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr(locale, 'feedbackControls')}
          </Text>
          <ToggleRow
            label={tr(locale, 'audio')}
            description={tr(locale, 'audioSettingDescription')}
            value={audioEnabled}
            onToggle={() => void setAudioEnabled(!audioEnabled)}
            locale={locale}
          />
          <ToggleRow
            label={tr(locale, 'haptics')}
            description={tr(locale, 'hapticsSettingDescription')}
            value={hapticsEnabled}
            onToggle={() => void setHapticsEnabled(!hapticsEnabled)}
            locale={locale}
          />
          <ToggleRow
            label={tr(locale, 'reducedMotion')}
            description={tr(locale, 'reducedMotionSettingDescription')}
            value={reducedMotionEnabled}
            onToggle={() => void setReducedMotionEnabled(!reducedMotionEnabled)}
            locale={locale}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr(locale, 'language')}</Text>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = lang === selectedLanguage;
            return (
              <Pressable
                key={lang}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${tr(locale, 'language')}: ${getLocaleDisplayName(lang, locale)}`}
                style={[
                  styles.languageButton,
                  active ? styles.languageActive : null,
                ]}
                onPress={() => void setSelectedLanguage(lang)}
              >
                <Text style={styles.languageText}>
                  {getLocaleDisplayName(lang, locale)}
                </Text>
                <Text style={styles.languageStateText}>
                  {active ? tr(locale, 'selected') : tr(locale, 'select')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr(locale, 'dataAndPrivacy')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr(locale, 'resetLocalProgress')}
            style={styles.destructiveButton}
            onPress={() => askReset(false)}
            disabled={busy}
          >
            <Text style={styles.destructiveButtonText}>
              {tr(locale, 'resetLocalProgress')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr(locale, 'fullResetIncludingSettings')}
            style={styles.destructiveButton}
            onPress={() => askReset(true)}
            disabled={busy}
          >
            <Text style={styles.destructiveButtonText}>
              {tr(locale, 'fullResetIncludingSettings')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr(locale, 'legalAndSupport')}
          </Text>
          {legalItems.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              style={styles.linkButton}
              onPress={() => void openLink(item.url)}
            >
              <Text style={styles.linkButtonText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr(locale, 'appInformation')}
          </Text>
          <Text style={styles.versionText}>{mobileRuntimeConfig.appName}</Text>
          {metadataLines.map((line) => (
            <Text key={line.label} style={styles.versionText}>
              {line.label}: {line.value}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ToggleRow(props: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  locale: Locale;
}): React.JSX.Element {
  const { label, description, value, onToggle, locale } = props;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      accessibilityHint={description}
      style={styles.toggleRow}
      onPress={onToggle}
    >
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Text style={styles.toggleState}>
        {value ? tr(locale, 'on') : tr(locale, 'off')}
      </Text>
    </Pressable>
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
  },
  content: {
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },
  section: {
    backgroundColor: '#101A36D1',
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#2B4573',
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  sectionTitle: {
    color: '#B8D3FF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  toggleRow: {
    minHeight: 52,
    borderRadius: designTokens.radii.sm,
    borderWidth: 1,
    borderColor: '#3E5D8F',
    backgroundColor: '#0C1731CC',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  toggleTextWrap: {
    flexShrink: 1,
    gap: 2,
  },
  toggleLabel: {
    color: designTokens.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDescription: {
    color: '#A7BFEB',
    fontSize: 12,
  },
  toggleState: {
    color: designTokens.colors.cyan,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'right',
  },
  languageButton: {
    minHeight: 48,
    borderRadius: designTokens.radii.sm,
    borderWidth: 1,
    borderColor: '#3E5D8F',
    backgroundColor: '#0C1731CC',
    paddingHorizontal: designTokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageActive: {
    borderColor: '#6EF2FF',
  },
  languageText: {
    color: designTokens.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  languageStateText: {
    color: '#AFD0FF',
    fontSize: 12,
  },
  destructiveButton: {
    minHeight: 48,
    borderRadius: designTokens.radii.sm,
    borderWidth: 1,
    borderColor: '#85455C',
    backgroundColor: '#2A1120',
    paddingHorizontal: designTokens.spacing.md,
    justifyContent: 'center',
  },
  destructiveButtonText: {
    color: '#FFC1CF',
    fontSize: 14,
    fontWeight: '700',
  },
  linkButton: {
    minHeight: 44,
    borderRadius: designTokens.radii.sm,
    borderWidth: 1,
    borderColor: '#3E5D8F',
    backgroundColor: '#0C1731CC',
    paddingHorizontal: designTokens.spacing.md,
    justifyContent: 'center',
  },
  linkButtonText: {
    color: designTokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    color: '#9FBDEB',
    fontSize: 12,
    marginTop: designTokens.spacing.xs,
  },
});
