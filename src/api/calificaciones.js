// api/calificaciones.js

export const obtenerCalificaciones = async (buscar="") => {
  return await window.api.obtenerCalificaciones(buscar);
};

export const guardarCalificacion = async (data) => {
  return await window.api.guardarCalificacion(data);
};