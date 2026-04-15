import { useEffect, useState } from 'react';
import {
  obtenerResumen,
  obtenerPorMes,
  obtenerPorPrograma,
  obtenerCargaDocentes,
} from '../../api/reportes';
import './Reportes.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Reportes() {
  const [resumen, setResumen] = useState({});
  const [meses, setMeses] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [carga, setCarga] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setResumen(await obtenerResumen());
    setMeses(await obtenerPorMes());
    setProgramas(await obtenerPorPrograma());
    setCarga(await obtenerCargaDocentes());
  };
  const formatearMes = (mes, anio) => {
    const fecha = new Date(anio, mes - 1);

    return fecha
      .toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
      .replace(/^\w/, (c) => c.toUpperCase());
  };
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(carga);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Carga Docente');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([buffer]), 'CargaDocentes.xlsx');
  };

  return (
    <div>
      <h2>Reportes</h2>

      {/* 🔹 RESUMEN */}
      <div className="cards">
        <div className="card total">
          <div className="card-title">Total</div>
          <div className="card-value">{resumen.total}</div>
        </div>

        <div className="card sintribunal">
          <div className="card-title">Sin tribunal</div>
          <div className="card-value">{resumen.sin_tribunal}</div>
        </div>

        <div className="card revision">
          <div className="card-title">En revisión</div>
          <div className="card-value">{resumen.en_revision}</div>
        </div>

        <div className="card sinfecha">
          <div className="card-title">Sin fecha</div>
          <div className="card-value">{resumen.sin_fecha_defensa}</div>
        </div>

        <div className="card programado">
          <div className="card-title">Programados</div>
          <div className="card-value">{resumen.programados}</div>
        </div>

        <div className="card calificacion">
          <div className="card-title">Sin calificar</div>
          <div className="card-value">{resumen.pendientes_calificacion}</div>
        </div>

        <div className="card rechazado">
          <div className="card-title">Rechazados</div>
          <div className="card-value">{resumen.rechazados}</div>
        </div>

        <div className="card finalizado">
          <div className="card-title">Finalizados</div>
          <div className="card-value">{resumen.finalizados}</div>
        </div>
      </div>
      <h3>Carga docente</h3>
      <button
        className="btn-agregar"
        style={{
          width: '30%',
        }}
        onClick={exportarExcel}
      >
        Exportar Excel
      </button>
      <div className="tabla-scroll">
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
      </div>
      {/* 🔹 POR MES */}
      <h3>Recepciones por mes</h3>
      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>Mes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {meses.map((m, i) => (
            <tr key={i}>
              <td>{formatearMes(m.mes, m.anio)}</td>
              <td>{m.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 POR PROGRAMA */}
      <h3>Recepciones por programa</h3>
      <table className="tablaDocentes">
        <thead>
          <tr>
            <th>Programa</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {programas.map((p, i) => (
            <tr key={i}>
              <td>{p.nombre}</td>
              <td>{p.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
