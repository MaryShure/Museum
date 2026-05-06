import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageRenderer from "../renderer/PageRenderer";
import { blockRegistry } from "../block-registry/blockRegistry";
import {
  getPageBySlug,
  updateBlock,
  getPages,
} from "../../server/src/api/pagesApi";

const emptyPage = {
  id: null,
  title: "",
  slug: "",
  blocks: [],
};

const AdminPageBuilder = () => {
  const [page, setPage] = useState(emptyPage);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState([]); // список страниц для page-select
  const { slug = "main" } = useParams();

  // Загрузка страницы
  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getPageBySlug(slug);

        const normalizedPage = {
          ...data,
          blocks: (data.blocks || []).map((block) => ({
            ...block,
            sort_order: block.sort_order ?? 0,
            props: block.props || {},
          })),
        };

        setPage(normalizedPage);
        setSelectedBlockId(normalizedPage.blocks[0]?.id ?? null);
      } catch (err) {
        setError(err.message || "Не удалось загрузить страницу");
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  // Загрузка списка страниц для выпадающих списков
  useEffect(() => {
    const loadPages = async () => {
      try {
        const list = await getPages();
        setPages(Array.isArray(list) ? list : list.pages || []);
      } catch (err) {
        console.error("Не удалось загрузить список страниц", err);
      }
    };

    loadPages();
  }, []);

  const selectedBlock = useMemo(
    () => page.blocks.find((block) => block.id === selectedBlockId),
    [page.blocks, selectedBlockId],
  );

  // Обновление простых полей и images/items по схеме "имя.индекс"
  const updateBlockProp = (field, value) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;

        if (field.startsWith("images.")) {
          const index = Number(field.split(".")[1]);
          const nextImages = [...(block.props.images || [])];
          nextImages[index] = value;

          return {
            ...block,
            props: {
              ...block.props,
              images: nextImages,
            },
          };
        }

        if (field.startsWith("items.")) {
          const [, indexStr, key] = field.split(".");
          const index = Number(indexStr);
          const nextItems = [...(block.props.items || [])];

          if (!nextItems[index]) {
            nextItems[index] = { title: "", description: "" };
          }

          nextItems[index] = {
            ...nextItems[index],
            [key]: value,
          };

          return {
            ...block,
            props: {
              ...block.props,
              items: nextItems,
            },
          };
        }

        return {
          ...block,
          props: {
            ...block.props,
            [field]: value,
          },
        };
      }),
    }));
  };

  // Сохранение выбранного блока
  const handleSaveSelectedBlock = async () => {
    if (!selectedBlock) return;

    try {
      setIsSaving(true);
      setError("");

      const updated = await updateBlock(selectedBlock.id, {
        props: selectedBlock.props,
        sort_order: selectedBlock.sort_order,
        is_visible: selectedBlock.is_visible ?? true,
      });

      setPage((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === updated.id ? { ...block, ...updated } : block,
        ),
      }));
    } catch (err) {
      setError(err.message || "Не удалось сохранить блок");
    } finally {
      setIsSaving(false);
    }
  };

  // === Работа с массивом items для TextBlock ===

  const updateTextBlockItem = (index, key, value) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;

        const nextItems = [...(block.props.items || [])];
        nextItems[index] = {
          ...(nextItems[index] || { title: "", description: "" }),
          [key]: value,
        };

        return {
          ...block,
          props: {
            ...block.props,
            items: nextItems,
          },
        };
      }),
    }));
  };

  const addTextBlockItem = () => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;

        return {
          ...block,
          props: {
            ...block.props,
            items: [
              ...(block.props.items || []),
              { title: "", description: "" },
            ],
          },
        };
      }),
    }));
  };

  const removeTextBlockItem = (indexToRemove) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;

        return {
          ...block,
          props: {
            ...block.props,
            items: (block.props.items || []).filter(
              (_, index) => index !== indexToRemove,
            ),
          },
        };
      }),
    }));
  };

  // Унифицированный рендер инпута по типу поля
  const renderFieldInput = (field, value) => {
    if (field.type === "textarea") {
      return (
        <textarea
          className="builder-input builder-textarea"
          value={value}
          onChange={(e) => updateBlockProp(field.name, e.target.value)}
        />
      );
    }

    if (field.type === "page-select") {
      return (
        <select
          className="builder-input"
          value={value ?? ""}
          onChange={(e) =>
            updateBlockProp(
              field.name,
              e.target.value ? Number(e.target.value) : null,
            )
          }
        >
          <option value="">Не выбрано</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.route_path})
            </option>
          ))}
        </select>
      );
    }

    // по умолчанию text
    return (
      <input
        className="builder-input"
        type="text"
        value={value}
        onChange={(e) => updateBlockProp(field.name, e.target.value)}
      />
    );
  };

  // === Рендер ===

  if (isLoading) {
    return <div className="builder-empty">Загрузка страницы...</div>;
  }

  if (error && !page.id) {
    return <div className="builder-empty">Ошибка: {error}</div>;
  }

  return (
    <div className="builder-layout">
      {/* ЛЕВАЯ ПАНЕЛЬ: Структура */}
      <aside className="builder-sidebar">
        <div className="builder-panel-header">
          <h2>Структура</h2>
        </div>

        <div className="builder-block-list">
          {page.blocks.map((block, index) => (
            <button
              key={block.id}
              className={`builder-block-item ${
                selectedBlockId === block.id ? "is-active" : ""
              }`}
              onClick={() => setSelectedBlockId(block.id)}
            >
              <span className="builder-block-index">{index + 1}</span>
              <span className="builder-block-label">
                {blockRegistry[block.type]?.label || block.type}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* ЦЕНТР: превью */}
      <section className="builder-canvas">
        <div className="builder-canvas-toolbar">
          <span className="builder-canvas-badge">
            {page.title || "Страница"} / {page.slug}
          </span>
        </div>

        <div className="builder-canvas-scroll">
          <div className="builder-preview-frame">
            <PageRenderer blocks={page.blocks} />
          </div>
        </div>
      </section>

      {/* ПРАВАЯ ПАНЕЛЬ: Настройки */}
      <aside className="builder-settings">
        <div className="builder-panel-header">
          <h2>Настройки</h2>
          <button
            className="admin-button admin-button-primary"
            onClick={handleSaveSelectedBlock}
            disabled={!selectedBlock || isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>

        {selectedBlock ? (
          <div className="builder-settings-body">
            <p className="builder-settings-type">
              {blockRegistry[selectedBlock.type]?.label || selectedBlock.type}
            </p>

            {error ? <p className="builder-error-text">{error}</p> : null}

            {/* Обычные поля блока по описанию из blockRegistry */}
            {blockRegistry[selectedBlock.type]?.fields?.map((field) => {
              const isImageField = field.name.startsWith("images.");
              const isItemField = field.name.startsWith("items.");

              const imageIndex = isImageField
                ? Number(field.name.split(".")[1])
                : null;

              let value = "";

              if (isImageField) {
                value = selectedBlock.props.images?.[imageIndex] || "";
              } else if (isItemField) {
                const [, indexStr, key] = field.name.split(".");
                const index = Number(indexStr);
                value = selectedBlock.props.items?.[index]?.[key] || "";
              } else {
                value =
                  selectedBlock.props[field.name] === null ||
                  selectedBlock.props[field.name] === undefined
                    ? ""
                    : selectedBlock.props[field.name];
              }

              return (
                <div key={field.name} className="builder-field">
                  <label className="builder-label">{field.label}</label>
                  {renderFieldInput(field, value)}
                </div>
              );
            })}

            {/* Отдельная секция для массива items у textBlock */}
            {selectedBlock.type === "textBlock" && (
              <div className="builder-array-group">
                <div className="builder-array-header">
                  <h3>Элементы блока</h3>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={addTextBlockItem}
                  >
                    Добавить элемент
                  </button>
                </div>

                {(selectedBlock.props.items || []).map((item, index) => (
                  <div key={index} className="builder-array-card">
                    <div className="builder-array-card-top">
                      <p className="builder-array-card-title">
                        Элемент {index + 1}
                      </p>
                      <button
                        type="button"
                        className="admin-button admin-button-ghost danger"
                        onClick={() => removeTextBlockItem(index)}
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="builder-field">
                      <label className="builder-label">Заголовок</label>
                      <input
                        className="builder-input"
                        type="text"
                        value={item.title || ""}
                        onChange={(e) =>
                          updateTextBlockItem(index, "title", e.target.value)
                        }
                      />
                    </div>

                    <div className="builder-field">
                      <label className="builder-label">Описание</label>
                      <textarea
                        className="builder-input builder-textarea"
                        value={item.description || ""}
                        onChange={(e) =>
                          updateTextBlockItem(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="builder-empty">Выбери блок слева</div>
        )}
      </aside>
    </div>
  );
};

export default AdminPageBuilder;
