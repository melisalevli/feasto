import { useMemo } from 'react';
import { translate, type Key, type T, type Vars } from '../i18n';
import { useStore } from '../store';

export function useT(): T {
  const lang = useStore((s) => s.lang);
  return useMemo(() => Object.assign((key: Key, vars?: Vars) => translate(lang, key, vars), { lang }), [lang]);
}