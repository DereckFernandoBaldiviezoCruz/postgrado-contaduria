import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { obtenerDefensas, asignarFechaDefensa } from "../../api/asignacionDefensas";

export default function AsignacionDefensas(){

  const [defensas,setDefensas]=useState([]);
  const [loading,setLoading]=useState(true);

  const [modal,setModal]=useState(false);
  const [actual,setActual]=useState(null);
  const [fecha,setFecha]=useState("");

  const [buscar,setBuscar] = useState("");
  const estadoClass = (estado) => {
  switch (estado) {
    case "En revision":
      return "estado revision";

    case "Aceptado":
      return "estado aceptado";

    case "Recepcionado":
      return "estado recepcionado";

    case "Programada":
      return "estado programada";

    case "Finalizado":
      return "estado finalizado";

    default:
      return "estado pendiente";
  }
};
  const cargar = async (texto="") => {

setLoading(true);

const res = await obtenerDefensas(texto);

setDefensas(res);

setLoading(false);

};

  useEffect(()=>{

const delay = setTimeout(()=>{
  cargar(buscar);
},300);

return ()=>clearTimeout(delay);

},[buscar]);

  const abrirModal=(fila)=>{
    setActual(fila);
    setFecha(fila.fecha_defensa==="-"?"":fila.fecha_defensa);
    setModal(true);
  };

  const guardar=async()=>{

    if(!fecha) return Swal.fire({
      icon:"warning",
      title:"Seleccione una fecha"
    });

    const ok = await asignarFechaDefensa({
      recepcion_id: actual.recepcion_id,
      fecha
    });

    if(ok){
      Swal.fire({
  icon: "success",
  title: "Fecha asignada",
  text: "La defensa fue programada correctamente",
  confirmButtonColor: "#3085d6"
});
      setModal(false);
      cargar();
    }else{
      Swal.fire({
  icon: "error",
  title: "Error",
  text: "No se pudo asignar la fecha"
});
    }
  };

  return(
    <div>
      <h2 className="tituloEstudiantes"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>
      Asignación de Defensas</h2>
      <div className="filtros">

<input
placeholder="🔎 Buscar estudiante, programa, tutor o tema..."
value={buscar}
onChange={(e)=>setBuscar(e.target.value)}
/>

</div>
      {loading ? (
        <p>Cargando...</p>
      ) : (

      <table className="tablaDocentes">

        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Programa</th>
            <th>Tema</th>
            <th>Tutor</th>
            <th>Fecha Recepción</th>
            <th>Fecha Defensa</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>

{defensas.length === 0 ? (

<tr>
<td colSpan="8" style={{
textAlign:"center",
padding:"30px",
color:"#777",
fontStyle:"italic"
}}>
🔍 No se encontraron resultados
</td>
</tr>

) : (

defensas.map((d,i)=>(

<tr key={i}>

<td>{d.estudiante}</td>
<td>{d.programa}</td>
<td>{d.tema}</td>
<td>{d.tutor}</td>
<td>{d.fecha_recepcion}</td>
<td>{d.fecha_defensa}</td>

<td>
<span className={estadoClass(d.estado)}>
{d.estado || "Pendiente"}
</span>
</td>

<td>

{d.estado === "Aceptado" && (
<button
className="btn-agregar"
onClick={()=>abrirModal(d)}
>
Asignar Fecha
</button>
)}

{d.estado === "Programada" && (
<button
style={{width:"100%"}}
className="btn-editar"
onClick={()=>abrirModal(d)}
>
Editar Fecha
</button>
)}

</td>

</tr>

))

)}

</tbody>

      </table>

      )}

      {/* MODAL */}

      {modal && (

      <div className="modal-overlay">

        <div className="modal">

          <h3>Asignar Fecha de Defensa</h3>

          <p><b>Estudiante:</b> {actual.estudiante}</p>
          <p><b>Tema:</b> {actual.tema}</p>

          <input
            type="date"
            value={fecha}
            onChange={e=>setFecha(e.target.value)}
          />

          <br/><br/>

          <button
            style={{justifyContent:"center"}}
            className="btn-agregar"
            onClick={guardar}
          >
            Guardar
          </button>

          <button
          style={{width:"100%"}}
            className="btn-eliminar"
            onClick={()=>setModal(false)}
          >
            Cancelar
          </button>

        </div>

      </div>

      )}
    </div>
  );
}