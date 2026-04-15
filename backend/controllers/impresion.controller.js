const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const db = require('../db/db');
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

  const d = rows[0];

  const titulo = abreviarNivel(d.nivel_academico);
  const tutorFormateado = titulo ? `${titulo} ${d.tutor}` : d.tutor;
  const hoy = new Date();
  const fechaRaw = hoy.toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fecha = fechaRaw.replace(/de (\w+)/, (match, mes) => {
    return `de ${mes.toLowerCase()}`;
  });
  const anio = hoy.getFullYear();

  // 🔹 función base de texto
  const texto = (txt, bold = false) =>
    new TextRun({
      text: txt,
      bold,
      italics: true,
      font: 'Book Antiqua',
      size: 22, // 11 * 2
    });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240, // 👈 Carta ancho
              height: 15840, // 👈 Carta alto
            },
          },
        },
        children: [
          // 🔹 FECHA (derecha)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [texto(`Sucre, ${fecha}`)],
          }),

          // 🔹 CITE (derecha y negrita)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [texto(`Cite. Pos. N° ${numero}/${anio}`, true)],
          }),

          new Paragraph(''),

          // 🔹 DESTINATARIO
          new Paragraph({ children: [texto('Señor:', true)] }),
          new Paragraph({ children: [texto(tutorFormateado)] }),
          new Paragraph({ children: [texto('Presente. -', true)] }),

          new Paragraph(''),

          new Paragraph({ children: [texto('De mi mayor consideración:')] }),
          new Paragraph(''),

          // 🔹 CUERPO
          new Paragraph({
            children: [
              texto(
                `La Facultad de Contaduría Pública y Ciencias Financieras, a través de su Unidad de Posgrado, velando por la capacitación de sus profesionales ha propiciado el programa de `,
              ),
              texto(`“${d.programa}”`, true),
              texto('.'),
            ],
          }),
          new Paragraph(''),

          new Paragraph({
            children: [
              texto(
                `Conocedora de su relevante formación académica y en el marco que establece la normativa vigente me permito invitarle para que brinde el apoyo académico como Tutor de tesis titulada:`,
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
                `Por otra parte, hacemos conocer a su persona que actualmente existen dos opciones de formato para la presentación de tesis de Maestría, conforme a la normativa vigente, la cual adjuntamos a la presente.`,
              ),
            ],
          }),

          new Paragraph({
            children: [
              texto(
                `De aceptar la invitación y una vez concluido el proceso de elaboración de la tesis, deberá enviarnos un informe basado en el formato que va incluida a esta.`,
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

          // 🔥 ESPACIO PARA FIRMA
          new Paragraph(''),
          new Paragraph(''),
          new Paragraph(''),
          new Paragraph(''),
          new Paragraph(''),
          // 🔹 FIRMA CENTRADA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [texto('Dra. Mirtha J. Guerra Paniagua Ph.D.')],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [texto('Coordinadora Unidad de Posgrado', true)],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [texto('Facultad de Contaduría Pública', true)],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [texto('y Ciencias Financieras', true)],
          }),
          new Paragraph(''),
          new Paragraph(''),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Copia Archivo',
                italics: true,
                font: 'Times New Roman',
                size: 18, // 9 * 2
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Adjunto: lo indicado.',
                italics: true,
                font: 'Times New Roman',
                size: 18,
              }),
            ],
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
}

module.exports = { imprimirTutor };
