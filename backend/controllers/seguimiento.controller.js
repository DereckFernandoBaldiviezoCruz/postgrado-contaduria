const db = require('../db/db');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const registrarAuditoria = require('./auditoria');
const QRCode = require('qrcode');
const dbError = require('./dbError');

/* =========================
   FUNCIONES AUXILIARES
========================= */

function fechaTexto(fecha) {
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  const f = new Date(fecha);
  return `${f.getDate()} de ${meses[f.getMonth()]} de ${f.getFullYear()}`;
}

function abreviarNivel(nivel) {
  switch (nivel) {
    case 'Licenciado':
      return 'Lic';
    case 'Magister':
      return 'MSc';
    case 'Doctor':
      return 'Dr';
    case 'Postdoctorado':
      return 'PhD';
    default:
      return '';
  }
}

function safeFileName(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

/* =========================
   LISTAR
========================= */
async function listar(buscar = '') {
  try {
    const area = global.areaActual;

    let sql = `
      SELECT
        r.id recepcion_id,
        r.tema titulo,
        r.fecha_recepcion,
        e.nombre_completo estudiante,
        t.nombre_completo tutor,
        r.estado
      FROM recepciones r
      JOIN estudiantes e ON e.id=r.estudiante_id
      LEFT JOIN tutores t ON t.id=r.tutor_id
      JOIN programas p ON p.id=r.programa_id
    `;

    let params = [area];

    if (buscar) {
      sql += `
        WHERE e.estado='Activo'
        AND r.estado IN ('En revision','Aceptado','Programada')
        AND p.area = ?
        AND (
          e.nombre_completo LIKE ?
          OR r.tema LIKE ?
          OR t.nombre_completo LIKE ?
        )
      `;

      const filtro = `%${buscar}%`;
      params.push(filtro, filtro, filtro);
    } else {
      sql += `
        WHERE e.estado='Activo'
        AND r.estado IN ('En revision','Aceptado','Programada')
        AND p.area = ?
      `;
    }

    sql += ` ORDER BY e.nombre_completo`;

    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   OBTENER RECEPCIONES
========================= */
async function obtenerRecepciones(id) {
  try {
    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.tema,
        r.fecha_recepcion,
        p.nombre AS programa,
        p.area
      FROM recepciones r
      JOIN programas p ON p.id = r.programa_id
      WHERE r.estudiante_id = (
        SELECT estudiante_id FROM recepciones WHERE id=?
      )
      ORDER BY r.fecha_recepcion DESC
      `,
      [id],
    );

    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   TRIBUNAL
========================= */
async function obtenerTribunal(id) {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        tr.rol,
        d.nombre_completo,
        d.nivel_academico
      FROM tribunales tr
      JOIN docentes d ON d.id=tr.docente_id
      WHERE tr.recepcion_id=?
      `,
      [id],
    );

    return rows.map((t) => ({
      rol: t.rol,
      nombre_completo: `${abreviarNivel(t.nivel_academico)} ${t.nombre_completo}`,
    }));
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   ACEPTAR TEMA
========================= */
async function aceptarTema(recepcion_id, usuario_id) {
  try {
    const [[row]] = await db.query(
      `SELECT estado FROM recepciones WHERE id=?`,
      [recepcion_id],
    );

    if (!row) throw new Error('Recepción no encontrada');

    if (row.estado === 'Aceptado') return { ok: true };

    await db.query(`UPDATE recepciones SET estado='Aceptado' WHERE id=?`, [
      recepcion_id,
    ]);

    await registrarAuditoria(
      'recepciones',
      recepcion_id,
      'UPDATE',
      'Se aceptó el tema de tesis',
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   IMPRIMIR
========================= */
async function imprimir(data, usuario_id) {
  try {
    const { recepcion_id, numero, carpetaDestino } = data;

    if (!carpetaDestino) throw new Error('No se seleccionó carpeta');

    const [[info]] = await db.query(
      `
      SELECT
        r.tema,
        p.nombre AS programa,
        c.nombre AS carrera,
        e.nombre_completo AS estudiante,
        t.nombre_completo AS tutor
      FROM recepciones r
      JOIN estudiantes e ON e.id = r.estudiante_id
      JOIN programas p ON p.id = r.programa_id
      JOIN carreras c ON c.id = p.carrera_id
      LEFT JOIN tutores t ON t.id = r.tutor_id
      WHERE r.id = ?
      `,
      [recepcion_id],
    );

    const [tribunal] = await db.query(
      `
      SELECT
        tr.rol,
        d.nombre_completo,
        d.nivel_academico
      FROM tribunales tr
      JOIN docentes d ON d.id = tr.docente_id
      WHERE tr.recepcion_id = ?
      `,
      [recepcion_id],
    );

    function ordenRol(rol) {
      switch (rol) {
        case 'PRESIDENTE':
          return 0;
        case 'SECRETARIO':
          return 1;
        case 'VOCAL':
          return 2;
        default:
          return 3;
      }
    }

    tribunal.sort((a, b) => ordenRol(a.rol) - ordenRol(b.rol));

    const tribunales = tribunal.map((t) => ({
      rol: t.rol,
      nombre: `${abreviarNivel(t.nivel_academico)} ${t.nombre_completo}`,
    }));

    const presidente =
      tribunales.find((t) => t.rol === 'PRESIDENTE')?.nombre || '';
    const secretario =
      tribunales.find((t) => t.rol === 'SECRETARIO')?.nombre || '';
    const vocal = tribunales.find((t) => t.rol === 'VOCAL')?.nombre || '';

    const fechaDoc = fechaTexto(new Date());
    const anioActual = new Date().getFullYear();

    const template = fs.readFileSync(
      path.join(__dirname, '../templates/invitacion.html'),
      'utf8',
    );
    const formularioTemplate = fs.readFileSync(
      path.join(__dirname, '../templates/formulario.html'),
      'utf8',
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    let numeroActual = parseInt(numero);
    const archivos = [];
    const temaSafe = safeFileName(info.tema);

    const qrBase64 = await QRCode.toDataURL(
      'https://posgrado.usfx.bo/modalidad-investigacion-diplomado/',
    );

    for (const tr of tribunales) {
      const html = template
        .replaceAll('{{docente}}', tr.nombre)
        .replaceAll('{{programa}}', info.programa || '')
        .replaceAll('{{carrera}}', info.carrera || '')
        .replaceAll('{{presidente}}', presidente)
        .replaceAll('{{secretario}}', secretario)
        .replaceAll('{{vocal}}', vocal)
        .replaceAll('{{estudiante}}', info.estudiante)
        .replaceAll('{{tema}}', info.tema)
        .replaceAll('{{fechaTexto}}', fechaDoc)
        .replaceAll('{{anioActual}}', anioActual)
        .replaceAll('{{numero}}', numeroActual)
        .replaceAll('{{firmaBase64}}', qrBase64);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const nombreArchivo = `INVITACION_${tr.rol}_${tr.nombre}_${numeroActual}.pdf`;

      await page.pdf({
        path: path.join(carpetaDestino, nombreArchivo),
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '25mm', right: '25mm' },
      });

      archivos.push(numeroActual);
      numeroActual++;
    }

    const htmlFormulario = formularioTemplate
      .replaceAll('{{programa}}', info.programa || '')
      .replaceAll('{{carrera}}', info.carrera || '')
      .replaceAll('{{presidente}}', presidente)
      .replaceAll('{{secretario}}', secretario)
      .replaceAll('{{vocal}}', vocal)
      .replaceAll('{{estudiante}}', info.estudiante)
      .replaceAll('{{tema}}', info.tema)
      .replaceAll('{{fechaTexto}}', fechaDoc)
      .replaceAll('{{anioActual}}', anioActual);

    await page.setContent(htmlFormulario, { waitUntil: 'domcontentloaded' });

    await page.pdf({
      path: path.join(carpetaDestino, `FORMULARIO_${temaSafe}.pdf`),
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '25mm', right: '25mm' },
    });

    await browser.close();

    await registrarAuditoria(
      'recepciones',
      recepcion_id,
      'PRINT',
      'Se generaron invitaciones de tribunal',
      usuario_id,
    );

    return { ok: true, archivos };
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   RECHAZAR TEMA
========================= */
async function rechazarTema(recepcion_id, usuario_id) {
  try {
    await db.query(
      "UPDATE recepciones SET estado='Rechazado', fecha_finalizacion=NOW() WHERE id=?",
      [recepcion_id],
    );

    await registrarAuditoria(
      'recepciones',
      recepcion_id,
      'UPDATE',
      'Se rechazó el tema de tesis',
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    throw dbError(error);
  }
}

module.exports = {
  listar,
  obtenerRecepciones,
  obtenerTribunal,
  aceptarTema,
  imprimir,
  rechazarTema,
};
