import { useT } from '../hooks/useT';

export default function Hero({ onSurprise }: { onSurprise: () => void }) {
  const t = useT();
  return (
    <header className="hero" id="top">
      <div className="g">
        <h1>{t('hero.title')}</h1>
        <div className="side">
          <p>{t('hero.sub')}</p>
          <div className="btns">
            <button className="btn" onClick={() => document.getElementById('app')?.scrollIntoView()}>
              {t('hero.add')}
            </button>
            <button className="btn alt" onClick={onSurprise}>{t('surprise')}</button>
          </div>
        </div>
      </div>
    </header>
  );
}