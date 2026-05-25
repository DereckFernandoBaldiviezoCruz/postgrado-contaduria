import { useEffect, useState } from 'react';
import { listarCarreras } from '../api/carreras';
import './modal.css';

export default function ModalPrograma({
  abierto,
  cerrar,
  guardar,
  programaEditar,
}) {
  const [form, setForm] = useState({
    nombre: '',
    gestion: '',
    version: '',
    inscritos: '',
    carrera_id: '',
  });

  const [carreras, setCarreras] = useState([]);

  /* ===============================
     CARGAR CARRERAS
  =============================== */
  useEffect(() => {
    const cargarCarreras = async () => {
      const data = await listarCarreras();
      setCarreras(data);
    };
    cargarCarreras();
  }, []);

  /* ===============================
     EDIT MODE
  =============================== */
  useEffect(() => {
    if (programaEditar) {
      setForm({
        id: programaEditar.id,
        nombre: programaEditar.nombre || '',
        gestion: programaEditar.gestion || '',
        version: programaEditar.version || '',
        inscritos: programaEditar.inscritos || '',
        carrera_id: programaEditar.carrera_id || '',
      });
    } else {
      setForm({
        nombre: '',
        gestion: '',
        version: '',
        inscritos: '',
        carrera_id: '',
      });
    }
  }, [programaEditar]);

  if (!abierto) return null;

  /* ===============================
     HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = (e) => {
    e.preventDefault();

    guardar({
      ...form,
      carrera_id: form.carrera_id || null,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{programaEditar ? 'Editar Programa' : 'Nuevo Programa'}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <input
            name="gestion"
            placeholder="Gestión"
            value={form.gestion}
            onChange={handleChange}
            required
          />

          <input
            name="version"
            placeholder="Versión"
            value={form.version}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="inscritos"
            placeholder="Inscritos"
            value={form.inscritos}
            onChange={handleChange}
            required
          />

          {/* SELECT CARRERA */}
          <select
            name="carrera_id"
            value={form.carrera_id}
            onChange={handleChange}
            style={{
              width: '95%',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Sin carrera</option>

            {carreras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <div className="modal-acciones">
            <button
              type="submit"
              className="btn-agregar"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              Guardar
            </button>

            <button
              style={{ justifyContent: 'center', width: '100%' }}
              type="button"
              className="btn-eliminar"
              onClick={cerrar}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
