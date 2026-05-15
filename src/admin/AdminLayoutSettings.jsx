import { useEffect, useState } from "react";
import { getPages, uploadImage } from "../api/pagesApi";
import { getSiteSettings, updateSiteSettings } from "../api/siteSettingsApi";

const API_ORIGIN = "http://localhost:4000";

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createMenuItem = () => ({
  id: createId(),
  label: "Новый пункт",
  type: "link",
  pageId: null,
  url: "",
  dropdownItems: [],
});

const createDropdownItem = () => ({
  id: createId(),
  title: "Новый элемент",
  pageId: null,
  url: "",
  image: "",
});

const createFooterColumn = () => ({
  id: createId(),
  title: "Новая колонка",
  links: [],
});

const createFooterLink = () => ({
  id: createId(),
  label: "Новая ссылка",
  pageId: null,
  url: "",
});

const findPageById = (pages, pageId) =>
  pages.find((page) => Number(page.id) === Number(pageId)) || null;

const normalizeSettings = (data) => ({
  header_config: {
    logoLink: data?.header_config?.logoLink || "/",
    menuItems: data?.header_config?.menuItems || [],
    socials: data?.header_config?.socials || [
      { id: createId(), type: "instagram", url: "" },
      { id: createId(), type: "facebook", url: "" },
    ],
  },
  footer_config: {
    logoLink: data?.footer_config?.logoLink || "/",
    columns: data?.footer_config?.columns || [],
    socials: data?.footer_config?.socials || [
      { id: createId(), type: "instagram", url: "" },
      { id: createId(), type: "facebook", url: "" },
    ],
  },
});

const sectionTabStyle = (isActive) => ({
  cursor: "pointer",
  border: "1px solid var(--border-color, #e2e2e2)",
  background: isActive ? "var(--primary-50, #f6f2ed)" : "#fff",
  padding: "14px 16px",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  gap: 6,
});

const cardStyle = {
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 20,
  padding: 16,
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const nestedCardStyle = {
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 18,
  padding: 16,
  background: "rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const nestedInnerCardStyle = {
  border: "1px dashed rgba(0,0,0,0.14)",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const AdminLayoutSettings = () => {
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState(
    normalizeSettings({ header_config: {}, footer_config: {} }),
  );
  const [activeSection, setActiveSection] = useState("header");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [pagesData, settingsData] = await Promise.all([
          getPages(),
          getSiteSettings(),
        ]);

        const pagesList = Array.isArray(pagesData)
          ? pagesData
          : pagesData.pages || [];

        setPages(pagesList);
        setSettings(normalizeSettings(settingsData));
      } catch (err) {
        setError(err.message || "Не удалось загрузить настройки сайта");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      await updateSiteSettings(settings);
    } catch (err) {
      setError(err.message || "Не удалось сохранить настройки сайта");
    } finally {
      setIsSaving(false);
    }
  };

  const setHeaderConfig = (updater) => {
    setSettings((prev) => ({
      ...prev,
      header_config:
        typeof updater === "function" ? updater(prev.header_config) : updater,
    }));
  };

  const setFooterConfig = (updater) => {
    setSettings((prev) => ({
      ...prev,
      footer_config:
        typeof updater === "function" ? updater(prev.footer_config) : updater,
    }));
  };

  const updateHeaderMenuItem = (itemId, field, value) => {
    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateHeaderDropdownItem = (
    menuItemId,
    dropdownItemId,
    field,
    value,
  ) => {
    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === menuItemId
          ? {
              ...item,
              dropdownItems: (item.dropdownItems || []).map((dropdownItem) =>
                dropdownItem.id === dropdownItemId
                  ? { ...dropdownItem, [field]: value }
                  : dropdownItem,
              ),
            }
          : item,
      ),
    }));
  };

  const updateFooterColumn = (columnId, field, value) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId ? { ...column, [field]: value } : column,
      ),
    }));
  };

  const updateFooterLink = (columnId, linkId, field, value) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: (column.links || []).map((link) =>
                link.id === linkId ? { ...link, [field]: value } : link,
              ),
            }
          : column,
      ),
    }));
  };

  const handleHeaderMenuPageChange = (menuItemId, pageIdValue) => {
    const pageId = pageIdValue ? Number(pageIdValue) : null;
    const page = pageId ? findPageById(pages, pageId) : null;

    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === menuItemId
          ? {
              ...item,
              pageId,
              url: page?.route_path || item.url || "",
            }
          : item,
      ),
    }));
  };

  const handleHeaderDropdownPageChange = (
    menuItemId,
    dropdownItemId,
    pageIdValue,
  ) => {
    const pageId = pageIdValue ? Number(pageIdValue) : null;
    const page = pageId ? findPageById(pages, pageId) : null;

    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === menuItemId
          ? {
              ...item,
              dropdownItems: (item.dropdownItems || []).map((dropdownItem) =>
                dropdownItem.id === dropdownItemId
                  ? {
                      ...dropdownItem,
                      pageId,
                      url: page?.route_path || dropdownItem.url || "",
                    }
                  : dropdownItem,
              ),
            }
          : item,
      ),
    }));
  };

  const handleFooterLinkPageChange = (columnId, linkId, pageIdValue) => {
    const pageId = pageIdValue ? Number(pageIdValue) : null;
    const page = pageId ? findPageById(pages, pageId) : null;

    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: (column.links || []).map((link) =>
                link.id === linkId
                  ? {
                      ...link,
                      pageId,
                      url: page?.route_path || link.url || "",
                    }
                  : link,
              ),
            }
          : column,
      ),
    }));
  };

  const handleImageUpload = async (
    fieldKey,
    file,
    menuItemId,
    dropdownItemId,
  ) => {
    if (!file) return;

    try {
      setUploadingField(fieldKey);
      setError("");

      const result = await uploadImage(file);
      const imageUrl = `${API_ORIGIN}${result.url}`;

      updateHeaderDropdownItem(menuItemId, dropdownItemId, "image", imageUrl);
    } catch (err) {
      setError(err.message || "Не удалось загрузить изображение");
    } finally {
      setUploadingField("");
    }
  };

  if (isLoading) {
    return <div className="builder-empty">Загрузка настроек сайта...</div>;
  }

  return (
    <div className="builder-layout">
      <aside className="builder-sidebar">
        <div className="builder-panel-header">
          <h2>Секции</h2>
        </div>

        <div className="builder-block-list">
          <button
            type="button"
            style={sectionTabStyle(activeSection === "header")}
            onClick={() => setActiveSection("header")}
          >
            <strong>Header</strong>
            <span className="builder-hint">Навигация, dropdown и соцсети</span>
          </button>

          <button
            type="button"
            style={sectionTabStyle(activeSection === "footer")}
            onClick={() => setActiveSection("footer")}
          >
            <strong>Footer</strong>
            <span className="builder-hint">
              Колонки, ссылки и нижние соцсети
            </span>
          </button>
        </div>
      </aside>

      <section className="builder-canvas">
        <div className="builder-canvas-toolbar">
          <span className="builder-canvas-badge">
            {activeSection === "header"
              ? "Редактирование Header"
              : "Редактирование Footer"}
          </span>

          <button
            type="button"
            className="admin-button admin-button-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>

        <div className="builder-canvas-scroll">
          <div className="builder-preview-frame" style={{ padding: 24 }}>
            {error ? <p className="builder-error-text">{error}</p> : null}

            <div className="builder-settings-body" style={{ maxWidth: 920 }}>
              {activeSection === "header" ? (
                <>
                  <h2 style={{ marginBottom: 20 }}>Header</h2>

                  <div style={cardStyle}>
                    <div className="builder-field">
                      <label className="builder-label">Ссылка логотипа</label>
                      <input
                        className="builder-input"
                        type="text"
                        value={settings.header_config.logoLink || "/"}
                        onChange={(e) =>
                          setHeaderConfig((prev) => ({
                            ...prev,
                            logoLink: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div style={{ height: 20 }} />

                  <div style={cardStyle}>
                    <div className="builder-array-header">
                      <h3>Пункты меню</h3>
                      <button
                        type="button"
                        className="admin-button admin-button-secondary"
                        onClick={() =>
                          setHeaderConfig((prev) => ({
                            ...prev,
                            menuItems: [
                              ...(prev.menuItems || []),
                              createMenuItem(),
                            ],
                          }))
                        }
                      >
                        Добавить пункт
                      </button>
                    </div>

                    {(settings.header_config.menuItems || []).map(
                      (item, index) => (
                        <div key={item.id} style={nestedCardStyle}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              alignItems: "center",
                            }}
                          >
                            <strong>Пункт меню #{index + 1}</strong>
                            <span className="builder-hint">
                              {item.type === "dropdown"
                                ? "Пункт с выпадающим меню"
                                : "Обычная ссылка"}
                            </span>
                          </div>

                          <div className="builder-field">
                            <label className="builder-label">Название</label>
                            <input
                              className="builder-input"
                              value={item.label || ""}
                              onChange={(e) =>
                                updateHeaderMenuItem(
                                  item.id,
                                  "label",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="builder-field">
                            <label className="builder-label">Тип</label>
                            <select
                              className="builder-input"
                              value={item.type || "link"}
                              onChange={(e) =>
                                updateHeaderMenuItem(
                                  item.id,
                                  "type",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="link">Обычная ссылка</option>
                              <option value="dropdown">Dropdown</option>
                            </select>
                          </div>

                          <div className="builder-field">
                            <label className="builder-label">Страница</label>
                            <select
                              className="builder-input"
                              value={item.pageId ?? ""}
                              onChange={(e) =>
                                handleHeaderMenuPageChange(
                                  item.id,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Не выбрано</option>
                              {pages.map((page) => (
                                <option key={page.id} value={page.id}>
                                  {page.title} ({page.route_path || page.slug})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="builder-field">
                            <label className="builder-label">URL</label>
                            <input
                              className="builder-input"
                              value={item.url || ""}
                              onChange={(e) =>
                                updateHeaderMenuItem(
                                  item.id,
                                  "url",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {item.type === "dropdown" ? (
                            <div style={nestedInnerCardStyle}>
                              <div className="builder-array-header">
                                <h3>Элементы выпадающего меню</h3>
                                <button
                                  type="button"
                                  className="admin-button admin-button-secondary"
                                  onClick={() =>
                                    setHeaderConfig((prev) => ({
                                      ...prev,
                                      menuItems: prev.menuItems.map(
                                        (menuItem) =>
                                          menuItem.id === item.id
                                            ? {
                                                ...menuItem,
                                                dropdownItems: [
                                                  ...(menuItem.dropdownItems ||
                                                    []),
                                                  createDropdownItem(),
                                                ],
                                              }
                                            : menuItem,
                                      ),
                                    }))
                                  }
                                >
                                  Добавить элемент
                                </button>
                              </div>

                              {(item.dropdownItems || []).length === 0 ? (
                                <div className="builder-hint">
                                  Пока нет элементов dropdown.
                                </div>
                              ) : null}

                              {(item.dropdownItems || []).map(
                                (dropdownItem, subIndex) => (
                                  <div key={dropdownItem.id} style={cardStyle}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        alignItems: "center",
                                      }}
                                    >
                                      <strong>Элемент #{subIndex + 1}</strong>
                                      <span className="builder-hint">
                                        Карточка внутри dropdown
                                      </span>
                                    </div>

                                    <div className="builder-field">
                                      <label className="builder-label">
                                        Заголовок
                                      </label>
                                      <input
                                        className="builder-input"
                                        value={dropdownItem.title || ""}
                                        onChange={(e) =>
                                          updateHeaderDropdownItem(
                                            item.id,
                                            dropdownItem.id,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>

                                    <div className="builder-field">
                                      <label className="builder-label">
                                        Страница
                                      </label>
                                      <select
                                        className="builder-input"
                                        value={dropdownItem.pageId ?? ""}
                                        onChange={(e) =>
                                          handleHeaderDropdownPageChange(
                                            item.id,
                                            dropdownItem.id,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="">Не выбрано</option>
                                        {pages.map((page) => (
                                          <option key={page.id} value={page.id}>
                                            {page.title} (
                                            {page.route_path || page.slug})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="builder-field">
                                      <label className="builder-label">
                                        URL
                                      </label>
                                      <input
                                        className="builder-input"
                                        value={dropdownItem.url || ""}
                                        onChange={(e) =>
                                          updateHeaderDropdownItem(
                                            item.id,
                                            dropdownItem.id,
                                            "url",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>

                                    <div className="builder-field">
                                      <label className="builder-label">
                                        Изображение
                                      </label>
                                      <input
                                        className="builder-input"
                                        value={dropdownItem.image || ""}
                                        onChange={(e) =>
                                          updateHeaderDropdownItem(
                                            item.id,
                                            dropdownItem.id,
                                            "image",
                                            e.target.value,
                                          )
                                        }
                                      />

                                      <label
                                        className="builder-upload-button"
                                        style={{ marginTop: 12 }}
                                      >
                                        Загрузить с компьютера
                                        <input
                                          type="file"
                                          accept="image/*"
                                          style={{ display: "none" }}
                                          onChange={(e) =>
                                            handleImageUpload(
                                              `${item.id}-${dropdownItem.id}`,
                                              e.target.files?.[0],
                                              item.id,
                                              dropdownItem.id,
                                            )
                                          }
                                        />
                                      </label>

                                      {uploadingField ===
                                      `${item.id}-${dropdownItem.id}` ? (
                                        <div className="builder-upload-status">
                                          Загрузка...
                                        </div>
                                      ) : null}

                                      {dropdownItem.image ? (
                                        <div
                                          className="builder-image-preview"
                                          style={{
                                            marginTop: 12,
                                            maxWidth: 240,
                                          }}
                                        >
                                          <img
                                            src={dropdownItem.image}
                                            alt={
                                              dropdownItem.title ||
                                              "Dropdown item"
                                            }
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : null}
                        </div>
                      ),
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ marginBottom: 20 }}>Footer</h2>

                  <div style={cardStyle}>
                    <div className="builder-field">
                      <label className="builder-label">
                        Ссылка логотипа footer
                      </label>
                      <input
                        className="builder-input"
                        type="text"
                        value={settings.footer_config.logoLink || "/"}
                        onChange={(e) =>
                          setFooterConfig((prev) => ({
                            ...prev,
                            logoLink: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div style={{ height: 20 }} />

                  <div style={cardStyle}>
                    <div className="builder-array-header">
                      <h3>Колонки footer</h3>
                      <button
                        type="button"
                        className="admin-button admin-button-secondary"
                        onClick={() =>
                          setFooterConfig((prev) => ({
                            ...prev,
                            columns: [
                              ...(prev.columns || []),
                              createFooterColumn(),
                            ],
                          }))
                        }
                      >
                        Добавить колонку
                      </button>
                    </div>

                    {(settings.footer_config.columns || []).map(
                      (column, index) => (
                        <div key={column.id} style={nestedCardStyle}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              alignItems: "center",
                            }}
                          >
                            <strong>Колонка #{index + 1}</strong>
                            <span className="builder-hint">
                              Группа ссылок footer
                            </span>
                          </div>

                          <div className="builder-field">
                            <label className="builder-label">
                              Заголовок колонки
                            </label>
                            <input
                              className="builder-input"
                              value={column.title || ""}
                              onChange={(e) =>
                                updateFooterColumn(
                                  column.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div style={nestedInnerCardStyle}>
                            <div className="builder-array-header">
                              <h3>Ссылки</h3>
                              <button
                                type="button"
                                className="admin-button admin-button-secondary"
                                onClick={() =>
                                  setFooterConfig((prev) => ({
                                    ...prev,
                                    columns: prev.columns.map((item) =>
                                      item.id === column.id
                                        ? {
                                            ...item,
                                            links: [
                                              ...(item.links || []),
                                              createFooterLink(),
                                            ],
                                          }
                                        : item,
                                    ),
                                  }))
                                }
                              >
                                Добавить ссылку
                              </button>
                            </div>

                            {(column.links || []).length === 0 ? (
                              <div className="builder-hint">
                                В этой колонке пока нет ссылок.
                              </div>
                            ) : null}

                            {(column.links || []).map((link, linkIndex) => (
                              <div key={link.id} style={cardStyle}>
                                <strong>Ссылка #{linkIndex + 1}</strong>

                                <div className="builder-field">
                                  <label className="builder-label">
                                    Текст ссылки
                                  </label>
                                  <input
                                    className="builder-input"
                                    value={link.label || ""}
                                    onChange={(e) =>
                                      updateFooterLink(
                                        column.id,
                                        link.id,
                                        "label",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="builder-field">
                                  <label className="builder-label">
                                    Страница
                                  </label>
                                  <select
                                    className="builder-input"
                                    value={link.pageId ?? ""}
                                    onChange={(e) =>
                                      handleFooterLinkPageChange(
                                        column.id,
                                        link.id,
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">Не выбрано</option>
                                    {pages.map((page) => (
                                      <option key={page.id} value={page.id}>
                                        {page.title} (
                                        {page.route_path || page.slug})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="builder-field">
                                  <label className="builder-label">URL</label>
                                  <input
                                    className="builder-input"
                                    value={link.url || ""}
                                    onChange={(e) =>
                                      updateFooterLink(
                                        column.id,
                                        link.id,
                                        "url",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className="builder-settings">
        <div className="builder-panel-header">
          <h2>Подсказки</h2>
        </div>

        <div className="builder-settings-body">
          {activeSection === "header" ? (
            <>
              <p className="builder-settings-type">
                Header редактируется отдельно: логотип, ссылки и dropdown.
              </p>
              <p className="builder-settings-type">
                Вложенные элементы dropdown вынесены в отдельные карточки, чтобы
                структура меню читалась лучше.
              </p>
            </>
          ) : (
            <>
              <p className="builder-settings-type">
                Footer редактируется отдельно по колонкам.
              </p>
              <p className="builder-settings-type">
                Каждая колонка содержит собственный набор ссылок.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default AdminLayoutSettings;
