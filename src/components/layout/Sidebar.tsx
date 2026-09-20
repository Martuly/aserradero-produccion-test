import { NavLink } from 'react-router-dom';
import {
  Package,
  TreePine,
  Boxes,
  ScanSearch,
  Factory,
  Menu,
  X,
  MapPin,
  LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    title: 'Gestión',
    items: [
      {
        to: '/produccion/panel',
        label: 'Panel de producción',
        icon: LayoutDashboard,
      },
      {
        to: '/produccion/ingresos',
        label: 'Ingresos',
        icon: Package,
      },
      {
        to: '/produccion/lotes',
        label: 'Lotes',
        icon: TreePine,
      },
      {
        to: '/produccion/registrar',
        label: 'Registrar producción',
        icon: Factory,
      },
      {
        to: '/produccion/paquetes',
        label: 'Paquetes',
        icon: Boxes,
      },
    ],
  },
  {
    title: 'Consulta',
    items: [
      {
        to: '/produccion/trazabilidad',
        label: 'Trazabilidad',
        icon: ScanSearch,
      },
      {
        to: '/produccion/origenes',
        label: 'Orígenes / Montes',
        icon: MapPin,
      },
    ],
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Botón mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-iforest-600 bg-iforest-700 p-2 text-white shadow-sm lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
        border-r border-iforest-800
        bg-iforest-700 text-white
        transition-transform duration-200
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo / encabezado */}
        <div className="flex items-center justify-between border-b border-iforest-600 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ifaccent-500 text-iforest-900">
              <Factory size={21} />
            </div>

            <div>
              <p className="text-base font-bold leading-tight text-white">
                Impulso Forestal
              </p>

              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-iforest-200">
                Producción y trazabilidad
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-iforest-200 hover:bg-iforest-600 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-iforest-300">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white text-iforest-700 shadow-sm'
                          : 'text-iforest-100 hover:bg-iforest-600 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-iforest-600 px-5 py-4">
          <p className="text-xs font-medium text-iforest-200">
            Impulso Forestal
          </p>

          <p className="mt-1 text-[11px] text-iforest-300">
            Módulo de Producción
          </p>
        </div>
      </aside>
    </>
  );
}