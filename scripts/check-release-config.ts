import { validateReleaseConfigReadiness } from './lib/releaseConfigCheck';

const result = validateReleaseConfigReadiness();
if (result.warnings.length > 0) {
  console.warn('release config warnings:');
  for (const warning of result.warnings) {
    console.warn(`- ${warning}`);
  }
}
if (!result.valid) {
  console.error('release config checks failed:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('release config checks passed.');
