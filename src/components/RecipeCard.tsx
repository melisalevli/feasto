import { useEffect, useState } from 'react';
import { explain } from '../core/engine';
import { approxTime, recipeName, status } from '../core/format';
import { useT } from '../hooks/useT';
import { useIngName } from '../hooks/useIngName';
import { useStore } from '../store';
import type { Evaluation } from '../core/types';

interface Props {
  result: Evaluation;
  haveCount: number;
  onOpen: (id: string) => void;
  onRemove?: () => void;
}

export default function RecipeCard({ result: e, haveCount, onOpen, onRemove }: Props) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const label = useIngName();
  const r = e.recipe;

  const pct = Math.round(e.coverage * 100);
  const optionalIds = new Set(r.ingredients.filter(([, w]) => w === 1).map(([id]) => id));
  const named = (id: string) => (optionalIds.has(id) ? t('card.optional', { name: label(id) }) : label(id));
  const missingText = e.missing.length
    ? t('card.missing', { list: e.missing.map(named).join(', ') })
    : t('card.none');

  // Animate the progress bar from 0 on mount
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <article className="card">
      <div className="th">{r.emoji}</div>
      <div>
        <h4>{recipeName(r, lang)}</h4>
        <div className="meta">
          {approxTime(r.time, t)} / {t(`diff.${r.difficulty}`)} / {t(`meal.${r.meal}`)}
        </div>
      </div>
      <div className="card-st">
        {onRemove && (
          <button className="x" aria-label={`${t('list.remove')}: ${recipeName(r, lang)}`} onClick={onRemove}>
            ✕
          </button>
        )}
        <div className="st">{status(e, t)}</div>
      </div>
      <div className="bar"><i style={{ width: `${width}%` }} /></div>
      <ul className="why">
        {explain(e, haveCount, label, t).map((line) => <li key={line}>{line}</li>)}
      </ul>
      <div className="ft">
        <span className="miss" title={missingText}>{missingText}</span>
        <button className="lk" onClick={() => onOpen(r.id)}>{t('card.view')}</button>
      </div>
    </article>
  );
}