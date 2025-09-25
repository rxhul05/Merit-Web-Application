import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onHide: (id: string) => void }> = ({ toasts, onHide }) => {
  return (
    <div
      className="fixed z-50 pointer-events-none flex flex-col gap-2 sm:gap-3 inset-x-2 top-2 sm:inset-auto sm:top-4 sm:right-4"
      role="region"
      aria-live="polite"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onHide: (id: string) => void }> = ({ toast, onHide }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-accent-400" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'glass border-emerald-500/30 text-gray-100';
      case 'error':
        return 'glass border-red-500/30 text-gray-100';
      case 'warning':
        return 'glass border-amber-500/30 text-gray-100';
      case 'info':
        return 'glass border-accent-500/30 text-gray-100';
    }
  };

  const getAccent = () => {
    switch (toast.type) {
      case 'success':
        return 'from-emerald-500 to-teal-500';
      case 'error':
        return 'from-red-500 to-rose-500';
      case 'warning':
        return 'from-amber-500 to-orange-500';
      case 'info':
        return 'from-accent-500 to-accent-600';
    }
  };

  const getIconBg = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 ring-red-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 ring-amber-500/30';
      case 'info':
        return 'bg-accent-500/20 text-accent-400 ring-accent-500/30';
    }
  };

  return (
    <div className={`relative w-full sm:max-w-sm sm:w-[22rem] pointer-events-auto select-none transition-all duration-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-dark-lg ${getStyles()}`}
      >
        <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${getAccent()}`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${getIconBg()}`}>
              {getIcon()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5 truncate text-gray-100">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-sm leading-5 text-gray-300 line-clamp-3">{toast.message}</p>
              )}
            </div>

            <button
              className="ml-2 rounded-lg p-1 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
              onClick={() => onHide(toast.id)}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-dark-700/50">
            <div
              className={`h-full bg-gradient-to-r ${getAccent()} shadow-glow`}
              style={{ width: mounted ? '0%' : '100%', transition: `width ${toast.duration}ms linear` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
