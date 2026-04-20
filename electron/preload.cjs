const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  /* ================= ESTUDIANTES ================= */

  listarEstudiantes: (buscar) =>
    ipcRenderer.invoke('estudiantes:listar', buscar),

  crearEstudiante: (data) => ipcRenderer.invoke('estudiantes:crear', data),

  editarEstudiante: (data) =>
    ipcRenderer.invoke('estudiantes:editar', data.id, data),

  eliminarEstudiante: (id) => ipcRenderer.invoke('estudiantes:eliminar', id),

  /* ================= DOCENTES ================= */

  listarDocentes: (buscar) => ipcRenderer.invoke('docentes:listar', buscar),

  crearDocente: (data) => ipcRenderer.invoke('docentes:crear', data),

  editarDocente: (data) => ipcRenderer.invoke('docentes:editar', data.id, data),

  eliminarDocente: (id) => ipcRenderer.invoke('docentes:eliminar', id),

  /* ================= CARRERAS ================= */

  listarCarreras: () => ipcRenderer.invoke('carreras:listar'),

  crearCarrera: (data) => ipcRenderer.invoke('carreras:crear', data),

  editarCarrera: (data) => ipcRenderer.invoke('carreras:editar', data.id, data),

  eliminarCarrera: (id) => ipcRenderer.invoke('carreras:eliminar', id),

  /* ================= PROGRAMAS ================= */

  listarProgramas: () => ipcRenderer.invoke('programas:listar'),

  crearPrograma: (data) => ipcRenderer.invoke('programas:crear', data),

  editarPrograma: (data) =>
    ipcRenderer.invoke('programas:editar', data.id, data),

  eliminarPrograma: (id) => ipcRenderer.invoke('programas:eliminar', id),

  /* ================= RECEPCIONES ================= */

  listarRecepciones: (buscar) =>
    ipcRenderer.invoke('recepciones:listar', buscar),

  crearRecepcion: (data) => ipcRenderer.invoke('recepciones:crear', data),

  editarRecepcion: (data) =>
    ipcRenderer.invoke('recepciones:editar', data.id, data),

  cambiarEstadoRecepcion: (id, estado) =>
    ipcRenderer.invoke('recepciones:cambiar-estado', id, estado),

  /* ================= DEFENSAS ================= */

  listarDefensas: () => ipcRenderer.invoke('defensas:listar'),

  listarCargaDocentes: () => ipcRenderer.invoke('defensas:carga-docentes'),

  obtenerTribunal: (id) => ipcRenderer.invoke('defensas:obtener-tribunal', id),

  guardarTribunal: (data) =>
    ipcRenderer.invoke('defensas:guardar-tribunal', data),

  /* ================= SEGUIMIENTO ================= */

  listarSeguimiento: (buscar) =>
    ipcRenderer.invoke('seguimiento:listar', buscar),

  obtenerRecepcionesSeguimiento: (id) =>
    ipcRenderer.invoke('seguimiento:obtener-recepciones', id),

  obtenerTribunalSeguimiento: (id) =>
    ipcRenderer.invoke('seguimiento:obtener-tribunal', id),

  aceptarTema: (recepcion_id) =>
    ipcRenderer.invoke('seguimiento:aceptar-tema', recepcion_id),

  imprimirSeguimiento: (data) =>
    ipcRenderer.invoke('seguimiento:imprimir', data),

  /* ================= TUTORES ================= */

  listarTutores: () => ipcRenderer.invoke('tutores:listar'),

  crearTutor: (data) => ipcRenderer.invoke('tutores:crear', data),

  editarTutor: (data) => ipcRenderer.invoke('tutores:editar', data.id, data),

  eliminarTutor: (id) => ipcRenderer.invoke('tutores:eliminar', id),

  /* ================= SISTEMA ================= */

  seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta'),

  obtenerDefensas: (buscar) => ipcRenderer.invoke('obtenerDefensas', buscar),

  asignarFechaDefensa: (data) =>
    ipcRenderer.invoke('asignarFechaDefensa', data),

  obtenerCalificaciones: (buscar) =>
    ipcRenderer.invoke('obtenerCalificaciones', buscar),

  guardarCalificacion: (data) =>
    ipcRenderer.invoke('guardarCalificacion', data),

  login: (usuario, password) =>
    ipcRenderer.invoke('auth:login', usuario, password),

  /* ================= USUARIOS ================= */

  listarUsuarios: () => ipcRenderer.invoke('usuarios:listar'),

  crearUsuario: (data) => ipcRenderer.invoke('usuarios:crear', data),

  editarUsuario: (data) => ipcRenderer.invoke('usuarios:editar', data.id, data),

  eliminarUsuario: (id) => ipcRenderer.invoke('usuarios:eliminar', id),

  actualizarPerfil: (data) =>
    ipcRenderer.invoke('usuarios:actualizarPerfil', data),

  historialRecepciones: (id) => ipcRenderer.invoke('recepciones:historial', id),

  rechazarTema: (recepcion_id) =>
    ipcRenderer.invoke('seguimiento:rechazar-tema', recepcion_id),

  listarTodos: (buscar) =>
    ipcRenderer.invoke('estudiantes:listarTodos', buscar),

  cambiarEstadoEstudiante: (id, estado) =>
    ipcRenderer.invoke('estudiantes:estado', id, estado),

  cambiarEstadoPrograma: (id, estado) =>
    ipcRenderer.invoke('programas:estado', id, estado),

  listarProgramasTodos: () => ipcRenderer.invoke('programas:listarTodos'),

  listarCarrerasTodos: () => ipcRenderer.invoke('carreras:listarTodos'),

  cambiarEstadoCarrera: (id, estado) =>
    ipcRenderer.invoke('carreras:estado', id, estado),

  activarDocente: (id) => ipcRenderer.invoke('docentes:activar', id),

  listarDocentesActivos: () => ipcRenderer.invoke('docentes:listarActivos'),

  listarRegistros: (pagina, limite) =>
    ipcRenderer.invoke('auditoria:listar', pagina, limite),

  filtrarRegistros: (filtro, pagina, limite) =>
    ipcRenderer.invoke('auditoria:filtrar', filtro, pagina, limite),

  /* ================= AREA ================= */

  setArea: (area) => ipcRenderer.invoke('sistema:set-area', area),

  getArea: () => ipcRenderer.invoke('sistema:get-area'),

  importarDocentes: (data) => ipcRenderer.invoke('docentes:importar', data),

  importarEstudiantes: (data) =>
    ipcRenderer.invoke('estudiantes:importar', data),

  imprimirTutor: (data) =>
    ipcRenderer.invoke('recepciones:imprimirTutor', data),

  obtenerSegundaInstancia: (buscar) =>
    ipcRenderer.invoke('segunda:obtenerSegundaInstancia', buscar),

  guardarSegundaInstancia: (data) =>
    ipcRenderer.invoke('segunda:guardarSegundaInstancia', data),

  obtenerResumen: () => ipcRenderer.invoke('reportes:resumen'),
  obtenerPorMes: () => ipcRenderer.invoke('reportes:mes'),
  obtenerPorPrograma: () => ipcRenderer.invoke('reportes:programa'),
  obtenerCargaDocentes: () => ipcRenderer.invoke('reportes:carga'),
  onMessage: (callback) => ipcRenderer.on('msg', callback),
});
