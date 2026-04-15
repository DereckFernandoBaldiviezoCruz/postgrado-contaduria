import { useState } from "react";

export default function ModalPerfil({abierto,cerrar,usuario}){

  const [nombre,setNombre] = useState(usuario?.nombre || "");
  const [password,setPassword] = useState("");

  const guardar = async () => {

    await window.api.actualizarPerfil({
      id:usuario.id,
      nombre,
      password
    });

    const nuevoUsuario = {
      ...usuario,
      nombre
    };

    localStorage.setItem("usuario",JSON.stringify(nuevoUsuario));

    alert("Perfil actualizado");

    cerrar();

    window.location.reload();

  };

  if(!abierto) return null;

  return(

    <div className="modalOverlay" onClick={cerrar}>

      <div className="modal" onClick={(e)=>e.stopPropagation()}>

        <h2 style={{color:"black"}}>Mi Perfil</h2>
        <h3 style={{color:"black"}}>Nombre</h3>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e)=>setNombre(e.target.value)}
        />
        <h3 style={{color:"black"}}>Contraseña</h3>
        <input
          type="password"
          placeholder="Nueva contraseña (opcional)"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <div style={{display:"flex",gap:"10px"}}>

          <button className="btn-agregar" onClick={guardar}>
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