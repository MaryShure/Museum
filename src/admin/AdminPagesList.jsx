import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPages,
  createPage,
  deletePage,
} from "../../server/src/api/pagesApi";

const emptyForm = {
  title: "",
  slug: "",
};

const AdminPagesList = () => {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadPages = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getPages();
      const list = Array.isArray(data) ? data : data.pages || [];
      setPages(list);
    } catch (err) {
      setError(err.message || "Не удалось загрузить список страниц");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug) return;

    try {
      setIsCreating(true);
      setError("");

      const payload = {
        title: form.title,
        slug: form.slug.trim(),
        route_path: form.slug.trim() === "main" ? "/" : `/${form.slug.trim()}`,
      };

      const created = await createPage(payload);

      setForm(emptyForm);
      await loadPages();

      navigate(`/admin/${created.slug}`);
    } catch (err) {
      setError(err.message || "Не удалось создать страницу");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePage = async (pageId, slug) => {
    if (!window.confirm("Удалить страницу и все её блоки?")) return;

    try {
      await deletePage(pageId);
      await loadPages();

      // если удаляем текущую страницу, уходим на главную админки
      // (список страниц)
      // slug проверим на всякий случай
      if (window.location.hash.includes(`#/admin/${slug}`)) {
        navigate("/admin");
      }
    } catch (err) {
      alert(err.message || "Не удалось удалить страницу");
    }
  };

  if (isLoading) {
    return <div className="builder-empty">Загрузка страниц...</div>;
  }

  return (
    <div className="builder-layout">
      <aside className="builder-sidebar">
        <div className="builder-panel-header">
          <h2>Страницы</h2>
        </div>

        {error ? <p className="builder-error-text">{error}</p> : null}

        <div className="builder-block-list">
          {pages.map((page) => (
            <div key={page.id} className="builder-block-item">
              <button
                type="button"
                className="builder-block-label"
                onClick={() => navigate(`/admin/${page.slug}`)}
              >
                <span className="builder-block-index">#</span>
                <span>
                  {page.title} ({page.slug})
                </span>
              </button>

              <button
                type="button"
                className="admin-button admin-button-ghost danger"
                onClick={() => handleDeletePage(page.id, page.slug)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="builder-canvas">
        <div className="builder-canvas-toolbar">
          <span className="builder-canvas-badge">Управление страницами</span>
        </div>

        <div className="builder-canvas-scroll">
          <div className="builder-preview-frame" style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 16 }}>Создать новую страницу</h2>
            <form
              onSubmit={handleCreatePage}
              className="builder-settings-body"
              style={{ maxWidth: 480 }}
            >
              <div className="builder-field">
                <label className="builder-label">Название страницы</label>
                <input
                  className="builder-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Например: Мероприятия"
                />
              </div>

              <div className="builder-field">
                <label className="builder-label">Slug (часть URL)</label>
                <input
                  className="builder-input"
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="Например: events"
                />
                <p className="builder-hint">
                  Итоговый путь будет{" "}
                  {form.slug
                    ? form.slug.trim() === "main"
                      ? "/"
                      : `/${form.slug.trim()}`
                    : "/slug"}
                </p>
              </div>

              <button
                type="submit"
                className="admin-button admin-button-primary"
                disabled={isCreating}
              >
                {isCreating ? "Создание..." : "Создать страницу"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <aside className="builder-settings">
        <div className="builder-panel-header">
          <h2>Подсказки</h2>
        </div>
        <div className="builder-settings-body">
          <p className="builder-settings-type">
            После создания страницы вы сможете добавить в неё блоки в редакторе.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default AdminPagesList;
