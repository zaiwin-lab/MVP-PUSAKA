import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger' | 'white';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  secondary: 'bg-ink text-white hover:bg-ink/90 shadow-sm',
  outline: 'border border-line bg-white text-ink hover:border-emerald-300 hover:bg-emerald-50/60',
  ghost: 'text-ink-muted hover:bg-emerald-50 hover:text-emerald-700',
  gold: 'bg-gold-300 text-ink hover:bg-gold-400',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  white: 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-[52px] px-7 text-[15px] gap-2.5',
  icon: 'h-9 w-9',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap',
    variants[variant],
    sizes[size],
    className,
  );

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...props },
  ref,
) {
  return <button ref={ref} className={buttonClass(variant, size, className)} {...props} />;
});

export function ButtonLink({
  href, variant = 'primary', size = 'md', className, children, external, ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={buttonClass(variant, size, className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
