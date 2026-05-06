import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import "../styles/admin.css";

const AdminLayout = () => {
  const location = useLocation();
  const { slug } = useParams();

  const currentBuilderPath = slug ? `/admin/${slug}` : "/admin/main";

  const isPagesRoute = location.pathname === "/admin";
  const isBuilderRoute =
    location.pathname.startsWith("/admin/") && location.pathname !== "/admin";

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-logo">CMS</div>

          <div className="admin-topbar-meta">
            <h1 className="admin-title">Панель управления</h1>
            <p className="admin-subtitle">
              Управление страницами и конструктором блоков
            </p>
          </div>

          <nav className="admin-topbar-nav" aria-label="Навигация админки">
            <Link
              to="/admin"
              className={`admin-nav-link ${isPagesRoute ? "is-active" : ""}`}
            >
              Страницы
            </Link>

            <Link
              to={currentBuilderPath}
              className={`admin-nav-link ${isBuilderRoute ? "is-active" : ""}`}
            >
              Конструктор
            </Link>
          </nav>
        </div>

        <div className="admin-topbar-actions">
          <Link to="/" className="admin-button admin-button-ghost">
            Открыть сайт
          </Link>
        </div>
      </header>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
