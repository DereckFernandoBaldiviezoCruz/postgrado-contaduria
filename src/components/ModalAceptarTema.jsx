export default function ModalAceptarTema({ data, cerrar, confirmar, tipo }) {

  const esAceptar = tipo === "ACEPTAR";

  return(
    <div className="modal-overlay">
      <div className="modal">

        <h3>
          {esAceptar ? "Aceptar Monografía" : "Rechazar Monografía"}
        </h3>

        <p>
          {esAceptar
            ? "¿Está seguro de aceptar la monografía:"
            : "¿Está seguro de rechazar la monografía:"}
        </p>

        <div style={{
          background:"#f4f6f8",
          padding:12,
          borderRadius:6,
          margin:"15px 0"
        }}>
          <b>{data.titulo}</b>
        </div>

        <div style={{display:"flex",gap:10}}>

          <button
            className={esAceptar ? "btn-agregar" : "btn-eliminar"}
            onClick={confirmar}
          >
            {esAceptar ? "Sí, aceptar" : "Sí, rechazar"}
          </button>

          <button
            className="btn-editar"
            onClick={cerrar}
          >
            Cancelar
          </button>

        </div>

      </div>
    </div>
  );
}