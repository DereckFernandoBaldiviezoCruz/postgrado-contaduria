import { useEffect, useState } from 'react';
import ModalTribunal from '../../components/ModalTribunal';
import { listarDefensas } from '../../api/defensas';

export default function EditarTribunales() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [seleccion, setSeleccion] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [ultimoCount, setUltimoCount] = useState(0);

  const cargar = async (forzar = false) => {
    try {
      const nuevas = await listarDefensas();

      // 🚫 No actualizar si el modal está abierto
      if (modal && !forzar) return;

      // 🔥 Solo actualizar si hay cambios
      if (forzar || nuevas.length !== ultimoCount) {
        setData(nuevas);
        setUltimoCount(nuevas.length);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargar(true); // carga inicial

    const interval = setInterval(() => {
      cargar(); // verificación
    }, 5000);

    return () => clearInterval(interval);
  }, [modal]);

  const abrir = (row) => {
    setSeleccion(row);
    setModal(true);
  };

  const dataFiltrada = data
    .filter((r) => r.tribunales_asignados > 0)
    .filter(
      (r) =>
        r.estudiante?.toLowerCase().includes(buscar.toLowerCase()) ||
        r.tema?.toLowerCase().includes(buscar.toLowerCase()),
    );

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
      default:
        return 'estado pendiente';
    }
  };

  return (
    <div>
      <h2 className="tituloEstudiantes">Editar Tribunales</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="🔎 Buscar estudiante o tema..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>

      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>#</th>
            <th>Estudiante</th>
            <th>Tema</th>
            <th>Tutor</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {dataFiltrada.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: '#777',
                  fontStyle: 'italic',
                }}
              >
                No hay tribunales asignados
              </td>
            </tr>
          ) : (
            dataFiltrada.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.estudiante}</td>
                <td>{r.tema}</td>
                <td>{r.tutor}</td>

                <td>
                  <span className={estadoClass(r.estado)}>
                    {r.estado || 'Pendiente'}
                  </span>
                </td>

                <td>
                  <button
                    className="btn-editar"
                    style={{ width: '100%' }}
                    onClick={() => abrir(r)}
                  >
                    Editar tribunales
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ModalTribunal
        abierto={modal}
        cerrar={() => {
          setModal(false);
          cargar(true); // 🔥 recarga segura al cerrar
        }}
        recepcion={seleccion}
        recargar={() => cargar(true)}
      />
    </div>
  );
}
