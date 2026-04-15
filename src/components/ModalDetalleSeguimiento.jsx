import { useEffect, useState } from 'react';
import { obtenerRecepciones, obtenerTribunal } from '../api/seguimiento';

export default function ModalDetalleSeguimiento({ data, cerrar }) {
  const [recepciones, setRecepciones] = useState([]);
  const [tribunal, setTribunal] = useState([]);

  useEffect(() => {
    (async () => {
      setRecepciones(await obtenerRecepciones(data.recepcion_id));
      setTribunal(await obtenerTribunal(data.recepcion_id));
    })();
  }, []);
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toISOString().split('T')[0];
  };
  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h3>Información de Seguimiento</h3>

        {/* DATOS PRINCIPALES */}
        <div className="bloque-info">
          <p>
            <b>Tema:</b> {data.titulo}
          </p>
          <p>
            <b>Tutor:</b> {data.tutor}
          </p>
          <p>
            <b>Fecha recepción:</b> {formatearFecha(data.fecha_recepcion)}
          </p>
        </div>

        <hr />

        {/* TRIBUNALES */}
        <h4>Tribunal</h4>

        {tribunal.map((t) => (
          <p key={t.rol}>
            <b>{t.rol}:</b> {t.nombre_completo}
          </p>
        ))}

        <hr />

        {/* HISTORIAL */}
        <h4>Recepciones</h4>

        {recepciones.map((r) => (
          <div key={r.id} style={{ marginBottom: 10 }}>
            <b>{r.tema}</b>
            <br />
            Programa: {r.programa}
            <br />
            Área: {r.area}
            <br />
            Fecha: {formatearFecha(r.fecha_recepcion)}
          </div>
        ))}

        <button
          style={{ width: '100%' }}
          className="btn-eliminar"
          onClick={cerrar}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
