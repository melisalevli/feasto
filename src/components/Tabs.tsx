import type { Evaluation, TabId } from '../core/types';
import { useT } from '../hooks/useT';

export const TABS: { id: TabId }[] = [{ id: 'now' }, { id: 'almost' }, { id: 'diff' }];

interface Props {
  groups: Record<TabId, Evaluation[]>;
  active: TabId;
  onSelect: (t: TabId) => void;
}

export default function Tabs({ groups, active, onSelect }: Props) {
  const t = useT();
  return (
    <div className="tabs" role="tablist">
      {TABS.map(({ id }) => (
        <button
          key={id}
          role="tab"
          aria-selected={id === active}
          className={`tab${groups[id].length ? '' : ' zero'}`}
          onClick={() => onSelect(id)}
        >
          <span>{t(`tab.${id}`)}</span>
          <b>{groups[id].length}</b>
        </button>
      ))}
    </div>
  );
}