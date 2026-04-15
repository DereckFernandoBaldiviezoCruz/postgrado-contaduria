import { useEffect, useState } from 'react';
import ModalUsuario from '../../components/ModalUsuario';

import {
  listarUsuarios,
  crearUsuarioAPI,
  editarUsuarioAPI,
  eliminarUsuarioAPI,
} from '../../api/usuarios';

export default function Usuarios() {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const cargar = async () => {
    const resp = await listarUsuarios();

    if (!resp) return;

    const filtrado = resp.filter(
      (u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol.toLowerCase().includes(busqueda.toLowerCase()),
    );

    setData(filtrado);
  };

  useEffect(() => {
    cargar();
  }, [busqueda]);

  /* =========================
     CREAR
  ========================= */

  const crearUsuario = () => {
    setUsuarioSeleccionado(null);
    setModalOpen(true);
  };

  /* =========================
     EDITAR
  ========================= */

  const editarUsuario = (row) => {
    setUsuarioSeleccionado(row);
    setModalOpen(true);
  };

  /* =========================
     ELIMINAR
  ========================= */

  const eliminarUsuario = async (id) => {
    const confirmar = confirm('¿Eliminar usuario?');

    if (!confirmar) return;

    await eliminarUsuarioAPI(id);

    cargar();
  };

  return (
    <>
      <div>
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
          Usuarios
        </h2>

        <div className="filtros">
          <input
            placeholder="🔎 Buscar usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button className="btn-agregar" onClick={crearUsuario}>
            Nuevo Usuario
          </button>
        </div>

        <table className="tablaDocentes">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Área</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#777',
                    fontStyle: 'italic',
                  }}
                >
                  🔍 No se encontraron resultados
                </td>
              </tr>
            ) : (
              data.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.nombre}</td>
                  <td>{u.usuario}</td>
                  <td>{u.rol}</td>
                  <td>{u.area}</td>
                  <td>{u.estado}</td>

                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => editarUsuario(u)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarUsuario(u.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      <ModalUsuario
        abierto={modalOpen}
        cerrar={() => {
          setModalOpen(false);
          setUsuarioSeleccionado(null);
        }}
        usuario={usuarioSeleccionado}
        recargar={cargar}
        esEdicion={!!usuarioSeleccionado}
      />
    </>
  );
}
