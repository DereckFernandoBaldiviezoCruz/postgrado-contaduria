import { useEffect,useState } from "react";
import { obtenerTribunal } from "../api/seguimiento";

export default function ModalTribunalInfo({data,cerrar}){

  const [tribunal,setTribunal]=useState([]);

  useEffect(()=>{
    (async()=>{
      setTribunal(await obtenerTribunal(data.recepcion_id));
    })();
  },[]);

  return(
    <div className="modal-overlay">
      <div className="modal">

        <h3>Tribunales</h3>

        {tribunal.map(t=>(
          <p key={t.rol}>
            <b>{t.rol}:</b> {t.nombre_completo}
          </p>
        ))}

        <button onClick={cerrar}>Cerrar</button>
      </div>
    </div>
  );
}