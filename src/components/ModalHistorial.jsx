import { useEffect, useState } from "react";
import { historialRecepciones } from "../api/estudiantes";

export default function ModalHistorial({ abierto, cerrar, estudiante }){
  const formatearFecha = (f) => {
  if (!f) return "";

  if (typeof f === "string") {
    return f.slice(0, 10);
  }

  const fecha = new Date(f);
  if (isNaN(fecha)) return "";

  return fecha.toISOString().slice(0, 10);
};
  const [data,setData] = useState([]);

  useEffect(()=>{
    if(!abierto || !estudiante) return;

    (async()=>{
      const resp = await historialRecepciones(estudiante.id);
      setData(resp || []);
    })();

  },[abierto, estudiante]);

  if(!abierto) return null;

  return(
    <div className="modal-overlay">
      <div className="modal" style={{width:"600px"}}>

        <h3>Historial de Recepciones</h3>

        <p><strong>{estudiante.nombre_completo}</strong></p>

        <table className="tablaDocentes">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tema</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {data.map(r=>(
              <tr key={r.id}>
                <td>{formatearFecha(r.fecha_recepcion)}</td>
                <td>{r.tema}</td>
                <td>{r.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button style={{width:"100%"}} className="btn-eliminar" onClick={cerrar}>
          Cerrar
        </button>

      </div>
    </div>
  );
}