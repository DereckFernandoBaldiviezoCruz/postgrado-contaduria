import { useEffect,useState } from "react";
import {
  obtenerTribunal,
  guardarTribunalAPI
} from "../api/defensas";
import { listarDocentesActivos } from "../api/docentes";

export default function ModalTribunal({
  abierto,
  cerrar,
  recepcion,
  recargar
}){

  const [docentes,setDocentes]=useState([]);

  const [form,setForm]=useState({
    presidente:"",
    secretario:"",
    vocal:""
  });

  useEffect(() => {

  if (!abierto || !recepcion) return;

  (async () => {

    setDocentes(await listarDocentesActivos());

    const data = await obtenerTribunal(recepcion.recepcion_id);

    if (data.length) {
      const f = {
        presidente: "",
        secretario: "",
        vocal: ""
      };

      data.forEach(t => {
        if (t.rol === "PRESIDENTE") f.presidente = t.docente_id;
        if (t.rol === "SECRETARIO") f.secretario = t.docente_id;
        if (t.rol === "VOCAL") f.vocal = t.docente_id;
      });

      setForm(f);
    } else {
      setForm({
        presidente: "",
        secretario: "",
        vocal: ""
      });
    }

  })();

}, [abierto, recepcion]);

  const guardar=async(e)=>{
    e.preventDefault();

    await guardarTribunalAPI({
      recepcion_id:recepcion.recepcion_id,
      ...form
    });

    cerrar();
    recargar();
  };

  if(!abierto) return null;

  return(
  <div className="modal-overlay">

    <div className="modal tribunal-modal">

      <h2 className="modal-title">
        Editar Miembros del Tribunal
      </h2>

      <p className="modal-subtitle">
        Actualice los roles para el estudiante:
        <span> {recepcion.estudiante}</span>
      </p>

      <form onSubmit={guardar} className="tribunal-form">

        {/* PRESIDENTE */}
        <div className="campo">
          <label>PRESIDENTE DEL TRIBUNAL:</label>
          <select
            required
            value={form.presidente}
            onChange={e=>setForm({...form,presidente:e.target.value})}
          >
            <option value="">Seleccione docente</option>
            {docentes.map(d=>(
              <option key={d.id} value={d.id}>
                {d.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        {/* VOCAL */}
        <div className="campo">
          <label>VOCAL DEL TRIBUNAL:</label>
          <select
            required
            value={form.vocal}
            onChange={e=>setForm({...form,vocal:e.target.value})}
          >
            <option value="">Seleccione docente</option>
            {docentes.map(d=>(
              <option key={d.id} value={d.id}>
                {d.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        {/* SECRETARIO */}
        <div className="campo">
          <label>SECRETARIO DEL TRIBUNAL:</label>
          <select
            required
            value={form.secretario}
            onChange={e=>setForm({...form,secretario:e.target.value})}
          >
            <option value="">Seleccione docente</option>
            {docentes.map(d=>(
              <option key={d.id} value={d.id}>
                {d.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        {/* BOTONES */}
        <div className="modal-actions">

          <button
            type="button"
            className="btn-eliminar"
            onClick={cerrar}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-agregar"
            style={{
          width:"50%",
          justifyContent:"center"
        }}
          >
            Guardar Cambios
          </button>

        </div>

      </form>
    </div>
  </div>
);
}