import { useStore } from '../store';
import { useRoute, type Route } from '../hooks/useRoute';
import { useT } from '../hooks/useT';
import type { Key, Lang } from '../i18n';

const LINKS: { route: Route; key: Key }[] = [
  { route: 'find', key: 'nav.find' },
  { route: 'explore', key: 'nav.explore' },
  { route: 'pantry', key: 'nav.pantry' },
  { route: 'saved', key: 'nav.saved' },
  { route: 'list', key: 'nav.list' },
];
const LANGS: Lang[] = ['en', 'tr'];

export default function Nav() {
  const t = useT();
  const current = useRoute();
  const saved = useStore((s) => s.saved.length);
  const list = useStore((s) => s.shopping.length);
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const counts: Partial<Record<Route, number>> = { saved, list };

  return (
    <nav>
      <div className="g">
        <a className="logo" href="#find"><img src="/feasto.png" alt="Feasto" /></a>
        <div className="links">
          {LINKS.map(({ route, key }) => (
            <a key={route} href={`#${route}`} aria-current={current === route ? 'page' : undefined}>
              {t(key)}{counts[route] ? ` (${counts[route]})` : ''}
            </a>
          ))}
          <span className="lang" role="group" aria-label={t('nav.lang')}>
            {LANGS.map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </span>
        </div>
      </div>
    </nav>
  );
}