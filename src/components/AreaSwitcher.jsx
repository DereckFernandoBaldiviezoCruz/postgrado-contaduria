import { useEffect, useState } from 'react';
import { obtenerPendientesPorAreas } from '../api/pendientes';

export default function AreaSwitcher({ usuario }) {
  const [areaActual, setAreaActual] = useState('');
  const [pendientes, setPendientes] = useState({
    MAESTRIAS: {
      tribunales: 0,
      seguimiento: 0,
      defensas: 0,
      calificaciones: 0,
      segundaInstancia: 0,
    },
    DIPLOMADOS: {
      tribunales: 0,
      seguimiento: 0,
      defensas: 0,
      calificaciones: 0,
      segundaInstancia: 0,
    },
  });

  const cargarArea = async () => {
    const area = await window.api.getArea();
    setAreaActual(area);
  };
  const cargarPendientes = async () => {
    try {
      const data = await obtenerPendientesPorAreas();

      setPendientes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const totalPorRol = (areaData = {}) => {
    const tribunales = Number(areaData?.tribunales || 0);
    const seguimiento = Number(areaData?.seguimiento || 0);
    const defensas = Number(areaData?.defensas || 0);
    const calificaciones = Number(areaData?.calificaciones || 0);
    const segundaInstancia = Number(areaData?.segundaInstancia || 0);

    switch (usuario?.rol?.trim()) {
      case 'Administrador':
        return (
          tribunales +
          seguimiento +
          defensas +
          calificaciones +
          segundaInstancia
        );

      case 'Encargado de Tribunales':
        return tribunales;

      case 'Encargado de Recepciones':
        return seguimiento + defensas + calificaciones + segundaInstancia;

      default:
        return 0;
    }
  };

  const cambiarArea = async (area) => {
    await window.api.setArea(area);
    setAreaActual(area);
    window.location.reload();
  };
  useEffect(() => {
    cargarArea();
    cargarPendientes();

    const interval = setInterval(cargarPendientes, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ===== SI SOLO TIENE UN AREA ===== */
  if (!areaActual) return null;
  if (usuario.area !== 'AMBOS') {
    return <div className="area-estatica">{areaActual}</div>;
  }

  /* ===== SWITCH PARA AMBOS ===== */
  const totalMaestrias = totalPorRol(pendientes?.MAESTRIAS);
  const totalDiplomados = totalPorRol(pendientes?.DIPLOMADOS);
  return (
    <div className="area-switch">
      <button
        className={`area-btn maestrias ${areaActual === 'MAESTRIAS' ? 'activo' : ''}`}
        onClick={() => cambiarArea('MAESTRIAS')}
      >
        Maestrías
        <span
          className={`badge-area ${
            totalPorRol(pendientes.MAESTRIAS) === 0 ? 'vacio' : ''
          }`}
        >
          {totalMaestrias > 0 ? totalMaestrias : ''}
        </span>
      </button>

      <button
        className={`area-btn diplomados ${areaActual === 'DIPLOMADOS' ? 'activo' : ''}`}
        onClick={() => cambiarArea('DIPLOMADOS')}
      >
        Diplomados
        <span
          className={`badge-area ${
            totalPorRol(pendientes.DIPLOMADOS) === 0 ? 'vacio' : ''
          }`}
        >
          {totalDiplomados > 0 ? totalDiplomados : ''}
        </span>
      </button>
    </div>
  );
}
