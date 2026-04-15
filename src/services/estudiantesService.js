const estudiantesService = {

  obtener: async () => {
    return await window.api.obtenerEstudiantes();
  }

};

export default estudiantesService;