/* =========================
   LISTAR
========================= */
export const listarUsuarios = async () => {
  return await window.api.listarUsuarios();
};

/* =========================
   CREAR
========================= */
export const crearUsuarioAPI = async (data) => {
  return await window.api.crearUsuario(data);
};

/* =========================
   EDITAR
========================= */
export const editarUsuarioAPI = async (data) => {
  return await window.api.editarUsuario(data);
};

/* =========================
   ELIMINAR
========================= */
export const eliminarUsuarioAPI = async (id) => {
  return await window.api.eliminarUsuario(id);
};

/* =========================
   PERFIL USUARIO
========================= */
export const actualizarPerfilAPI = async (data) => {
  return await window.api.actualizarPerfil(data);
};