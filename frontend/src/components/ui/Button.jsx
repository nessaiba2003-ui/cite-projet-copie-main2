import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] border border-transparent shadow-sm',
  secondary:
    'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] border border-transparent shadow-sm',
  outline:
    'border border-stone-300 text-stone-800 bg-transparent hover:bg-stone-50',
  ghost:
    'text-stone-700 bg-transparent hover:bg-stone-100 hover:text-stone-900',
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-sm',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
};

function hasTextClass(s = '') {
  // détecte text-... ou text[...] etc.
  return /\btext-\[?.+?\]?\b/.test(s);
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const isDisabled = disabled || loading;

  // Auto-fix: si quelqu’un met bg-white sur un bouton sans préciser text-...,
  // on force un texte foncé pour éviter “bouton vide”
  const needsDarkText = className.includes('bg-white') && !hasTextClass(className);
  const autoTextFix = needsDarkText ? 'text-stone-900' : '';

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
        autoTextFix,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {children}
    </button>
  );
}