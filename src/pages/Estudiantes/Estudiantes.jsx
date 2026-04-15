import { useState, useEffect, useRef } from 'react';
import ModalEstudiante from '../../components/ModalEstudiante';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import './Estudiantes.css';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

import {
  listarEstudiantes,
  crearEstudianteAPI,
  editarEstudianteAPI,
  eliminarEstudianteAPI,
  importarEstudiantesAPI,
} from '../../api/estudiantes';

export default function Estudiantes() {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteEditar, setEstudianteEditar] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  const fileInput = useRef(null);

  /* ===============================
     CARGAR DESDE MYSQL
  =============================== */
  const cargarEstudiantes = async (texto = '') => {
    const data = await listarEstudiantes(texto);
    setEstudiantes(data);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      cargarEstudiantes(busqueda);
    }, 350);

    return () => clearTimeout(delay);
  }, [busqueda]);

  /* ===============================
     ABRIR NUEVO
  =============================== */
  const abrirNuevo = () => {
    setEstudianteEditar(null);
    setModalAbierto(true);
  };

  /* ===============================
     EDITAR
  =============================== */
  const editarEstudiante = (est) => {
    setEstudianteEditar(est);
    setModalAbierto(true);
  };

  /* ===============================
     GUARDAR (CREATE / UPDATE)
  =============================== */
  const guardarEstudiante = async (data) => {
    try {
      if (data.id) {
        await editarEstudianteAPI(data);

        Swal.fire({
          icon: 'success',
          title: 'Estudiante actualizado',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await crearEstudianteAPI(data);

        Swal.fire({
          icon: 'success',
          title: 'Estudiante creado correctamente',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      await cargarEstudiantes();
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
  const pedirEliminar = (id) => {
    setIdEliminar(id);
    setConfirmOpen(true);
  };

  const confirmarEliminar = async () => {
    await eliminarEstudianteAPI(idEliminar);
    setConfirmOpen(false);
    await cargarEstudiantes();
  };

  const exportarExcel = () => {
    const datos = estudiantes.map((e, index) => ({
      '#': index + 1,
      'Nombre Completo': e.nombre_completo,
      CI: e.ci,
      Correo: e.correo,
      Teléfono: e.celular,
      Carrera: e.carrera_nombre,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');

    XLSX.writeFile(
      workbook,
      `lista_estudiantes_${new Date().toLocaleDateString()}.xlsx`,
    );
  };

  const descargarPlantilla = () => {
    const datos = [
      {
        nombre_completo: '',
        ci: '',
        correo: '',
        celular: '',
        carrera: '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    XLSX.writeFile(wb, 'Plantilla_Estudiantes.xlsx');
  };

  const importarExcel = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const json = XLSX.utils.sheet_to_json(sheet);

    try {
      const resultado = await importarEstudiantesAPI(json);

      let mensaje = `${resultado.insertados} estudiantes importados`;

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

      cargarEstudiantes();
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
      {/* HEADER (NO SE TOCA) */}
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
          Lista de Estudiantes
        </h2>

        <div className="acciones">
          <button className="btn-agregar" onClick={abrirNuevo}>
            + Agregar Estudiante
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

      {/* FILTROS (igual) */}
      <div className="filtros">
        <input
          placeholder="🔎 Buscar estudiante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA (MISMA ESTRUCTURA) */}
      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Completo</th>
            <th>CI</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {estudiantes.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                No se encontraron estudiantes
              </td>
            </tr>
          )}
          {estudiantes.map((e, index) => (
            <tr key={e.id}>
              <td>{index + 1}</td>
              <td>{e.nombre_completo}</td>
              <td>{e.ci}</td>
              <td>{e.correo}</td>
              <td>
                <a
                  href={`https://wa.me/591${e.celular}`}
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

                  {e.celular}
                </a>
              </td>
              <td>{e.carrera_nombre}</td>

              <td className="acciones-tabla">
                <button
                  className="btn-editar"
                  onClick={() => editarEstudiante(e)}
                >
                  Editar
                </button>

                <button
                  className="btn-eliminar"
                  onClick={() => pedirEliminar(e.id)}
                >
                  Inactivar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL ORIGINAL */}
      <ModalEstudiante
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        guardar={guardarEstudiante}
        estudianteEditar={estudianteEditar}
      />

      {/* MODAL CONFIRMACION GLOBAL */}
      <ModalConfirmacion
        abierto={confirmOpen}
        mensaje="¿Seguro que deseas inactivar este estudiante?"
        confirmar={confirmarEliminar}
        cancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
