import type { SessionState } from '../session/types';

export const SESSION_SNAPSHOT_VERSION = 1 as const;

export interface SessionSnapshot {
  snapshotVersion: typeof SESSION_SNAPSHOT_VERSION;
  engineVersion: string;
  session: SessionState;
}

export type SnapshotValidationErrorCode =
  | 'invalid_shape'
  | 'unsupported_snapshot_version'
  | 'invalid_engine_version'
  | 'invalid_number'
  | 'negative_metric'
  | 'duplicate_node_id'
  | 'duplicate_link_id'
  | 'invalid_link_reference'
  | 'missing_core_node'
  | 'invalid_node_type'
  | 'invalid_profile'
  | 'invalid_tuning_version';

export interface SnapshotValidationError {
  code: SnapshotValidationErrorCode;
  path: string;
  message: string;
}

export interface SnapshotValidationResult {
  valid: boolean;
  errors: SnapshotValidationError[];
}

const ENGINE_VERSION = 'game-engine-v1';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function pushError(
  errors: SnapshotValidationError[],
  code: SnapshotValidationErrorCode,
  path: string,
  message: string,
): void {
  errors.push({ code, path, message });
}

export function createSessionSnapshot(session: SessionState): SessionSnapshot {
  return {
    snapshotVersion: SESSION_SNAPSHOT_VERSION,
    engineVersion: ENGINE_VERSION,
    session,
  };
}

export function validateSessionSnapshot(
  snapshot: unknown,
): SnapshotValidationResult {
  const errors: SnapshotValidationError[] = [];

  if (!snapshot || typeof snapshot !== 'object') {
    pushError(
      errors,
      'invalid_shape',
      'snapshot',
      'Snapshot must be an object.',
    );
    return { valid: false, errors };
  }

  const typed = snapshot as Partial<SessionSnapshot>;

  if (typed.snapshotVersion !== SESSION_SNAPSHOT_VERSION) {
    pushError(
      errors,
      'unsupported_snapshot_version',
      'snapshot.snapshotVersion',
      'Snapshot version is not supported.',
    );
  }

  if (typed.engineVersion !== ENGINE_VERSION) {
    pushError(
      errors,
      'invalid_engine_version',
      'snapshot.engineVersion',
      'Snapshot engine version mismatch.',
    );
  }

  const session = typed.session;
  if (!session || typeof session !== 'object') {
    pushError(
      errors,
      'invalid_shape',
      'snapshot.session',
      'Session is missing.',
    );
    return { valid: false, errors };
  }

  const s = session as SessionState;
  if (s.profile !== 'intro' && s.profile !== 'standard') {
    pushError(
      errors,
      'invalid_profile',
      'snapshot.session.profile',
      'Invalid profile.',
    );
  }

  if (typeof s.tuningVersion !== 'string' || !s.tuningVersion) {
    pushError(
      errors,
      'invalid_tuning_version',
      'snapshot.session.tuningVersion',
      'Invalid tuning version.',
    );
  }

  const numericChecks: Array<[string, number]> = [
    ['snapshot.session.tick', s.tick],
    ['snapshot.session.elapsedMs', s.elapsedMs],
    ['snapshot.session.signalStrength', s.signalStrength],
    ['snapshot.session.stability', s.stability],
    ['snapshot.session.score', s.score],
    ['snapshot.session.metrics.invalidActions', s.metrics.invalidActions],
    ['snapshot.session.metrics.nodesStabilized', s.metrics.nodesStabilized],
    ['snapshot.session.metrics.linksRepaired', s.metrics.linksRepaired],
    [
      'snapshot.session.metrics.connectionsCreated',
      s.metrics.connectionsCreated,
    ],
    ['snapshot.session.metrics.riskSum', s.metrics.riskSum],
    ['snapshot.session.metrics.riskSamples', s.metrics.riskSamples],
  ];

  for (const [path, value] of numericChecks) {
    if (!isFiniteNumber(value)) {
      pushError(errors, 'invalid_number', path, 'Expected a finite number.');
      continue;
    }
    if (value < 0) {
      pushError(
        errors,
        'negative_metric',
        path,
        'Expected a non-negative number.',
      );
    }
  }

  const nodeIds = new Set<string>();
  let coreCount = 0;
  for (const node of s.graph.nodes) {
    if (nodeIds.has(node.id)) {
      pushError(
        errors,
        'duplicate_node_id',
        `snapshot.session.graph.nodes.${node.id}`,
        'Duplicate node id.',
      );
    }
    nodeIds.add(node.id);
    if (node.type === 'core') coreCount += 1;
    if (
      node.type !== 'core' &&
      node.type !== 'relay' &&
      node.type !== 'amplifier' &&
      node.type !== 'stabilizer' &&
      node.type !== 'decayer'
    ) {
      pushError(
        errors,
        'invalid_node_type',
        `snapshot.session.graph.nodes.${node.id}.type`,
        'Invalid node type.',
      );
    }
  }

  if (coreCount < 1) {
    pushError(
      errors,
      'missing_core_node',
      'snapshot.session.graph.nodes',
      'At least one core node is required.',
    );
  }

  const linkIds = new Set<string>();
  for (const link of s.graph.links) {
    if (linkIds.has(link.id)) {
      pushError(
        errors,
        'duplicate_link_id',
        `snapshot.session.graph.links.${link.id}`,
        'Duplicate link id.',
      );
    }
    linkIds.add(link.id);
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) {
      pushError(
        errors,
        'invalid_link_reference',
        `snapshot.session.graph.links.${link.id}`,
        'Link references unknown nodes.',
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function restoreSessionSnapshot(snapshot: unknown): SessionState {
  const validation = validateSessionSnapshot(snapshot);
  if (!validation.valid) {
    throw new Error(
      `Invalid session snapshot: ${validation.errors
        .map((error) => `${error.path}:${error.code}`)
        .join(', ')}`,
    );
  }
  return (snapshot as SessionSnapshot).session;
}

export function serializeSessionSnapshot(snapshot: SessionSnapshot): string {
  return JSON.stringify(snapshot);
}

export function deserializeSessionSnapshot(payload: string): unknown {
  return JSON.parse(payload) as unknown;
}

function stableSerialize(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashString(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function snapshotFingerprintPayload(
  snapshot: SessionSnapshot,
): Record<string, unknown> {
  return {
    snapshotVersion: snapshot.snapshotVersion,
    engineVersion: snapshot.engineVersion,
    session: {
      sessionId: snapshot.session.sessionId,
      seed: snapshot.session.seed,
      profile: snapshot.session.profile,
      tuningVersion: snapshot.session.tuningVersion,
      tick: snapshot.session.tick,
      elapsedMs: snapshot.session.elapsedMs,
      signalStrength: snapshot.session.signalStrength,
      stability: snapshot.session.stability,
      collapsed: snapshot.session.collapsed,
      score: snapshot.session.score,
      graph: snapshot.session.graph,
      metrics: snapshot.session.metrics,
    },
  };
}

export function getSessionSnapshotFingerprint(
  snapshot: SessionSnapshot,
): string {
  return hashString(stableSerialize(snapshotFingerprintPayload(snapshot)));
}
