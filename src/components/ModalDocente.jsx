import { useState, useEffect } from "react";
import { listarCarreras } from "../api/carreras";

export default function ModalDocente({
  abierto,
  cerrar,
  guardar,
  docenteEditar
}) {

  const [nombre, setNombre] = useState("");
  const [ci, setCi] = useState("");
  const [nivel, setNivel] = useState("");
  const [correo, setCorreo] = useState("");
  const [celular, setCelular] = useState("");
  const [carreraId, setCarreraId] = useState("");

  const [carreras, setCarreras] = useState([]);

  /* ======================
     CARGAR CARRERAS
  ====================== */
  useEffect(() => {
    const cargar = async () => {
      const data = await listarCarreras();
      setCarreras(data);
    };
    cargar();
  }, []);

  /* ======================
     EDITAR DATA
  ====================== */
  useEffect(() => {

    if (docenteEditar) {
      setNombre(docenteEditar.nombre_completo || "");
      setCi(docenteEditar.ci || "");
      setNivel(docenteEditar.nivel_academico || "");
      setCorreo(docenteEditar.correo || "");
      setCelular(docenteEditar.celular || "");
      setCarreraId(docenteEditar.carrera_id || "");
    } else {
      limpiar();
    }

  }, [docenteEditar]);

  const limpiar = () => {
    setNombre("");
    setCi("");
    setNivel("");
    setCorreo("");
    setCelular("");
    setCarreraId("");
  };

  if (!abierto) return null;

  const submit = () => {
    guardar({
      id: docenteEditar?.id,
      nombre_completo: nombre,
      ci,
      nivel_academico: nivel,
      correo,
      celular,
      carrera_id: carreraId
    });

    cerrar();
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h3>
          {docenteEditar ? "Editar Docente" : "Nuevo Docente"}
        </h3>

        <input
          placeholder="Nombre completo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />

        <input
          placeholder="CI"
          value={ci}
          onChange={e => setCi(e.target.value)}
        />

        {/* ENUM */}
        <select value={nivel} onChange={e => setNivel(e.target.value)}>
          <option value="">Nivel académico</option>
          <option value="Licenciado">Licenciado</option>
          <option value="Magister">Magister</option>
          <option value="Doctor">Doctor</option>
          <option value="Postdoctorado">Postdoctorado</option>
        </select>

        <input
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
        />

        <input
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
        />

        {/* CARRERAS DINÁMICO */}
        <select
          value={carreraId}
          onChange={e => setCarreraId(e.target.value)}
        >
          <option value="">Seleccione carrera</option>
          {carreras.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          

          <button className="btn-agregar" onClick={submit}>
            Guardar
          </button>

          <button style={{width:"100%", padding:"5px"}} className="btn-eliminar" onClick={cerrar}>
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}