import { useEffect, useMemo, useState } from "react";
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
    logoUrl: data?.header_config?.logoUrl || "",
    menuItems: data?.header_config?.menuItems || [],
    socials: data?.header_config?.socials || [
      { id: createId(), type: "instagram", url: "" },
      { id: createId(), type: "facebook", url: "" },
    ],
  },
  footer_config: {
    logoLink: data?.footer_config?.logoLink || "/",
    logoUrl: data?.footer_config?.logoUrl || "",
    columns: data?.footer_config?.columns || [],
    socials: data?.footer_config?.socials || [
      { id: createId(), type: "instagram", url: "" },
      { id: createId(), type: "facebook", url: "" },
    ],
  },
});

const moveItem = (list, fromIndex, toIndex) => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const AdminLayoutSettings = () => {
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState(
    normalizeSettings({ header_config: {}, footer_config: {} }),
  );
  const [activeSection, setActiveSection] = useState("header");
  const [selectedNode, setSelectedNode] = useState({
    type: "header-root",
    id: "header-root",
  });
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

  useEffect(() => {
    setSelectedNode(
      activeSection === "header"
        ? { type: "header-root", id: "header-root" }
        : { type: "footer-root", id: "footer-root" },
    );
  }, [activeSection]);

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

  const addMenuItem = () => {
    const item = createMenuItem();

    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: [...(prev.menuItems || []), item],
    }));

    setSelectedNode({ type: "menu-item", id: item.id });
  };

  const addDropdownItem = (menuItemId) => {
    const item = createDropdownItem();

    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((menuItem) =>
        menuItem.id === menuItemId
          ? {
              ...menuItem,
              dropdownItems: [...(menuItem.dropdownItems || []), item],
            }
          : menuItem,
      ),
    }));

    setSelectedNode({
      type: "dropdown-item",
      id: item.id,
      parentId: menuItemId,
    });
  };

  const addFooterColumn = () => {
    const column = createFooterColumn();

    setFooterConfig((prev) => ({
      ...prev,
      columns: [...(prev.columns || []), column],
    }));

    setSelectedNode({ type: "footer-column", id: column.id });
  };

  const addFooterLink = (columnId) => {
    const link = createFooterLink();

    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: [...(column.links || []), link],
            }
          : column,
      ),
    }));

    setSelectedNode({ type: "footer-link", id: link.id, parentId: columnId });
  };

  const removeMenuItem = (itemId) => {
    if (!window.confirm("Удалить этот пункт меню?")) return;

    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((item) => item.id !== itemId),
    }));
    setSelectedNode({ type: "header-root", id: "header-root" });
  };

  const removeDropdownItem = (menuItemId, dropdownItemId) => {
    if (!window.confirm("Удалить этот элемент dropdown?")) return;

    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item.id === menuItemId
          ? {
              ...item,
              dropdownItems: (item.dropdownItems || []).filter(
                (dropdownItem) => dropdownItem.id !== dropdownItemId,
              ),
            }
          : item,
      ),
    }));
    setSelectedNode({ type: "menu-item", id: menuItemId });
  };

  const removeFooterColumn = (columnId) => {
    if (!window.confirm("Удалить эту колонку footer?")) return;

    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((column) => column.id !== columnId),
    }));
    setSelectedNode({ type: "footer-root", id: "footer-root" });
  };

  const removeFooterLink = (columnId, linkId) => {
    if (!window.confirm("Удалить эту ссылку footer?")) return;

    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: (column.links || []).filter((link) => link.id !== linkId),
            }
          : column,
      ),
    }));
    setSelectedNode({ type: "footer-column", id: columnId });
  };

  const moveMenuItemUp = (itemId) => {
    setHeaderConfig((prev) => {
      const index = prev.menuItems.findIndex((item) => item.id === itemId);
      return { ...prev, menuItems: moveItem(prev.menuItems, index, index - 1) };
    });
  };

  const moveMenuItemDown = (itemId) => {
    setHeaderConfig((prev) => {
      const index = prev.menuItems.findIndex((item) => item.id === itemId);
      return { ...prev, menuItems: moveItem(prev.menuItems, index, index + 1) };
    });
  };

  const moveDropdownItemUp = (menuItemId, dropdownItemId) => {
    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) => {
        if (item.id !== menuItemId) return item;
        const index = (item.dropdownItems || []).findIndex(
          (el) => el.id === dropdownItemId,
        );
        return {
          ...item,
          dropdownItems: moveItem(item.dropdownItems || [], index, index - 1),
        };
      }),
    }));
  };

  const moveDropdownItemDown = (menuItemId, dropdownItemId) => {
    setHeaderConfig((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) => {
        if (item.id !== menuItemId) return item;
        const index = (item.dropdownItems || []).findIndex(
          (el) => el.id === dropdownItemId,
        );
        return {
          ...item,
          dropdownItems: moveItem(item.dropdownItems || [], index, index + 1),
        };
      }),
    }));
  };

  const moveFooterColumnUp = (columnId) => {
    setFooterConfig((prev) => {
      const index = prev.columns.findIndex((column) => column.id === columnId);
      return { ...prev, columns: moveItem(prev.columns, index, index - 1) };
    });
  };

  const moveFooterColumnDown = (columnId) => {
    setFooterConfig((prev) => {
      const index = prev.columns.findIndex((column) => column.id === columnId);
      return { ...prev, columns: moveItem(prev.columns, index, index + 1) };
    });
  };

  const moveFooterLinkUp = (columnId, linkId) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) => {
        if (column.id !== columnId) return column;
        const index = (column.links || []).findIndex(
          (link) => link.id === linkId,
        );
        return {
          ...column,
          links: moveItem(column.links || [], index, index - 1),
        };
      }),
    }));
  };

  const moveFooterLinkDown = (columnId, linkId) => {
    setFooterConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((column) => {
        if (column.id !== columnId) return column;
        const index = (column.links || []).findIndex(
          (link) => link.id === linkId,
        );
        return {
          ...column,
          links: moveItem(column.links || [], index, index + 1),
        };
      }),
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

  const selectedEntity = useMemo(() => {
    if (selectedNode.type === "header-root") return { type: "header-root" };
    if (selectedNode.type === "footer-root") return { type: "footer-root" };

    if (selectedNode.type === "menu-item") {
      const item = settings.header_config.menuItems.find(
        (item) => item.id === selectedNode.id,
      );
      return item ? { type: "menu-item", item } : null;
    }

    if (selectedNode.type === "dropdown-item") {
      for (const item of settings.header_config.menuItems) {
        const dropdownItem = (item.dropdownItems || []).find(
          (child) => child.id === selectedNode.id,
        );
        if (dropdownItem) {
          return { type: "dropdown-item", item, dropdownItem };
        }
      }
    }

    if (selectedNode.type === "footer-column") {
      const column = settings.footer_config.columns.find(
        (column) => column.id === selectedNode.id,
      );
      return column ? { type: "footer-column", column } : null;
    }

    if (selectedNode.type === "footer-link") {
      for (const column of settings.footer_config.columns) {
        const link = (column.links || []).find(
          (child) => child.id === selectedNode.id,
        );
        if (link) {
          return { type: "footer-link", column, link };
        }
      }
    }

    return null;
  }, [selectedNode, settings]);

  const selectedTitle = useMemo(() => {
    if (!selectedEntity) return "Ничего не выбрано";
    if (selectedEntity.type === "header-root") return "Header";
    if (selectedEntity.type === "footer-root") return "Footer";
    if (selectedEntity.type === "menu-item")
      return selectedEntity.item.label || "Пункт меню";
    if (selectedEntity.type === "dropdown-item") {
      return selectedEntity.dropdownItem.title || "Элемент dropdown";
    }
    if (selectedEntity.type === "footer-column") {
      return selectedEntity.column.title || "Колонка footer";
    }
    if (selectedEntity.type === "footer-link") {
      return selectedEntity.link.label || "Ссылка footer";
    }
    return "Элемент";
  }, [selectedEntity]);

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
            className={`builder-block-item ${activeSection === "header" ? "is-active" : ""}`}
            onClick={() => setActiveSection("header")}
          >
            Header
          </button>

          <button
            type="button"
            className={`builder-block-item ${activeSection === "footer" ? "is-active" : ""}`}
            onClick={() => setActiveSection("footer")}
          >
            Footer
          </button>
        </div>
      </aside>

      <section className="builder-canvas">
        <div className="builder-canvas-toolbar">
          <span className="builder-canvas-badge">
            {activeSection === "header"
              ? "Структура Header"
              : "Структура Footer"}
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

            {activeSection === "header" ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  className={`builder-block-item ${
                    selectedNode.type === "header-root" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setSelectedNode({ type: "header-root", id: "header-root" })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <strong>Header</strong>
                  <div className="builder-hint">Корневые настройки header</div>
                </div>

                {(settings.header_config.menuItems || []).map((item, index) => (
                  <div key={item.id}>
                    <div
                      className={`builder-block-item ${
                        selectedNode.type === "menu-item" &&
                        selectedNode.id === item.id
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedNode({ type: "menu-item", id: item.id })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="builder-block-label"
                        style={{ textAlign: "left", width: "100%" }}
                      >
                        <strong>
                          {index + 1}. {item.label || "Без названия"}
                        </strong>
                        <div className="builder-hint">
                          {item.type === "dropdown" ? "Dropdown" : "Ссылка"}
                        </div>
                      </div>
                    </div>

                    {item.type === "dropdown" &&
                    (item.dropdownItems || []).length > 0 ? (
                      <div
                        style={{
                          marginTop: 10,
                          marginLeft: 24,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {(item.dropdownItems || []).map(
                          (dropdownItem, subIndex) => (
                            <div
                              key={dropdownItem.id}
                              className={`builder-block-item ${
                                selectedNode.type === "dropdown-item" &&
                                selectedNode.id === dropdownItem.id
                                  ? "is-active"
                                  : ""
                              }`}
                              style={{
                                borderStyle: "dashed",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setSelectedNode({
                                  type: "dropdown-item",
                                  id: dropdownItem.id,
                                  parentId: item.id,
                                })
                              }
                            >
                              <div
                                className="builder-block-label"
                                style={{ textAlign: "left", width: "100%" }}
                              >
                                <strong>
                                  {index + 1}.{subIndex + 1}{" "}
                                  {dropdownItem.title || "Без названия"}
                                </strong>
                                <div className="builder-hint">
                                  Элемент dropdown
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  className={`builder-block-item ${
                    selectedNode.type === "footer-root" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setSelectedNode({ type: "footer-root", id: "footer-root" })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <strong>Footer</strong>
                  <div className="builder-hint">Корневые настройки footer</div>
                </div>

                {(settings.footer_config.columns || []).map((column, index) => (
                  <div key={column.id}>
                    <div
                      className={`builder-block-item ${
                        selectedNode.type === "footer-column" &&
                        selectedNode.id === column.id
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedNode({
                          type: "footer-column",
                          id: column.id,
                        })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="builder-block-label"
                        style={{ textAlign: "left", width: "100%" }}
                      >
                        <strong>
                          {index + 1}. {column.title || "Без названия"}
                        </strong>
                        <div className="builder-hint">Колонка footer</div>
                      </div>
                    </div>

                    {(column.links || []).length > 0 ? (
                      <div
                        style={{
                          marginTop: 10,
                          marginLeft: 24,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {(column.links || []).map((link, subIndex) => (
                          <div
                            key={link.id}
                            className={`builder-block-item ${
                              selectedNode.type === "footer-link" &&
                              selectedNode.id === link.id
                                ? "is-active"
                                : ""
                            }`}
                            style={{ borderStyle: "dashed", cursor: "pointer" }}
                            onClick={() =>
                              setSelectedNode({
                                type: "footer-link",
                                id: link.id,
                                parentId: column.id,
                              })
                            }
                          >
                            <div
                              className="builder-block-label"
                              style={{ textAlign: "left", width: "100%" }}
                            >
                              <strong>
                                {index + 1}.{subIndex + 1}{" "}
                                {link.label || "Без названия"}
                              </strong>
                              <div className="builder-hint">Ссылка footer</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="builder-settings">
        <div className="builder-panel-header">
          <h2>Настройки</h2>
        </div>

        <div className="builder-settings-body">
          <div style={{ marginBottom: 20 }}>
            <div className="builder-hint">Выбранный элемент</div>
            <h3 style={{ marginTop: 6 }}>{selectedTitle}</h3>
          </div>

          {selectedEntity?.type === "header-root" ? (
            <>
              <div className="builder-field">
                <label className="builder-label">Ссылка логотипа</label>
                <input
                  className="builder-input"
                  value={settings.header_config.logoLink || "/"}
                  onChange={(e) =>
                    setHeaderConfig((prev) => ({
                      ...prev,
                      logoLink: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="builder-field">
                <label className="builder-label">Изображение логотипа</label>
                <div className="builder-image-field">
                  <input
                    className="builder-input"
                    type="text"
                    value={settings.header_config.logoUrl || ""}
                    placeholder="URL логотипа"
                    onChange={(e) =>
                      setHeaderConfig((prev) => ({
                        ...prev,
                        logoUrl: e.target.value,
                      }))
                    }
                  />
                  <label className="builder-upload-button">
                    Загрузить с компьютера
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingField("header-logo");
                          const result = await uploadImage(file);
                          const imageUrl = `${API_ORIGIN}${result.url}`;
                          setHeaderConfig((prev) => ({
                            ...prev,
                            logoUrl: imageUrl,
                          }));
                        } catch (err) {
                          setError(
                            err.message || "Не удалось загрузить логотип",
                          );
                        } finally {
                          setUploadingField("");
                        }
                      }}
                    />
                  </label>
                  {uploadingField === "header-logo" && (
                    <div className="builder-upload-status">Загрузка...</div>
                  )}
                  {settings.header_config.logoUrl && (
                    <div
                      className="builder-image-preview"
                      style={{ marginTop: 12, maxWidth: 120 }}
                    >
                      <img
                        src={settings.header_config.logoUrl}
                        alt="Логотип header"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {selectedEntity?.type === "menu-item" ? (
            <>
              <div className="builder-field">
                <label className="builder-label">Название</label>
                <input
                  className="builder-input"
                  value={selectedEntity.item.label || ""}
                  onChange={(e) =>
                    updateHeaderMenuItem(
                      selectedEntity.item.id,
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
                  value={selectedEntity.item.type || "link"}
                  onChange={(e) =>
                    updateHeaderMenuItem(
                      selectedEntity.item.id,
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
                  value={selectedEntity.item.pageId ?? ""}
                  onChange={(e) =>
                    handleHeaderMenuPageChange(
                      selectedEntity.item.id,
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
                  value={selectedEntity.item.url || ""}
                  onChange={(e) =>
                    updateHeaderMenuItem(
                      selectedEntity.item.id,
                      "url",
                      e.target.value,
                    )
                  }
                />
              </div>
            </>
          ) : null}

          {selectedEntity?.type === "dropdown-item" ? (
            <>
              <div className="builder-field">
                <label className="builder-label">Заголовок</label>
                <input
                  className="builder-input"
                  value={selectedEntity.dropdownItem.title || ""}
                  onChange={(e) =>
                    updateHeaderDropdownItem(
                      selectedEntity.item.id,
                      selectedEntity.dropdownItem.id,
                      "title",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="builder-field">
                <label className="builder-label">Страница</label>
                <select
                  className="builder-input"
                  value={selectedEntity.dropdownItem.pageId ?? ""}
                  onChange={(e) =>
                    handleHeaderDropdownPageChange(
                      selectedEntity.item.id,
                      selectedEntity.dropdownItem.id,
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
                  value={selectedEntity.dropdownItem.url || ""}
                  onChange={(e) =>
                    updateHeaderDropdownItem(
                      selectedEntity.item.id,
                      selectedEntity.dropdownItem.id,
                      "url",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="builder-field">
                <label className="builder-label">Изображение</label>
                <input
                  className="builder-input"
                  value={selectedEntity.dropdownItem.image || ""}
                  onChange={(e) =>
                    updateHeaderDropdownItem(
                      selectedEntity.item.id,
                      selectedEntity.dropdownItem.id,
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
                        `${selectedEntity.item.id}-${selectedEntity.dropdownItem.id}`,
                        e.target.files?.[0],
                        selectedEntity.item.id,
                        selectedEntity.dropdownItem.id,
                      )
                    }
                  />
                </label>

                {uploadingField ===
                `${selectedEntity.item.id}-${selectedEntity.dropdownItem.id}` ? (
                  <div className="builder-upload-status">Загрузка...</div>
                ) : null}

                {selectedEntity.dropdownItem.image ? (
                  <div
                    className="builder-image-preview"
                    style={{ marginTop: 12, maxWidth: 240 }}
                  >
                    <img
                      src={selectedEntity.dropdownItem.image}
                      alt={selectedEntity.dropdownItem.title || "Dropdown item"}
                    />
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {selectedEntity?.type === "footer-root" ? (
            <>
              <div className="builder-field">
                <label className="builder-label">
                  Ссылка логотипа (footer)
                </label>
                <input
                  className="builder-input"
                  value={settings.footer_config.logoLink || "/"}
                  onChange={(e) =>
                    setFooterConfig((prev) => ({
                      ...prev,
                      logoLink: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="builder-field">
                <label className="builder-label">
                  Изображение логотипа (footer)
                </label>
                <div className="builder-image-field">
                  <input
                    className="builder-input"
                    type="text"
                    value={settings.footer_config.logoUrl || ""}
                    placeholder="URL логотипа"
                    onChange={(e) =>
                      setFooterConfig((prev) => ({
                        ...prev,
                        logoUrl: e.target.value,
                      }))
                    }
                  />
                  <label className="builder-upload-button">
                    Загрузить с компьютера
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingField("footer-logo");
                          const result = await uploadImage(file);
                          const imageUrl = `${API_ORIGIN}${result.url}`;
                          setFooterConfig((prev) => ({
                            ...prev,
                            logoUrl: imageUrl,
                          }));
                        } catch (err) {
                          setError(
                            err.message || "Не удалось загрузить логотип",
                          );
                        } finally {
                          setUploadingField("");
                        }
                      }}
                    />
                  </label>
                  {uploadingField === "footer-logo" && (
                    <div className="builder-upload-status">Загрузка...</div>
                  )}
                  {settings.footer_config.logoUrl && (
                    <div
                      className="builder-image-preview"
                      style={{ marginTop: 12, maxWidth: 120 }}
                    >
                      <img
                        src={settings.footer_config.logoUrl}
                        alt="Логотип footer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {selectedEntity?.type === "footer-column" ? (
            <div className="builder-field">
              <label className="builder-label">Заголовок колонки</label>
              <input
                className="builder-input"
                value={selectedEntity.column.title || ""}
                onChange={(e) =>
                  updateFooterColumn(
                    selectedEntity.column.id,
                    "title",
                    e.target.value,
                  )
                }
              />
            </div>
          ) : null}

          {selectedEntity?.type === "footer-link" ? (
            <>
              <div className="builder-field">
                <label className="builder-label">Текст ссылки</label>
                <input
                  className="builder-input"
                  value={selectedEntity.link.label || ""}
                  onChange={(e) =>
                    updateFooterLink(
                      selectedEntity.column.id,
                      selectedEntity.link.id,
                      "label",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="builder-field">
                <label className="builder-label">Страница</label>
                <select
                  className="builder-input"
                  value={selectedEntity.link.pageId ?? ""}
                  onChange={(e) =>
                    handleFooterLinkPageChange(
                      selectedEntity.column.id,
                      selectedEntity.link.id,
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
                  value={selectedEntity.link.url || ""}
                  onChange={(e) =>
                    updateFooterLink(
                      selectedEntity.column.id,
                      selectedEntity.link.id,
                      "url",
                      e.target.value,
                    )
                  }
                />
              </div>
            </>
          ) : null}

          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Действия</h3>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedEntity?.type === "header-root" ? (
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={addMenuItem}
                >
                  Добавить пункт меню
                </button>
              ) : null}

              {selectedEntity?.type === "menu-item" ? (
                <>
                  {selectedEntity.item.type === "dropdown" ? (
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={() => addDropdownItem(selectedEntity.item.id)}
                    >
                      Добавить элемент dropdown
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => moveMenuItemUp(selectedEntity.item.id)}
                  >
                    Вверх
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => moveMenuItemDown(selectedEntity.item.id)}
                  >
                    Вниз
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-ghost danger"
                    onClick={() => removeMenuItem(selectedEntity.item.id)}
                  >
                    Удалить пункт
                  </button>
                </>
              ) : null}

              {selectedEntity?.type === "dropdown-item" ? (
                <>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() =>
                      moveDropdownItemUp(
                        selectedEntity.item.id,
                        selectedEntity.dropdownItem.id,
                      )
                    }
                  >
                    Вверх
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() =>
                      moveDropdownItemDown(
                        selectedEntity.item.id,
                        selectedEntity.dropdownItem.id,
                      )
                    }
                  >
                    Вниз
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-ghost danger"
                    onClick={() =>
                      removeDropdownItem(
                        selectedEntity.item.id,
                        selectedEntity.dropdownItem.id,
                      )
                    }
                  >
                    Удалить элемент
                  </button>
                </>
              ) : null}

              {selectedEntity?.type === "footer-root" ? (
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={addFooterColumn}
                >
                  Добавить колонку
                </button>
              ) : null}

              {selectedEntity?.type === "footer-column" ? (
                <>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => addFooterLink(selectedEntity.column.id)}
                  >
                    Добавить ссылку
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => moveFooterColumnUp(selectedEntity.column.id)}
                  >
                    Вверх
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() =>
                      moveFooterColumnDown(selectedEntity.column.id)
                    }
                  >
                    Вниз
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-ghost danger"
                    onClick={() => removeFooterColumn(selectedEntity.column.id)}
                  >
                    Удалить колонку
                  </button>
                </>
              ) : null}

              {selectedEntity?.type === "footer-link" ? (
                <>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() =>
                      moveFooterLinkUp(
                        selectedEntity.column.id,
                        selectedEntity.link.id,
                      )
                    }
                  >
                    Вверх
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() =>
                      moveFooterLinkDown(
                        selectedEntity.column.id,
                        selectedEntity.link.id,
                      )
                    }
                  >
                    Вниз
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-ghost danger"
                    onClick={() =>
                      removeFooterLink(
                        selectedEntity.column.id,
                        selectedEntity.link.id,
                      )
                    }
                  >
                    Удалить ссылку
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AdminLayoutSettings;
