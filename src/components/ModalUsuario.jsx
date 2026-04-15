import { useState, useEffect } from 'react';
import { crearUsuarioAPI, editarUsuarioAPI } from '../api/usuarios';

export default function ModalUsuario({
  abierto,
  cerrar,
  usuario,
  recargar,
  esEdicion,
}) {
  const [nombre, setNombre] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('secretaria');
  const [area, setArea] = useState('MAESTRIAS');

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '');
      setUser(usuario.usuario || '');
      setRol(usuario.rol || 'Encargado de Tribunales');
      setArea(usuario.area || 'MAESTRIAS');
    } else {
      setNombre('');
      setUser('');
      setPassword('');
      setRol('Encargado de Tribunales');
      setArea('MAESTRIAS');
    }
  }, [usuario]);

  const guardar = async () => {
    if (!nombre || !user) {
      alert('Complete los campos');
      return;
    }

    if (esEdicion) {
      await editarUsuarioAPI({
        id: usuario.id,
        nombre,
        usuario: user,
        rol,
        area,
      });
    } else {
      if (!password) {
        alert('Ingrese contraseña');
        return;
      }

      await crearUsuarioAPI({
        nombre,
        usuario: user,
        password,
        rol,
        area,
      });
    }

    cerrar();
    recargar();
  };

  if (!abierto) return null;

  return (
    <div className="modalOverlay">
      <div className="modal">
        <h3>{esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        {!esEdicion && (
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <select
          style={{ width: '100%' }}
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="Administrador">Administrador</option>
          <option value="Apoyo Logistico">Apoyo Logistico</option>
          <option value="Encargado de Recepciones">
            Encargado de Recepciones
          </option>
          <option value="Encargado de Tribunales">
            Encargado de Tribunales
          </option>
        </select>
        <select
          style={{ width: '100%' }}
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option value="MAESTRIAS">MAESTRIAS</option>
          <option value="DIPLOMADOS">DIPLOMADOS</option>
          <option value="AMBOS">AMBOS</option>
        </select>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
