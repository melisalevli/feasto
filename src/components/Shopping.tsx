import { ING } from '../data';
import { useStore } from '../store';
import { useT } from '../hooks/useT';
import { useIngName } from '../hooks/useIngName';
import Page from './Page';

export default function Shopping() {
  const t = useT();
  const name = useIngName();
  const { shopping, buy, removeShopping, clearShopping } = useStore();
  const items = shopping.filter((id) => ING[id]);

  return (
    <Page
      title={t('list.title')}
      aside={items.length ? <button className="lk" onClick={clearShopping}>{t('clear')}</button> : undefined}
    >
      {items.length ? (
        <>
          <p className="note">{t('list.note')}</p>
          <ul className="list">
            {items.map((id) => (
              <li key={id}>
                <span>{ING[id].emoji} {name(id)}</span>
                <span className="row-acts">
                  <button className="lk" onClick={() => buy(id)}>{t('list.got')}</button>
                  <button
                    className="lk"
                    aria-label={`${t('list.remove')}: ${name(id)}`}
                    onClick={() => removeShopping(id)}
                  >
                    {t('list.remove')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="empty">
          {t('list.empty')}{' '}
          <a className="lk" href="#find">{t('list.find')}</a>
        </p>
      )}
    </Page>
  );
}