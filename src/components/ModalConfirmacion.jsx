import './ModalConfirmacion.css';

export default function ModalConfirmacion({
  abierto,
  mensaje,
  confirmar,
  cancelar,
}) {
  if (!abierto) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h3>Confirmar acción</h3>

        <p>{mensaje}</p>

        <div className="confirm-actions">
          <button className="btn-eliminar" onClick={confirmar}>
            Sí, inactivar
          </button>

          <button className="btn-editar" onClick={cancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
