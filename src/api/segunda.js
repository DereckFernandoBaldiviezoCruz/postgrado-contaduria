export const obtenerSegundaInstancia = async (buscar = '') => {
  return await window.api.obtenerSegundaInstancia(buscar);
};

export const guardarSegundaInstancia = async (data) => {
  return await window.api.guardarSegundaInstancia(data);
};
