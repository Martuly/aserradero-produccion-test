import type { ReactNode } from 'react';
import { Bell, User } from 'lucide-react';

export function Header({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3 pl-16 lg:pl-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <button className="flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <User size={20} />
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">Operador</span>
          </button>
        </div>
      </div>
    </header>
  );
}
