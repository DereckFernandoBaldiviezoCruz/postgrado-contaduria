import { useEffect, useState } from 'react';

export default function AreaSwitcher({ usuario }) {
  const [areaActual, setAreaActual] = useState('');

  useEffect(() => {
    cargarArea();
  }, []);

  const cargarArea = async () => {
    const area = await window.api.getArea();
    setAreaActual(area);
  };

  const cambiarArea = async (area) => {
    await window.api.setArea(area);
    setAreaActual(area);
    window.location.reload();
  };

  /* ===== SI SOLO TIENE UN AREA ===== */
  if (!areaActual) return null;
  if (usuario.area !== 'AMBOS') {
    return <div className="area-estatica">{areaActual}</div>;
  }

  /* ===== SWITCH PARA AMBOS ===== */

  return (
    <div className="area-switch">
      <button
        className={`area-btn maestrias ${areaActual === 'MAESTRIAS' ? 'activo' : ''}`}
        onClick={() => cambiarArea('MAESTRIAS')}
      >
        Maestrías
      </button>

      <button
        className={`area-btn diplomados ${areaActual === 'DIPLOMADOS' ? 'activo' : ''}`}
        onClick={() => cambiarArea('DIPLOMADOS')}
      >
        Diplomados
      </button>
    </div>
  );
}
