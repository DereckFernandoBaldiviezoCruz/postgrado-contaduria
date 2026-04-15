import { useState, useEffect } from 'react';
import ModalPrograma from '../../components/ModalPrograma';
import './Programas.css';

import {
  listarProgramasTodos,
  crearProgramaAPI,
  editarProgramaAPI,
  cambiarEstadoProgramaAPI,
} from '../../api/programas';

export default function Programas() {
  const [programas, setProgramas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [programaEditar, setProgramaEditar] = useState(null);

  const [confirmar, setConfirmar] = useState(null);

  /* ===============================
     CARGAR PROGRAMAS
  =============================== */
  const cargarProgramas = async () => {
    const data = await listarProgramasTodos();
    setProgramas(data || []);
  };

  useEffect(() => {
    cargarProgramas();
  }, []);

  /* ===============================
     NUEVO
  =============================== */
  const abrirNuevo = () => {
    setProgramaEditar(null);
    setModalAbierto(true);
  };

  /* ===============================
     EDITAR
  =============================== */
  const editarPrograma = (p) => {
    setProgramaEditar(p);
    setModalAbierto(true);
  };

  /* ===============================
     GUARDAR
  =============================== */
  const guardarPrograma = async (data) => {
    if (data.id) {
      await editarProgramaAPI(data);
    } else {
      await crearProgramaAPI(data);
    }

    setModalAbierto(false);
    await cargarProgramas();
  };

  /* ===============================
     CAMBIAR ESTADO
  =============================== */
  const cambiarEstado = (p) => {
    const nuevo = p.estado === 'Activo' ? 'Inactivo' : 'Activo';

    setConfirmar({
      programa: p,
      nuevoEstado: nuevo,
    });
  };

  const confirmarCambio = async () => {
    await cambiarEstadoProgramaAPI(
      confirmar.programa.id,
      confirmar.nuevoEstado,
    );

    setConfirmar(null);
    await cargarProgramas();
  };

  return (
    <div>
      <div className="header">
        <h2 className="tituloEstudiantes">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circle-plus SegundaInstancia_titleIcon__3qew4"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
          </svg>
          Gestión de Programas
        </h2>
      </div>

      <button className="btn-agregar" onClick={abrirNuevo}>
        + Agregar Programa
      </button>

      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Gestión</th>
            <th>Versión</th>
            <th>Capacidad</th>
            <th>Inscritos</th>
            <th>Carrera</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {programas.map((p, index) => (
            <tr key={p.id}>
              <td>{index + 1}</td>
              <td>{p.nombre}</td>
              <td>{p.gestion}</td>
              <td>{p.version}</td>
              <td>{p.capacidad_maxima}</td>
              <td>{p.inscritos}</td>
              <td>{p.carrera_nombre}</td>

              <td>
                <span
                  className={
                    p.estado === 'Activo'
                      ? 'estado aceptado'
                      : 'estado pendiente'
                  }
                >
                  {p.estado}
                </span>
              </td>

              <td style={{ display: 'flex', gap: 5 }}>
                <button
                  style={{ width: '50%' }}
                  className="btn-editar"
                  onClick={() => editarPrograma(p)}
                >
                  Editar
                </button>

                <button
                  style={{ width: '50%' }}
                  className={
                    p.estado === 'Activo' ? 'btn-eliminar' : 'btn-agregar'
                  }
                  onClick={() => cambiarEstado(p)}
                >
                  {p.estado === 'Activo' ? 'Inactivar' : 'Reactivar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalPrograma
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        guardar={guardarPrograma}
        programaEditar={programaEditar}
      />

      {/* ================= MODAL CONFIRMACION ================= */}
      {confirmar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {confirmar.nuevoEstado === 'Activo'
                ? 'Reactivar Programa'
                : 'Inactivar Programa'}
            </h3>

            <p>
              {confirmar.nuevoEstado === 'Activo'
                ? '¿Deseas reactivar este programa?'
                : '¿Deseas inactivar este programa?'}
            </p>

            <div
              style={{
                background: '#f4f6f8',
                padding: 12,
                borderRadius: 6,
                margin: '15px 0',
              }}
            >
              <b>{confirmar.programa.nombre}</b>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className={
                  confirmar.nuevoEstado === 'Activo'
                    ? 'btn-agregar'
                    : 'btn-eliminar'
                }
                onClick={confirmarCambio}
              >
                {confirmar.nuevoEstado === 'Activo'
                  ? 'Sí, reactivar'
                  : 'Sí, inactivar'}
              </button>

              <button className="btn-editar" onClick={() => setConfirmar(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
