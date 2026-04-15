// src/api/seguimiento.js

export const listarSeguimiento = async (buscar="") => {
  return await window.api.listarSeguimiento(buscar);
};

export const obtenerRecepciones = async (id) => {
  return await window.api.obtenerRecepcionesSeguimiento(id);
};

export const obtenerTribunal = async (id) => {
  return await window.api.obtenerTribunalSeguimiento(id);
};

export const aceptarTemaAPI = async (recepcion_id) => {
  return await window.api.aceptarTema(recepcion_id);
};

export const rechazarTemaAPI = async (recepcion_id) => {
  return await window.api.rechazarTema(recepcion_id);
};

export const imprimirAPI = async (data) => {
  return await window.api.imprimirSeguimiento(data);
};