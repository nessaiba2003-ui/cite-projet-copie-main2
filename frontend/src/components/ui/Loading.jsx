import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function Loading({ size = 'md', label = 'Chargement…', fullScreen = false, className }) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 text-[#E07A5F]', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Loader2 className={cn('animate-spin', sizeMap[size])} />
      {label && <p className="text-sm text-stone-600">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}