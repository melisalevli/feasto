import { useEffect, useMemo, useState } from 'react';
import { RECIPE, engine } from './data';
import { useHave, useStore } from './store';
import { useRoute } from './hooks/useRoute';
import { useT } from './hooks/useT';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Sidebar from './components/Sidebar';
import Tabs, { TABS } from './components/Tabs';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import Unlock from './components/Unlock';
import Explore from './components/Explore';
import Pantry from './components/Pantry';
import Saved from './components/Saved';
import Shopping from './components/Shopping';
import Modal from './components/Modal';
import Footer from './components/Footer';

// `list` is the ordered recipe ids the detail was opened from, used by the prev/next buttons
type View = { id: string; surprise?: boolean; list?: string[] };

export default function App() {
  const t = useT();
  const { lang, useSoon, maxTime, meal, diet, tab, history, setTab, toggle, resetFilters } = useStore();
  const have = useHave();
  const [view, setView] = useState<View | null>(null);
  const [cooking, setCooking] = useState(false);
  const route = useRoute();

  useEffect(() => window.scrollTo(0, 0), [route]);
  // Lets CSS (uppercase labels) and screen readers use the right language rules, e.g. Turkish İ
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const ctx = useMemo(
    () => ({
      maxTime,
      meal: meal ?? undefined,
      diet: diet ?? undefined,
      useSoon: new Set(useSoon),
      recent: new Set(history.slice(0, 5)),
    }),
    [maxTime, meal, diet, useSoon, history]
  );
  const groups = useMemo(() => engine.suggest(have, ctx), [have, ctx]);
  const unlock = useMemo(() => (have.size ? engine.unlock(have, ctx) : []), [have, ctx]);

  const active = groups[tab].length ? tab : TABS.find((x) => groups[x.id].length)?.id ?? tab;
  const order = groups[active].map((e) => e.recipe.id);
  const filtered = maxTime !== 999 || meal !== null || diet !== null;
  const recipe = view ? RECIPE[view.id] : undefined;

  const open = (id: string, list?: string[]) => setView({ id, list });
  const surprise = () => setView({ id: engine.surprise(have, ctx, view?.id).id, surprise: true });
  const close = () => setView(null);

  const list = view?.list;
  const index = list && view ? list.indexOf(view.id) : -1;
  const nav =
    list && index >= 0 && list.length > 1
      ? { index, total: list.length, go: (d: -1 | 1) => setView({ id: list[index + d], list }) }
      : undefined;

  // Prev/next arrows sit outside the modal; hidden while cooking so progress isn't lost
  const showArrows = !!recipe && !!nav && !cooking;
  useEffect(() => {
    document.body.classList.toggle('has-rnav', showArrows);
    return () => document.body.classList.remove('has-rnav');
  }, [showArrows]);

  return (
    <>
      <Nav />

      {route === 'find' && (
        <>
          <Hero onSurprise={surprise} />
          <section id="app">
            <div className="g">
              <Sidebar onSurprise={surprise} />
              <main>
                <div className="mh">
                  <h2>{t('menu.title')}</h2>
                  <span className="label">
                    {t(have.size === 1 ? 'ingredients.one' : 'ingredients.many', { n: have.size })}
                  </span>
                </div>
                <Tabs groups={groups} active={active} onSelect={setTab} />
                <Unlock items={unlock} onAdd={toggle} />
                <div className="cards">
                  {groups[active].length ? (
                    groups[active].map((e) => (
                      <RecipeCard key={e.recipe.id} result={e} haveCount={have.size} onOpen={(id) => open(id, order)} />
                    ))
                  ) : (
                    <p className="empty">
                      {!have.size ? t('empty.start') : filtered ? t('empty.filters') : t('empty.none')}
                      {have.size > 0 && filtered && (
                        <>
                          {' '}
                          <button className="lk" onClick={resetFilters}>{t('reset')}</button>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </main>
            </div>
          </section>
        </>
      )}

      {route === 'explore' && <Explore onOpen={open} />}
      {route === 'pantry' && <Pantry />}
      {route === 'saved' && <Saved onOpen={open} />}
      {route === 'list' && <Shopping />}

      <Footer />
      {/* Keyed so each hop resets the modal's scroll position */}
      <Modal key={view?.id} open={!!recipe} onClose={close}>
        {recipe && (
          <RecipeDetail
            recipe={recipe}
            have={have}
            surprise={!!view?.surprise}
            onClose={close}
            onAgain={surprise}
            onCooking={setCooking}
          />
        )}
      </Modal>
      {/* Same .arrow buttons as the Your Kitchen shelf, fixed on either side of the recipe detail */}
      {showArrows && nav && (
        <>
          <button
            className="arrow rside l"
            aria-label={t('pager.prev')}
            style={{ visibility: nav.index === 0 ? 'hidden' : 'visible' }}
            onClick={() => nav.go(-1)}
          >
            ‹
          </button>
          <button
            className="arrow rside r"
            aria-label={t('pager.next')}
            style={{ visibility: nav.index === nav.total - 1 ? 'hidden' : 'visible' }}
            onClick={() => nav.go(1)}
          >
            ›
          </button>
        </>
      )}
    </>
  );
}