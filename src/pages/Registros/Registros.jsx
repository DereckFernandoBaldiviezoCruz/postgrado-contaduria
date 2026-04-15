import { useEffect, useState } from 'react';
import { listarRegistros, filtrarRegistros } from '../../api/auditoria';

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const limite = 20;

  const [filtro, setFiltro] = useState({
    usuario: '',
    tabla: '',
    accion: '',
  });

  const [loading, setLoading] = useState(false);
  const [modoBusqueda, setModoBusqueda] = useState(false);

  /* =========================
     CARGAR NORMAL
  ========================= */
  async function cargar() {
    setLoading(true);

    const res = await listarRegistros(pagina, limite);

    setRegistros(res.data);
    setTotal(res.total);

    setLoading(false);
  }

  /* =========================
     BUSCAR
  ========================= */
  async function buscar() {
    setLoading(true);
    setPagina(1);
    setModoBusqueda(true);

    const res = await filtrarRegistros(filtro, 1, limite);

    setRegistros(res.data);
    setTotal(res.total);

    setLoading(false);
  }

  /* =========================
     LIMPIAR FILTRO
  ========================= */
  function limpiar() {
    setFiltro({
      usuario: '',
      tabla: '',
      accion: '',
    });

    setModoBusqueda(false);
    setPagina(1);
  }

  /* =========================
     CAMBIOS INPUT
  ========================= */
  function handleChange(e) {
    setFiltro({
      ...filtro,
      [e.target.name]: e.target.value,
    });
  }

  /* =========================
     EFECTOS
  ========================= */
  useEffect(() => {
    if (modoBusqueda) {
      filtrarRegistros(filtro, pagina, limite).then((res) => {
        setRegistros(res.data);
        setTotal(res.total);
      });
    } else {
      cargar();
    }
  }, [pagina]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-4">
      <h2>Registros del Sistema</h2>

      {/* 🔹 FILTROS */}
      <div
        style={{
          marginBottom: '15px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <input
          name="usuario"
          placeholder="Usuario"
          value={filtro.usuario}
          onChange={handleChange}
        />

        <input
          name="tabla"
          placeholder="Tabla"
          value={filtro.tabla}
          onChange={handleChange}
        />

        <select name="accion" value={filtro.accion} onChange={handleChange}>
          <option value="">Todas</option>
          <option value="CREATE">Crear</option>
          <option value="UPDATE">Editar</option>
          <option value="DELETE">Eliminar</option>
          <option value="PRINT">Imprimir</option>
        </select>

        <button onClick={buscar}>Buscar</button>
        <button onClick={limpiar}>Limpiar</button>
      </div>

      {/* 🔹 TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Tabla</th>
              <th>Acción</th>
              <th>Descripción</th>
            </tr>
          </thead>

          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#777',
                    fontStyle: 'italic',
                  }}
                >
                  No se encontraron registros
                </td>
              </tr>
            ) : (
              registros.map((r) => {
                const fecha = new Date(r.fecha).toLocaleString();

                return (
                  <tr key={r.id}>
                    <td>{fecha}</td>
                    <td>{r.usuario || '-'}</td>
                    <td>{r.tabla}</td>
                    <td>{r.accion}</td>
                    <td>{r.descripcion}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* 🔹 PAGINACIÓN */}
      <div
        style={{
          marginTop: 15,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          ← Anterior
        </button>

        <span>
          Página {pagina} de {Math.ceil(total / limite) || 1}
        </span>

        <button
          disabled={pagina >= Math.ceil(total / limite)}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
