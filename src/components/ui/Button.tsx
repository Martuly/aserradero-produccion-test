import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  primary:
    'bg-iforest-700 text-white hover:bg-iforest-800 active:bg-iforest-900 shadow-sm',

  secondary:
    'bg-white text-iforest-700 border border-bordersoft hover:bg-iforest-50 active:bg-iforest-100',

  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',

  ghost:
    'text-iforest-700 hover:bg-iforest-50 active:bg-iforest-100',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl
        font-semibold
        transition-colors
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  const variants2: Record<Variant, string> = {
    primary: 'text-iforest-700 hover:text-iforest-800',
    secondary: 'text-textmuted hover:text-textmain',
    danger: 'text-rose-600 hover:text-rose-700',
    ghost: 'text-iforest-600 hover:text-iforest-800',
  };

  return (
    <button
      {...props}
      className={`
        inline-flex items-center gap-1
        text-sm font-medium
        transition-colors
        ${variants2[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center
        rounded-xl
        p-2
        text-iforest-700
        transition-colors
        hover:bg-iforest-50
        hover:text-iforest-800
        ${className}
      `}
    >
      {children}
    </button>
  );
}