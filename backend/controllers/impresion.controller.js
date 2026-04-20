const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const db = require('../db/db');
const manejarErrorDB = require('./dbError'); // 🔥 IMPORTANTE

function abreviarNivel(nivel) {
  switch (nivel) {
    case 'Licenciado':
      return 'Lic.';
    case 'Magister':
      return 'MSc.';
    case 'Doctor':
      return 'Dr.';
    case 'Postdoctorado':
      return 'PhD.';
    default:
      return '';
  }
}

async function imprimirTutor(data) {
  try {
    const { recepcion_id, numero, carpetaDestino } = data;

    const [rows] = await db.query(
      `
      SELECT 
        r.tema,
        p.nombre as programa,
        t.nombre_completo as tutor,
        t.nivel_academico,
        e.nombre_completo as estudiante
      FROM recepciones r
      JOIN estudiantes e ON e.id = r.estudiante_id
      JOIN programas p ON p.id = r.programa_id
      JOIN tutores t ON t.id = r.tutor_id
      WHERE r.id=?
      `,
      [recepcion_id],
    );

    if (rows.length === 0) {
      throw new Error('No se encontró la información para imprimir');
    }

    const d = rows[0];

    const titulo = abreviarNivel(d.nivel_academico);
    const tutorFormateado = titulo ? `${titulo} ${d.tutor}` : d.tutor;

    const hoy = new Date();
    const fechaRaw = hoy.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const fecha = fechaRaw.replace(/de (\w+)/, (_, mes) => {
      return `de ${mes.toLowerCase()}`;
    });

    const anio = hoy.getFullYear();

    const texto = (txt, bold = false) =>
      new TextRun({
        text: txt,
        bold,
        italics: true,
        font: 'Book Antiqua',
        size: 22,
      });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 12240,
                height: 15840,
              },
            },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [texto(`Sucre, ${fecha}`)],
            }),

            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [texto(`Cite. Pos. N° ${numero}/${anio}`, true)],
            }),

            new Paragraph(''),

            new Paragraph({ children: [texto('Señor:', true)] }),
            new Paragraph({ children: [texto(tutorFormateado)] }),
            new Paragraph({ children: [texto('Presente. -', true)] }),

            new Paragraph(''),

            new Paragraph({ children: [texto('De mi mayor consideración:')] }),
            new Paragraph(''),

            new Paragraph({
              children: [
                texto(
                  `La Facultad de Contaduría Pública y Ciencias Financieras, a través de su Unidad de Posgrado, ha propiciado el programa de `,
                ),
                texto(`“${d.programa}”`, true),
                texto('.'),
              ],
            }),

            new Paragraph(''),

            new Paragraph({
              children: [
                texto(
                  `Me permito invitarle a brindar apoyo como Tutor de la tesis titulada:`,
                ),
              ],
            }),

            new Paragraph({
              children: [
                texto(`“${d.tema}” `, true),
                texto(`del/la maestrante `),
                texto(d.estudiante.toUpperCase(), true),
                texto('.'),
              ],
            }),

            new Paragraph(''),

            new Paragraph({
              children: [
                texto(
                  `Al concluir el proceso deberá presentar el informe correspondiente.`,
                ),
              ],
            }),

            new Paragraph(''),

            new Paragraph({
              children: [texto('Sin otro particular, saludo a usted.')],
            }),

            new Paragraph(''),
            new Paragraph(''),
            new Paragraph({ children: [texto('Atentamente,')] }),

            new Paragraph(''),
            new Paragraph(''),
            new Paragraph(''),
            new Paragraph(''),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [texto('Dra. Mirtha J. Guerra Paniagua Ph.D.')],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [texto('Coordinadora Unidad de Posgrado', true)],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const nombreArchivo = `CITE_${numero}_${d.tutor}.docx`;
    const ruta = path.join(carpetaDestino, nombreArchivo);

    fs.writeFileSync(ruta, buffer);

    return {
      ok: true,
      archivos: [nombreArchivo],
    };
  } catch (error) {
    console.error(error);

    // 🔥 errores de base de datos
    if (error.code) {
      throw new Error(manejarErrorDB(error));
    }

    // 🔥 errores de archivos
    if (error.code === 'ENOENT') {
      throw new Error('Ruta de guardado no válida');
    }

    throw new Error('Error al generar el documento');
  }
}

module.exports = { imprimirTutor };
