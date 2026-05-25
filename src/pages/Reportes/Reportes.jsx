import { useEffect, useState } from 'react';
import {
  obtenerResumen,
  obtenerPorMes,
  obtenerPorPrograma,
  obtenerCargaDocentes,
  obtenerResumenPrograma,
} from '../../api/reportes';

import './Reportes.css';
import { listarProgramasTodos } from '../../api/programas';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Reportes() {
  const [resumen, setResumen] = useState({});
  const [meses, setMeses] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [carga, setCarga] = useState([]);

  const [programa, setPrograma] = useState('TODOS');
  const [listaProgramas, setListaProgramas] = useState([]);

  const [gestion, setGestion] = useState('TODOS');
  const [mes, setMes] = useState('TODOS');

  const [resumenPrograma, setResumenPrograma] = useState([]);

  // 🔥 MODALES
  const [modalCarga, setModalCarga] = useState(false);
  const [modalPrograma, setModalPrograma] = useState(false);

  const [programaDetalle, setProgramaDetalle] = useState(null);

  /* =========================
     CARGAR
  ========================= */

  const cargar = async () => {
    try {
      // 🔥 FILTROS SOLO PARA REPORTES GENERALES
      const r = await obtenerResumen(gestion, mes, programa);

      const m = await obtenerPorMes(gestion, programa);

      const p = await obtenerPorPrograma(gestion, mes);

      // 🔥 CARGA DOCENTES NORMAL
      const c = await obtenerCargaDocentes();

      // 🔥 RESUMEN PROGRAMAS SIEMPRE GENERAL
      const rp = await obtenerResumenPrograma(gestion, mes, 'TODOS');

      const programasDB = await listarProgramasTodos();

      setResumen(r || {});
      setMeses(m || []);
      setProgramas(p || []);
      setCarga(c || []);

      setResumenPrograma(rp || []);

      setListaProgramas(programasDB || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargar();

    const interval = setInterval(() => {
      cargar();
    }, 5000);

    return () => clearInterval(interval);
  }, [gestion, mes, programa]);

  /* =========================
     FORMATEAR MES
  ========================= */

  const formatearMes = (mes, anio) => {
    const fecha = new Date(anio, mes - 1);

    return fecha
      .toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  /* =========================
     EXPORTAR EXCEL
  ========================= */

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(carga);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Carga Docente');

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(new Blob([buffer]), 'CargaDocentes.xlsx');
  };

  /* =========================
     ABRIR MODAL PROGRAMA
  ========================= */

  const abrirPrograma = (p) => {
    setProgramaDetalle(p);
    setModalPrograma(true);
  };

  return (
    <div>
      <h2 className="tituloEstudiantes">Reportes</h2>

      {/* =========================
          FILTROS
      ========================= */}

      <div className="filtros-reportes">
        <select value={gestion} onChange={(e) => setGestion(e.target.value)}>
          <option value="TODOS">Todas las gestiones</option>

          {[2022, 2023, 2024, 2025, 2026].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="TODOS">Todos los meses</option>

          <option value={1}>Enero</option>
          <option value={2}>Febrero</option>
          <option value={3}>Marzo</option>
          <option value={4}>Abril</option>
          <option value={5}>Mayo</option>
          <option value={6}>Junio</option>
          <option value={7}>Julio</option>
          <option value={8}>Agosto</option>
          <option value={9}>Septiembre</option>
          <option value={10}>Octubre</option>
          <option value={11}>Noviembre</option>
          <option value={12}>Diciembre</option>
        </select>

        {/* 🔥 ESTE FILTRO SIGUE FUNCIONANDO */}
        <select value={programa} onChange={(e) => setPrograma(e.target.value)}>
          <option value="TODOS">Todos los programas</option>

          {listaProgramas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* =========================
          CARDS RESUMEN
      ========================= */}

      <div className="cards">
        <div className="card total">
          <div className="card-title">Total</div>
          <div className="card-value">{resumen.total || 0}</div>
        </div>

        <div className="card sintribunal">
          <div className="card-title">Sin tribunal</div>
          <div className="card-value">{resumen.sin_tribunal || 0}</div>
        </div>

        <div className="card revision">
          <div className="card-title">En revisión</div>
          <div className="card-value">{resumen.en_revision || 0}</div>
        </div>

        <div className="card sinfecha">
          <div className="card-title">Sin fecha</div>
          <div className="card-value">{resumen.sin_fecha_defensa || 0}</div>
        </div>

        <div className="card calificacion">
          <div className="card-title">Sin calificar</div>
          <div className="card-value">
            {resumen.pendientes_calificacion || 0}
          </div>
        </div>

        <div className="card rechazado">
          <div className="card-title">Rechazados</div>
          <div className="card-value">{resumen.rechazados || 0}</div>
        </div>

        <div className="card finalizado">
          <div className="card-title">Finalizados</div>
          <div className="card-value">{resumen.finalizados || 0}</div>
        </div>
      </div>

      {/* =========================
          CARGA DOCENTE
      ========================= */}

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <button
          className="btn-agregar"
          onClick={() => setModalCarga(true)}
          style={{
            background: 'linear-gradient(135deg, #0636a7, #04a36f)',
            color: '#fff',
          }}
        >
          Ver carga docente
        </button>

        <button className="btn-agregar" onClick={exportarExcel}>
          Exportar Excel
        </button>
      </div>

      {/* =========================
          RECEPCIONES POR MES
      ========================= */}

      <h3 class="tituloEstudiantes">Recepciones por mes</h3>

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

      {/* =========================
          RECEPCIONES POR PROGRAMA
      ========================= */}

      <h3 class="tituloEstudiantes">Recepciones por programa</h3>

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

      {/* =========================
          RESUMEN PROGRAMAS
      ========================= */}

      <h3>Resumen por programa</h3>

      <div className="cards">
        {resumenPrograma.map((p) => {
          const avance =
            p.inscritos > 0
              ? ((p.defendidos / p.inscritos) * 100).toFixed(1)
              : 0;

          return (
            <div className="card total" key={p.id}>
              <div className="card-title">{p.nombre}</div>

              <div style={{ marginTop: 10 }}>
                <b>Inscritos:</b> {p.inscritos}
              </div>

              <div>
                <b>Defendidos:</b> {p.defendidos}
              </div>

              <div>
                <b>Avance:</b> {avance}%
              </div>

              <div className="barra-avance">
                <div
                  className="barra-progreso"
                  style={{
                    width: `${avance}%`,
                  }}
                />

                <span className="texto-barra">{avance}%</span>
              </div>

              <button
                className="btn-agregar btn-detalle-programa"
                style={{
                  width: '100%',
                  marginTop: 15,
                }}
                onClick={() => abrirPrograma(p)}
              >
                Más información
              </button>
            </div>
          );
        })}
      </div>

      {/* =========================
          MODAL CARGA DOCENTE
      ========================= */}

      {modalCarga && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              width: '80%',
              maxWidth: 900,
            }}
          >
            <h2>Carga docente</h2>

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

            <button
              className="btn-eliminar"
              style={{
                marginTop: 20,
                width: '100%',
              }}
              onClick={() => setModalCarga(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* =========================
          MODAL PROGRAMA
      ========================= */}

      {modalPrograma && programaDetalle && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              width: '80%',
              maxWidth: 1000,
            }}
          >
            <h2>{programaDetalle.nombre}</h2>

            <div className="detalle-grid">
              <div className="detalle-box">
                <span>Inscritos</span>
                <h1>{programaDetalle.inscritos}</h1>
              </div>

              <div className="detalle-box">
                <span>Recepciones</span>
                <h1>{programaDetalle.recepciones}</h1>
              </div>

              <div className="detalle-box">
                <span>Defendidos</span>
                <h1>{programaDetalle.defendidos}</h1>
              </div>

              <div className="detalle-box">
                <span>Pendientes</span>
                <h1>{programaDetalle.pendientes}</h1>
              </div>

              <div className="detalle-box">
                <span>Rechazados</span>
                <h1>{programaDetalle.rechazados}</h1>
              </div>

              <div className="detalle-box aprobado">
                <span>Aprobados</span>
                <h1>{programaDetalle.aprobados}</h1>
              </div>

              <div className="detalle-box">
                <span>Tasa de aprobación</span>

                <h1
                  style={{
                    color:
                      programaDetalle.eficiencia >= 80
                        ? 'green'
                        : programaDetalle.eficiencia >= 50
                          ? '#f39c12'
                          : 'red',
                  }}
                >
                  {programaDetalle.eficiencia || 0}%
                </h1>
              </div>

              <div className="detalle-box">
                <span>Tiempo promedio</span>

                <h1>
                  {programaDetalle.tiempo_promedio
                    ? `${Math.round(programaDetalle.tiempo_promedio)} días`
                    : 'Sin datos'}
                </h1>
              </div>
            </div>

            <div className="barra-avance grande">
              <div
                className="barra-progreso grande"
                style={{
                  width: `${
                    programaDetalle.inscritos > 0
                      ? (
                          (programaDetalle.defendidos /
                            programaDetalle.inscritos) *
                          100
                        ).toFixed(1)
                      : 0
                  }%`,
                }}
              />

              <span className="texto-barra grande">
                {programaDetalle.inscritos > 0
                  ? (
                      (programaDetalle.defendidos / programaDetalle.inscritos) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#555',
              }}
            >
              Avance de defensas completadas
            </div>

            <button
              className="btn-eliminar"
              style={{
                marginTop: 20,
                width: '100%',
              }}
              onClick={() => setModalPrograma(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
