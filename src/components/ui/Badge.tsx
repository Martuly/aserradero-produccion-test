import type { ReactNode } from 'react';

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  yellow: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  red: 'bg-rose-100 text-rose-700 ring-rose-600/20',
  blue: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/10',
};

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: BadgeColor }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClasses[color]}`}>
      {children}
    </span>
  );
}
