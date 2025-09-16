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

    if (newToast.duration > 0) {
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
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white/70 backdrop-blur border-green-200 text-green-900';
      case 'error':
        return 'bg-white/70 backdrop-blur border-red-200 text-red-900';
      case 'warning':
        return 'bg-white/70 backdrop-blur border-yellow-200 text-yellow-900';
      case 'info':
        return 'bg-white/70 backdrop-blur border-blue-200 text-blue-900';
    }
  };

  const getAccent = () => {
    switch (toast.type) {
      case 'success':
        return 'from-green-500/90 to-emerald-500/90';
      case 'error':
        return 'from-red-500/90 to-rose-500/90';
      case 'warning':
        return 'from-amber-500/90 to-yellow-500/90';
      case 'info':
        return 'from-blue-500/90 to-cyan-500/90';
    }
  };

  const getIconBg = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 text-green-700 ring-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 ring-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
    }
  };

  return (
    <div className={`relative max-w-sm w-[22rem] pointer-events-auto select-none transition-all duration-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div
        className={`relative overflow-hidden rounded-xl border shadow-lg shadow-black/5 ${getStyles()}`}
      >
        <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${getAccent()}`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${getIconBg()}`}>
              {getIcon()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5 truncate">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-sm leading-5 text-black/70 line-clamp-3">{toast.message}</p>
              )}
            </div>

            <button
              className="ml-2 rounded-md p-1 text-black/50 hover:text-black/70 hover:bg-black/5 transition-colors"
              onClick={() => onHide(toast.id)}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-black/5">
            <div
              className={`h-full bg-gradient-to-r ${getAccent()}`}
              style={{ width: mounted ? '0%' : '100%', transition: `width ${toast.duration}ms linear` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
