import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { FeedbackContext, type ConfirmOptions, type ToastKind } from './useFeedback';

interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

// Replaces window.confirm / alert with an in-app dialog and toast notifications.
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const confirm = useCallback((opts: ConfirmOptions) =>
    new Promise<boolean>(resolve => setDialog({ ...opts, resolve })), []);

  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const toast = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = ++nextId.current;
    setToasts(prev => [...prev, { id, kind, text }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const close = useCallback((ok: boolean) => {
    setDialog(current => {
      current?.resolve(ok);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, close]);

  return (
    <FeedbackContext.Provider value={{ confirm, toast }}>
      {children}
      {dialog && (
        <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) close(false); }}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className={`dialog-icon${dialog.tone === 'primary' ? ' dialog-icon-primary' : ''}`}>
              <Icon name={dialog.icon ?? 'trash'} size={20} />
            </div>
            <h2 id="dialog-title" className="dialog-title">{dialog.title}</h2>
            {dialog.message && <p className="dialog-message">{dialog.message}</p>}
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => close(false)}>Cancelar</Button>
              <Button variant={dialog.tone ?? 'danger'} onClick={() => close(true)} autoFocus>
                {dialog.confirmLabel ?? 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="toasts" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <span className="toast-icon"><Icon name={t.kind === 'success' ? 'checkCircle' : 'alertCircle'} size={18} /></span>
            <span className="toast-text">{t.text}</span>
            <button className="icon-btn" style={{ width: 22, height: 22 }} aria-label="Cerrar" onClick={() => dismiss(t.id)}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}
