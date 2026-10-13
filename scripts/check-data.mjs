// Validates src/data/*.json. Runs before every build (npm run build) or manually (npm run check:data).
// Exits with code 1 if anything is wrong, so a broken data file never reaches production.
import { readFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8'));
const ingredients = read('ingredients.json');
const recipes = read('recipes.json');
const subs = read('substitutions.json');

const ids = new Set(ingredients.map((i) => i.id));
const errors = [];

const seenIds = new Set();
const seenNames = new Set();
for (const r of recipes) {
  if (seenIds.has(r.id)) errors.push(`duplicate recipe id "${r.id}"`);
  seenIds.add(r.id);

  const key = r.name.trim().toLowerCase();
  if (seenNames.has(key)) errors.push(`duplicate recipe name "${r.name}"`);
  seenNames.add(key);

  if (!Array.isArray(r.steps) || r.steps.length === 0) {
    errors.push(`recipe "${r.id}": no steps`);
  } else if (!r.tr?.steps || r.tr.steps.length !== r.steps.length) {
    errors.push(`recipe "${r.id}": Turkish steps missing or different length`);
  }
  if (!r.tr?.name) errors.push(`recipe "${r.id}": missing tr.name`);
  if (!Array.isArray(r.ingredients) || r.ingredients.length === 0) errors.push(`recipe "${r.id}": no ingredients`);

  for (const [id] of r.ingredients ?? []) {
    if (!ids.has(id)) errors.push(`recipe "${r.id}": unknown ingredient "${id}"`);
  }
}

for (const s of subs) {
  for (const id of [s.from, s.to]) if (!ids.has(id)) errors.push(`substitution: unknown ingredient "${id}"`);
}

if (errors.length) {
  console.error(`\nData check failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`Data OK: ${recipes.length} recipes, ${ingredients.length} ingredients, ${subs.length} substitutions.`);