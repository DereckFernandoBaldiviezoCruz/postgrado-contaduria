const { ipcMain, dialog } = require('electron');

const estudiantes = require('./controllers/estudiantes.controller');
const defensas = require('./controllers/defensas.controller');
const docentes = require('./controllers/docentes.controller');
const carreras = require('./controllers/carreras.controller');
const programas = require('./controllers/programas.controller');
const recepciones = require('./controllers/recepciones.controller');
const seguimiento = require('./controllers/seguimiento.controller');
const tutores = require('./controllers/tutores.controller');
const impresion = require('./controllers/impresion.controller');
const asignacionDefensas = require('./controllers/asignacionDefensas.controller');
const {
  obtenerCalificaciones,
  guardarCalificacion,
} = require('./controllers/calificaciones.controller');
const auth = require('./controllers/auth.controller');
const usuarios = require('./controllers/usuarios.controller');
const auditoria = require('./controllers/auditoria.controller');
const segunda = require('./controllers/segunda.controller');
const reportes = require('./controllers/reportes.controller');

ipcMain.handle('auth:login', async (_, usuario, password) => {
  try {
    return await auth.login(usuario, password);
  } catch (error) {
    throw new Error(error.message);
  }
});

function registerIpc() {
  /* ================= ESTUDIANTES ================= */

  ipcMain.handle('estudiantes:listar', (_, buscar) =>
    estudiantes.listar(buscar),
  );

  ipcMain.handle('estudiantes:crear', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return estudiantes.crear(data, usuario);
  });

  ipcMain.handle('estudiantes:editar', (_, id, data) => {
    const usuario = global.usuarioActual?.id || null;

    return estudiantes.editar(id, data, usuario);
  });

  ipcMain.handle('estudiantes:eliminar', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return estudiantes.eliminar(id, usuario);
  });

  /* ================= DEFENSAS ================= */

  ipcMain.handle('defensas:listar', () => defensas.listarDefensas());

  ipcMain.handle('defensas:carga-docentes', () => defensas.cargaDocentes());

  ipcMain.handle('defensas:obtener-tribunal', (_, recepcion_id) =>
    defensas.obtenerTribunal(recepcion_id),
  );

  ipcMain.handle('defensas:guardar-tribunal', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return defensas.guardarTribunal(data, usuario);
  });

  /* ================= DOCENTES ================= */

  ipcMain.handle('docentes:listar', (_, buscar) => docentes.listar(buscar));

  ipcMain.handle('docentes:crear', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return docentes.crear(data, usuario);
  });

  ipcMain.handle('docentes:editar', (_, id, data) => {
    const usuario = global.usuarioActual?.id || null;

    return docentes.editar(id, data, usuario);
  });

  ipcMain.handle('docentes:eliminar', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return docentes.eliminar(id, usuario);
  });

  /* ================= CARRERAS ================= */

  ipcMain.handle('carreras:listar', () => carreras.listar());

  ipcMain.handle('carreras:crear', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return carreras.crear(data, usuario);
  });

  ipcMain.handle('carreras:editar', (_, id, data) => {
    const usuario = global.usuarioActual?.id || null;

    return carreras.editar(id, data, usuario);
  });

  ipcMain.handle('carreras:eliminar', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return carreras.eliminar(id, usuario);
  });

  /* ================= PROGRAMAS ================= */

  ipcMain.handle('programas:listar', () => programas.listar());

  ipcMain.handle('programas:crear', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return programas.crear(data, usuario);
  });

  ipcMain.handle('programas:editar', (_, id, data) => {
    const usuario = global.usuarioActual?.id || null;

    return programas.editar(id, data, usuario);
  });

  ipcMain.handle('programas:eliminar', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return programas.eliminar(id, usuario);
  });

  /* ================= RECEPCIONES ================= */

  ipcMain.handle('recepciones:listar', (_, buscar) =>
    recepciones.listar(buscar),
  );

  ipcMain.handle('recepciones:crear', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return recepciones.crear(data, usuario);
  });

  ipcMain.handle('recepciones:editar', (_, id, data) => {
    const usuario = global.usuarioActual?.id || null;

    return recepciones.editar(id, data, usuario);
  });

  ipcMain.handle('recepciones:cambiar-estado', (_, id, estado) => {
    const usuario = global.usuarioActual?.id || null;

    return recepciones.cambiarEstado(id, estado, usuario);
  });

  /* ================= SEGUIMIENTO ================= */

  ipcMain.handle('seguimiento:listar', (_, buscar) =>
    seguimiento.listar(buscar),
  );

  ipcMain.handle('seguimiento:obtener-recepciones', (_, id) =>
    seguimiento.obtenerRecepciones(id),
  );

  ipcMain.handle('seguimiento:obtener-tribunal', (_, id) =>
    seguimiento.obtenerTribunal(id),
  );

  ipcMain.handle('seguimiento:aceptar-tema', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return seguimiento.aceptarTema(id, usuario);
  });

  ipcMain.handle('seguimiento:imprimir', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return seguimiento.imprimir(data, usuario);
  });
  /* ================= TUTORES ================= */

  ipcMain.handle('tutores:listar', () => tutores.listar());

  ipcMain.handle('tutores:crear', (_, data) => {
    const usuario = global.usuarioActual?.id || null;

    return tutores.crear(data, usuario);
  });

  ipcMain.handle('tutores:editar', (_, id, data) => {
    const usuario = global.usuarioActual?.id || null;

    return tutores.editar(id, data, usuario);
  });

  ipcMain.handle('tutores:eliminar', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return tutores.eliminar(id, usuario);
  });

  /* ================= SISTEMA ================= */

  ipcMain.handle('seleccionar-carpeta', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('obtenerDefensas', async (_, buscar) => {
    return await asignacionDefensas.obtenerDefensas(buscar);
  });

  ipcMain.handle('asignarFechaDefensa', async (event, data) => {
    const usuario = global.usuarioActual;

    return await asignacionDefensas.asignarFechaDefensa(data, usuario.id);
  });

  ipcMain.handle('obtenerCalificaciones', async (_, buscar) => {
    return await obtenerCalificaciones(buscar);
  });

  ipcMain.handle('guardarCalificacion', async (event, data) => {
    const usuario = global.usuarioActual?.id || null;

    return await guardarCalificacion(data, usuario);
  });

  /* ================= USUARIOS ================= */

  ipcMain.handle('usuarios:listar', () => usuarios.listar());

  ipcMain.handle('usuarios:crear', (_, data) => usuarios.crear(data));

  ipcMain.handle('usuarios:editar', (_, id, data) => usuarios.editar(id, data));

  ipcMain.handle('usuarios:eliminar', (_, id) => usuarios.eliminar(id));

  ipcMain.handle('usuarios:actualizarPerfil', (event, data) =>
    usuarios.actualizarPerfil(data),
  );

  ipcMain.handle('recepciones:historial', async (_, estudiante_id) =>
    recepciones.historial(estudiante_id),
  );

  ipcMain.handle('seguimiento:rechazar-tema', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return seguimiento.rechazarTema(id, usuario);
  });

  ipcMain.handle('estudiantes:listarTodos', (_, buscar) =>
    estudiantes.listarTodos(buscar),
  );

  ipcMain.handle('estudiantes:estado', (_, id, estado) => {
    const usuario = global.usuarioActual?.id || null;

    return estudiantes.cambiarEstadoEstudiante(id, estado, usuario);
  });

  ipcMain.handle('programas:estado', (_, id, estado) => {
    const usuario = global.usuarioActual?.id || null;

    return programas.cambiarEstadoPrograma(id, estado, usuario);
  });

  ipcMain.handle('programas:listarTodos', () => {
    return programas.listarTodos();
  });

  ipcMain.handle('carreras:listarTodos', () => carreras.listarTodos());

  ipcMain.handle('carreras:estado', (_, id, estado) => {
    const usuario = global.usuarioActual?.id || null;

    return carreras.cambiarEstadoCarrera(id, estado, usuario);
  });

  ipcMain.handle('docentes:activar', (_, id) => {
    const usuario = global.usuarioActual?.id || null;

    return docentes.activar(id, usuario);
  });

  ipcMain.handle('docentes:listarActivos', () => docentes.listarActivos());
}

ipcMain.handle('auditoria:listar', (_, pagina, limite) => {
  return auditoria.listar(pagina, limite);
});

ipcMain.handle('auditoria:filtrar', (_, filtro, pagina, limite) => {
  return auditoria.filtrar(filtro, pagina, limite);
});

/* ================= AREA ================= */

ipcMain.handle('sistema:set-area', (_, area) => {
  global.areaActual = area;
  return true;
});

ipcMain.handle('sistema:get-area', () => {
  return global.areaActual || null;
});

ipcMain.handle('docentes:importar', async (event, datos) => {
  const usuario = global.usuarioActual;
  return await docentes.importar(datos, usuario.id);
});

ipcMain.handle('estudiantes:importar', async (event, datos) => {
  const usuario = global.usuarioActual;

  return await estudiantes.importar(datos, usuario.id);
});

ipcMain.handle('recepciones:imprimirTutor', async (_, data) => {
  try {
    return await impresion.imprimirTutor(data);
  } catch (error) {
    console.error('Error imprimir tutor:', error);
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('segunda:obtenerSegundaInstancia', (_, buscar) => {
  return segunda.obtenerSegundaInstancia(buscar);
});

ipcMain.handle('segunda:guardarSegundaInstancia', (_, data) => {
  const usuario = global.usuarioActual?.id || null;
  return segunda.guardarSegundaInstancia(data, usuario);
});

/* ================= REPORTES ================= */

ipcMain.handle('reportes:resumen', () => {
  return reportes.resumenGeneral();
});

ipcMain.handle('reportes:mes', () => {
  return reportes.recepcionesPorMes();
});

ipcMain.handle('reportes:programa', () => {
  return reportes.porPrograma();
});

ipcMain.handle('reportes:carga', () => {
  return reportes.cargaDocentes();
});

module.exports = registerIpc;
