import { useEffect, useRef, useState } from 'react';
import { ING, INGREDIENTS, COMMON } from '../data';
import { searchIngredients } from '../core/ingredients';
import { MEALS } from '../core/types';
import { useStore } from '../store';
import { useT } from '../hooks/useT';
import { useIngName } from '../hooks/useIngName';
import IngredientButton from './IngredientButton';

const TIMES = [
  { label: 'any', value: 999 },
  { label: 'time.u15', value: 15 },
  { label: 'time.u30', value: 30 },
] as const;

const PAGE_SIZE = 12;
// Fixed order: common ingredients first, then everything else. Selecting never reorders the shelf.
const ORDERED = [...COMMON.map((id) => ING[id]), ...INGREDIENTS.filter((i) => !COMMON.includes(i.id))];

const STICK_TOP = 80; // px under the sticky nav
const STICK_GAP = 16; // px kept below "Surprise me" when it reaches the bottom of the screen

export default function Sidebar({ onSurprise }: { onSurprise: () => void }) {
  const t = useT();
  const name = useIngName();
  const { have, useSoon, maxTime, meal, diet, toggle, toggleSoon, clear, setMaxTime, setMeal, setDiet, lang } = useStore();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [collapsed, setCollapsed] = useState(false); // only has an effect on small screens (see styles.css)
  const q = query.trim().toLocaleLowerCase(lang);
  const ref = useRef<HTMLElement>(null);

  // The sidebar scrolls with the page, then stops with "Surprise me" at the bottom of the screen
  // and stays there, so the left side never goes blank. If it is shorter than the screen it simply
  // sticks under the nav. The sidebar height changes (ingredients, pager), so measure it live.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const top = Math.min(STICK_TOP, window.innerHeight - el.offsetHeight - STICK_GAP);
      el.style.setProperty('--stick-top', `${top}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const list = q ? searchIngredients(INGREDIENTS, q, lang) : ORDERED;
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = list.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !q || !list.length) return;
    const { id } = list[0];
    if (!have.includes(id)) toggle(id);
    setQuery('');
    setPage(0);
  };

  return (
    <aside ref={ref} className={collapsed ? 'collapsed' : undefined}>
      <button className="btn alt side-toggle" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
        {t(collapsed ? 'side.show' : 'side.hide')}
      </button>

      <div className="blk">
        <input
          className="search"
          type="search"
          placeholder={t('search.ing')}
          aria-label={t('search.ing')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          onKeyDown={onEnter}
        />
        <div className="bh">
          <span className="label">{t('kitchen.title', { n: have.length })}</span>
          <button className="lk" onClick={clear}>{t('clear')}</button>
        </div>
        <div className="shelf">
          {shown.map((ing) => (
            <IngredientButton key={ing.id} ing={ing} />
          ))}
          {q && !list.length && <p className="empty">{t('search.none', { q: query })}</p>}
        </div>
        {pages > 1 && (
          <div className="sh-nav">
            <button
              className="arrow"
              aria-label={t('pager.prev')}
              style={{ visibility: current === 0 ? 'hidden' : 'visible' }}
              onClick={() => setPage(current - 1)}
            >
              ‹
            </button>
            <span className="label">{t('pager.page', { a: current + 1, b: pages })}</span>
            <button
              className="arrow"
              aria-label={t('pager.next')}
              style={{ visibility: current === pages - 1 ? 'hidden' : 'visible' }}
              onClick={() => setPage(current + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {have.length > 0 && (
        <div className="blk">
          <span className="label">{t('soon.title')}</span>
          <div className="chips">
            {have.map((id) => (
              <button key={id} className="chip" aria-pressed={useSoon.includes(id)} onClick={() => toggleSoon(id)}>
                {name(id)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="blk">
        <span className="label">{t('time.title')}</span>
        <div className="seg">
          {TIMES.map((x) => (
            <button key={x.value} aria-pressed={maxTime === x.value} onClick={() => setMaxTime(x.value)}>
              {t(x.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="blk">
        <span className="label">{t('meal.title')}</span>
        <div className="chips">
          <button className="chip" aria-pressed={meal === null} onClick={() => setMeal(null)}>{t('any')}</button>
          {MEALS.map((m) => (
            <button key={m} className="chip" aria-pressed={meal === m} onClick={() => setMeal(m)}>
              {t(`meal.${m}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="blk">
        <span className="label">{t('diet.title')}</span>
        <div className="chips">
          <button className="chip" aria-pressed={diet === 'vegetarian'} onClick={() => setDiet('vegetarian')}>
            {t('diet.vegetarian')}
          </button>
          <button className="chip" aria-pressed={diet === 'vegan'} onClick={() => setDiet('vegan')}>
            {t('diet.vegan')}
          </button>
        </div>
      </div>

      <button className="btn alt" onClick={onSurprise}>{t('surprise')}</button>
    </aside>
  );
}