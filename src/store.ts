import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { detectLang, type Lang } from './i18n';
import type { Diet, Meal, TabId } from './core/types';

interface State {
  lang: Lang;
  have: string[];
  useSoon: string[];
  maxTime: number;
  meal: Meal | null; // null = any
  diet: Diet | null; // null = any
  tab: TabId;
  history: string[];  // recipe ids, newest first
  saved: string[];    // recipe ids
  shopping: string[]; // ingredient ids
  setLang: (l: Lang) => void;
  toggle: (id: string) => void;
  toggleSoon: (id: string) => void;
  clear: () => void;
  setMaxTime: (t: number) => void;
  setMeal: (m: Meal | null) => void;
  setDiet: (d: Diet) => void; // picking the active one turns it off
  resetFilters: () => void;
  setTab: (t: TabId) => void;
  toggleSaved: (id: string) => void;
  addShopping: (ids: string[]) => void;
  buy: (id: string) => void;
  removeShopping: (id: string) => void;
  clearShopping: () => void;
  made: (id: string, used: string[]) => void;
}

const flip = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export const useStore = create<State>()(
  persist(
    (set) => ({
      lang: detectLang(),
      have: [],
      useSoon: [],
      maxTime: 999,
      meal: null,
      diet: null,
      tab: 'now',
      history: [],
      saved: [],
      shopping: [],
      setLang: (lang) => set({ lang }),
      toggle: (id) =>
        set((s) => ({
          have: flip(s.have, id),
          useSoon: s.useSoon.filter((x) => x !== id), // removing an ingredient clears its flag
        })),
      toggleSoon: (id) => set((s) => ({ useSoon: flip(s.useSoon, id) })),
      clear: () => set({ have: [], useSoon: [] }),
      setMaxTime: (maxTime) => set({ maxTime }),
      setMeal: (meal) => set({ meal }),
      setDiet: (d) => set((s) => ({ diet: s.diet === d ? null : d })),
      resetFilters: () => set({ maxTime: 999, meal: null, diet: null }),
      setTab: (tab) => set({ tab }),
      toggleSaved: (id) => set((s) => ({ saved: flip(s.saved, id) })),
      addShopping: (ids) =>
        set((s) => ({ shopping: [...new Set([...s.shopping, ...ids.filter((i) => !s.have.includes(i))])] })),
      buy: (id) =>
        set((s) => ({
          shopping: s.shopping.filter((x) => x !== id),
          have: s.have.includes(id) ? s.have : [...s.have, id],
        })),
      removeShopping: (id) => set((s) => ({ shopping: s.shopping.filter((x) => x !== id) })),
      clearShopping: () => set({ shopping: [] }),
      // Cooking it uses up the "use soon" ingredients the recipe called for
      made: (id, used) =>
        set((s) => ({
          history: [id, ...s.history.filter((x) => x !== id)].slice(0, 30),
          have: s.have.filter((x) => !(used.includes(x) && s.useSoon.includes(x))),
          useSoon: s.useSoon.filter((x) => !used.includes(x)),
        })),
    }),
    {
      name: 'feasto:v1',
      partialize: ({ lang, have, useSoon, maxTime, meal, diet, history, saved, shopping }) => ({
        lang, have, useSoon, maxTime, meal, diet, history, saved, shopping,
      }),
    }
  )
);

export const useHave = () => {
  const list = useStore((s) => s.have);
  return useMemo(() => new Set(list), [list]);
};