import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import {
  obtenerSegundaInstancia,
  guardarSegundaInstancia,
} from '../../api/segunda';

export default function SegundaInstancia() {
  const [lista, setLista] = useState([]);
  const [modal, setModal] = useState(false);
  const [actual, setActual] = useState(null);
  const [defensa, setDefensa] = useState('');
  const [buscar, setBuscar] = useState('');
  const esDiplomado = lista.length > 0 && lista[0].tipo === 'Diplomados';

  const cargar = async (texto = '') => {
    const res = await obtenerSegundaInstancia(texto);
    setLista(res);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      cargar(buscar);
    }, 300);

    return () => clearTimeout(delay);
  }, [buscar]);

  // ✅ CORREGIDO: no mezclar nota vieja con nueva
  const abrirModal = (fila) => {
    setActual(fila);

    if (fila.instancia > 1) {
      // ya existe segunda nota → editar
      setDefensa(fila.nota_defensa);
    } else {
      // nueva
      setDefensa('');
    }

    setModal(true);
  };

  const guardar = async () => {
    const defensaNum = Number(defensa);

    if (actual.tipo === 'Diplomados') {
      if (defensaNum < 0 || defensaNum > 40) {
        return Swal.fire('Error', 'Defensa debe ser 0-40', 'warning');
      }
    } else {
      if (defensaNum < 0 || defensaNum > 100) {
        return Swal.fire('Error', 'Calificación debe ser 0-100', 'warning');
      }
    }

    try {
      await guardarSegundaInstancia({
        recepcion_id: actual.recepcion_id,
        nota_defensa: defensaNum,
      });

      Swal.fire('Guardado', 'Segunda instancia registrada', 'success');

      setModal(false);
      cargar();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };
  const estadoClass = (estado) => {
    if (estado === 'Aprobado') return 'estado aprobado';
    if (estado === 'Reprobado') return 'estado reprobado';

    return 'estado pendiente';
  };

  return (
    <div>
      <h2>Segunda Instancia</h2>

      <input
        placeholder="Buscar..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
      />

      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tema</th>
            {esDiplomado && <th>Entrada</th>}
            <th>Defensa</th>
            <th>Suma</th>
            <th>Nueva Defensa</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                🔍 No hay reprobados
              </td>
            </tr>
          ) : (
            lista.map((d, i) => {
              // ✅ calcular defensa anterior correctamente
              const defensaAnterior =
                d.instancia > 1
                  ? d.suma - (d.nota_entrada || 0)
                  : d.nota_defensa;

              return (
                <tr key={i}>
                  <td>{d.estudiante}</td>
                  <td>{d.tema}</td>

                  {/* Entrada */}
                  {d.tipo === 'Diplomados' && <td>{d.nota_entrada ?? '-'}</td>}

                  {/* Defensa anterior */}
                  <td>{defensaAnterior ?? '-'}</td>

                  {/* 🔴 Suma en rojo */}
                  <td className="nota-reprobado">{d.suma ?? '-'}</td>

                  {/* Nueva defensa */}
                  <td>{d.instancia > 1 ? d.nota_defensa : '-'}</td>
                  <td>
                    <span className={estadoClass(d.estado)}>{d.estado}</span>
                  </td>
                  <td>
                    <button
                      className={d.instancia > 1 ? 'btn-editar' : 'btn-agregar'}
                      onClick={() => abrirModal(d)}
                      style={{ width: '100%' }}
                    >
                      {d.instancia > 1 ? 'Editar' : 'Calificar'}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Segunda Instancia</h3>

            <p>
              <b>{actual.tema}</b>
            </p>

            {/* Entrada solo para diplomado */}
            {actual.tipo === 'Diplomados' && (
              <>
                <label>Entrada</label>
                <br />
                <input value={actual.nota_entrada} disabled />
              </>
            )}

            <br />

            {/* Defensa anterior */}
            <label>Defensa anterior</label>
            <br />
            <input
              value={
                actual.instancia > 1
                  ? actual.suma - (actual.nota_entrada || 0)
                  : actual.nota_defensa
              }
              disabled
            />

            <br />
            <br />

            {/* Nueva */}
            <label>
              {actual.tipo === 'Diplomados'
                ? 'Nueva Defensa (0-40)'
                : 'Nueva Calificación (0-100)'}
            </label>

            <input
              type="number"
              value={defensa}
              onChange={(e) => setDefensa(e.target.value)}
            />

            <br />
            <br />

            <button
              style={{ display: 'block', margin: '0 auto' }}
              className="btn-agregar"
              onClick={guardar}
            >
              Guardar
            </button>

            <button
              style={{ width: '100%', alignItems: 'center' }}
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
