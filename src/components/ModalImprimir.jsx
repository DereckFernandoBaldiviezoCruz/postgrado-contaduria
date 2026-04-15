import { useState } from "react";
import { imprimirAPI } from "../api/seguimiento";
import Swal from "sweetalert2";

export default function ModalImprimir({data,cerrar}){

  const [numero,setNumero]=useState("");

  const imprimir = async () => {

  if (!numero) return alert("Ingrese número inicial");

  const carpeta = await window.api.seleccionarCarpeta();

  console.log("Carpeta seleccionada:", carpeta); // 👈 AGREGA ESTO

  if (!carpeta) {
    return Swal.fire({
      icon: "info",
      title: "Cancelado",
      text: "No se seleccionó carpeta"
    });
  }

  const res = await imprimirAPI({
    recepcion_id: data.recepcion_id,
    numero,
    carpetaDestino: carpeta
  });

  console.log("Respuesta backend:", res); // 👈 AGREGA ESTO

  if (res?.ok) {

    Swal.fire({
      icon: "success",
      title: "Éxito",
      html: `Cartas generadas correctamente con CITES Nº ${res.archivos.join(", ")}`,
      confirmButtonText: "OK"
    });

    cerrar();

  } else {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: res?.error || "Error al generar documentos"
    });

  }
};

  return(
    <div className="modal-overlay">
      <div className="modal" style={{width:"400px"}}>

        <h3>Generar Invitaciones</h3>

        <input
          placeholder="Número inicial (ej: 5)"
          value={numero}
          onChange={e=>setNumero(e.target.value)}
        />

        <button className="btn-agregar" 
        style={{justifyContent:"center"}}
        onClick={imprimir}>
          Generar
        </button>

        <button className="btn-eliminar" 
        style={{width:"100%"}}
        onClick={cerrar}>
          Cancelar
        </button>

      </div>
    </div>
  );
}