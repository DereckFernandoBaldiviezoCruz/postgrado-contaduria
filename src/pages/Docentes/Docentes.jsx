import { useState, useEffect } from 'react';
import ModalDocente from '../../components/ModalDocente';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import './Docentes.css';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useRef } from 'react';

import {
  listarDocentes,
  crearDocenteAPI,
  editarDocenteAPI,
  eliminarDocenteAPI,
  activarDocenteAPI,
  importarDocentesAPI,
} from '../../api/docentes';

export default function Docentes() {
  const [busqueda, setBusqueda] = useState('');
  const [docentes, setDocentes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [docenteEditar, setDocenteEditar] = useState(null);
  const fileInput = useRef(null);

  /* ===============================
     CARGAR DESDE MYSQL
  =============================== */
  const cargarDocentes = async (texto = '') => {
    const data = await listarDocentes(texto);
    setDocentes(data);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      cargarDocentes(busqueda);
    }, 200);

    return () => clearTimeout(delay);
  }, [busqueda]);

  /* ===============================
     NUEVO
  =============================== */
  const abrirNuevo = () => {
    setDocenteEditar(null);
    setModalAbierto(true);
  };

  /* ===============================
     EDITAR
  =============================== */
  const editarDocente = (doc) => {
    setDocenteEditar(doc);
    setModalAbierto(true);
  };

  /* ===============================
     GUARDAR
  =============================== */
  const guardarDocente = async (data) => {
    try {
      if (data.id) {
        await editarDocenteAPI(data);

        Swal.fire({
          icon: 'success',
          title: 'Docente actualizado',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await crearDocenteAPI(data);

        Swal.fire({
          icon: 'success',
          title: 'Docente creado correctamente',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      await cargarDocentes();
    } catch (error) {
      const mensaje = error.message
        .replace(/Error invoking remote method '.*': /, '')
        .replace(/^Error: /, '');

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
      });
    }
  };

  /* ===============================
     ELIMINAR
  =============================== */
  const cambiarEstado = async (docente) => {
    if (docente.estado === 'Activo') {
      await eliminarDocenteAPI(docente.id);
    } else {
      await activarDocenteAPI(docente.id);
    }

    await cargarDocentes();
  };

  const exportarExcel = () => {
    const datos = docentes.map((d, index) => ({
      '#': index + 1,
      'Nombre Completo': d.nombre_completo,
      'Carnet Identidad': d.ci,
      'Nivel Académico': d.nivel_academico,
      Correo: d.correo,
      Celular: d.celular,
      Carrera: d.carrera_nombre,
      Estado: d.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Docentes');

    XLSX.writeFile(
      workbook,
      `docentes_${new Date().toLocaleDateString().replaceAll('/', '-')}.xlsx`,
    );
  };
  const descargarPlantilla = () => {
    const datos = [
      {
        nombre_completo: '',
        ci: '',
        nivel_academico: 'Licenciado',
        correo: '',
        celular: '',
        carrera: '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    XLSX.writeFile(wb, 'Plantilla_Docentes.xlsx');
  };
  const importarExcel = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const json = XLSX.utils.sheet_to_json(sheet);

    try {
      const resultado = await importarDocentesAPI(json);

      let mensaje = `${resultado.insertados} docentes importados`;

      if (resultado.duplicados.length > 0) {
        mensaje += `\n\n${resultado.duplicados.length} duplicados:\n`;

        resultado.duplicados.forEach((ci) => {
          mensaje += `• CI ${ci}\n`;
        });
      }

      Swal.fire({
        icon: resultado.duplicados.length ? 'warning' : 'success',
        title: 'Resultado de importación',
        text: mensaje,
      });

      cargarDocentes();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    }
  };

  return (
    <div>
      <div className="header">
        <h2 className="tituloEstudiantes">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-users"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          Lista de Docentes
        </h2>

        <div className="acciones">
          <button className="btn-agregar" onClick={abrirNuevo}>
            + Agregar Docente
          </button>

          <button className="btn-excel" onClick={exportarExcel}>
            Exportar Excel
          </button>

          <button className="btn-excel" onClick={descargarPlantilla}>
            Descargar Plantilla
          </button>

          <button
            className="btn-excel"
            onClick={() => fileInput.current.click()}
          >
            Importar Excel
          </button>

          <input
            type="file"
            accept=".xlsx"
            ref={fileInput}
            style={{ display: 'none' }}
            onChange={importarExcel}
          />
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="filtros">
        <input
          placeholder="🔎 Buscar docente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Completo</th>
            <th>Carnet Identidad</th>
            <th>Nivel Académico</th>
            <th>Correo</th>
            <th>Celular</th>
            <th>Carrera</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {docentes.map((d, index) => (
            <tr
              key={d.id}
              className={d.estado === 'Inactivo' ? 'inactivo' : ''}
            >
              <td>{index + 1}</td>
              <td>{d.nombre_completo}</td>
              <td>{d.ci}</td>
              <td>{d.nivel_academico}</td>
              <td>{d.correo}</td>
              <td>
                <a
                  href={`https://wa.me/591${d.celular}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsappLink"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ marginRight: 6 }}
                  >
                    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.01 0C5.38 0 .01 5.37.01 12c0 2.12.55 4.19 1.6 6.01L0 24l6.18-1.62A11.9 11.9 0 0 0 12.01 24C18.63 24 24 18.63 24 12c0-3.18-1.24-6.17-3.48-8.52zM12.01 21.82a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.67.96.98-3.57-.24-.37a9.8 9.8 0 1 1 8.28 4.56zm5.38-7.35c-.29-.15-1.72-.85-1.99-.95-.27-.1-.47-.15-.66.15-.2.29-.76.95-.94 1.15-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.35-1.44-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.17-.23-.56-.47-.48-.66-.49h-.56c-.2 0-.51.07-.78.37-.27.29-1.03 1-1.03 2.44s1.06 2.83 1.21 3.02c.15.2 2.09 3.19 5.06 4.47.71.31 1.27.5 1.71.64.72.23 1.37.2 1.88.12.57-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.35z" />
                  </svg>

                  {d.celular}
                </a>
              </td>
              <td>{d.carrera_nombre}</td>
              <td>
                <span
                  className={
                    d.estado === 'Activo'
                      ? 'estado aceptado'
                      : 'estado pendiente'
                  }
                >
                  {d.estado}
                </span>
              </td>

              <td style={{ display: 'flex', gap: 5 }}>
                <button className="btn-editar" onClick={() => editarDocente(d)}>
                  Editar
                </button>

                <button
                  style={{ width: '50%' }}
                  className={
                    d.estado === 'Activo' ? 'btn-eliminar' : 'btn-agregar'
                  }
                  onClick={() => cambiarEstado(d)}
                >
                  {d.estado === 'Activo' ? 'Inactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalDocente
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        guardar={guardarDocente}
        docenteEditar={docenteEditar}
      />
    </div>
  );
}
