import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Locale, PostRunTuningReport } from '@nexa/types';
import { tr } from '../../../shared/i18n/tr';
import { designTokens } from '../../../shared/design/tokens';
import {
  aggregatePlaytestReports,
  buildComparisonDelta,
  compareTagToTag,
  createComparisonSnapshot,
  deriveComparisonInsights,
  derivePlaytestInsights,
  exportAggregateSummaryJson,
  exportComparisonSnapshotJson,
  exportPlaytestBundleJson,
  summarizeTags,
  type ComparisonDelta,
} from '../telemetry/playtestLab';
import { copyText } from '../../../shared/dev/copyText';
import {
  DEFAULT_TUNING_PROFILE_TAG,
  sanitizeTuningProfileTag,
} from '../../../shared/dev/tuningProfileTag';
import {
  addSavedTuningTag,
  MAX_EXPERIMENT_NOTE_LENGTH,
  removeSavedTuningTag,
  sanitizeExperimentNote,
  sanitizeSavedTuningTags,
} from '../../../shared/dev/tuningProfileData';

interface PlaytestLabPanelProps {
  locale: Locale;
  reports: PostRunTuningReport[];
  runtimeVersion: string;
  activeTuningProfileTag: string;
  savedTuningTags: string[];
  experimentNotesByTag: Record<string, string>;
  onClose: () => void;
  onClearReports: () => Promise<void>;
  onExportReports: () => Promise<string>;
  onChangeActiveTag: (tag: string) => Promise<void>;
  onSaveSavedTags: (tags: string[]) => Promise<void>;
  onSaveExperimentNote: (tag: string, note: string) => Promise<void>;
}

function msToSecondsLabel(ms: number): string {
  return `${Math.round(ms / 1000)}s`;
}

function trendKey(
  trend: 'improved' | 'worsened' | 'unchanged',
): 'devImproved' | 'devWorsened' | 'devUnchanged' {
  if (trend === 'improved') return 'devImproved';
  if (trend === 'worsened') return 'devWorsened';
  return 'devUnchanged';
}

function renderDeltaLine(
  locale: Locale,
  labelKey: string,
  delta: ComparisonDelta | null,
  selector: (value: ComparisonDelta) => ComparisonDelta[keyof ComparisonDelta],
): string {
  if (!delta) return `${tr(locale, labelKey)}: ${tr(locale, 'devNoData')}`;
  const value = selector(delta);
  return `${tr(locale, labelKey)}: ${tr(locale, trendKey(value.trend))}`;
}

export function PlaytestLabPanel({
  locale,
  reports,
  runtimeVersion,
  activeTuningProfileTag,
  savedTuningTags,
  experimentNotesByTag,
  onClose,
  onClearReports,
  onExportReports,
  onChangeActiveTag,
  onSaveSavedTags,
  onSaveExperimentNote,
}: PlaytestLabPanelProps) {
  const [exportText, setExportText] = useState<string | null>(null);
  const [copyStatusKey, setCopyStatusKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tagDraft, setTagDraft] = useState(activeTuningProfileTag);
  const [noteDraft, setNoteDraft] = useState(
    experimentNotesByTag[activeTuningProfileTag] ?? '',
  );

  useEffect(() => {
    setTagDraft(activeTuningProfileTag);
    setNoteDraft(experimentNotesByTag[activeTuningProfileTag] ?? '');
  }, [activeTuningProfileTag, experimentNotesByTag]);

  const aggregate = useMemo(() => aggregatePlaytestReports(reports), [reports]);
  const insights = useMemo(
    () => derivePlaytestInsights(aggregate),
    [aggregate],
  );
  const tagSummaries = useMemo(() => summarizeTags(reports), [reports]);

  const selectedTag = activeTuningProfileTag;
  const selectedTagReports = useMemo(
    () => reports.filter((report) => report.tuningProfileTag === selectedTag),
    [reports, selectedTag],
  );
  const selectedTagAggregate = useMemo(
    () => aggregatePlaytestReports(selectedTagReports),
    [selectedTagReports],
  );

  const selectedTagSnapshot = useMemo(
    () => createComparisonSnapshot(selectedTagReports, 5),
    [selectedTagReports],
  );
  const selectedTagSnapshotDelta = useMemo(
    () => buildComparisonDelta(selectedTagSnapshot),
    [selectedTagSnapshot],
  );

  const compareToBaseline = useMemo(
    () => compareTagToTag(reports, selectedTag, DEFAULT_TUNING_PROFILE_TAG),
    [reports, selectedTag],
  );

  const previousTag = useMemo(() => {
    const tags = tagSummaries
      .map((item) => item.tag)
      .filter((tag) => tag !== selectedTag);
    return tags[0] ?? null;
  }, [selectedTag, tagSummaries]);

  const compareToPreviousTag = useMemo(
    () =>
      previousTag ? compareTagToTag(reports, selectedTag, previousTag) : null,
    [previousTag, reports, selectedTag],
  );

  const comparisonInsights = useMemo(
    () => deriveComparisonInsights(selectedTagSnapshotDelta),
    [selectedTagSnapshotDelta],
  );

  const topCollapse = useMemo(() => {
    let winner: { key: string; count: number } | null = null;
    for (const [key, count] of Object.entries(
      aggregate.collapseReasonDistribution,
    )) {
      if (!winner || count > winner.count) {
        winner = { key, count };
      }
    }
    return winner;
  }, [aggregate.collapseReasonDistribution]);

  const topFlags = useMemo(
    () =>
      Object.entries(aggregate.tuningFlagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    [aggregate.tuningFlagFrequency],
  );

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{tr(locale, 'devPlaytestLab')}</Text>
      <Text style={styles.localOnly}>{tr(locale, 'devLocalOnly')}</Text>

      <View style={styles.tagRow}>
        <Text style={styles.item}>{tr(locale, 'devTuningProfile')}</Text>
        <TextInput
          style={styles.input}
          value={tagDraft}
          onChangeText={setTagDraft}
          placeholder={DEFAULT_TUNING_PROFILE_TAG}
          placeholderTextColor="#7F9BC7"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          style={styles.smallButton}
          onPress={async () => {
            const sanitized = sanitizeTuningProfileTag(tagDraft);
            if (sanitized !== tagDraft.trim().toLowerCase()) {
              setCopyStatusKey('devInvalidTagName');
            } else {
              setCopyStatusKey(null);
            }
            setTagDraft(sanitized);
            await onChangeActiveTag(sanitized);
            setCopyStatusKey('devActiveTagChanged');
          }}
        >
          <Text style={styles.smallButtonText}>
            {tr(locale, 'devSelectedTag')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.smallButton}
          onPress={async () => {
            const next = addSavedTuningTag(
              savedTuningTags,
              activeTuningProfileTag,
            );
            await onSaveSavedTags(next);
            setCopyStatusKey(
              next.length >= 12 ? 'devMax12Tags' : 'devSavedTags',
            );
          }}
        >
          <Text style={styles.smallButtonText}>
            {tr(locale, 'devSaveCurrentTag')}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.item}>
        {tr(locale, 'devActiveTag')}: {activeTuningProfileTag}
      </Text>
      <Text style={styles.subTitle}>{tr(locale, 'devSavedTags')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipsRow}>
          {sanitizeSavedTuningTags(savedTuningTags).map((tag) => (
            <View
              key={tag}
              style={[
                styles.chip,
                tag === activeTuningProfileTag ? styles.chipActive : null,
              ]}
            >
              <Pressable onPress={() => void onChangeActiveTag(tag)}>
                <Text style={styles.chipText}>{tag}</Text>
              </Pressable>
              {tag !== DEFAULT_TUNING_PROFILE_TAG ? (
                <Pressable
                  onPress={async () => {
                    if (tag === DEFAULT_TUNING_PROFILE_TAG) {
                      setCopyStatusKey('devBaselineCannotDelete');
                      return;
                    }
                    const removed = removeSavedTuningTag(
                      savedTuningTags,
                      tag,
                      activeTuningProfileTag,
                    );
                    await onSaveSavedTags(removed.savedTags);
                    if (removed.activeTag !== activeTuningProfileTag) {
                      await onChangeActiveTag(removed.activeTag);
                      setCopyStatusKey('devActiveTagChanged');
                    }
                  }}
                >
                  <Text style={styles.chipDelete}>×</Text>
                </Pressable>
              ) : (
                <Text style={styles.chipDeleteDisabled}>•</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={styles.subTitle}>{tr(locale, 'devExperimentNote')}</Text>
      <TextInput
        style={styles.noteInput}
        value={noteDraft}
        onChangeText={(value) =>
          setNoteDraft(
            sanitizeExperimentNote(value).slice(0, MAX_EXPERIMENT_NOTE_LENGTH),
          )
        }
        placeholder={tr(locale, 'devNoNoteYet')}
        placeholderTextColor="#7F9BC7"
        multiline
      />
      <Pressable
        style={styles.smallButton}
        onPress={async () => {
          await onSaveExperimentNote(activeTuningProfileTag, noteDraft);
          setCopyStatusKey('devNoteSaved');
        }}
      >
        <Text style={styles.smallButtonText}>{tr(locale, 'devSaveNote')}</Text>
      </Pressable>

      {reports.length === 0 ? (
        <Text style={styles.empty}>{tr(locale, 'devNoReportsYet')}</Text>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.item}>
            {tr(locale, 'devRuns')}: {aggregate.totalRuns}
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devAverageDuration')}:{' '}
            {msToSecondsLabel(aggregate.averageDurationMs)}
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devMedianDuration')}:{' '}
            {msToSecondsLabel(aggregate.medianDurationMs)}
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devAverageScore')}:{' '}
            {Math.round(aggregate.averageScore)}
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devRecommendationAcceptance')}:{' '}
            {(aggregate.averageRecommendationAcceptanceRate * 100).toFixed(0)}%
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devTutorialCompletion')}:{' '}
            {(aggregate.tutorialCompletionRate * 100).toFixed(0)}%
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devMostCommonCollapse')}:{' '}
            {topCollapse
              ? `${tr(locale, topCollapse.key)} (${topCollapse.count})`
              : tr(locale, 'devNoData')}
          </Text>
          <Text style={styles.subTitle}>{tr(locale, 'devTopTuningFlags')}</Text>
          {topFlags.map(([flag, count]) => (
            <Text key={flag} style={styles.item}>
              {flag}: {count}
            </Text>
          ))}

          <Text style={styles.subTitle}>{tr(locale, 'devTagSummaries')}</Text>
          {tagSummaries.map((summary) => (
            <Text key={summary.tag} style={styles.item}>
              {summary.tag}: {summary.aggregate.totalRuns}
            </Text>
          ))}

          <Text style={styles.subTitle}>
            {tr(locale, 'devCompareToBaseline')}
          </Text>
          <Text style={styles.item}>
            {renderDeltaLine(
              locale,
              'devAverageDuration',
              compareToBaseline,
              (x) => x.duration,
            )}
          </Text>
          <Text style={styles.item}>
            {renderDeltaLine(
              locale,
              'devAverageScore',
              compareToBaseline,
              (x) => x.score,
            )}
          </Text>
          <Text style={styles.item}>
            {renderDeltaLine(
              locale,
              'devAverageRisk',
              compareToBaseline,
              (x) => x.risk,
            )}
          </Text>

          <Text style={styles.subTitle}>
            {tr(locale, 'devComparisonSnapshot')}
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devLatestRuns')}:{' '}
            {selectedTagSnapshot.latest.reports.length}
          </Text>
          <Text style={styles.item}>
            {tr(locale, 'devPreviousRuns')}:{' '}
            {selectedTagSnapshot.previous.reports.length}
          </Text>
          {selectedTagSnapshotDelta ? (
            <View style={styles.comparisonBox}>
              <Text style={styles.item}>
                {tr(locale, 'devAverageDuration')}:{' '}
                {tr(locale, trendKey(selectedTagSnapshotDelta.duration.trend))}
              </Text>
              <Text style={styles.item}>
                {tr(locale, 'devAverageScore')}:{' '}
                {tr(locale, trendKey(selectedTagSnapshotDelta.score.trend))}
              </Text>
              <Text style={styles.item}>
                {tr(locale, 'devAverageRisk')}:{' '}
                {tr(locale, trendKey(selectedTagSnapshotDelta.risk.trend))}
              </Text>
              <Text style={styles.item}>
                {tr(locale, 'devTutorialCompletion')}:{' '}
                {tr(
                  locale,
                  trendKey(selectedTagSnapshotDelta.tutorialCompletion.trend),
                )}
              </Text>
              <Text style={styles.item}>
                {tr(locale, 'devRecommendationAcceptance')}:{' '}
                {tr(
                  locale,
                  trendKey(
                    selectedTagSnapshotDelta.recommendationAcceptance.trend,
                  ),
                )}
              </Text>
            </View>
          ) : (
            <Text style={styles.item}>
              {tr(locale, 'devNoComparisonDataYet')}
            </Text>
          )}
          <Text style={styles.subTitle}>
            {tr(locale, 'devComparisonInsights')}
          </Text>
          {comparisonInsights.map((key) => (
            <Text key={key} style={styles.item}>
              {tr(locale, key)}
            </Text>
          ))}

          <Text style={styles.subTitle}>
            {tr(locale, 'devBalancingInsights')}
          </Text>
          {insights.map((insightKey) => (
            <Text key={insightKey} style={styles.item}>
              {tr(locale, insightKey)}
            </Text>
          ))}

          {previousTag ? (
            <Text style={styles.item}>
              {tr(locale, 'devPreviousRuns')}: {previousTag} (
              {compareToPreviousTag
                ? tr(locale, trendKey(compareToPreviousTag.duration.trend))
                : tr(locale, 'devNoData')}
              )
            </Text>
          ) : null}

          <Text style={styles.item}>
            {tr(locale, 'devRunsByTag')}: {selectedTagAggregate.totalRuns}
          </Text>
          {selectedTagAggregate.totalRuns === 0 ? (
            <Text style={styles.item}>{tr(locale, 'devNoReportsForTag')}</Text>
          ) : null}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <Pressable
          style={styles.button}
          onPress={async () => {
            setBusy(true);
            const json = await onExportReports();
            setExportText(json);
            setBusy(false);
          }}
        >
          <Text style={styles.buttonText}>
            {tr(locale, 'devExportReports')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            setExportText(exportAggregateSummaryJson(aggregate));
          }}
        >
          <Text style={styles.buttonText}>
            {tr(locale, 'devExportSummary')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            setExportText(
              exportComparisonSnapshotJson(
                selectedTagSnapshot,
                selectedTagSnapshotDelta,
              ),
            );
          }}
        >
          <Text style={styles.buttonText}>
            {tr(locale, 'devCopyComparison')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={async () => {
            const selectedTagJson = JSON.stringify(selectedTagReports, null, 2);
            const result = await copyText(selectedTagJson);
            setCopyStatusKey(
              result.copied ? 'devCopied' : 'devCopyUnavailable',
            );
            setExportText(selectedTagJson);
          }}
        >
          <Text style={styles.buttonText}>
            {tr(locale, 'devExportSelectedTag')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={async () => {
            const tagSummaryJson = JSON.stringify(tagSummaries, null, 2);
            const result = await copyText(tagSummaryJson);
            setCopyStatusKey(
              result.copied ? 'devCopied' : 'devCopyUnavailable',
            );
            setExportText(tagSummaryJson);
          }}
        >
          <Text style={styles.buttonText}>
            {tr(locale, 'devExportAllTags')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={async () => {
            const bundle = exportPlaytestBundleJson({
              runtimeVersion,
              reports,
              aggregateSummary: aggregate,
              comparisonSnapshot: selectedTagSnapshot,
              comparisonDelta: selectedTagSnapshotDelta,
              activeTuningProfileTag,
              savedTuningTags,
              experimentNotesByTag,
              tagSummaries,
              selectedTagReports,
              selectedTagComparison: {
                baseline: compareToBaseline,
                previousTag,
                previousTagDelta: compareToPreviousTag,
                withinTag: selectedTagSnapshotDelta,
              },
            });
            const result = await copyText(bundle);
            setCopyStatusKey(
              result.copied ? 'devCopied' : 'devCopyUnavailable',
            );
            setExportText(bundle);
          }}
        >
          <Text style={styles.buttonText}>{tr(locale, 'devCopySummary')}</Text>
        </Pressable>
        <Pressable
          style={styles.buttonDanger}
          onPress={async () => {
            setBusy(true);
            await onClearReports();
            setExportText(null);
            setCopyStatusKey(null);
            setBusy(false);
          }}
        >
          <Text style={styles.buttonText}>{tr(locale, 'devClearReports')}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{tr(locale, 'home')}</Text>
        </Pressable>
      </View>

      {busy ? (
        <Text style={styles.busy}>{tr(locale, 'devWorking')}</Text>
      ) : null}
      {copyStatusKey ? (
        <Text style={styles.busy}>{tr(locale, copyStatusKey)}</Text>
      ) : null}
      {exportText ? (
        <ScrollView style={styles.exportBox}>
          <Text style={styles.exportText}>{exportText}</Text>
        </ScrollView>
      ) : null}
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
    borderRadius: designTokens.radii.lg,
    backgroundColor: '#0B1226F0',
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.sm,
  },
  title: { color: '#DDEBFF', fontSize: 20, fontWeight: '700' },
  localOnly: { color: '#95B6E8', fontSize: 12 },
  empty: { color: '#C8DBFF', fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { gap: 6, paddingBottom: 8 },
  subTitle: {
    color: '#AFCBFA',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  item: { color: '#DDEBFF', fontSize: 13 },
  comparisonBox: {
    borderWidth: 1,
    borderColor: '#35507A',
    borderRadius: designTokens.radii.md,
    padding: designTokens.spacing.sm,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#4C6FA5',
    color: '#DDEBFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  smallButton: {
    minHeight: 36,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#6FAFE6',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  smallButtonText: {
    color: '#E4F0FF',
    fontSize: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#476DA6',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    borderColor: '#7FD2FF',
    backgroundColor: '#12315A',
  },
  chipText: {
    color: '#DDEBFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chipDelete: {
    color: '#F2A4A4',
    fontSize: 14,
    fontWeight: '700',
  },
  chipDeleteDisabled: {
    color: '#6F8CB8',
    fontSize: 14,
  },
  noteInput: {
    minHeight: 58,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#4C6FA5',
    color: '#DDEBFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  actions: { gap: designTokens.spacing.xs },
  button: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#6FAFE6',
    borderRadius: designTokens.radii.md,
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.md,
  },
  buttonDanger: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#D78080',
    borderRadius: designTokens.radii.md,
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.md,
  },
  buttonText: { color: '#E4F0FF', textAlign: 'center', fontWeight: '600' },
  busy: { color: '#95B6E8', fontSize: 12 },
  exportBox: {
    maxHeight: 120,
    borderRadius: designTokens.radii.md,
    borderWidth: 1,
    borderColor: '#35507A',
    padding: designTokens.spacing.sm,
  },
  exportText: { color: '#BED8FF', fontSize: 10 },
});
