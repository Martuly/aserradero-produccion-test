import { NavLink } from 'react-router-dom';
import { Package, TreePine, Boxes, ScanSearch, Factory, Menu, X, MapPin } from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    title: 'Producción',
    items: [
      { to: '/produccion/ingresos', label: 'Ingresos', icon: Package },
      { to: '/produccion/lotes', label: 'Lotes', icon: TreePine },
      { to: '/produccion/registrar', label: 'Registrar producción', icon: Factory },
      { to: '/produccion/paquetes', label: 'Paquetes', icon: Boxes },
      { to: '/produccion/trazabilidad', label: 'Trazabilidad', icon: ScanSearch },
      { to: '/produccion/origenes', label: 'Orígenes / Montes', icon: MapPin },
    ],
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Factory size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Aserradero</p>
              <p className="text-xs text-gray-400 leading-tight">Producción y trazabilidad</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{section.title}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-400">v1.0 · Demo Producción</p>
        </div>
      </aside>
    </>
  );
}
