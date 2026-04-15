import { useState, useEffect } from 'react';
import './modal.css';

export default function ModalEstudiante({
  abierto,
  cerrar,
  guardar,
  estudianteEditar,
}) {
  const [nombre, setNombre] = useState('');
  const [ci, setCi] = useState('');
  const [correo, setCorreo] = useState('');
  const [celular, setCelular] = useState('');

  const [carreraId, setCarreraId] = useState('');

  const [carreras, setCarreras] = useState([]);

  /* =============================
     CARGAR SELECTS DESDE MYSQL
  ==============================*/
  useEffect(() => {
    const cargarCatalogos = async () => {
      setCarreras(await window.api.listarCarreras());
    };

    cargarCatalogos();
  }, []);

  /* =============================
     MODO EDITAR
  ==============================*/
  useEffect(() => {
    if (estudianteEditar) {
      setNombre(estudianteEditar.nombre_completo);
      setCi(estudianteEditar.ci);
      setCorreo(estudianteEditar.correo);
      setCelular(estudianteEditar.celular);
      setCarreraId(estudianteEditar.carrera_id);
    } else {
      setNombre('');
      setCi('');
      setCorreo('');
      setCelular('');
      setCarreraId('');
    }
  }, [estudianteEditar]);

  if (!abierto) return null;

  /* =============================
     GUARDAR
  ==============================*/
  const handleSubmit = () => {
    guardar({
      id: estudianteEditar?.id,
      nombre_completo: nombre,
      ci,
      correo,
      celular,
      carrera_id: carreraId,
    });

    cerrar();
  };

  return (
    <div className="modal-overlay">
      <div style={{ width: '400px' }} className="modal">
        <h3>{estudianteEditar ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h3>

        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre Completo"
        />

        <input
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          placeholder="CI"
        />

        <input
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo"
        />

        <input
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          placeholder="Celular"
        />

        {/* ===== SELECT CARRERAS ===== */}
        <select
          value={carreraId}
          onChange={(e) => setCarreraId(e.target.value)}
        >
          <option value="">-- Seleccione Carrera --</option>

          {carreras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button className="btn-agregar" onClick={handleSubmit}>
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
