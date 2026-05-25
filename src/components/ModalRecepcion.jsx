import { useEffect, useState } from 'react';
import { listarDocentesActivos } from '../api/docentes';
import { crearRecepcionAPI, editarRecepcionAPI } from '../api/recepciones';
import { listarProgramas } from '../api/programas';
import {
  crearPagoAPI,
  editarPagoAPI,
  eliminarPagoAPI,
  obtenerPagoRecepcionAPI,
} from '../api/pagos';
import Swal from 'sweetalert2';

export default function ModalRecepcion({
  abierto,
  cerrar,
  estudiante,
  recargar,
}) {
  const [docentes, setDocentes] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [pagoId, setPagoId] = useState(null);

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
    docente_id: '',

    // NUEVO
    tiene_multa: false,
    numero_comprobante: '',
    fecha_pago: '',
    monto: '',
    glosa: '',
  });

  const esEdicion = !!estudiante?.recepcion_id;

  /* =========================
     CARGAR DATOS
  ========================= */
  useEffect(() => {
    if (!abierto) return;

    (async () => {
      const docs = (await listarDocentesActivos()).sort((a, b) =>
        a.nombre_completo.localeCompare(b.nombre_completo, 'es'),
      );
      const progs = await listarProgramas();

      setDocentes(docs);
      setProgramas(progs);
    })();
  }, [abierto]);

  /* =========================
     CARGAR FORM
  ========================= */
  useEffect(() => {
    if (!abierto || !estudiante) return;

    (async () => {
      setPagoId(null);

      let pago = null;

      if (esEdicion) {
        pago = await obtenerPagoRecepcionAPI(estudiante.recepcion_id);
      }

      if (pago) {
        setPagoId(pago.id);
      }

      setForm({
        programa_id: estudiante.programa_id || '',
        tema: estudiante.tema || '',
        objetivo: estudiante.objetivo || '',
        observaciones: estudiante.observaciones || '',
        docente_id: estudiante.docente_id || '',

        fecha_recepcion: esEdicion
          ? formatearFecha(estudiante.fecha_recepcion)
          : formatearFecha(new Date()),

        tiene_multa: !!pago,

        numero_comprobante: pago?.numero_comprobante || '',

        fecha_pago: formatearFecha(pago?.fecha_pago),

        monto: pago?.monto || '',

        glosa: pago?.glosa || '',
      });
    })();
  }, [estudiante, abierto]);

  /* =========================
     GUARDAR
  ========================= */
  const guardar = async (e) => {
    e.preventDefault();

    if (!form.docente_id) {
      return Swal.fire({
        icon: 'warning',
        title: 'Seleccione un docente',
      });
    }

    try {
      const payload = {
        ...form,
        estudiante_id: estudiante.estudiante_id,
      };
      let recepcionId = null;
      if (esEdicion) {
        await editarRecepcionAPI({
          ...payload,
          id: estudiante.recepcion_id,
        });

        recepcionId = estudiante.recepcion_id;
      } else {
        const nueva = await crearRecepcionAPI(payload);

        recepcionId = nueva.id;
      }
      // MULTA
      if (form.tiene_multa) {
        const payloadPago = {
          recepcion_id: recepcionId,

          tipo: 'Multa',

          numero_comprobante: form.numero_comprobante,

          fecha_pago: form.fecha_pago,

          monto: form.monto,

          glosa: form.glosa,
        };

        // EDITAR
        if (pagoId) {
          await editarPagoAPI({
            id: pagoId,
            ...payloadPago,
          });
        }

        // CREAR
        else {
          await crearPagoAPI(payloadPago);
        }
      }

      // ELIMINAR SI DESACTIVÓ
      else {
        if (pagoId) {
          await eliminarPagoAPI(pagoId);
        }
      }

      cerrar();
      recargar();
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
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <h4>Docente Tutor</h4>

          <select
            required
            value={form.docente_id}
            onChange={(e) =>
              setForm({
                ...form,
                docente_id: e.target.value,
              })
            }
          >
            <option value="">Seleccione docente tutor</option>

            {docentes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre_completo}
              </option>
            ))}
          </select>

          <h4>Tema (Monografía)</h4>

          <input
            placeholder="Tema"
            required
            value={form.tema}
            onChange={(e) =>
              setForm({
                ...form,
                tema: e.target.value,
              })
            }
          />

          <h4>Programa</h4>

          <select
            required
            value={form.programa_id}
            onChange={(e) =>
              setForm({
                ...form,
                programa_id: e.target.value,
              })
            }
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
            onChange={(e) =>
              setForm({
                ...form,
                objetivo: e.target.value,
              })
            }
          />

          <h4>Observaciones</h4>

          <textarea
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) =>
              setForm({
                ...form,
                observaciones: e.target.value,
              })
            }
          />

          <h4>Fecha</h4>

          <input
            type="date"
            required
            value={form.fecha_recepcion}
            onChange={(e) =>
              setForm({
                ...form,
                fecha_recepcion: e.target.value,
              })
            }
          />
          {/* MULTA */}
          <div
            style={{
              marginTop: 10,
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 8,
              background: '#fafafa',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.tiene_multa}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tiene_multa: e.target.checked,
                    })
                  }
                />

                <span>Multa</span>
              </label>
            </div>

            {form.tiene_multa && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginTop: 15,
                }}
              >
                <div>
                  <label>Número de comprobante</label>

                  <input
                    placeholder="Ej: 00045821"
                    value={form.numero_comprobante}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        numero_comprobante: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Fecha de pago</label>

                  <input
                    type="date"
                    value={form.fecha_pago}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fecha_pago: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Monto</label>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.monto}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monto: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Glosa</label>

                  <textarea
                    placeholder="Detalle del pago..."
                    value={form.glosa}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        glosa: e.target.value,
                      })
                    }
                  />
                </div>
                {pagoId && (
                  <button
                    type="button"
                    className="btn-eliminar"
                    onClick={async () => {
                      const confirm = await Swal.fire({
                        icon: 'warning',
                        title: 'Eliminar multa',
                        text: '¿Desea eliminar esta multa?',
                        showCancelButton: true,
                        confirmButtonText: 'Eliminar',
                      });

                      if (!confirm.isConfirmed) return;

                      await eliminarPagoAPI(pagoId);

                      setPagoId(null);

                      setForm({
                        ...form,
                        tiene_multa: false,
                        numero_comprobante: '',
                        fecha_pago: '',
                        monto: '',
                        glosa: '',
                      });

                      Swal.fire({
                        icon: 'success',
                        title: 'Multa eliminada',
                      });
                    }}
                  >
                    Eliminar multa
                  </button>
                )}
              </div>
            )}
          </div>

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
