import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);

if (!process.env.DATABASE_URL) {
  console.warn('[API] DATABASE_URL no está configurada.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((x) => x.trim()) : true,
}));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT current_database() AS database, NOW() AS now');
    res.json({ ok: true, ...r.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo conectar a PostgreSQL.' });
  }
});

function mapPackage(row) {
  return {
    idPaquete: Number(row.id_paquete),
    codigo: row.codigo,
    tipo: row.tipo,
    estado: row.estado,
    fechaGeneracion: row.fecha_generacion,
    cantidadPiezas: row.cantidad_piezas == null ? null : Number(row.cantidad_piezas),
    espesorMm: row.espesor_mm == null ? null : Number(row.espesor_mm),
    anchoMm: row.ancho_mm == null ? null : Number(row.ancho_mm),
    largoMm: row.largo_mm == null ? null : Number(row.largo_mm),
    pieTablar: row.pie_tablar == null ? null : Number(row.pie_tablar),
    metrosCuadrados: row.metros_cuadrados == null ? null : Number(row.metros_cuadrados),
    metrosCubicos: row.metros_cubicos == null ? null : Number(row.metros_cubicos),
    calidad: row.calidad,
    aptoPara: row.apto_para,
    publicToken: row.public_token,
    producto: row.producto,
    ubicacionActual: row.ubicacion_actual,
  };
}

function mapTrace(row) {
  return {
    nivel: Number(row.nivel),
    codigoPaquete: row.codigo_paquete,
    tipoPaquete: row.tipo_paquete,
    estadoPaquete: row.estado_paquete,
    numeroLote: row.numero_lote,
    numeroRemito: row.numero_remito,
    numeroPesada: row.numero_pesada == null ? null : Number(row.numero_pesada),
    proveedor: row.proveedor,
    origen: row.origen,
    establecimiento: row.establecimiento,
    localidad: row.localidad,
    provincia: row.provincia,
    latitud: row.latitud == null ? null : Number(row.latitud),
    longitud: row.longitud == null ? null : Number(row.longitud),
  };
}

async function getReportByCode(codigo) {
  const packageResult = await pool.query(`
    SELECT
      p.id_paquete, p.codigo, p.tipo, p.estado, p.fecha_generacion,
      p.cantidad_piezas, p.espesor_mm, p.ancho_mm, p.largo_mm,
      p.pie_tablar, p.metros_cuadrados, p.metros_cubicos,
      p.calidad, p.apto_para, p.public_token,
      pr.nombre AS producto,
      u.nombre AS ubicacion_actual
    FROM paquete p
    LEFT JOIN producto pr ON pr.id_producto = p.id_producto
    LEFT JOIN ubicacion u ON u.id_ubicacion = p.id_ubicacion
    WHERE UPPER(p.codigo) = UPPER($1)
    LIMIT 1
  `, [codigo]);

  if (packageResult.rowCount === 0) return null;

  const traceResult = await pool.query(
    'SELECT * FROM fn_trazabilidad_paquete_completa($1)',
    [codigo],
  );

  return {
    paquete: mapPackage(packageResult.rows[0]),
    genealogia: traceResult.rows.map(mapTrace),
  };
}

app.get('/api/trazabilidad/:codigo', async (req, res) => {
  try {
    const report = await getReportByCode(req.params.codigo);
    if (!report) return res.status(404).json({ message: 'Paquete no encontrado.' });
    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo consultar la trazabilidad.' });
  }
});

app.get('/api/public/trazabilidad/:token', async (req, res) => {
  try {
    const tokenResult = await pool.query(
      'SELECT codigo FROM paquete WHERE public_token = $1 LIMIT 1',
      [req.params.token],
    );
    if (tokenResult.rowCount === 0) {
      return res.status(404).json({ message: 'Identificador público no válido.' });
    }
    const report = await getReportByCode(tokenResult.rows[0].codigo);
    if (!report) return res.status(404).json({ message: 'Paquete no encontrado.' });
    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo consultar la trazabilidad pública.' });
  }
});

app.listen(port, () => {
  console.log(`[API] Producción/Trazabilidad escuchando en http://localhost:${port}`);
});
