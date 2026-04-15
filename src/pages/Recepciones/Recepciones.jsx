import { useEffect, useState } from 'react';
import ModalRecepcion from '../../components/ModalRecepcion';
import { listarRecepciones } from '../../api/recepciones';
import ModalHistorialRecepciones from '../../components/ModalHistorialRecepciones';
import ModalImprimirTutor from '../../components/ModalImprimirTutor';

export default function Recepciones() {
  const [busqueda, setBusqueda] = useState('');
  const [data, setData] = useState([]);
  const [modalImprimir, setModalImprimir] = useState(false);
  const [recepcionSeleccionada, setRecepcionSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [estudianteHistorial, setEstudianteHistorial] = useState(null);

  const cargar = async () => {
    const resp = await listarRecepciones(busqueda);
    setData(resp || []);
  };

  useEffect(() => {
    const delay = setTimeout(() => cargar(), 10);
    return () => clearTimeout(delay);
  }, [busqueda]);

  const abrirModal = (row) => {
    setEstudianteSeleccionado(row);
    setModalOpen(true);
  };

  const verHistorial = (row) => {
    setEstudianteHistorial(row);
    setModalHistorial(true);
  };
  const abrirModalImprimir = (row) => {
    setRecepcionSeleccionada(row);
    setModalImprimir(true);
  };

  const estadoClass = (estado) => {
    switch (estado) {
      case 'En revision':
        return 'estado revision';
      case 'Aceptado':
        return 'estado aceptado';
      case 'Recepcionado':
        return 'estado recepcionado';
      case 'Programada':
        return 'estado programada';
      case 'Finalizado':
        return 'estado finalizado';
      case 'Rechazado':
        return 'estado rechazado';
      default:
        return 'estado pendiente';
    }
  };

  return (
    <div>
      <h2 className="tituloEstudiantes">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-clipboard-check Defensas_titleIcon__p7qtl"
          aria-hidden="true"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <path d="m9 14 2 2 4-4"></path>
        </svg>
        Recepciones
      </h2>

      <div className="filtros">
        <input
          placeholder="🔎 Buscar estudiante, tema o tutor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>#</th>
            <th>Estudiante</th>
            <th>Programa</th>
            <th>Tema</th>
            <th>Tutor</th>
            <th>Objetivo</th>
            <th>Observaciones</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan="8"
                style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: '#777',
                  fontStyle: 'italic',
                }}
              >
                🔍 No se encontraron resultados
              </td>
            </tr>
          )}

          {data.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>

              <td>{r.estudiante}</td>

              <td>{r.programa || '-'}</td>

              <td>{r.tema || '-'}</td>

              <td>{r.tutor || '-'}</td>

              <td>{r.objetivo || '-'}</td>

              <td>{r.observaciones || '-'}</td>

              <td>
                {r.fecha_recepcion
                  ? new Date(r.fecha_recepcion).toISOString().split('T')[0]
                  : '-'}
              </td>

              <td>
                <span className={estadoClass(r.estado)}>
                  {r.estado || 'Pendiente'}
                </span>
              </td>

              <td>
                <div style={{ display: 'flex', gap: 5 }}>
                  {!r.recepcion_id && (
                    <button
                      style={{ justifyContent: 'center' }}
                      className="btn-agregar"
                      onClick={() => abrirModal(r)}
                    >
                      Recepcionar
                    </button>
                  )}

                  {r.recepcion_id &&
                    r.estado !== 'Finalizado' &&
                    r.estado !== 'Rechazado' && (
                      <button
                        className="btn-editar"
                        onClick={() => abrirModal(r)}
                      >
                        Editar
                      </button>
                    )}
                  {r.recepcion_id && r.tutor && (
                    <button
                      className="btn-editar"
                      onClick={() => abrirModalImprimir(r)}
                    >
                      Imprimir
                    </button>
                  )}

                  {r.estado === 'Finalizado' ||
                    (r.estado === 'Rechazado' && (
                      <button
                        className="btn-agregar"
                        onClick={() => abrirModal(r)}
                      >
                        Nueva Recepción
                      </button>
                    ))}

                  <button
                    className="btn-editar"
                    onClick={() => verHistorial(r)}
                  >
                    Historial
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalRecepcion
        abierto={modalOpen}
        cerrar={() => {
          setModalOpen(false);
          setEstudianteSeleccionado(null);
        }}
        estudiante={estudianteSeleccionado}
        recargar={cargar}
        esEdicion={!!estudianteSeleccionado?.recepcion_id}
      />
      <ModalHistorialRecepciones
        abierto={modalHistorial}
        cerrar={() => setModalHistorial(false)}
        estudiante={estudianteHistorial}
      />
      {modalImprimir && (
        <ModalImprimirTutor
          data={recepcionSeleccionada}
          cerrar={() => setModalImprimir(false)}
        />
      )}
    </div>
  );
}
