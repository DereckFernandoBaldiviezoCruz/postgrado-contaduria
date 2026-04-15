// src/api/recepciones.js

/* =========================
   LISTAR
========================= */
export const listarRecepciones = async (buscar = '') => {
  return await window.api.listarRecepciones(buscar);
};

/* =========================
   CREAR
========================= */
export const crearRecepcionAPI = async (data) => {
  return await window.api.crearRecepcion(data);
};

/* =========================
   EDITAR
========================= */
export const editarRecepcionAPI = async (data) => {
  return await window.api.editarRecepcion(data);
};

/* =========================
   CAMBIAR ESTADO
========================= */
export const cambiarEstadoRecepcion = async (id, estado) => {
  return await window.api.cambiarEstadoRecepcion(id, estado);
};

export const historialRecepciones = async (id) => {
  return await window.api.historialRecepciones(id);
};

export const imprimirTutorAPI = async (data) => {
  return await window.api.imprimirTutor(data);
};
