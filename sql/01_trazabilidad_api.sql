-- Función usada por GET /api/trazabilidad/:codigo
-- Ejecutar en aserradero_produccion_test si todavía no existe.

CREATE OR REPLACE FUNCTION fn_trazabilidad_paquete_completa(
    p_codigo VARCHAR
)
RETURNS TABLE (
    nivel INTEGER,
    codigo_paquete VARCHAR,
    tipo_paquete VARCHAR,
    estado_paquete VARCHAR,
    numero_lote VARCHAR,
    numero_remito VARCHAR,
    numero_pesada BIGINT,
    proveedor VARCHAR,
    origen VARCHAR,
    establecimiento VARCHAR,
    localidad VARCHAR,
    provincia VARCHAR,
    latitud NUMERIC,
    longitud NUMERIC
)
LANGUAGE SQL
AS $$
    WITH RECURSIVE genealogia AS (
        SELECT
            p.id_paquete,
            p.codigo,
            p.tipo,
            p.estado,
            0 AS nivel
        FROM paquete p
        WHERE UPPER(p.codigo) = UPPER(p_codigo)

        UNION ALL

        SELECT
            p_origen.id_paquete,
            p_origen.codigo,
            p_origen.tipo,
            p_origen.estado,
            g.nivel + 1
        FROM genealogia g
        JOIN transformacion_salida_paquete tsp
            ON tsp.id_paquete = g.id_paquete
        JOIN transformacion_entrada_paquete tep
            ON tep.id_transformacion = tsp.id_transformacion
        JOIN paquete p_origen
            ON p_origen.id_paquete = tep.id_paquete
    )

    SELECT DISTINCT
        g.nivel,
        g.codigo AS codigo_paquete,
        p.tipo AS tipo_paquete,
        p.estado AS estado_paquete,
        l.numero_lote,
        i.numero_remito,
        i.numero_pesada,
        prov.razon_social AS proveedor,
        o.nombre AS origen,
        o.establecimiento,
        o.localidad,
        o.provincia,
        o.latitud,
        o.longitud
    FROM genealogia g
    JOIN paquete p
        ON p.id_paquete = g.id_paquete
    LEFT JOIN paquete_lote_origen plo
        ON plo.id_paquete = g.id_paquete
    LEFT JOIN lote l
        ON l.id_lote = plo.id_lote
    LEFT JOIN ingreso_materia_prima i
        ON i.id_ingreso = l.id_ingreso
    LEFT JOIN proveedor prov
        ON prov.id_proveedor = i.id_proveedor
    LEFT JOIN origen_monte o
        ON o.id_origen = i.id_origen
    ORDER BY g.nivel, g.codigo;
$$;
