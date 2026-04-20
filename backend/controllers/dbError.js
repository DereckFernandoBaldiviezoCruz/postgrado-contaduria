function manejarErrorDB(error) {
  console.error('Error DB:', error);

  if (
    error.code === 'ENOTFOUND' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ECONNREFUSED'
  ) {
    throw new Error('Error de conexión con la base de datos');
  }

  throw new Error('Error interno del servidor');
}

module.exports = manejarErrorDB;
