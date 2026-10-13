import { useCallback } from 'react';
import { ING } from '../data';
import { loc } from '../core/format';
import { useStore } from '../store';

export function useIngName() {
  const lang = useStore((s) => s.lang);
  return useCallback(
    (id: string) => {
      const ing = ING[id];
      return ing ? loc(lang, ing.name, ing.name_tr) : id;
    },
    [lang],
  );
}