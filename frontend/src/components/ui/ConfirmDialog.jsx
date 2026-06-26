import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function ConfirmDialog({
  open,
  title = 'Confirmation',
  description = 'Êtes-vous sûr ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger', // 'danger' | 'default'
  loading = false,
  onConfirm,
  onClose,
}) {
  if (typeof document === 'undefined') return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
      : 'bg-[#E07A5F] hover:bg-[#C96A50] text-white border-transparent';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
            initial={{ scale: 0.98, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="font-display text-lg font-bold text-stone-800">{title}</h3>
            <p className="mt-2 text-sm text-stone-600">{description}</p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                {cancelText}
              </Button>

              <Button
                onClick={onConfirm}
                loading={loading}
                disabled={loading}
                className={confirmBtnClass}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}