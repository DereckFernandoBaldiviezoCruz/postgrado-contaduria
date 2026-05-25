export const obtenerResumen = async (gestion, mes, programa) => {
  return await window.api.obtenerResumen(gestion, mes, programa);
};

export const obtenerPorMes = async (gestion) => {
  return await window.api.obtenerPorMes(gestion);
};

export const obtenerPorPrograma = async (gestion, mes) => {
  return await window.api.obtenerPorPrograma(gestion, mes);
};

export const obtenerCargaDocentes = async () => {
  return await window.api.obtenerCargaDocentes();
};

export const obtenerResumenPrograma = async (gestion, mes, programa) => {
  return await window.api.obtenerResumenPrograma(gestion, mes, programa);
};
