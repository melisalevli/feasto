import type { Ingredient, Recipe, Substitution } from '../core/types';
import { createEngine } from '../core/engine';
import ingredients from './ingredients.json';
import recipes from './recipes.json';
import subs from './substitutions.json';

export const INGREDIENTS = ingredients as Ingredient[];

const seen = new Set<string>();
export const REC = (recipes as unknown as Recipe[]).filter((r) => {
  if (seen.has(r.id)) return false;
  seen.add(r.id);
  return Array.isArray(r.steps) && r.steps.length > 0;
});

export const SUBS = subs as Substitution[];
export const ING: Record<string, Ingredient> = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));
export const RECIPE: Record<string, Recipe> = Object.fromEntries(REC.map((r) => [r.id, r]));
export const engine = createEngine(REC, SUBS, INGREDIENTS);

// Shown on the shelf before the user searches
export const COMMON = [
  'egg', 'chicken', 'rice', 'tomato', 'onion', 'garlic',
  'potato', 'pasta', 'cheese', 'milk', 'bread', 'butter',
];

export const subsFor = (id: string) => SUBS.filter((s) => s.from === id);

// Dev-only data check: catches typos in the JSON
if (import.meta.env.DEV) {
  const bad = [
    ...REC.flatMap((r) => r.ingredients.filter(([id]) => !ING[id]).map(([id]) => `recipe ${r.id}: ${id}`)),
    ...SUBS.flatMap((s) => [s.from, s.to].filter((id) => !ING[id]).map((id) => `substitution: ${id}`)),
    ...COMMON.filter((id) => !ING[id]).map((id) => `common: ${id}`),
  ];
  if (bad.length) console.error('Unknown ingredient ids:', bad);
}