import type { ReactNode } from 'react';
import { Bell, User } from 'lucide-react';

export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-bordersoft bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3 pl-16 lg:pl-5">
        <div>
          <h1 className="text-xl font-bold text-textmain">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-0.5 text-sm text-textmuted">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {/* Notificaciones */}
          <button
            className="
              relative rounded-xl
              border border-transparent
              p-2 text-iforest-700
              transition
              hover:border-iforest-100
              hover:bg-iforest-50
            "
            aria-label="Notificaciones"
          >
            <Bell size={20} />

            <span
              className="
                absolute right-1.5 top-1.5
                h-2 w-2 rounded-full
                bg-ifaccent-500
                ring-2 ring-white
              "
            />
          </button>

          {/* Usuario */}
          <button
            className="
              flex items-center gap-2
              rounded-xl
              border border-bordersoft
              bg-white
              px-3 py-2
              text-iforest-700
              transition
              hover:bg-iforest-50
            "
          >
            <div
              className="
                flex h-7 w-7
                items-center justify-center
                rounded-full
                bg-iforest-100
                text-iforest-700
              "
            >
              <User size={17} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-textmain">
                Operador
              </p>

              <p className="text-[10px] uppercase tracking-wide text-textmuted">
                Producción
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}