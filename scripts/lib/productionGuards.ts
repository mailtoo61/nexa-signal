import fs from 'node:fs';
import path from 'node:path';

export interface ProductionGuardResult {
  valid: boolean;
  errors: string[];
}

const SOURCE_ROOT = path.resolve('apps/mobile/src');
const RISKY_LABELS = ['Playtest Lab', 'Tuning Flag', 'Debug'];

function walkFiles(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, out);
      continue;
    }
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
}

export function validateProductionGuards(): ProductionGuardResult {
  const errors: string[] = [];
  const files: string[] = [];
  walkFiles(SOURCE_ROOT, files);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const hasDevGate =
      content.includes('__DEV__') || content.includes('isDevRuntime(');

    for (const label of RISKY_LABELS) {
      if (content.includes(label) && !hasDevGate) {
        errors.push(
          `${file} contains "${label}" without an explicit development gate`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
