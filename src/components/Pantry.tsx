import { INGREDIENTS } from '../data';
import { useStore } from '../store';
import { useT } from '../hooks/useT';
import IngredientButton from './IngredientButton';
import type { Category } from '../core/types';
import Page from './Page';

type Group = Exclude<Category, 'egg'>;
const group = (c: Category): Group => (c === 'egg' ? 'dairy' : c); // eggs share the dairy group

// Fewest ingredients first, so groups that share a row have similar heights
const GROUPS = [...new Set(INGREDIENTS.map((i) => group(i.cat)))]
  .map((cat) => ({ cat, items: INGREDIENTS.filter((i) => group(i.cat) === cat) }))
  .sort((a, b) => a.items.length - b.items.length);

export default function Pantry() {
  const t = useT();
  const count = useStore((s) => s.have.length);
  const clear = useStore((s) => s.clear);
  return (
    <Page
      title={t('pantry.title')}
      aside={
        <span className="row-acts">
          {count > 0 && (
            <button className="lk" onClick={clear}>{t('clear')}</button>
          )}
          <a className="lk" href="#find">{t('pantry.cta')}</a>
        </span>
      }
    >
      <p className="note">{t('pantry.note', { n: count })}</p>
      <div className="cats">
        {GROUPS.map(({ cat, items }) => (
          <div className="blk" key={cat}>
            <span className="label">{t(`cat.${cat}`)}</span>
            <div className="shelf">
              {items.map((ing) => (
                <IngredientButton key={ing.id} ing={ing} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}