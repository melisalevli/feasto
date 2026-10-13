import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Runs while the dialog is attached, before the first paint, so focus never lands on a button inside it.
// Must stay a stable (module-level) function: an inline one would re-run on every render and steal focus.
const focusOnMount = (el: HTMLDivElement | null) => el?.focus({ preventScroll: true });

export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={focusOnMount} tabIndex={-1} className="box" role="dialog" aria-modal="true" aria-labelledby="mt">
        {children}
      </div>
    </div>
  );
}