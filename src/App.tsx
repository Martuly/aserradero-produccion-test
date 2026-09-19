import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProduccionIngresos } from '@/screens/produccion/ProduccionIngresos';
import { ProduccionIngresoDetalle } from '@/screens/produccion/ProduccionIngresoDetalle';
import { ProduccionLotes } from '@/screens/produccion/ProduccionLotes';
import { ProduccionLoteDetalle } from '@/screens/produccion/ProduccionLoteDetalle';
import { ProduccionRegistrar } from '@/screens/produccion/ProduccionRegistrar';
import { ProduccionPaquetes } from '@/screens/produccion/ProduccionPaquetes';
import { ProduccionPaqueteDetalle } from '@/screens/produccion/ProduccionPaqueteDetalle';
import { ProduccionTrazabilidad } from '@/screens/produccion/ProduccionTrazabilidad';
import { ProduccionTrazabilidadPublica } from '@/screens/produccion/ProduccionTrazabilidadPublica';
import { ProduccionOrigenes } from '@/screens/produccion/ProduccionOrigenes';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/produccion/trazabilidad" replace />} />
        <Route path="/produccion/ingresos" element={<ProduccionIngresos />} />
        <Route path="/produccion/ingresos/:id" element={<ProduccionIngresoDetalle />} />
        <Route path="/produccion/lotes" element={<ProduccionLotes />} />
        <Route path="/produccion/lotes/:id" element={<ProduccionLoteDetalle />} />
        <Route path="/produccion/registrar" element={<ProduccionRegistrar />} />
        <Route path="/produccion/paquetes" element={<ProduccionPaquetes />} />
        <Route path="/produccion/paquetes/:id" element={<ProduccionPaqueteDetalle />} />
        <Route path="/produccion/trazabilidad" element={<ProduccionTrazabilidad />} />
        <Route path="/produccion/origenes" element={<ProduccionOrigenes />} />
        <Route path="/trazabilidad/:codigo" element={<ProduccionTrazabilidad />} />
        <Route path="/public/trazabilidad/:token" element={<ProduccionTrazabilidadPublica />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
