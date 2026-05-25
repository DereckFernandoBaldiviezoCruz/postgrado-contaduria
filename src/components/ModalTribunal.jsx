import { useEffect, useState } from 'react';
import { obtenerTribunal, guardarTribunalAPI } from '../api/defensas';
import { listarDocentesActivos } from '../api/docentes';
import { listarCargaDocentes } from '../api/defensas';

export default function ModalTribunal({
  abierto,
  cerrar,
  recepcion,
  recargar,
}) {
  const [docentes, setDocentes] = useState([]);
  const [recomendados, setRecomendados] = useState([]);

  const [form, setForm] = useState({
    presidente: '',
    secretario: '',
    vocal: '',
  });
  const docentesDisponibles = (rolActual) => {
    return docentes.filter((d) => {
      if (
        rolActual !== 'presidente' &&
        Number(form.presidente) === Number(d.id)
      )
        return false;

      if (
        rolActual !== 'secretario' &&
        Number(form.secretario) === Number(d.id)
      )
        return false;

      if (rolActual !== 'vocal' && Number(form.vocal) === Number(d.id))
        return false;

      return true;
    });
  };

  useEffect(() => {
    if (!abierto || !recepcion) return;

    (async () => {
      const lista = await listarDocentesActivos();

      const filtrados = lista
        .filter((d) => Number(d.id) !== Number(recepcion.docente_id))
        .sort((a, b) =>
          a.nombre_completo.localeCompare(b.nombre_completo, 'es'),
        );

      setDocentes(filtrados);

      const carga = await listarCargaDocentes(recepcion.docente_id);
      setRecomendados(carga);

      const data = await obtenerTribunal(recepcion.recepcion_id);

      if (data.length) {
        const f = {
          presidente: '',
          secretario: '',
          vocal: '',
        };

        data.forEach((t) => {
          if (t.rol === 'PRESIDENTE') f.presidente = t.docente_id;
          if (t.rol === 'SECRETARIO') f.secretario = t.docente_id;
          if (t.rol === 'VOCAL') f.vocal = t.docente_id;
        });

        setForm(f);
      } else {
        setForm({
          presidente: '',
          secretario: '',
          vocal: '',
        });
      }
    })();
  }, [abierto, recepcion]);

  const guardar = async (e) => {
    e.preventDefault();

    await guardarTribunalAPI({
      recepcion_id: recepcion.recepcion_id,
      ...form,
    });

    cerrar();
    recargar();
  };

  if (!abierto) return null;

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div
        className="modal tribunal-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Asignar Miembros del Tribunal</h2>

        <div
          style={{
            background: '#f4f6f8',
            padding: 12,
            borderRadius: 8,
            marginBottom: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: '14px',
          }}
        >
          <div>
            <strong>Estudiante:</strong> <span>{recepcion.estudiante}</span>
          </div>

          <div>
            <strong>Tema:</strong>{' '}
            <span
              style={{
                color: '#2e7d32',
                fontWeight: 500,
              }}
            >
              {recepcion.tema}
            </span>
          </div>

          <div>
            <strong>Programa:</strong> <span>{recepcion.programa}</span>
          </div>

          <div>
            <strong>Tutor:</strong> <span>{recepcion.docente}</span>
          </div>
        </div>

        <form onSubmit={guardar} className="tribunal-form">
          {/* PRESIDENTE */}
          <div className="campo">
            <label>PRESIDENTE DEL TRIBUNAL:</label>
            <select
              required
              value={form.presidente}
              onChange={(e) => setForm({ ...form, presidente: e.target.value })}
            >
              <option value="">Seleccione docente</option>
              {docentesDisponibles('presidente').map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* VOCAL */}
          <div className="campo">
            <label>VOCAL DEL TRIBUNAL:</label>
            <select
              required
              value={form.vocal}
              onChange={(e) => setForm({ ...form, vocal: e.target.value })}
            >
              <option value="">Seleccione docente</option>
              {docentesDisponibles('vocal').map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* SECRETARIO */}
          <div className="campo">
            <label>SECRETARIO DEL TRIBUNAL:</label>
            <select
              required
              value={form.secretario}
              onChange={(e) => setForm({ ...form, secretario: e.target.value })}
            >
              <option value="">Seleccione docente</option>
              {docentesDisponibles('secretario').map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* BOTONES */}
          <div className="modal-actions">
            <button type="button" className="btn-eliminar" onClick={cerrar}>
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-agregar"
              style={{
                width: '50%',
                justifyContent: 'center',
              }}
            >
              Guardar Cambios
            </button>
          </div>
          <h3 style={{ marginTop: 20 }}>Carga Docentes</h3>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: 10,
            }}
          >
            {recomendados.map((d, index) => (
              <div
                key={d.id}
                style={{
                  padding: '8px 0',
                  borderBottom:
                    index !== recomendados.length - 1
                      ? '1px solid #eee'
                      : 'none',
                }}
              >
                <strong>{d.nombre_completo}</strong>
                <br />
                Pendientes: {d.pendientes || 0}
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
