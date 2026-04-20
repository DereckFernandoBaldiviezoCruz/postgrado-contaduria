import { useEffect, useState } from 'react';
import ModalTribunal from '../../components/ModalTribunal';
import { listarDefensas, listarCargaDocentes } from '../../api/defensas';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Defensas() {
  const [data, setData] = useState([]);
  const [carga, setCarga] = useState([]);
  const [modal, setModal] = useState(false);
  const [seleccion, setSeleccion] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [ultimoCount, setUltimoCount] = useState(0);

  const cargar = async (forzar = false) => {
    try {
      const nuevas = await listarDefensas();

      // 🚫 Si hay modal abierto → no actualizar
      if (modal && !forzar) return;

      // 🔥 Solo actualizar si cambió algo
      if (forzar || nuevas.length !== ultimoCount) {
        setData(nuevas);
        setUltimoCount(nuevas.length);

        // también actualiza carga docente
        const cargaNueva = await listarCargaDocentes();
        setCarga(cargaNueva);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    cargar(true); // primera carga SIEMPRE

    const interval = setInterval(() => {
      cargar(); // sin forzar
    }, 5000);

    return () => clearInterval(interval);
  }, [modal]);

  const abrir = (row) => {
    setSeleccion(row);
    setModal(true);
  };

  /* EXPORTAR */
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(carga);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Carga Docente');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([buffer]), 'CargaDocentes.xlsx');
  };

  const dataFiltrada = data
    .filter((r) => r.tribunales_asignados == 0)
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
          class="lucide lucide-circle-plus Monografias_titleIcon__8fRgq"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12h8"></path>
          <path d="M12 8v8"></path>
        </svg>
        Tribunales
      </h2>
      <div className="filtros">
        <input
          type="text"
          placeholder="🔎 Buscar estudiante o tema..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>
      {/* TABLA DEFENSAS */}
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
                🔍 No se encontraron resultados
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
                    className="btn-agregar"
                    style={{ width: '100%' }}
                    onClick={() => abrir(r)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m16 11 2 2 4-4"></path>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>

                    {r.tribunales_asignados == 0
                      ? 'Asignar tribunales'
                      : 'Editar tribunales'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* CARGA DOCENTE */}
      <h3 style={{ marginTop: 40 }}>Carga docente</h3>

      <button
        className="btn-agregar"
        style={{
          width: '30%',
        }}
        onClick={exportarExcel}
      >
        Exportar Excel
      </button>

      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Pendientes</th>
            <th>Finalizados</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {carga.map((d) => (
            <tr key={d.id}>
              <td>{d.nombre_completo}</td>
              <td>{d.pendientes || 0}</td>
              <td>{d.finalizados || 0}</td>
              <td>{d.total || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalTribunal
        abierto={modal}
        cerrar={() => {
          setModal(false);
          cargar(true); // 🔥 recarga real al cerrar
        }}
        recepcion={seleccion}
        recargar={() => cargar(true)}
      />
    </div>
  );
}
