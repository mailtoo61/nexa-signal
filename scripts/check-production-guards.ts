import { validateProductionGuards } from './lib/productionGuards';

const result = validateProductionGuards();
if (!result.valid) {
  console.error('production guard checks failed:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('production guard checks passed.');
