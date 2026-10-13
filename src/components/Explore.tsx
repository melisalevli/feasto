import { useEffect, useMemo, useState } from 'react';
import { REC, engine } from '../data';
import { useHave, useStore } from '../store';
import { approxTime, recipeName, status } from '../core/format';
import { useT } from '../hooks/useT';
import Page from './Page';

const PAGE_SIZE = 48;

export default function Explore({ onOpen }: { onOpen: (id: string, list: string[]) => void }) {
  const t = useT();
  const have = useHave();
  const lang = useStore((s) => s.lang);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const q = query.trim().toLocaleLowerCase(lang);

  // Sorted A-Z once per language. Search only filters, so the order never changes.
  const sorted = useMemo(
    () => [...REC].sort((a, b) => recipeName(a, lang).localeCompare(recipeName(b, lang), lang)),
    [lang]
  );

  const all = useMemo(() => sorted.map((r) => engine.evaluate(r, have)), [have, sorted]);
  const items = q ? all.filter((e) => recipeName(e.recipe, lang).toLocaleLowerCase(lang).includes(q)) : all;

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [current]);

  return (
    <Page
      title={t('explore.title')}
      aside={<span className="label">{t('recipes.many', { n: items.length })}</span>}
    >
      <input
        className="search"
        type="search"
        placeholder={t('explore.search')}
        aria-label={t('explore.search')}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
      />
      {shown.length ? (
        <div className="tbl">
          {shown.map((e) => (
            <button
              key={e.recipe.id}
              className="tile"
              onClick={() => onOpen(e.recipe.id, items.map((x) => x.recipe.id))}
            >
              <span className="head">
                <span className="e">{e.recipe.emoji}</span>
                <span>
                  <b>{recipeName(e.recipe, lang)}</b>
                  <small>
                    {approxTime(e.recipe.time, t)} / {t(`diff.${e.recipe.difficulty}`)}
                  </small>
                </span>
              </span>
              {have.size > 0 && <span className="st">{status(e, t)}</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className="empty">{t('explore.none', { q: query })}</p>
      )}
      {pages > 1 && (
        <div className="pager" role="navigation" aria-label={t('pager.label')}>
          <button
            className="btn alt sm"
            style={{ visibility: current === 0 ? 'hidden' : 'visible' }}
            onClick={() => setPage(current - 1)}
          >
            {t('pager.prev')}
          </button>
          <span className="label">
            {t('pager.page', { a: current + 1, b: pages })}
          </span>
          <button
            className="btn alt sm"
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            {t('pager.next')}
          </button>
        </div>
      )}
    </Page>
  );
}