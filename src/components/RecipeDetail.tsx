import { useEffect, useState } from 'react';
import { engine, subsFor } from '../data';
import { ids } from '../core/engine';
import { approxTime, loc, recipeName } from '../core/format';
import { useStore } from '../store';
import { useT } from '../hooks/useT';
import { useIngName } from '../hooks/useIngName';
import type { Key } from '../i18n';
import type { Recipe } from '../core/types';

interface Props {
  recipe: Recipe;
  have: Set<string>;
  surprise: boolean;
  onClose: () => void;
  // Lets the parent hide the outside prev/next arrows while cooking, so progress isn't lost
  onCooking?: (cooking: boolean) => void;
  onAgain: () => void;
}

const LEGEND: { cls: 'ok' | 'sw' | 'opt'; key: Key }[] = [
  { cls: 'ok', key: 'legend.have' },
  { cls: 'sw', key: 'legend.swap' },
  { cls: 'opt', key: 'legend.optional' },
];
const ORDER = { ok: 0, sw: 1, opt: 2 } as const; // Have, then Swap needed, then Optional

function Legend() {
  const t = useT();
  return (
    <p className="legend">
      {LEGEND.map(({ cls, key }) => (
        <span key={cls}>
          <span className={`dot ${cls}`} /> {t(key)}
        </span>
      ))}
    </p>
  );
}

function Ingredients({ recipe: r, have }: { recipe: Recipe; have: Set<string> }) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const name = useIngName();
  const cap = (s: string) => s.charAt(0).toLocaleUpperCase(t.lang) + s.slice(1);

  const rows = r.ingredients
    .map(([id, w]) => {
      const owned = have.has(id);
      const optional = w === 1;
      const state: keyof typeof ORDER = owned ? 'ok' : optional ? 'opt' : 'sw';
      return { id, state };
    })
    .sort((a, b) => ORDER[a.state] - ORDER[b.state]);

  return (
    <ul className="rows">
      {rows.map(({ id, state }) => {
        const required = state === 'sw';
        const swap = required ? engine.swapFor(id, have) : undefined;
        const options = required ? subsFor(id) : [];
        const legendKey = LEGEND.find((l) => l.cls === state)!.key;
        return (
          <li key={id}>
            <span className={`dot ${state}`} role="img" aria-label={t(legendKey)} />
            <div>
              <b>{name(id)}</b>
              {swap && (
                <small>
                  {t('detail.swap', {
                    name: name(swap.to).toLocaleLowerCase(t.lang),
                    note: loc(lang, swap.note, swap.note_tr),
                  })}
                </small>
              )}
              {required && !swap && (
                options.length ? (
                  options.map((s) => (
                    <small key={s.to}>
                      {cap(t(have.has(s.to) ? 'detail.couldhave' : 'detail.could', {
                        name: name(s.to).toLocaleLowerCase(t.lang),
                        compat: t(`compat.${s.compat}`),
                        note: loc(lang, s.note, s.note_tr),
                      }))}
                    </small>
))
                ) : (
                  <small>{t('detail.noswap')}</small>
                )
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function RecipeDetail({ recipe: r, have, surprise, onClose, onAgain, onCooking }: Props) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const shopping = useStore((s) => s.shopping);
  const isSaved = useStore((s) => s.saved.includes(r.id));
  const toggleSaved = useStore((s) => s.toggleSaved);
  const addShopping = useStore((s) => s.addShopping);
  const made = useStore((s) => s.made);
  const [cooking, setCooking] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [showIng, setShowIng] = useState(false);

  useEffect(() => {
    onCooking?.(cooking);
    return () => onCooking?.(false);
  }, [cooking]); // eslint-disable-line react-hooks/exhaustive-deps

  const name = recipeName(r, lang);
  const steps = loc(lang, r.steps, r.tr?.steps);

  const toBuy = r.ingredients
    .filter(([id, w]) => !have.has(id) && w >= 2 && !engine.swapFor(id, have))
    .map(([id]) => id);
  const listed = toBuy.every((id) => shopping.includes(id));

  const toggleStep = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const finish = () => {
    made(r.id, ids(r).filter((id) => have.has(id)));
    onClose();
  };

  // Cooking mode
  if (cooking) {
    return (
      <>
        <div className="th">{r.emoji}</div>
        <div>
          <span className="label">{t('detail.cooking', { done: done.size, total: steps.length })}</span>
          <h2 id="mt">{name}</h2>
        </div>
        <div className="det">
          <ul className="todo">
            {steps.map((s, i) => (
              <li key={i}>
                <label>
                  <input type="checkbox" checked={done.has(i)} onChange={() => toggleStep(i)} />
                  <span className={done.has(i) ? 'done' : undefined}>{s}</span>
                </label>
              </li>
            ))}
          </ul>
          <button className="lk" onClick={() => setShowIng(!showIng)}>
            {showIng ? t('detail.hide') : t('detail.lack')}
          </button>
          {showIng && (
            <>
              <Legend />
              <Ingredients recipe={r} have={have} />
            </>
          )}
        </div>
        <div className="acts">
          <button className="btn alt" onClick={() => setCooking(false)}>{t('detail.back')}</button>
          <button className="btn" onClick={finish}>{t('detail.finish')}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="th">{r.emoji}</div>
      <div>
        <span className="label">{surprise ? t('detail.surprise') : t(`meal.${r.meal}`)}</span>
        <h2 id="mt">{name}</h2>
        <p className="meta">
          {approxTime(r.time, t)} / {t(`diff.${r.difficulty}`)} / {t(`meal.${r.meal}`)}
        </p>
        <Legend />
      </div>

      <div className="det">
        <section>
          <span className="label">{t('detail.ingredients')}</span>
          <Ingredients recipe={r} have={have} />
        </section>

        <section>
          <span className="label">{t('detail.steps')}</span>
          <ol className="steps">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </section>

        <div className="sub">
          <button className="lk" onClick={() => toggleSaved(r.id)}>
            {isSaved ? t('detail.saved') : t('detail.save')}
          </button>
          {toBuy.length > 0 && (
            <button className="lk" disabled={listed} onClick={() => addShopping(toBuy)}>
              {listed ? t('detail.listed') : t('detail.addlist', { n: toBuy.length })}
            </button>
          )}
        </div>
      </div>

      <div className="acts">
        <button className="btn" onClick={() => setCooking(true)}>{t('detail.cook')}</button>
        <button className="btn alt" onClick={onClose}>{t('detail.close')}</button>
        {surprise && <button className="btn alt" onClick={onAgain}>{t('detail.again')}</button>}
      </div>
    </>
  );
}