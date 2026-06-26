import { cn } from '../../utils/helpers';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-stone-200 bg-white text-stone-800 shadow-sm',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--color-primary)]/25',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('border-b border-stone-200 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('font-display text-lg font-semibold text-stone-800', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('mt-1 text-sm text-stone-600', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn('px-6 py-4', className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center gap-3 border-t border-stone-200 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;