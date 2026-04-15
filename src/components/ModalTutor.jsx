import { useEffect, useState } from 'react';
import { listarDocentes } from '../api/docentes';
import { listarTutores } from '../api/tutores';

export default function ModalTutor({ abierto, cerrar, guardar }) {
  const [modo, setModo] = useState('INTERNO');

  const [docentes, setDocentes] = useState([]);
  const [tutores, setTutores] = useState([]);

  const [busquedaDocente, setBusquedaDocente] = useState('');
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);

  const [tutorExterno, setTutorExterno] = useState('');

  const [form, setForm] = useState({
    nombre_completo: '',
    ci: '',
    correo: '',
    celular: '',
  });

  useEffect(() => {
    listarDocentes().then(setDocentes);
    listarTutores().then(setTutores);
  }, []);

  const docentesFiltrados = docentes.filter((d) =>
    d.nombre_completo.toLowerCase().includes(busquedaDocente.toLowerCase()),
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const seleccionarDocente = (docente) => {
    setDocenteSeleccionado(docente);
  };

  const submit = (e) => {
    e.preventDefault();

    if (modo === 'INTERNO') {
      if (!docenteSeleccionado) {
        alert('Seleccione un docente');
        return;
      }

      guardar({
        tutor_docente_id: docenteSeleccionado.id,
      });

      return;
    }

    if (modo === 'EXTERNO_EXISTENTE') {
      guardar({
        tutor_id: tutorExterno,
      });

      return;
    }

    guardar({
      nuevoTutor: true,
      ...form,
    });
  };

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Asignar Tutor</h3>

        <form onSubmit={submit}>
          <label>Tipo de tutor</label>
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="INTERNO">Docente interno</option>
            <option value="EXTERNO_EXISTENTE">Tutor externo existente</option>
            <option value="EXTERNO_NUEVO">Nuevo tutor externo</option>
          </select>

          {/* ================= DOCENTE INTERNO ================= */}

          {modo === 'INTERNO' && (
            <>
              <label>Buscar docente</label>

              <input
                placeholder="Buscar docente..."
                value={busquedaDocente}
                onChange={(e) => setBusquedaDocente(e.target.value)}
              />

              <div
                style={{
                  maxHeight: 200,
                  overflow: 'auto',
                  border: '1px solid #ccc',
                  marginTop: 5,
                }}
              >
                {docentesFiltrados.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => seleccionarDocente(d)}
                    style={{
                      padding: 8,
                      cursor: 'pointer',
                      background:
                        docenteSeleccionado?.id === d.id ? '#e8f0ff' : '',
                    }}
                  >
                    {d.nombre_completo} — CI: {d.ci}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ================= EXTERNO EXISTENTE ================= */}

          {modo === 'EXTERNO_EXISTENTE' && (
            <>
              <label>Seleccionar tutor</label>

              <select
                value={tutorExterno}
                onChange={(e) => setTutorExterno(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Seleccione</option>

                {tutores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre_completo} — CI: {t.ci}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* ================= NUEVO EXTERNO ================= */}

          {modo === 'EXTERNO_NUEVO' && (
            <>
              <label>Nombre</label>
              <input
                name="nombre_completo"
                value={form.nombre_completo}
                onChange={handleChange}
                required
              />

              <label>CI</label>
              <input name="ci" value={form.ci} onChange={handleChange} />

              <label>Correo</label>
              <input
                name="correo"
                value={form.correo}
                onChange={handleChange}
              />

              <label>Celular</label>
              <input
                name="celular"
                value={form.celular}
                onChange={handleChange}
              />
            </>
          )}

          <button
            type="submit"
            className="btn-agregar"
            style={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
