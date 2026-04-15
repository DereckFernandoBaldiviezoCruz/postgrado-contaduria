import { useState, useEffect } from 'react';
import ModalPerfil from '../components/ModalPerfil';
import './Sidebar.css';
import { useLocation } from 'react-router-dom';
import {
  FiUsers,
  FiFolder,
  FiFileText,
  FiEdit,
  FiBarChart2,
  FiStar,
  FiPlusCircle,
} from 'react-icons/fi';
export default function Sidebar() {
  const [perfilOpen, setPerfilOpen] = useState(false);
  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('area');
    window.location.reload();
  };
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  // Detecta la ruta actual (#/estudiantes, etc)

  const location = useLocation();

  const linkClass = (ruta) =>
    location.pathname === ruta.replace('#', '')
      ? 'menu-item active'
      : 'menu-item';

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="logo">
        <img src="./logo.png" alt="logo" />

        <div className="logo-title">
          Unidad de Posgrado de la Facultad de Contaduría Pública
        </div>

        <div
          style={{ padding: '10px' }}
          className="user-info"
          onClick={() => setPerfilOpen(true)}
        >
          👤 {usuario?.nombre}
        </div>
      </div>

      {/* MENU SCROLLABLE */}
      <nav className="menu">
        {/* DOCENTES */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Apoyo Logistico') && (
          <a href="#/docentes" className={linkClass('#/docentes')}>
            <FiUsers size={20} />
            Docentes
          </a>
        )}

        {/* ESTUDIANTES */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Apoyo Logistico' ||
          usuario?.rol === 'Encargado de Recepciones') && (
          <a href="#/estudiantes" className={linkClass('#/estudiantes')}>
            <FiUsers size={20} />
            Estudiantes
          </a>
        )}

        {/* RECEPCIONES */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Recepciones') && (
          <a href="#/recepciones" className={linkClass('#/recepciones')}>
            <FiFileText size={20} />
            Recepciones
          </a>
        )}

        {/* TRIBUNALES - ASIGNAR */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Tribunales') && (
          <a href="#/defensas" className={linkClass('#/defensas')}>
            <FiPlusCircle size={20} />
            Asignar Tribunales
          </a>
        )}

        {/* TRIBUNALES - EDITAR */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Tribunales') && (
          <a href="#/tribunales" className={linkClass('#/tribunales')}>
            <FiEdit size={20} />
            Editar Tribunales
          </a>
        )}

        {/* SEGUIMIENTO */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Recepciones') && (
          <a href="#/seguimiento" className={linkClass('#/seguimiento')}>
            <FiBarChart2 size={20} />
            Seguimiento
          </a>
        )}

        {/* ASIGNACIÓN DEFENSAS */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Recepciones') && (
          <a
            href="#/asignacionDefensas"
            className={linkClass('#/asignacionDefensas')}
          >
            <FiEdit size={20} />
            Asignación de Defensas
          </a>
        )}

        {/* CALIFICAR */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Recepciones') && (
          <a href="#/calificar" className={linkClass('#/calificar')}>
            <FiStar size={20} />
            Calificar
          </a>
        )}

        {/* Segunda Instancia */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Encargado de Recepciones') && (
          <a
            href="#/segundaInstancia"
            className={linkClass('#/segundaInstancia')}
          >
            <FiStar size={20} />
            Segunda Instancia
          </a>
        )}

        {/* HISTORIAL */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Apoyo Logistico') && (
          <a href="#/historial" className={linkClass('#/historial')}>
            <FiFileText size={20} />
            Historial
          </a>
        )}

        {/* PROGRAMAS */}
        {(usuario?.rol === 'Administrador' ||
          usuario?.rol === 'Apoyo Logistico') && (
          <a href="#/programas" className={linkClass('#/programas')}>
            <FiFolder size={20} />
            Programas
          </a>
        )}

        {/* CARRERAS */}
        {usuario?.rol === 'Administrador' && (
          <a href="#/carreras" className={linkClass('#/carreras')}>
            <FiFolder size={20} />
            Carreras
          </a>
        )}

        {/* USUARIOS */}
        {usuario?.rol === 'Administrador' && (
          <a href="#/usuarios" className={linkClass('#/usuarios')}>
            <FiUsers size={20} />
            Usuarios
          </a>
        )}

        {/* Registros */}
        {usuario?.rol === 'Administrador' && (
          <a href="#/registros" className={linkClass('#/registros')}>
            <FiUsers size={20} />
            Registros
          </a>
        )}

        {/* REPORTES (TODOS) */}
        <a href="#/reportes" className={linkClass('#/reportes')}>
          <FiUsers size={20} />
          Reportes
        </a>
      </nav>

      {/* BOTÓN FIJO ABAJO */}
      <button className="logout-btn" onClick={cerrarSesion}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-log-out"
          aria-hidden="true"
        >
          <path d="m16 17 5-5-5-5"></path>
          <path d="M21 12H9"></path>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        </svg>
        <span>Cerrar Sesión</span>
      </button>
      <ModalPerfil
        abierto={perfilOpen}
        cerrar={() => setPerfilOpen(false)}
        usuario={usuario}
      />
    </aside>
  );
}
