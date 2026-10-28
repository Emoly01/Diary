import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from './Icons';
import './SlideOver.css';

/** A panel that slides over the page from one side, like a drawer. */
export default function SlideOver({
  children,
  side,
  label,
  closeLabel,
  onClose,
}: {
  children: ReactNode;
  side: 'left' | 'right';
  label: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="slide-over" role="dialog" aria-modal="true" aria-labelledby={label}>
      <div className="slide-over-scrim" onClick={onClose} />
      <div className={`slide-over-panel slide-over-${side}`}>
        <button ref={closeRef} type="button" className="btn btn-quiet slide-over-close" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
}
