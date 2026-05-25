import Sidebar from '../components/Sidebar';
import AreaSwitcher from '../components/AreaSwitcher';
import UpdateNotifier from '../components/UpdateNotifier';
import { Outlet } from 'react-router-dom';
import './layout.css';

export default function Layout({ usuario }) {
  return (
    <div className="layout">
      <Sidebar />

      <main className="contenido">
        <div className="update-container">
          <UpdateNotifier />
        </div>
        <div className="area-container">
          <AreaSwitcher usuario={usuario} />
        </div>

        <Outlet />
      </main>
    </div>
  );
}
