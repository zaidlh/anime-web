import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'default' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'default', duration: number = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[9999] pointer-events-none items-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-5 py-2.5 rounded-full text-[13px] font-bold shadow-[0_4px_24px_rgba(0,0,0,0.5)] whitespace-nowrap animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-auto bg-surface-container-highest border ${
              toast.type === 'success' ? 'border-green-500/40 text-tertiary' :
              toast.type === 'error' ? 'border-red-500/40 text-primary' :
              'border-outline text-on-surface'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
