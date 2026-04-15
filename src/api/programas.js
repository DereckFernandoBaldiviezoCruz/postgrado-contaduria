// src/api/programas.js

/* ===============================
   LISTAR PROGRAMAS
================================ */
export const listarProgramas = async () => {
  return await window.api.listarProgramas();
};

/* ===============================
   CREAR PROGRAMA
================================ */
export const crearProgramaAPI = async (data) => {
  return await window.api.crearPrograma(data);
};

/* ===============================
   EDITAR PROGRAMA
================================ */
export const editarProgramaAPI = async (data) => {
  return await window.api.editarPrograma(data);
};

/* ===============================
   ELIMINAR PROGRAMA
================================ */
export const eliminarProgramaAPI = async (id) => {
  return await window.api.eliminarPrograma(id);
};

/* ===============================
   CAMBIAR ESTADO
================================ */
export const cambiarEstadoProgramaAPI = (id, estado) =>
  window.api.cambiarEstadoPrograma(id, estado);

/* ===============================
   LISTAR TODOS
================================ */
export const listarProgramasTodos = () => {
  return window.api.listarProgramasTodos();
};
