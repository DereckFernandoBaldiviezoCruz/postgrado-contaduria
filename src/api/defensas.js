// api/defensas.js

export const listarDefensas = async () => {
  return await window.api.listarDefensas();
};

export const listarCargaDocentes = async (docenteExcluir) => {
  return await window.api.listarCargaDocentes(docenteExcluir);
};

export const obtenerTribunal = async (id) => {
  return await window.api.obtenerTribunal(id);
};

export const guardarTribunalAPI = async (data) => {
  return await window.api.guardarTribunal(data);
};
