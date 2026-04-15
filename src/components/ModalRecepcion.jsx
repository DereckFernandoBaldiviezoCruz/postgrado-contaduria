import { useEffect, useState } from 'react';
import { listarTutores, crearTutorAPI } from '../api/tutores';
import { listarDocentesActivos } from '../api/docentes';
import { crearRecepcionAPI, editarRecepcionAPI } from '../api/recepciones';
import { listarProgramas } from '../api/programas';
import Swal from 'sweetalert2';

export default function ModalRecepcion({
  abierto,
  cerrar,
  estudiante,
  recargar,
}) {
  const [tutores, setTutores] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [programas, setProgramas] = useState([]);

  const [modoTutor, setModoTutor] = useState('EXISTENTE');
  const [busquedaDocente, setBusquedaDocente] = useState('');
  const docentesFiltrados = docentes.filter((d) =>
    d.nombre_completo.toLowerCase().includes(busquedaDocente.toLowerCase()),
  );
  const [busquedaTutor, setBusquedaTutor] = useState('');

  const tutoresFiltrados = tutores.filter((t) =>
    t.nombre_completo.toLowerCase().includes(busquedaTutor.toLowerCase()),
  );
  const formatearFecha = (fecha) => {
    if (!fecha) return '';

    if (typeof fecha === 'string') {
      return fecha.slice(0, 10);
    }

    const f = new Date(fecha);
    if (isNaN(f)) return '';

    return f.toISOString().slice(0, 10);
  };
  const [form, setForm] = useState({
    programa_id: '',
    tema: '',
    objetivo: '',
    observaciones: '',
    fecha_recepcion: '',
    tutor_id: '',
  });

  const [tutorNuevo, setTutorNuevo] = useState({
    nombre_completo: '',
    ci: '',
    correo: '',
    celular: '',
    tipo: 'EXTERNO',
    docente_id: '',
    nivel_academico: '',
  });

  const esEdicion = !!estudiante?.recepcion_id;

  useEffect(() => {
    if (!abierto) return;

    (async () => {
      const progs = await listarProgramas();
      console.log('PROGRAMAS:', progs);
      setTutores(await listarTutores());
      setDocentes(await listarDocentesActivos());
      setProgramas(await listarProgramas());
    })();
  }, [abierto]);

  useEffect(() => {
    if (!abierto || !estudiante) return;

    if (estudiante.recepcion_id) {
      setForm({
        programa_id: estudiante.programa_id || '',
        tema: estudiante.tema || '',
        objetivo: estudiante.objetivo || '',
        observaciones: estudiante.observaciones || '',
        tutor_id: estudiante.tutor_id || '',
        fecha_recepcion: formatearFecha(estudiante.fecha_recepcion),
      });

      setModoTutor('EXISTENTE');
    } else {
      setForm({
        programa_id: '',
        tema: '',
        objetivo: '',
        observaciones: '',
        tutor_id: '',
        fecha_recepcion: formatearFecha(new Date()),
      });

      setModoTutor('EXISTENTE');
    }
  }, [estudiante, abierto]);

  const seleccionarDocente = (id) => {
    const d = docentes.find((x) => x.id == id);
    if (!d) return;

    setTutorNuevo({
      ...tutorNuevo,
      docente_id: d.id,
      nombre_completo: d.nombre_completo,
      ci: d.ci,
      correo: d.correo || '',
      celular: d.celular || '',
      nivel_academico: d.nivel_academico || '',
    });
  };

  const guardar = async (e) => {
    e.preventDefault();

    let tutor_id = form.tutor_id;

    /* CREAR TUTOR SI ES NUEVO */
    if (modoTutor === 'NUEVO') {
      let resp;

      try {
        resp = await crearTutorAPI(tutorNuevo);
      } catch (error) {
        const mensaje = error.message
          .replace(/Error invoking remote method '.*': /, '')
          .replace(/^Error: /, '');

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
        });
      }
      tutor_id = resp.id;
    }

    const payload = {
      ...form,
      tutor_id,
      estudiante_id: estudiante.estudiante_id,
    };

    /* ===== EDITAR ===== */
    if (esEdicion) {
      await editarRecepcionAPI({
        ...payload,
        id: estudiante.recepcion_id,
      });
    } else {
      /* ===== CREAR ===== */
      await crearRecepcionAPI(payload);
    }

    cerrar();
    recargar();
  };

  if (!abierto || !estudiante) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '600px',
        }}
      >
        <h3>{esEdicion ? 'Editar Recepción' : 'Recepcionar Trabajo'}</h3>

        {/* ESTUDIANTE BLOQUEADO */}
        <label>Estudiante</label>
        <div
          style={{
            background: '#f4f6f8',
            padding: 10,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          <strong>Estudiante:</strong>
          <br />
          {estudiante.estudiante}
        </div>

        <form
          onSubmit={guardar}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <h4>Tutor</h4>

          <div
            style={{
              display: 'flex',
              gap: 20,
              margin: '8px 0',
              justifyContent: 'center',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="radio"
                checked={modoTutor === 'EXISTENTE'}
                onChange={() => setModoTutor('EXISTENTE')}
              />
              Tutor existente
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="radio"
                checked={modoTutor === 'NUEVO'}
                onChange={() => setModoTutor('NUEVO')}
              />
              Nuevo tutor
            </label>
          </div>

          {modoTutor === 'EXISTENTE' && (
            <>
              <input
                placeholder="🔎 Buscar tutor..."
                value={busquedaTutor}
                onChange={(e) => setBusquedaTutor(e.target.value)}
              />

              <div
                style={{
                  maxHeight: 150,
                  overflow: 'auto',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                }}
              >
                {tutoresFiltrados.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: 6,
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      background:
                        form.tutor_id == t.id ? '#e8f0fe' : 'transparent',
                    }}
                    onClick={() => setForm({ ...form, tutor_id: t.id })}
                  >
                    {t.nombre_completo} — CI: {t.ci} — {t.tipo}
                  </div>
                ))}
              </div>
            </>
          )}

          {modoTutor === 'NUEVO' && (
            <>
              <select
                value={tutorNuevo.tipo}
                onChange={(e) =>
                  setTutorNuevo({ ...tutorNuevo, tipo: e.target.value })
                }
              >
                <option value="EXTERNO">Externo</option>
                <option value="INTERNO">Docente interno</option>
              </select>

              {tutorNuevo.tipo === 'INTERNO' && (
                <>
                  <input
                    placeholder="Buscar docente..."
                    value={busquedaDocente}
                    onChange={(e) => setBusquedaDocente(e.target.value)}
                  />

                  <div
                    style={{
                      maxHeight: 150,
                      overflow: 'auto',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                    }}
                  >
                    {docentesFiltrados.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          padding: 6,
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                        }}
                        onClick={() => seleccionarDocente(d.id)}
                      >
                        {d.nombre_completo} — CI: {d.ci}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tutorNuevo.tipo === 'INTERNO' && tutorNuevo.nivel_academico && (
                <>
                  <label>Nivel académico</label>
                  <input value={tutorNuevo.nivel_academico} disabled />
                </>
              )}

              <input
                placeholder="Nombre"
                value={tutorNuevo.nombre_completo}
                disabled={tutorNuevo.tipo === 'INTERNO'}
                onChange={(e) =>
                  setTutorNuevo({
                    ...tutorNuevo,
                    nombre_completo: e.target.value,
                  })
                }
              />

              <input
                placeholder="CI"
                value={tutorNuevo.ci}
                disabled={tutorNuevo.tipo === 'INTERNO'}
                onChange={(e) =>
                  setTutorNuevo({ ...tutorNuevo, ci: e.target.value })
                }
              />
              <label>Correo</label>
              <input
                placeholder="Correo"
                value={tutorNuevo.correo}
                disabled={tutorNuevo.tipo === 'INTERNO'}
                onChange={(e) =>
                  setTutorNuevo({ ...tutorNuevo, correo: e.target.value })
                }
              />
              <label>Celular</label>
              <input
                placeholder="Celular"
                value={tutorNuevo.celular}
                disabled={tutorNuevo.tipo === 'INTERNO'}
                onChange={(e) =>
                  setTutorNuevo({ ...tutorNuevo, celular: e.target.value })
                }
              />
              {tutorNuevo.tipo === 'EXTERNO' && (
                <>
                  <label>Nivel académico</label>
                  <select
                    value={tutorNuevo.nivel_academico}
                    onChange={(e) =>
                      setTutorNuevo({
                        ...tutorNuevo,
                        nivel_academico: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione</option>
                    <option value="Licenciado">Licenciado</option>
                    <option value="Magister">Magister</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Postdoctorado">Postdoctorado</option>
                  </select>
                </>
              )}
            </>
          )}
          <h4>Tema (Monografía)</h4>
          <input
            placeholder="Tema"
            required
            value={form.tema}
            onChange={(e) => setForm({ ...form, tema: e.target.value })}
          />

          <h4>Programa</h4>

          <select
            required
            value={form.programa_id}
            onChange={(e) => setForm({ ...form, programa_id: e.target.value })}
          >
            <option value="">Seleccione programa</option>

            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <h4>Objetivo</h4>
          <textarea
            placeholder="Objetivo"
            value={form.objetivo}
            onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
          />
          <h4>Observaciones</h4>
          <textarea
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
          />
          <h4>Fecha</h4>
          <input
            type="date"
            required
            value={form.fecha_recepcion}
            onChange={(e) =>
              setForm({ ...form, fecha_recepcion: e.target.value })
            }
          />

          <button
            type="submit"
            className="btn-agregar"
            style={{
              justifyContent: 'center',
            }}
          >
            Guardar Recepción
          </button>
          <button
            type="button"
            className="btn-eliminar"
            style={{
              width: '100%',
              height: '34px',
            }}
            onClick={cerrar}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
