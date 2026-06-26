import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function RejectDialog({
  open,
  title = 'Rejeter la réservation',
  description = 'Veuillez saisir le motif de rejet.',
  confirmText = 'Rejeter',
  cancelText = 'Annuler',
  loading = false,
  onConfirm, // (motif) => void
  onClose,
}) {
  const [motif, setMotif] = useState('');

  useEffect(() => {
    if (open) setMotif('');
  }, [open]);

  if (typeof document === 'undefined') return null;

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

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Motif <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                rows={4}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex: conflit d'agenda, informations manquantes..."
              />
              {motif.trim().length === 0 && (
                <p className="mt-1 text-xs text-stone-500">Le motif est obligatoire.</p>
              )}
            </div>

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
                onClick={() => onConfirm?.(motif.trim())}
                loading={loading}
                disabled={loading || motif.trim().length === 0}
                className="bg-red-600 hover:bg-red-700 text-white border-transparent"
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