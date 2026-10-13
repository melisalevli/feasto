import { useStore } from '../store';
import { useIngName } from '../hooks/useIngName';
import type { Ingredient } from '../core/types';

export default function IngredientButton({ ing }: { ing: Ingredient }) {
  const name = useIngName();
  const on = useStore((s) => s.have.includes(ing.id));
  const toggle = useStore((s) => s.toggle);
  return (
    <button className="ing" aria-pressed={on} onClick={() => toggle(ing.id)}>
      <span className="e">{ing.emoji}</span>
      <b>{name(ing.id)}</b>
    </button>
  );
}