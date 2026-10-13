import { useT } from '../hooks/useT';

export default function Footer() {
  const t = useT();
  return (
    <footer>
      <div className="g">
        <span>feasto</span>
        <span>{t('footer.tagline')}</span>
        <span>
          {t('footer.source')}{' '}
          <a href="https://www.themealdb.com" target="_blank" rel="noreferrer">TheMealDB</a>
          {t('footer.more')}
        </span>
      </div>
    </footer>
  );
}