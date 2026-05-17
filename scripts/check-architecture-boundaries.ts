import { readFileSync } from 'node:fs';
import { globSync } from 'glob';

const uiFiles = globSync('apps/mobile/src/**/*.{ts,tsx}');
const engineFiles = globSync('packages/game-engine/src/**/*.ts');
const screenFiles = globSync('apps/mobile/src/features/**/*Screen.tsx');

const errors: string[] = [];

for (const file of uiFiles) {
  const text = readFileSync(file, 'utf8');
  if (
    text.includes("from '@nexa/game-engine/src") ||
    text.includes('../engine/')
  ) {
    errors.push(`UI import boundary violation: ${file}`);
  }
  if (/['"]\.{1,2}\/assets\//.test(text)) {
    errors.push(`Direct asset path in UI: ${file}`);
  }
}

for (const file of screenFiles) {
  const text = readFileSync(file, 'utf8');
  if (/>[A-Za-z][^<{]+</.test(text)) {
    errors.push(`Possible hardcoded user-facing string in screen: ${file}`);
  }
}

for (const file of engineFiles) {
  const text = readFileSync(file, 'utf8');
  if (/from\s+['"](react|react-native|expo[^'"]*)['"]/.test(text)) {
    errors.push(`Engine imports UI/runtime package: ${file}`);
  }
  if (/Math\.random|Date\.now|new Date\(|crypto\.getRandomValues/.test(text)) {
    errors.push(`Non-deterministic API usage in engine: ${file}`);
  }
}

if (errors.length) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log('Architecture boundaries passed.');
