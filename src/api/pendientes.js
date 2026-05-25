export const obtenerPendientes = async () => {
  return await window.api.obtenerPendientes();
};

export const obtenerPendientesPorAreas = async () => {
  const data = await window.api.obtenerPendientesPorAreas();
  return data;
};
