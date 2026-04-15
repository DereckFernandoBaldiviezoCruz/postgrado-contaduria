/* =========================
   LISTAR
========================= */
export const listarDocentes = async (buscar = '') => {
  return await window.api.listarDocentes(buscar);
};

/* =========================
   CREAR
========================= */
export const crearDocenteAPI = async (data) => {
  return await window.api.crearDocente(data);
};

/* =========================
   EDITAR
========================= */
export const editarDocenteAPI = async (data) => {
  return await window.api.editarDocente(data);
};

/* =========================
   ELIMINAR
========================= */
export const eliminarDocenteAPI = async (id) => {
  return await window.api.eliminarDocente(id);
};

export const activarDocenteAPI = async (id) => {
  return await window.api.activarDocente(id);
};

export const listarDocentesActivos = async () => {
  return await window.api.listarDocentesActivos();
};

export const importarDocentesAPI = async (data) => {
  return await window.api.importarDocentes(data);
};
