// src/api/tutores.js

/* =========================
   LISTAR
========================= */
export const listarTutores = async () => {
  return await window.api.listarTutores();
};


/* =========================
   CREAR
========================= */
export const crearTutorAPI = async (data) => {
  return await window.api.crearTutor(data);
};


/* =========================
   EDITAR
========================= */
export const editarTutorAPI = async (data) => {
  return await window.api.editarTutor(data);
};


/* =========================
   ELIMINAR
========================= */
export const eliminarTutorAPI = async (id) => {
  return await window.api.eliminarTutor(id);
};