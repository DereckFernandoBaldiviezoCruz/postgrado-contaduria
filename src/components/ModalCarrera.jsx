import { useState, useEffect } from "react";
import "./ModalCarrera.css";
import "./modal.css";

export default function ModalCarrera({
  abierto,
  cerrar,
  guardar,
  carreraEditar
}) {

  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("Activo");

  /* Cargar datos si es edición */
  useEffect(() => {
    if (carreraEditar) {
      setNombre(carreraEditar.nombre);
      setEstado(carreraEditar.estado);
    } else {
      setNombre("");
      setEstado("Activo");
    }
  }, [carreraEditar]);

  if (!abierto) return null;

  const handleSubmit = () => {
    if (!nombre.trim()) return;

    guardar({
      id: carreraEditar?.id,
      nombre,
      estado
    });

    cerrar();
  };

  return (
    <div className="modal-overlay">
      <div className="modalCarrera">

        <h3>
          {carreraEditar ? "Editar Carrera" : "Nueva Carrera"}
        </h3>

        <input
          placeholder="Nombre de la carrera"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <select
        style={{height:"40px", borderRadius:"5px"}}
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <div className="modal-actions">

          <button className="btn-agregar" onClick={handleSubmit}>
            Guardar
          </button>

          <button className="btn-eliminar" onClick={cerrar}>
            Cancelar
          </button>

        </div>
      </div>
    </div>
  );
}