import { Outlet, Link, useLocation } from "react-router-dom";
import "../styles/admin.css";

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-logo">CMS</div>
          <div className="admin-topbar-meta">
            <h1 className="admin-title">Конструктор страниц</h1>
            <p className="admin-subtitle">{location.pathname}</p>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <Link to="/" className="admin-button admin-button-ghost">
            На сайт
          </Link>
          <button className="admin-button admin-button-secondary">
            Предпросмотр
          </button>
          <button className="admin-button admin-button-primary">
            Сохранить
          </button>
        </div>
      </header>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
