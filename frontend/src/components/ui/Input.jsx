import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, containerClassName, id, required, ...props },
  ref,
) {
  const inputId = id || props.name;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-stone-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'cim-field w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm transition-colors',
            'placeholder:text-stone-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/15',
            Icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/15',
            className,
          )}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

export default Input;