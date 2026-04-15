import { useEffect, useState } from "react";
import { historialRecepciones } from "../api/recepciones";

export default function ModalHistorialRecepciones({abierto,cerrar,estudiante}){

  const [data,setData] = useState([]);
  useEffect(()=>{

    if(!estudiante) return;

    const cargar = async()=>{

      const resp = await historialRecepciones(estudiante.estudiante_id);
        console.log("respuesta historial", resp);
      setData(resp || []);

    };

    cargar();

  },[estudiante]);

  if(!abierto) return null;

  return(

    <div className="modalOverlay" onClick={cerrar}>

      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        
        <h2 style={{color:"black"}}>

          Historial - {estudiante.estudiante}

        </h2>

        <table className="tablaDocentes">

          <thead>
            <tr>
              <th>#</th>
              <th>Tema</th>
              <th>Tutor</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>

            {data.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign:"center"}}>
                  Sin historial
                </td>
              </tr>
            )}

            {data.map((r,i)=>(
              <tr key={r.id}>

                <td>{i+1}</td>

                <td>{r.tema}</td>

                <td>{r.tutor || "-"}</td>

                <td>
                  {r.fecha_recepcion
                    ? new Date(r.fecha_recepcion)
                      .toISOString()
                      .split("T")[0]
                    : "-"
                  }
                </td>

                <td>{r.estado}</td>

              </tr>
            ))}

          </tbody>

        </table>

        <br/>

        <button
        style={{width:"100%"}}
          className="btn-eliminar"
          onClick={cerrar}
        >
          Cerrar
        </button>

      </div>

    </div>
  );

}