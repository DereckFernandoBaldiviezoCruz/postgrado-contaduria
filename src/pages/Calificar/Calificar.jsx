import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import {
  obtenerCalificaciones,
  guardarCalificacion,
} from '../../api/calificaciones';

export default function CalificarMonografias() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [actual, setActual] = useState(null);

  const [entrada, setEntrada] = useState('');
  const [defensa, setDefensa] = useState('');

  const [buscar, setBuscar] = useState('');

  const cargar = async (texto = '') => {
    setLoading(true);

    const res = await obtenerCalificaciones(texto);

    setLista(res);

    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      cargar(buscar);
    }, 300);

    return () => clearTimeout(delay);
  }, [buscar]);

  const abrirModal = (fila) => {
    setActual(fila);

    if (fila.tipo === 'Diplomados') {
      setEntrada(fila.nota_entrada || '');
      setDefensa(fila.nota_defensa || '');
    } else {
      setEntrada('');
      setDefensa(fila.suma || ''); // 👈 IMPORTANTE
    }

    setModal(true);
  };

  const guardar = async () => {
    if (actual.tipo === 'Diplomados') {
      if (entrada < 0 || entrada > 60) {
        return Swal.fire(
          'Error',
          'La nota de entrada debe ser 0-60',
          'warning',
        );
      }

      if (defensa < 0 || defensa > 40) {
        return Swal.fire(
          'Error',
          'La nota de defensa debe ser 0-40',
          'warning',
        );
      }
    } else {
      // MAESTRIA
      if (defensa < 0 || defensa > 100) {
        return Swal.fire('Error', 'La calificación debe ser 0-100', 'warning');
      }
    }

    const ok = await guardarCalificacion({
      recepcion_id: actual.recepcion_id,
      nota_entrada: actual.tipo === 'Diplomados' ? entrada : null,
      nota_defensa: defensa,
    });

    if (ok) {
      Swal.fire('Guardado', 'Calificación registrada', 'success');

      setModal(false);
      cargar();
    }
  };

  const estadoClass = (estado) => {
    if (estado === 'Aprobado') return 'estado aprobado';
    if (estado === 'Reprobado') return 'estado reprobado';

    return 'estado pendiente';
  };
  const textoEstado = (estado, instancia) => {
    if (estado === 'Aprobado' && instancia > 1) {
      return 'Aprobado en segunda instancia';
    }
    if (estado === 'Reprobado' && instancia > 1) {
      return 'Reprobado en segunda instancia';
    }

    return estado;
  };
  const esDiplomado = lista.length > 0 && lista[0].tipo === 'Diplomados';
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
          class="lucide lucide-clipboard-check"
          aria-hidden="true"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <path d="m9 14 2 2 4-4"></path>
        </svg>
        Calificación de Monografías
      </h2>
      <div className="filtros">
        <input
          placeholder="🔎 Buscar estudiante o tema..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="tablaDocentes">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Título</th>
              {esDiplomado ? (
                <>
                  <th>Entrada</th>
                  <th>Defensa</th>
                  <th>Suma</th>
                </>
              ) : (
                <th>Calificación</th>
              )}

              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
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
            ) : (
              lista.map((d, i) => (
                <tr key={i}>
                  <td>{d.estudiante}</td>
                  <td>{d.tema}</td>
                  {d.tipo === 'Diplomados' ? (
                    <>
                      <td>{d.nota_entrada || '-'}</td>
                      <td>{d.nota_defensa || '-'}</td>
                      <td>{d.suma || '-'}</td>
                    </>
                  ) : (
                    <td>{d.suma || '-'}</td>
                  )}

                  <td>
                    <span className={estadoClass(d.estado_calificacion)}>
                      {textoEstado(d.estado_calificacion, d.instancia)}
                    </span>
                  </td>

                  <td>
                    <button
                      style={{ width: '100%' }}
                      className={d.suma ? 'btn-editar' : 'btn-agregar'}
                      onClick={() => abrirModal(d)}
                    >
                      {d.suma ? 'Editar' : 'Calificar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Calificar Monografía</h3>
            <p>
              <b>{actual.tema}</b>
            </p>
            <br />

            {actual.tipo === 'Diplomados' ? (
              <>
                <label>Entrada (0-60)</label>
                <input
                  type="number"
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                />

                <br />
                <br />

                <label>Defensa (0-40)</label>
                <input
                  type="number"
                  value={defensa}
                  onChange={(e) => setDefensa(e.target.value)}
                />
              </>
            ) : (
              <>
                <label>Calificación (0-100)</label>
                <input
                  type="number"
                  value={defensa}
                  onChange={(e) => setDefensa(e.target.value)}
                />
              </>
            )}
            <br />
            <br />
            <button
              style={{
                justifyContent: 'center',
                padding: '5px',
                height: '40px',
              }}
              className="btn-agregar"
              onClick={guardar}
            >
              Guardar
            </button>
            <button
              style={{
                width: '100%',
                height: '35px',
                justifyContent: 'center',
                padding: '5px',
              }}
              className="btn-eliminar"
              onClick={() => setModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
