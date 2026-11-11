import { useUIStore, ToastItem } from '../../store/uiStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-md w-full flex-col gap-2.5 pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
  };

  const bgStyles = {
    success: 'border-emerald-200 bg-white shadow-lg shadow-emerald-950/5',
    error: 'border-red-200 bg-white shadow-lg shadow-red-950/5',
    warning: 'border-amber-200 bg-white shadow-lg shadow-amber-950/5',
    info: 'border-blue-200 bg-white shadow-lg shadow-blue-950/5',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-popover transition-all duration-200 animate-in slide-in-from-bottom-3',
        bgStyles[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-charcoal-muted leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="rounded-lg p-1 text-slate-400 hover:text-charcoal hover:bg-slate-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

