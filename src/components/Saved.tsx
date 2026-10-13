import { useMemo } from 'react';
import { RECIPE, engine } from '../data';
import { useHave, useStore } from '../store';
import { useT } from '../hooks/useT';
import Page from './Page';
import RecipeCard from './RecipeCard';

export default function Saved({ onOpen }: { onOpen: (id: string, list: string[]) => void }) {
  const t = useT();
  const saved = useStore((s) => s.saved);
  const useSoon = useStore((s) => s.useSoon);
  const toggleSaved = useStore((s) => s.toggleSaved);
  const have = useHave();

  const results = useMemo(() => {
    const ctx = { useSoon: new Set(useSoon) };
    return saved
      .filter((id) => RECIPE[id])
      .map((id) => engine.evaluate(RECIPE[id], have, ctx))
      .sort((a, b) => b.score - a.score);
  }, [saved, have, useSoon]);

  const order = results.map((e) => e.recipe.id);
  const ready = results.filter((e) => e.blocking.length === 0).length;

  return (
    <Page title={t('saved.title')} aside={<span className="label">{t('saved.count', { n: results.length })}</span>}>
      {results.length ? (
        <>
          <p className="note">{ready ? t('saved.ready', { n: ready }) : t('saved.none')}</p>
          <div className="cards">
            {results.map((e) => (
              <RecipeCard
                key={e.recipe.id}
                result={e}
                haveCount={have.size}
                onOpen={(id) => onOpen(id, order)}
                onRemove={() => toggleSaved(e.recipe.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="empty">{t('saved.empty')}</p>
      )}
    </Page>
  );
}