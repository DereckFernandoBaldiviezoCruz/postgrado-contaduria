import { useNavigate } from 'react-router-dom';
import './ElegirArea.css';

export default function ElegirArea({ setArea }) {
  const navigate = useNavigate();

  const elegir = async (area) => {
    await window.api.setArea(area);
    setArea(area);
    navigate('/');
  };

  return (
    <div className="pantalla-area">
      <div className="contenedor-area">
        <h1>Seleccione el Área del Sistema</h1>

        <div className="botones-area">
          <button
            className="btn-area maestriasE"
            onClick={() => elegir('MAESTRIAS')}
          >
            Maestrías
          </button>

          <button
            className="btn-area diplomadosE"
            onClick={() => elegir('DIPLOMADOS')}
          >
            Diplomados
          </button>
        </div>
      </div>
    </div>
  );
}
