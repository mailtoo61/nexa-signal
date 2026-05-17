import { validateI18nDictionaries } from './lib/i18nQa';

const result = validateI18nDictionaries();
if (!result.valid) {
  console.error('i18n checks failed:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('i18n checks passed.');
