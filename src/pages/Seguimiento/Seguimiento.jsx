import { useEffect,useState } from "react";
import {
  listarSeguimiento,
  aceptarTemaAPI,
  rechazarTemaAPI
} from "../../api/seguimiento";

import ModalDetalleSeguimiento from "../../components/ModalDetalleSeguimiento";
import ModalImprimir from "../../components/ModalImprimir";
import ModalAceptarTema from "../../components/ModalAceptarTema";

export default function Seguimiento(){
  const [busqueda,setBusqueda] = useState("");
  const [data,setData]=useState([]);
  const [detalle,setDetalle]=useState(null);
  const [imprimir,setImprimir]=useState(null);
  const [aceptar,setAceptar]=useState(null);
  const [confirmar,setConfirmar] = useState(null);
  const cargar = async (texto="")=>{
  setData(await listarSeguimiento(texto));
};

  useEffect(() => {

  const delay = setTimeout(() => {
    cargar(busqueda);
  }, 10);

  return () => clearTimeout(delay);

}, [busqueda]);

  const confirmarAccion = async () => {

  if(confirmar.tipo === "ACEPTAR"){
    await aceptarTemaAPI(confirmar.data.recepcion_id);
  }

  if(confirmar.tipo === "RECHAZAR"){
    await rechazarTemaAPI(confirmar.data.recepcion_id);
  }

  setConfirmar(null);
  cargar();
};
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

  return(
    <div>
      <h2 className="tituloEstudiantes"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text SeguimientoMonografia_titleIcon__4H3HE" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
      Seguimiento</h2>
      <div className="filtros">
  <input
    placeholder="🔎 Buscar estudiante, tema o tutor..."
    value={busqueda}
    onChange={(e)=>setBusqueda(e.target.value)}
  />
</div>
      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>Título</th>
            <th>Estudiante</th>
            <th>Tutor</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

{data.length === 0 ? (

<tr>
<td colSpan="5" style={{
textAlign:"center",
padding:"30px",
color:"#777",
fontStyle:"italic"
}}>
🔍 No se encontraron resultados
</td>
</tr>

) : (

data.map(r=>(
<tr key={r.recepcion_id}>

<td>{r.titulo}</td>
<td>{r.estudiante}</td>
<td>{r.tutor}</td>

<td>
<span className={estadoClass(r.estado)}>
{r.estado || "Pendiente"}
</span>
</td>

<td>
<div className="accionesSeguimiento">

<button
className="btn-editar"
onClick={()=>setDetalle(r)}
>
Ver
</button>

<button
onClick={()=>setImprimir(r)}
>
Imprimir
</button>

{r.estado==="En revision" && (
<>
<button
className="btn-agregar"
onClick={()=>setConfirmar({ tipo:"ACEPTAR", data:r })}
>
Aceptar
</button>

<button
className="btn-eliminar"
onClick={()=>setConfirmar({ tipo:"RECHAZAR", data:r })}
>
Rechazar
</button>
</>
)}
</div>
</td>

</tr>
))

)}

</tbody>
      </table>

      {detalle &&
        <ModalDetalleSeguimiento
          data={detalle}
          cerrar={()=>setDetalle(null)}
        />
      }

      {imprimir &&
        <ModalImprimir
          data={imprimir}
          cerrar={()=>setImprimir(null)}
        />
      }

      {confirmar && (
  <ModalAceptarTema
    data={confirmar.data}
    cerrar={()=>setConfirmar(null)}
    confirmar={confirmarAccion}
    tipo={confirmar.tipo}
  />
)}
    </div>
  );
}