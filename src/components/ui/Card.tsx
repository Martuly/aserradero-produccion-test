import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-2xl
        border border-bordersoft
        bg-white
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        border-b border-iforest-100
        px-5 py-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`
        px-5 py-4
        ${onClick ? 'cursor-pointer transition-colors hover:bg-iforest-50/50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}