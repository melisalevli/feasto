import { useSyncExternalStore } from 'react';

export type Route = 'find' | 'explore' | 'pantry' | 'saved' | 'list';
const ROUTES: Route[] = ['find', 'explore', 'pantry', 'saved', 'list'];

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export const useRoute = (): Route => {
  const hash = useSyncExternalStore(subscribe, () => location.hash.slice(1));
  return ROUTES.includes(hash as Route) ? (hash as Route) : 'find';
};