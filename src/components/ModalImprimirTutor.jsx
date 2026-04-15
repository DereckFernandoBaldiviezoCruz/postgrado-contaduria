import { useState } from 'react';
import Swal from 'sweetalert2';
import { imprimirTutorAPI } from '../api/recepciones';

export default function ModalImprimirTutor({ data, cerrar }) {
  const [numero, setNumero] = useState('');

  const imprimir = async () => {
    if (!numero) {
      return Swal.fire({
        icon: 'warning',
        title: 'Número requerido',
        text: 'Ingrese el número de Cite',
      });
    }

    const carpeta = await window.api.seleccionarCarpeta();

    if (!carpeta) {
      return Swal.fire({
        icon: 'info',
        title: 'Cancelado',
        text: 'No se seleccionó carpeta',
      });
    }

    const res = await imprimirTutorAPI({
      recepcion_id: data.recepcion_id,
      numero,
      carpetaDestino: carpeta,
    });

    if (res?.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Carta generada',
        html: `Carta generada correctamente con Cite Nº ${res.archivos.join(', ')}`,
        confirmButtonText: 'OK',
      });

      cerrar();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: res?.error || 'Error al generar documento',
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '420px' }}>
        <h3>Imprimir Invitación de Tutor</h3>

        <p style={{ marginBottom: 15 }}>
          Estudiante: <b>{data?.estudiante}</b>
        </p>

        <input
          placeholder="Número de Cite (ej: 3228)"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />

        <button
          className="btn-agregar"
          style={{ justifyContent: 'center' }}
          onClick={imprimir}
        >
          🖨 Generar Carta
        </button>

        <button
          className="btn-eliminar"
          style={{ width: '100%' }}
          onClick={cerrar}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
