import { useT } from '../hooks/useT';
import { useIngName } from '../hooks/useIngName';

interface Props {
  items: { id: string; count: number }[];
  onAdd: (id: string) => void;
}

export default function Unlock({ items, onAdd }: Props) {
  const t = useT();
  const name = useIngName();
  if (!items.length) return null;
  return (
    <div className="blk">
      <span className="label">{t('unlock.title')}</span>
      <div className="chips">
        {items.map(({ id, count }) => (
          <button key={id} className="chip" onClick={() => onAdd(id)}>
            + {name(id)} · {t(count === 1 ? 'recipes.one' : 'recipes.many', { n: count })}
          </button>
        ))}
      </div>
    </div>
  );
}