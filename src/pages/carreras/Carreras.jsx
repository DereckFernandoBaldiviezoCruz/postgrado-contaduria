import { useState, useEffect } from "react";
import ModalCarrera from "../../components/ModalCarrera";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import "./Carreras.css";

import {
  listarCarrerasTodos,
  crearCarreraAPI,
  editarCarreraAPI,
  cambiarEstadoCarreraAPI
} from "../../api/carreras";

export default function Carreras() {

  const [carreras, setCarreras] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [carreraEditar, setCarreraEditar] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  /* ===========================
     CARGAR DESDE MYSQL
  =========================== */
  const cargarCarreras = async () => {
  const data = await listarCarrerasTodos();
  setCarreras(data);
};

  useEffect(() => {
    cargarCarreras();
  }, []);

  /* ===========================
     ABRIR MODAL NUEVO
  =========================== */
  const abrirNueva = () => {
    setCarreraEditar(null);
    setModalAbierto(true);
  };

  /* ===========================
     ABRIR EDICION
  =========================== */
  const editarCarrera = (carrera) => {
    setCarreraEditar(carrera);
    setModalAbierto(true);
  };

  /* ===========================
     GUARDAR (CREATE / UPDATE)
  =========================== */
  const guardarCarrera = async (data) => {

    if (data.id) {
      await editarCarreraAPI(data);
    } else {
      await crearCarreraAPI(data);
    }

    await cargarCarreras(); // refresca tabla
  };

  /* ===========================
     CONFIRMAR ELIMINAR
  =========================== */
  const [confirmar, setConfirmar] = useState(null);

const cambiarEstado = (c) => {
  const nuevo = c.estado === "Activo" ? "Inactivo" : "Activo";

  setConfirmar({
    carrera: c,
    nuevoEstado: nuevo
  });
};

const confirmarCambio = async () => {
  await cambiarEstadoCarreraAPI(
    confirmar.carrera.id,
    confirmar.nuevoEstado
  );

  setConfirmar(null);
  await cargarCarreras();
};

  return (
    <div>
      <h2 className="tituloEstudiantes">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus Carreras_titleIcon__dWxv-" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
        Gestión de Carreras
      </h2>

      <button className="btn-agregar" onClick={abrirNueva}>
        + Agregar Carrera
      </button>

      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {carreras.map((c, index) => (
            <tr key={c.id}>
              <td>{index + 1}</td>
              <td>{c.nombre}</td>
              <td>
  <span className={
    c.estado === "Activo"
      ? "estado aceptado"
      : "estado pendiente"
  }>
    {c.estado}
  </span>
</td>

              <td style={{display:"flex",gap:5}}>

                <button
                style={{width:"50%"}}
                  className="btn-editar"
                  onClick={() => editarCarrera(c)}
                >
                  Editar
                </button>

                <button
                style={{width:"50%", justifyContent:"center"}}
  className={
    c.estado === "Activo"
      ? "btn-eliminar"
      : "btn-agregar"
  }
  onClick={() => cambiarEstado(c)}
>
  {c.estado === "Activo"
    ? "Inactivar"
    : "Reactivar"}
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalCarrera
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        guardar={guardarCarrera}
        carreraEditar={carreraEditar}
      />

      {confirmar && (
  <div className="modal-overlay">
    <div className="modal">

      <h3>
        {confirmar.nuevoEstado === "Activo"
          ? "Reactivar Carrera"
          : "Inactivar Carrera"}
      </h3>

      <p>
        {confirmar.nuevoEstado === "Activo"
          ? "¿Deseas reactivar esta carrera?"
          : "¿Deseas inactivar esta carrera?"}
      </p>

      <div style={{
        background:"#f4f6f8",
        padding:12,
        borderRadius:6,
        margin:"15px 0"
      }}>
        <b>{confirmar.carrera.nombre}</b>
      </div>

      <div style={{display:"flex",gap:5}}>

        <button
          style={{width:"50%"}}
          className={
            confirmar.nuevoEstado === "Activo"
              ? "btn-agregar"
              : "btn-eliminar"
          }
          onClick={confirmarCambio}
        >
          {confirmar.nuevoEstado === "Activo"
            ? "Sí, reactivar"
            : "Sí, inactivar"}
        </button>

        <button
          style={{width:"50%"}}
          className="btn-editar"
          onClick={() => setConfirmar(null)}
        >
          Cancelar
        </button>

      </div>

    </div>
  </div>
)}
    </div>
  );
}