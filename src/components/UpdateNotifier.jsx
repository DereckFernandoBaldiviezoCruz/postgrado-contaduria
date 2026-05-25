import { useEffect, useState } from 'react';

export default function UpdateNotifier() {
  const [visible, setVisible] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    if (!window.api) return;

    window.api.onUpdateAvailable(() => {
      setVisible(true);
    });

    window.api.onUpdateProgress((porcentaje) => {
      setDescargando(true);
      setProgreso(porcentaje);
    });
  }, []);

  const actualizar = () => {
    setDescargando(true);
    window.api.instalar();
  };

  if (!visible) return null;

  return (
    <div className="update-box">
      <div className="update-text">
        {!descargando ? (
          <>
            <strong>Nueva versión disponible</strong>
            <span>Haz clic para actualizar</span>
          </>
        ) : (
          <>
            <strong>Descargando actualización...</strong>
            <span>{progreso}% completado</span>
          </>
        )}
      </div>

      <button
        className="update-btn"
        onClick={actualizar}
        disabled={descargando}
      >
        {descargando ? 'Descargando...' : 'Actualizar'}
      </button>
    </div>
  );
}
