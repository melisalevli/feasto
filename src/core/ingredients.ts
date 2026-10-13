import type { Ingredient } from './types';
import type { Lang } from '../i18n';

export function searchIngredients(list: Ingredient[], query: string, lang: Lang = 'en'): Ingredient[] {
  const lower = (s: string) => s.toLocaleLowerCase(lang);
  const q = lower(query.trim());
  const rank = (i: Ingredient) => {
    const mainName = lower(lang === 'tr' && i.name_tr ? i.name_tr : i.name);
    if (mainName.startsWith(q)) return 0;
    if (mainName.includes(q)) return 1;
    if (i.aliases?.some((a) => lower(a).startsWith(q))) return 2;
    if (i.aliases?.some((a) => lower(a).includes(q))) return 3;
    return -1;
  };
  return list
    .map((i) => [i, rank(i)] as const)
    .filter(([, r]) => r >= 0)
    .sort((a, b) => a[1] - b[1])
    .map(([i]) => i);
}