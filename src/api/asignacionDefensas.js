// api/asignacionDefensas.js

export const obtenerDefensas = async (buscar="") => {
  return await window.api.obtenerDefensas(buscar);
};

export const asignarFechaDefensa = async (data) => {
  return await window.api.asignarFechaDefensa(data);
};