import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Введите email и пароль");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await login({
        email: email.trim(),
        password,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Не удалось войти");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Вход в админ-панель</h1>
        <p>Введите данные администратора для доступа к управлению сайтом.</p>

        {error ? <p className="builder-error-text">{error}</p> : null}

        <form onSubmit={handleSubmit} className="builder-settings-body">
          <div className="builder-field">
            <label className="builder-label">Email</label>
            <input
              className="builder-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="builder-field">
            <label className="builder-label">Пароль</label>
            <input
              className="builder-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="admin-button admin-button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
