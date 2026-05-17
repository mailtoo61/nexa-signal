import { validateReleaseConfigReadiness } from './lib/releaseConfigCheck';

const result = validateReleaseConfigReadiness();
if (!result.valid) {
  console.error('release config checks failed:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('release config checks passed.');
