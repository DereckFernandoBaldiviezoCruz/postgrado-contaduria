import { useState, useEffect } from 'react';
import './modal.css';
import Swal from 'sweetalert2';

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
      setCorreo(estudianteEditar.correo || '');
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

  const esCorreoValido = (email) => {
    if (!email) return true; // ✅ vacío permitido

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  /* =============================
     GUARDAR
  ==============================*/
  const handleSubmit = () => {
    // 🔤 limpiar espacios
    const nombreLimpio = nombre.trim();
    const ciLimpio = ci.trim();
    const correoLimpio = correo.trim();
    const celularLimpio = celular.trim();

    /* =============================
     VALIDACIONES
  ==============================*/

    // ❌ Nombre vacío
    if (!nombreLimpio) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre es obligatorio',
      });
      return;
    }

    // ❌ Nombre con caracteres raros
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreLimpio)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre solo debe contener letras',
      });
      return;
    }

    // ❌ CI inválido
    if (!/^\d+$/.test(ciLimpio)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El CI solo debe contener números',
      });
      return;
    }

    // ❌ Celular inválido (opcional)
    if (celularLimpio && !/^\d+$/.test(celularLimpio)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El celular solo debe contener números',
      });
      return;
    }

    // ❌ Correo inválido
    if (!esCorreoValido(correoLimpio)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El correo no es válido',
      });
      return;
    }

    /* =============================
     TODO OK → GUARDAR
  ==============================*/
    guardar({
      id: estudianteEditar?.id,
      nombre_completo: nombreLimpio,
      ci: ciLimpio,
      correo: correoLimpio || null,
      celular: celularLimpio,
      carrera_id: carreraId || null,
    });

    cerrar();
  };

  return (
    <div className="modal-overlay">
      <div style={{ width: '400px' }} className="modal">
        <h3>{estudianteEditar ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h3>

        <input
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))
          }
          placeholder="Nombre Completo"
        />

        <input
          value={ci}
          onChange={(e) => setCi(e.target.value.replace(/\D/g, ''))}
          placeholder="CI"
        />

        <input
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo"
        />

        <input
          value={celular}
          onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
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
