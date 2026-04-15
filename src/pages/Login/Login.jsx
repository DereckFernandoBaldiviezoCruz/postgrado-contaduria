import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../api/auth';

export default function Login({ setUsuario }) {
  const navigate = useNavigate();

  const [usuario, setUser] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const rutaInicialPorRol = (rol) => {
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
  };

  const entrar = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const u = await loginAPI(usuario, password);

      localStorage.setItem('usuario', JSON.stringify(u));
      setUsuario(u);

      if (u.area === 'MAESTRIAS') {
        await window.api.setArea('MAESTRIAS');
        navigate(rutaInicialPorRol(u.rol));
      } else if (u.area === 'DIPLOMADOS') {
        await window.api.setArea('DIPLOMADOS');
        navigate(rutaInicialPorRol(u.rol));
      } else {
        navigate('/elegir-area');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* LOGO */}

        <div className="login-logo">
          <img src="../public/logo.png" alt="logo" />
        </div>

        <h2>Sistema de Postgrado</h2>

        <form onSubmit={entrar}>
          {/* USUARIO */}

          <div className="input-group">
            <span className="icon">👤</span>

            <input
              style={{ marginBottom: '0px' }}
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          {/* PASSWORD */}

          <div className="input-group">
            <span className="icon">🔒</span>

            <input
              style={{ marginBottom: '0px' }}
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />

            <span className="show-pass" onClick={() => setShowPass(!showPass)}>
              {showPass ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 1l22 22" />
                  <path d="M10.58 10.58a2 2 0 002.83 2.83" />
                  <path d="M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4 10 7a13.16 13.16 0 01-2.16 3.19" />
                  <path d="M6.61 6.61A13.52 13.52 0 002 12c1 3 5 7 10 7a9.77 9.77 0 004.21-.91" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}
