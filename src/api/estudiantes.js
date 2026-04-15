/* =========================
   LISTAR
========================= */
export const listarTodos = async (buscar = '') => {
  return await window.api.listarTodos(buscar);
};

/* =========================
   CREAR
========================= */
export const crearEstudianteAPI = async (data) => {
  return await window.api.crearEstudiante(data);
};

/* =========================
   EDITAR
========================= */
export const editarEstudianteAPI = async (data) => {
  return await window.api.editarEstudiante(data);
};

/* =========================
   ELIMINAR
========================= */
export const eliminarEstudianteAPI = async (id, data) => {
  return await window.api.eliminarEstudiante(id, data);
};

export const listarEstudiantes = (buscar = '') =>
  window.api.listarEstudiantes(buscar);

export const cambiarEstadoEstudiante = (id, estado) =>
  window.api.cambiarEstadoEstudiante(id, estado);

export const historialRecepciones = (id) => window.api.historialRecepciones(id);

export const importarEstudiantesAPI = async (data) => {
  return await window.api.importarEstudiantes(data);
};
