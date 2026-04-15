export const listarRegistros = (pagina = 1, limite = 20) =>
  window.api.listarRegistros(pagina, limite);

export const filtrarRegistros = (filtro, pagina = 1, limite = 20) =>
  window.api.filtrarRegistros(filtro, pagina, limite);
