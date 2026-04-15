import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './layout/Layout';
import Login from './pages/Login/Login';

import Estudiantes from './pages/Estudiantes/Estudiantes';
import Carreras from './pages/carreras/Carreras';
import Docentes from './pages/Docentes/Docentes';
import Programas from './pages/programas/Programas';
import Seguimiento from './pages/Seguimiento/Seguimiento';
import Recepciones from './pages/Recepciones/Recepciones';
import Defensas from './pages/defensas/Defensas';
import AsignacionDefensas from './pages/AsignacionDefensas/AsignacionDefensas';
import Calificar from './pages/Calificar/Calificar';
import Usuarios from './pages/Usuarios/Usuarios';
import Historial from './pages/Historial/Historial';
import EditarTribunales from './pages/Tribunales/EditarTribunales';
import Registros from './pages/Registros/Registros';
import ElegirArea from './pages/ElegirArea/ElegirArea';
import Fade from './components/Fade';
import SegundaInstancia from './pages/SegundaInstancia/SegundaInstancia';
import Reportes from './pages/Reportes/Reportes';

function rutaInicialPorRol(rol) {
  switch (rol) {
    case 'Administrador':
      return '/estudiantes';
    case 'Apoyo Logistico':
      return '/docentes';
    case 'Encargado de Recepciones':
      return '/recepciones';
    case 'Encargado de Tribunales':
      return '/defensas';
    default:
      return '/estudiantes';
  }
}

export default function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario')),
  );

  const [area, setArea] = useState(undefined);

  /* ===============================
     CARGAR AREA DESDE ELECTRON
  =============================== */

  useEffect(() => {
    const cargarArea = async () => {
      const a = await window.api.getArea();
      setArea(a);
    };

    cargarArea();
  }, []);

  return (
    <HashRouter>
      {!usuario ? (
        <Login setUsuario={setUsuario} />
      ) : area === undefined ? (
        <Fade>
          <div
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            Cargando sistema...
          </div>
        </Fade>
      ) : usuario.area === 'AMBOS' && area === null ? (
        /* NO HA ELEGIDO AREA */
        <Fade>
          <ElegirArea setArea={setArea} />
        </Fade>
      ) : (
        <Fade>
          <Routes>
            <Route
              path="/elegir-area"
              element={<ElegirArea setArea={setArea} />}
            />

            <Route path="/" element={<Layout usuario={usuario} />}>
              <Route
                index
                element={<Navigate to={rutaInicialPorRol(usuario.rol)} />}
              />

              <Route path="estudiantes" element={<Estudiantes />} />
              <Route path="carreras" element={<Carreras />} />
              <Route path="docentes" element={<Docentes />} />
              <Route path="programas" element={<Programas />} />
              <Route path="seguimiento" element={<Seguimiento />} />
              <Route path="recepciones" element={<Recepciones />} />
              <Route path="defensas" element={<Defensas />} />
              <Route
                path="asignaciondefensas"
                element={<AsignacionDefensas />}
              />
              <Route path="calificar" element={<Calificar />} />
              <Route path="segundaInstancia" element={<SegundaInstancia />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="historial" element={<Historial />} />
              <Route path="tribunales" element={<EditarTribunales />} />
              <Route path="registros" element={<Registros />} />
              <Route path="reportes" element={<Reportes />} />
            </Route>
          </Routes>
        </Fade>
      )}
    </HashRouter>
  );
}
