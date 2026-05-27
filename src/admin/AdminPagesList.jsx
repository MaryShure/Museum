import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  getPages,
  createPage,
  updatePage,
  deletePage,
  uploadImage,
} from "../api/pagesApi";

const API_ORIGIN = "http://localhost:4000";

const emptyForm = {
  id: null,
  title: "",
  slug: "",
  route_path: "",
  status: "draft",
  page_type: "custom",
  preview_image: "",
};

const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
};

const buildRoutePath = (slug) => {
  const trimmed = slug.trim();
  if (!trimmed) return "";
  return trimmed === "main" ? "/" : `/${trimmed}`;
};

const normalizePage = (page) => ({
  ...page,
  preview_image: page.preview_image || "",
  status: page.status || "draft",
  page_type: page.page_type || "custom",
});

const AdminPagesList = () => {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || null,
    [pages, selectedPageId],
  );

  const loadPages = async (preserveSelection = true) => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getPages();
      const list = (Array.isArray(data) ? data : data.pages || []).map(
        normalizePage,
      );

      setPages(list);

      if (!preserveSelection) {
        return list;
      }

      if (selectedPageId) {
        const stillSelected = list.find((page) => page.id === selectedPageId);

        if (stillSelected) {
          setForm({
            id: stillSelected.id,
            title: stillSelected.title || "",
            slug: stillSelected.slug || "",
            route_path: stillSelected.route_path || "",
            status: stillSelected.status || "draft",
            page_type: stillSelected.page_type || "custom",
            preview_image: stillSelected.preview_image || "",
          });
          return list;
        }
      }

      if (list.length > 0) {
        const firstPage = list[0];
        setSelectedPageId(firstPage.id);
        setForm({
          id: firstPage.id,
          title: firstPage.title || "",
          slug: firstPage.slug || "",
          route_path: firstPage.route_path || "",
          status: firstPage.status || "draft",
          page_type: firstPage.page_type || "custom",
          preview_image: firstPage.preview_image || "",
        });
      } else {
        setSelectedPageId(null);
        setForm(emptyForm);
      }

      return list;
    } catch (err) {
      setError(err.message || "Не удалось загрузить список страниц");
      return [];
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

  const handleSelectPage = (page) => {
    const normalized = normalizePage(page);
    setSelectedPageId(normalized.id);
    setError("");
    setForm({
      id: normalized.id,
      title: normalized.title || "",
      slug: normalized.slug || "",
      route_path: normalized.route_path || "",
      status: normalized.status || "draft",
      page_type: normalized.page_type || "custom",
      preview_image: normalized.preview_image || "",
    });
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Заполни название страницы и slug");
      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        route_path: form.route_path.trim() || buildRoutePath(form.slug),
        status: form.status || "draft",
        page_type: form.page_type || "custom",
        preview_image: form.preview_image || "",
      };

      const created = await createPage(payload);
      setForm(emptyForm);

      const list = await loadPages(false);
      const createdPage = list.find((page) => page.id === created.id);

      if (createdPage) {
        handleSelectPage(createdPage);
      }

      navigate(`/admin/${created.slug}`);
    } catch (err) {
      setError(err.message || "Не удалось создать страницу");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSavePage = async () => {
    if (!form.id) return;

    if (!form.title.trim() || !form.slug.trim() || !form.route_path.trim()) {
      setError("title, slug и route_path обязательны");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const updated = await updatePage(form.id, {
        title: form.title.trim(),
        slug: form.slug.trim(),
        route_path: form.route_path.trim(),
        status: form.status,
        page_type: form.page_type,
        preview_image: form.preview_image || "",
      });

      const normalizedUpdated = normalizePage(updated);

      setPages((prev) =>
        prev.map((page) =>
          page.id === normalizedUpdated.id ? normalizedUpdated : page,
        ),
      );

      setSelectedPageId(normalizedUpdated.id);
      setForm({
        id: normalizedUpdated.id,
        title: normalizedUpdated.title || "",
        slug: normalizedUpdated.slug || "",
        route_path: normalizedUpdated.route_path || "",
        status: normalizedUpdated.status || "draft",
        page_type: normalizedUpdated.page_type || "custom",
        preview_image: normalizedUpdated.preview_image || "",
      });
    } catch (err) {
      setError(err.message || "Не удалось сохранить страницу");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (pageId, slug) => {
    if (!window.confirm("Удалить страницу и все её блоки?")) return;

    try {
      setError("");
      await deletePage(pageId);

      const list = await loadPages(false);

      if (selectedPageId === pageId) {
        if (list.length > 0) {
          handleSelectPage(list[0]);
        } else {
          setSelectedPageId(null);
          setForm(emptyForm);
        }
      }

      if (window.location.hash.includes(`#/admin/${slug}`)) {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.message || "Не удалось удалить страницу");
    }
  };

  const handlePreviewUpload = async (file) => {
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setError("");
      const result = await uploadImage(file);
      handleChange("preview_image", `${API_ORIGIN}${result.url}`);
    } catch (err) {
      setError(err.message || "Не удалось загрузить изображение");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleResetForm = () => {
    setSelectedPageId(null);
    setError("");
    setForm({
      ...emptyForm,
      status: "draft",
      page_type: "custom",
    });
  };

  if (isLoading) {
    return <div className="builder-empty">Загрузка...</div>;
  }

  return (
    <div className="admin-page-root">
      <div className="builder-layout">
        <aside className="builder-sidebar">
          <div className="builder-panel-header">
            <h2>Страницы</h2>
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={handleResetForm}
            >
              Новая
            </button>
          </div>

          {error ? <p className="builder-error-text">{error}</p> : null}

          <div className="builder-block-list">
            {pages.map((page) => {
              const previewUrl = resolveMediaUrl(page.preview_image);

              return (
                <div
                  key={page.id}
                  className={`builder-block-item ${
                    selectedPageId === page.id ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectPage(page)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    {previewUrl ? (
                      <div className="builder-page-preview">
                        <img src={previewUrl} alt={page.title} />
                      </div>
                    ) : null}

                    <div>
                      <strong>{page.title}</strong>
                      <div className="builder-block-meta">
                        {page.slug} · {page.route_path}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/${page.slug}`);
                      }}
                    >
                      Редактировать блоки
                    </button>

                    <button
                      type="button"
                      className="admin-button admin-button-ghost danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id, page.slug);
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="builder-canvas">
          <div className="builder-canvas-toolbar">
            <span className="builder-canvas-badge">
              {form.id ? "Редактирование страницы" : "Создание страницы"}
            </span>
            <div className="builder-canvas-status">
              Базовые настройки страницы
            </div>
          </div>

          <div className="builder-canvas-scroll">
            <div className="builder-preview-frame" style={{ padding: 24 }}>
              <h2 style={{ marginBottom: 16 }}>
                {form.id ? "Настройки страницы" : "Новая страница"}
              </h2>

              <form
                onSubmit={handleCreatePage}
                className="builder-settings-body"
                style={{ maxWidth: 640 }}
              >
                <div className="builder-field">
                  <label className="builder-label">Название</label>
                  <input
                    className="builder-input"
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Главная"
                  />
                </div>

                <div className="builder-field">
                  <label className="builder-label">Slug</label>
                  <input
                    className="builder-input"
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      const nextSlug = e.target.value;
                      handleChange("slug", nextSlug);
                      if (!form.id) {
                        handleChange("route_path", buildRoutePath(nextSlug));
                      }
                    }}
                    placeholder="main"
                  />
                </div>

                <div className="builder-field">
                  <label className="builder-label">Route path</label>
                  <input
                    className="builder-input"
                    type="text"
                    value={form.route_path}
                    onChange={(e) => handleChange("route_path", e.target.value)}
                    placeholder="/"
                  />
                  <p className="builder-help-text">
                    Если оставить пустым при создании, путь соберётся из slug.
                  </p>
                </div>

                <div className="builder-field">
                  <label className="builder-label">Статус</label>
                  <select
                    className="builder-input"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>
                </div>

                <div className="builder-field">
                  <label className="builder-label">Тип страницы</label>
                  <select
                    className="builder-input"
                    value={form.page_type}
                    onChange={(e) => handleChange("page_type", e.target.value)}
                  >
                    <option value="custom">custom</option>
                    <option value="system">system</option>
                  </select>
                </div>

                <div className="builder-field">
                  <label className="builder-label">Preview image</label>
                  <input
                    className="builder-input"
                    type="text"
                    value={form.preview_image}
                    onChange={(e) =>
                      handleChange("preview_image", e.target.value)
                    }
                    placeholder="URL изображения"
                  />

                  <label
                    className="builder-upload-button"
                    style={{ marginTop: 12 }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handlePreviewUpload(e.target.files?.[0])}
                    />
                    Загрузить изображение
                  </label>

                  {isUploadingImage ? (
                    <div className="builder-upload-status">Загрузка...</div>
                  ) : null}

                  {form.preview_image ? (
                    <div
                      className="builder-image-preview"
                      style={{ marginTop: 12, maxWidth: 360 }}
                    >
                      <img
                        src={resolveMediaUrl(form.preview_image)}
                        alt="Preview"
                      />
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className="admin-button admin-button-primary"
                    disabled={isCreating}
                  >
                    {isCreating ? "Создание..." : "Создать страницу"}
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={handleSavePage}
                    disabled={!form.id || isSaving}
                  >
                    {isSaving ? "Сохранение..." : "Сохранить"}
                  </button>

                  {selectedPage ? (
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={() => navigate(`/admin/${selectedPage.slug}`)}
                    >
                      Перейти к блокам
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </section>

        <aside className="builder-settings">
          <div className="builder-panel-header">
            <h2>Подсказка</h2>
          </div>

          <div className="builder-settings-body">
            <p className="builder-settings-type">
              Здесь ты задаёшь базовые параметры страницы: название, slug,
              конечный URL, статус и превью.
            </p>

            <p className="builder-settings-type">
              После сохранения можно перейти в редактор блоков и наполнить
              страницу контентом.
            </p>

            <p className="builder-settings-type">
              Для бронирований теперь доступны отдельные разделы сверху:
              «Календарь» и «Заявки».
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminPagesList;
