import type { Context, Evaluation, Ingredient, Recipe, Substitution, TabId } from './types';
import type { T } from '../i18n';

const SWAP_CREDIT = 0.7;
const COMPAT = { high: 2, medium: 1, low: 0 } as const;

export const ids = (r: Recipe) => r.ingredients.map(([id]) => id);

const push = <K, V>(m: Map<K, V[]>, k: K, v: V) => {
  const list = m.get(k);
  list ? list.push(v) : m.set(k, [v]);
};

export function createEngine(recipes: Recipe[], substitutions: Substitution[], ingredients: Ingredient[]) {
  // ingredient -> substitutions, and ingredient -> recipes that use it
  const subsFrom = new Map<string, Substitution[]>();
  for (const s of substitutions) push(subsFrom, s.from, s);
  const usedBy = new Map<string, Recipe[]>();
  for (const r of recipes) for (const id of ids(r)) push(usedBy, id, r);

    // Category defaults; an ingredient's own `animal` field overrides them.
  const CAT_ANIMAL = { meat: 'meat', fish: 'meat', egg: 'product', dairy: 'product' } as const;
  const kind = (i: Ingredient) => i.animal ?? CAT_ANIMAL[i.cat as keyof typeof CAT_ANIMAL];
  const meat = new Set(ingredients.filter((i) => kind(i) === 'meat').map((i) => i.id));
  const animal = new Set(ingredients.filter((i) => kind(i)).map((i) => i.id));
  const without = (banned: Set<string>) =>
    new Set(recipes.filter((r) => !ids(r).some((id) => banned.has(id))).map((r) => r.id));
  const dietOk = { vegetarian: without(meat), vegan: without(animal) };

  const allowed = (r: Recipe, ctx: Context) =>
    r.time <= (ctx.maxTime ?? Infinity) &&
    (!ctx.meal || r.meal === ctx.meal) &&
    (!ctx.diet || dietOk[ctx.diet].has(r.id));

  /** Best usable swap (medium or high compatibility) for an ingredient you don't have. */
  const swapFor = (id: string, have: Set<string>) =>
    (subsFrom.get(id) ?? [])
      .filter((s) => have.has(s.to) && s.compat !== 'low')
      .sort((a, b) => COMPAT[b.compat] - COMPAT[a.compat])[0];

  function evaluate(recipe: Recipe, have: Set<string>, ctx: Context = {}): Evaluation {
    const owned: string[] = [], missing: string[] = [], blocking: string[] = [];
    const swaps: Substitution[] = [];
    let total = 0, got = 0, core = false, extras = 0;

    for (const [id, w] of recipe.ingredients) {
      const required = w >= 2;
      if (required) total += w;
      if (have.has(id)) {
        owned.push(id);
        if (required) { got += w; core = true; }
        else extras++;
        continue;
      }
      missing.push(id);
      if (!required) continue; // optional never blocks
      const swap = swapFor(id, have);
      if (swap) { swaps.push(swap); got += w * SWAP_CREDIT; }
      else blocking.push(id);
    }

    const tab: TabId = blocking.length === 0 ? (swaps.length ? 'almost' : 'now') : blocking.length === 1 ? 'almost' : 'diff';
    const usedSoon = owned.filter((id) => ctx.useSoon?.has(id));
    const coverage = total ? got / total : 0;
    const score =
      coverage +
      0.05 * extras + // small tie-break: owning optional extras
      0.3 * (owned.length / Math.max(have.size, 1)) +
      (usedSoon.length ? 0.3 : 0) -
      (ctx.recent?.has(recipe.id) ? 0.25 : 0);

    return { recipe, owned, missing, swaps, blocking, coverage, usedSoon, tab, score, core };
  }

  /** Evaluate every candidate recipe and group + rank them by tab. */
  function suggest(have: Set<string>, ctx: Context = {}): Record<TabId, Evaluation[]> {
    const groups: Record<TabId, Evaluation[]> = { now: [], almost: [], diff: [] };
    const seen = new Set<Recipe>();
    for (const id of have) {
      for (const r of usedBy.get(id) ?? []) {
        if (seen.has(r)) continue;
        seen.add(r);
        if (!allowed(r, ctx)) continue;
        const e = evaluate(r, have, ctx);
        if (e.core) groups[e.tab].push(e);
      }
    }
    for (const list of Object.values(groups)) list.sort((a, b) => b.score - a.score);
    return groups;
  }

  /** Ingredients that would turn the most recipes into "Make now" if you added them. */
  function unlock(have: Set<string>, ctx: Context = {}, limit = 4) {
    const ready = new Set(suggest(have, ctx).now.map((e) => e.recipe.id));
    const out: { id: string; count: number }[] = [];
    for (const [id, recs] of usedBy) {
      if (have.has(id)) continue;
      const next = new Set(have).add(id);
      const count = recs.filter((r) => allowed(r, ctx) && !ready.has(r.id) && evaluate(r, next, ctx).tab === 'now').length;
      if (count) out.push({ id, count });
    }
    return out.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  /** Random pick weighted by score, so good matches come up more often. */
  function surprise(have: Set<string>, ctx: Context = {}, skip?: string): Recipe {
    const g = suggest(have, ctx);
    let pool = [...g.now, ...g.almost].filter((e) => e.recipe.id !== skip);
    if (!pool.length) pool = g.diff.filter((e) => e.recipe.id !== skip);
    if (pool.length) {
      const w = pool.map((e) => Math.max(e.score, 0.05));
      let x = Math.random() * w.reduce((a, b) => a + b, 0);
      for (let i = 0; i < pool.length; i++) {
        x -= w[i];
        if (x < 0) return pool[i].recipe;
      }
      return pool[0].recipe;
    }
    const rest = recipes.filter((r) => r.id !== skip && allowed(r, ctx));
    const list = rest.length ? rest : recipes;
    return list[Math.floor(Math.random() * list.length)];
  }

  return { suggest, unlock, surprise, swapFor, evaluate };
}

/** "Why this?" lines for a result. */
export function explain(e: Evaluation, haveCount: number, label: (id: string) => string, t: T): string[] {
  const lower = (id: string) => label(id).toLocaleLowerCase(t.lang);
  const lines: string[] = [];
  if (e.blocking.length === 0) lines.push(t(e.swaps.length ? 'why.allswap' : 'why.all'));
  else if (e.blocking.length === 1) lines.push(t('why.one', { name: label(e.blocking[0]) }));
  else lines.push(t('why.many', { n: e.blocking.length }));

  for (const s of e.swaps) lines.push(t('why.swap', { from: label(s.from), to: lower(s.to) }));
  lines.push(t('why.uses', { k: e.owned.length, n: haveCount }));
  if (e.usedSoon.length) lines.push(t('why.soon', { names: e.usedSoon.map(lower).join(', ') }));
  return lines;
}