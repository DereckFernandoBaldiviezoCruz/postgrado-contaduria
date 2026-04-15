import { useEffect, useState } from "react";
import {
  listarTodos,
  cambiarEstadoEstudiante
} from "../../api/estudiantes";

import ModalHistorial from "../../components/ModalHistorial";

export default function Historial(){

  const [data,setData] = useState([]);
  const [busqueda,setBusqueda] = useState("");
  const [modal,setModal] = useState(false);
  const [estSel,setEstSel] = useState(null);
  const [confirmar,setConfirmar] = useState(null);
  const cargar = async()=>{
    const resp = await listarTodos(busqueda);
    setData(resp || []);
  };

  useEffect(()=>{
    const t = setTimeout(()=>cargar(),300);
    return ()=>clearTimeout(t);
  },[busqueda]);

  const cambiarEstado = async(e)=>{
    const nuevo = e.estado === "Activo" ? "Inactivo" : "Activo";
    const cambiarEstado = (e)=>{
  const nuevo = e.estado === "Activo" ? "Inactivo" : "Activo";
      const confirmarCambio = async ()=>{
  await cambiarEstadoEstudiante(
    confirmar.estudiante.id,
    confirmar.nuevoEstado
  );

  setConfirmar(null);
  cargar();
};
  setConfirmar({
    estudiante: e,
    nuevoEstado: nuevo
  });
};

    await cambiarEstadoEstudiante(e.id, nuevo);
    cargar();
  };

  const abrirHistorial = (e)=>{
    setEstSel(e);
    setModal(true);
  };

  return(
    <div>
      <h2 className="tituloEstudiantes">Gestión de Estudiantes</h2>

      <div className="filtros">
        <input
          placeholder="🔎 Buscar por nombre, CI, celular o correo..."
          value={busqueda}
          onChange={(e)=>setBusqueda(e.target.value)}
        />
      </div>

      <table className="tablaDocentes">

        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>CI</th>
            <th>Celular</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

{data.length === 0 ? (

<tr>
<td colSpan="7" style={{
textAlign:"center",
padding:"30px",
color:"#777",
fontStyle:"italic"
}}>
🔍 No se encontraron resultados
</td>
</tr>

) : (

data.map((e,i)=>(

<tr key={e.id}>

<td>{i+1}</td>
<td>{e.nombre_completo}</td>
<td>{e.ci || "-"}</td>
<td>{e.celular || "-"}</td>
<td>{e.correo || "-"}</td>

<td>
<span className={
e.estado === "Activo"
? "estado aceptado"
: "estado pendiente"
}>
{e.estado}
</span>
</td>

<td style={{display:"flex",gap:5}}>

<button
className="btn-editar"
onClick={()=>abrirHistorial(e)}
>
Historial
</button>

<button
style={{width:"50%", justifyContent:"center"}}
className={
e.estado==="Activo"
? "btn-eliminar"
: "btn-agregar"
}
onClick={()=>cambiarEstado(e)}
>
{e.estado==="Activo"
? "Inactivar"
: "Reactivar"}
</button>

</td>

</tr>

))

)}

</tbody>

      </table>

      <ModalHistorial
        abierto={modal}
        cerrar={()=>setModal(false)}
        estudiante={estSel}
      />
      {confirmar && (
  <div className="modal-overlay">
    <div className="modal">

      <h3>
        {confirmar.nuevoEstado === "Activo"
          ? "Reactivar Estudiante"
          : "Inactivar Estudiante"}
      </h3>

      <p>
        {confirmar.nuevoEstado === "Activo"
          ? "¿Deseas reactivar al estudiante?"
          : "¿Deseas inactivar al estudiante?"}
      </p>

      <div style={{
        background:"#f4f6f8",
        padding:12,
        borderRadius:6,
        margin:"15px 0"
      }}>
        <b>{confirmar.estudiante.nombre_completo}</b>
      </div>

      <div style={{display:"flex",gap:10}}>

        <button
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
          className="btn-editar"
          onClick={()=>setConfirmar(null)}
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