import { createContext, useContext, type ReactNode } from 'react';
import type { IconName } from './Icon';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  icon?: IconName;
}

export type ToastKind = 'success' | 'error';

interface FeedbackContextType {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  toast: (text: string, kind?: ToastKind) => void;
}

export const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return ctx;
}
