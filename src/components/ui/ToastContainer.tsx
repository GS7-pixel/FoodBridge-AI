import { useApp, Toast as ToastType } from '../../context/AppContext';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const icons: Record<ToastType['type'], typeof CheckCircle> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colors: Record<ToastType['type'], string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const iconColors: Record<ToastType['type'], string> = {
  success: 'text-emerald-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3 max-w-sm">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up ${colors[toast.type]}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
