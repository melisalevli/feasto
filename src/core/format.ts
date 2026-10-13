import type { Evaluation, Recipe } from './types';
import type { Lang, T } from '../i18n';

/** Picks the Turkish value when the language is Turkish and it exists, otherwise the English one. */
export const loc = <V>(lang: Lang, base: V, tr?: V): V => (lang === 'tr' && tr ? tr : base);

export const recipeName = (r: Recipe, lang: Lang) => loc(lang, r.name, r.tr?.name);

/** "~25 min" under 90 minutes, "~2 h" above. Times are estimates, so the UI never shows them as exact. */
export const approxTime = (minutes: number, t: T) =>
  minutes < 90
    ? `~${minutes} ${t('unit.min')}`
    : `~${(Math.round(minutes / 30) / 2).toLocaleString(t.lang)} ${t('unit.h')}`;

/** Short readiness label, shared by recipe cards and the Explore grid. */
export const status = (e: Evaluation, t: T) =>
  e.blocking.length === 0
    ? t(e.swaps.length ? 'status.swap' : 'status.ready')
    : t('status.away', { n: e.blocking.length });