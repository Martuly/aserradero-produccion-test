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


function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getTableColumns(tableName) {
  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
  `, [tableName]);
  return new Set(result.rows.map((row) => row.column_name));
}

function firstExisting(columns, candidates) {
  return candidates.find((candidate) => columns.has(candidate)) || null;
}

async function getMateriaPrimaProcesada(desde, hasta) {
  const consumoCols = await getTableColumns('parte_produccion_consumo_lote');
  const parteCols = await getTableColumns('parte_produccion');
  const loteCols = await getTableColumns('lote');

  if (consumoCols.size === 0 || parteCols.size === 0 || loteCols.size === 0) {
    return { kg: null, lotes: null };
  }

  const cantidadCol = firstExisting(consumoCols, ['cantidad_consumida', 'cantidad', 'cantidad_procesada']);
  const consumoParteCol = firstExisting(consumoCols, ['id_parte_produccion', 'id_parte']);
  const consumoLoteCol = firstExisting(consumoCols, ['id_lote']);
  const parteIdCol = firstExisting(parteCols, ['id_parte_produccion', 'id_parte']);
  const fechaCol = firstExisting(parteCols, ['fecha', 'fecha_produccion', 'fecha_hora_inicio', 'created_at']);
  const loteIdCol = firstExisting(loteCols, ['id_lote']);
  const unidadCol = firstExisting(loteCols, ['unidad_medida', 'unidad']);

  if (!cantidadCol || !consumoParteCol || !consumoLoteCol || !parteIdCol || !fechaCol || !loteIdCol || !unidadCol) {
    return { kg: null, lotes: null };
  }

  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN UPPER(COALESCE(l.${unidadCol}::text, '')) = 'KG' THEN c.${cantidadCol}::numeric ELSE 0 END), 0) AS kg,
      COUNT(DISTINCT c.${consumoLoteCol}) FILTER (
        WHERE UPPER(COALESCE(l.${unidadCol}::text, '')) = 'KG'
      ) AS lotes
    FROM parte_produccion_consumo_lote c
    JOIN parte_produccion pp ON pp.${parteIdCol} = c.${consumoParteCol}
    JOIN lote l ON l.${loteIdCol} = c.${consumoLoteCol}
    WHERE pp.${fechaCol}::date BETWEEN $1::date AND $2::date
  `, [desde, hasta]);

  return {
    kg: Number(result.rows[0]?.kg || 0),
    lotes: Number(result.rows[0]?.lotes || 0),
  };
}

async function getPlayaKg() {
  const loteCols = await getTableColumns('lote');
  if (loteCols.size === 0) return null;

  const cantidadCol = firstExisting(loteCols, ['cantidad_disponible', 'cantidad_actual', 'cantidad_inicial', 'cantidad']);
  const unidadCol = firstExisting(loteCols, ['unidad_medida', 'unidad']);
  if (!cantidadCol || !unidadCol) return null;

  const result = await pool.query(`
    SELECT COALESCE(SUM(${cantidadCol}::numeric), 0) AS kg
    FROM lote
    WHERE UPPER(COALESCE(${unidadCol}::text, '')) = 'KG'
  `);
  return Number(result.rows[0]?.kg || 0);
}

async function getLotesAbiertos() {
  const loteCols = await getTableColumns('lote');
  if (loteCols.size === 0) return 0;

  const estadoCol = firstExisting(loteCols, ['estado']);
  if (!estadoCol) {
    const result = await pool.query('SELECT COUNT(*)::int AS cantidad FROM lote');
    return Number(result.rows[0]?.cantidad || 0);
  }

  const result = await pool.query(`
    SELECT COUNT(*)::int AS cantidad
    FROM lote
    WHERE UPPER(COALESCE(${estadoCol}::text, '')) NOT IN ('CERRADO', 'CONSUMIDO', 'ANULADO')
  `);
  return Number(result.rows[0]?.cantidad || 0);
}

app.get('/api/produccion/dashboard', async (req, res) => {
  try {
    const desde = String(req.query.desde || '');
    const hasta = String(req.query.hasta || '');

    if (!isIsoDate(desde) || !isIsoDate(hasta) || desde > hasta) {
      return res.status(400).json({ message: 'Rango de fechas inválido. Use desde y hasta en formato YYYY-MM-DD.' });
    }

    const [
      materiaPrima,
      paquetesResumen,
      produccionPorLoteResult,
      actividadSemanalResult,
      playaKg,
      lotesAbiertos,
    ] = await Promise.all([
      getMateriaPrimaProcesada(desde, hasta),
      pool.query(`
        SELECT
          COALESCE(SUM(metros_cubicos) FILTER (
            WHERE tipo = 'VERDE' AND fecha_generacion::date BETWEEN $1::date AND $2::date
          ), 0) AS produccion_verde_m3,
          COUNT(*) FILTER (WHERE estado = 'EN_PROCESO')::int AS paquetes_en_proceso,
          COALESCE(SUM(metros_cubicos) FILTER (
            WHERE estado = 'DISPONIBLE' AND tipo IN ('CLASIFICADO', 'MECANIZADO', 'FINAL')
          ), 0) AS stock_comercial_m3,
          COALESCE(SUM(metros_cubicos) FILTER (
            WHERE estado = 'DISPONIBLE' AND tipo = 'VERDE'
          ), 0) AS madera_verde_m3,
          COALESCE(SUM(metros_cubicos) FILTER (
            WHERE estado = 'DISPONIBLE' AND tipo = 'SECO'
          ), 0) AS a_clasificar_m3,
          COUNT(*) FILTER (
            WHERE estado = 'DISPONIBLE' AND tipo = 'SECO'
          )::int AS paquetes_a_clasificar
        FROM paquete
      `, [desde, hasta]),
      pool.query(`
        SELECT
          l.numero_lote AS lote,
          COALESCE(SUM(p.metros_cubicos), 0) AS metros_cubicos
        FROM paquete p
        JOIN paquete_lote_origen plo ON plo.id_paquete = p.id_paquete
        JOIN lote l ON l.id_lote = plo.id_lote
        WHERE p.tipo = 'VERDE'
          AND p.fecha_generacion::date BETWEEN $1::date AND $2::date
        GROUP BY l.numero_lote
        ORDER BY metros_cubicos DESC, l.numero_lote
        LIMIT 6
      `, [desde, hasta]),
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('week', fecha_generacion), 'DD/MM') AS semana,
          COUNT(*)::int AS paquetes
        FROM paquete
        WHERE fecha_generacion::date BETWEEN $1::date AND $2::date
        GROUP BY DATE_TRUNC('week', fecha_generacion)
        ORDER BY DATE_TRUNC('week', fecha_generacion)
      `, [desde, hasta]),
      getPlayaKg(),
      getLotesAbiertos(),
    ]);

    const row = paquetesResumen.rows[0] || {};
    const produccionVerdeM3 = Number(row.produccion_verde_m3 || 0);
    const paquetesEnProceso = Number(row.paquetes_en_proceso || 0);
    const stockComercialM3 = Number(row.stock_comercial_m3 || 0);
    const maderaVerdeM3 = Number(row.madera_verde_m3 || 0);
    const aClasificarM3 = Number(row.a_clasificar_m3 || 0);
    const paquetesAClasificar = Number(row.paquetes_a_clasificar || 0);

    const alertas = [];
    if (paquetesEnProceso > 0) {
      alertas.push({
        nivel: 'warning',
        texto: `${paquetesEnProceso} paquete(s) se encuentran actualmente en proceso.`,
      });
    }
    if (paquetesAClasificar > 0) {
      alertas.push({
        nivel: 'info',
        texto: `${paquetesAClasificar} paquete(s) secos están disponibles y pendientes de clasificación.`,
      });
    }
    if (stockComercialM3 > 0) {
      alertas.push({
        nivel: 'success',
        texto: `Hay ${stockComercialM3.toLocaleString('es-AR', { maximumFractionDigits: 3 })} m³ de stock comercial disponible.`,
      });
    }

    return res.json({
      periodo: { desde, hasta },
      indicadores: {
        materiaPrimaProcesadaKg: materiaPrima.kg,
        lotesProcesados: materiaPrima.lotes,
        produccionVerdeM3,
        paquetesEnProceso,
        stockComercialM3,
        aprovechamientoFisico: null,
        aprovechamientoNota: 'Pendiente definir conversión/regla común entre kg de entrada y m³ de salida.',
      },
      inventario: {
        playaKg,
        maderaVerdeM3,
        enSecadoM3: null,
        aClasificarM3,
        stockComercialM3,
        lotesAbiertos,
      },
      produccionPorLote: produccionPorLoteResult.rows.map((item) => ({
        lote: item.lote,
        metrosCubicos: Number(item.metros_cubicos || 0),
      })),
      actividadSemanal: actividadSemanalResult.rows.map((item) => ({
        semana: item.semana,
        paquetes: Number(item.paquetes || 0),
      })),
      alertas,
    });
  } catch (error) {
    console.error('[API] Error dashboard producción:', error);
    return res.status(500).json({ message: 'No se pudo consultar el panel de producción.' });
  }
});

app.listen(port, () => {
  console.log(`[API] Producción/Trazabilidad escuchando en http://localhost:${port}`);
});
