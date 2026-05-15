import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageRenderer from "../renderer/PageRenderer";
import { blockRegistry } from "../block-registry/blockRegistry";
import {
  getPageBySlug,
  updateBlock,
  getPages,
  createBlock,
  deleteBlock,
  uploadImage,
} from "../api/pagesApi";

const API_ORIGIN = "http://localhost:4000";

const emptyPage = {
  id: null,
  title: "",
  slug: "",
  blocks: [],
};

const normalizeBlock = (block, fallbackSortOrder = 1) => ({
  ...block,
  sort_order: block.sort_order ?? block.sortorder ?? fallbackSortOrder,
  is_visible: block.is_visible ?? block.isvisible ?? true,
  props: block.props || {},
});

const sortBlocks = (blocks) =>
  [...blocks].sort((a, b) => {
    const aOrder = a.sort_order ?? 0;
    const bOrder = b.sort_order ?? 0;
    return aOrder - bOrder;
  });

const reorderList = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result.map((item, index) => ({
    ...item,
    sort_order: index + 1,
  }));
};

const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
};

const getFieldValue = (block, fieldName) => {
  if (fieldName.startsWith("images.")) {
    const imageIndex = Number(fieldName.split(".")[1]);
    return block.props.images?.[imageIndex] ?? "";
  }

  if (fieldName.startsWith("items.")) {
    const [, indexStr, key] = fieldName.split(".");
    const itemIndex = Number(indexStr);
    return block.props.items?.[itemIndex]?.[key] ?? "";
  }

  return block.props[fieldName] ?? "";
};

const AdminPageBuilder = () => {
  const [page, setPage] = useState(emptyPage);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);
  const [isDeletingBlock, setIsDeletingBlock] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState([]);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [uploadingField, setUploadingField] = useState("");

  const { slug = "main" } = useParams();

  const reloadPage = async (preserveSelection = true) => {
    const data = await getPageBySlug(slug);

    const normalizedPage = {
      ...data,
      blocks: sortBlocks(
        (data.blocks || []).map((block, index) =>
          normalizeBlock(block, index + 1),
        ),
      ),
    };

    setPage(normalizedPage);

    if (preserveSelection) {
      const stillExists = normalizedPage.blocks.some(
        (block) => block.id === selectedBlockId,
      );

      if (stillExists) {
        setSelectedBlockId(selectedBlockId);
      } else {
        setSelectedBlockId(normalizedPage.blocks[0]?.id ?? null);
      }
    } else {
      setSelectedBlockId(normalizedPage.blocks[0]?.id ?? null);
    }

    return normalizedPage;
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError("");
        await reloadPage(false);
      } catch (err) {
        setError(err.message || "Не удалось загрузить страницу");
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]);

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

  const updateCheckboxGroup = (fieldName, optionValue, checked) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;

        const currentValues = Array.isArray(block.props[fieldName])
          ? block.props[fieldName]
          : [];

        const nextValues = checked
          ? [...new Set([...currentValues, optionValue])]
          : currentValues.filter((value) => value !== optionValue);

        return {
          ...block,
          props: {
            ...block.props,
            [fieldName]: nextValues,
          },
        };
      }),
    }));
  };

  const handleSaveSelectedBlock = async () => {
    if (!selectedBlock) return;

    try {
      setIsSaving(true);
      setError("");

      const updated = await updateBlock(selectedBlock.id, {
        props: selectedBlock.props,
        is_visible: selectedBlock.is_visible ?? true,
      });

      const normalizedUpdatedBlock = normalizeBlock(
        updated,
        selectedBlock.sort_order,
      );

      setPage((prev) => ({
        ...prev,
        blocks: sortBlocks(
          prev.blocks.map((block) =>
            block.id === normalizedUpdatedBlock.id
              ? { ...block, ...normalizedUpdatedBlock }
              : block,
          ),
        ),
      }));
    } catch (err) {
      setError(err.message || "Не удалось сохранить блок");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = async (blockType) => {
    if (!page.id) return;

    const registryEntry = blockRegistry[blockType];
    if (!registryEntry) return;

    try {
      setIsCreatingBlock(true);
      setError("");

      await createBlock({
        page_id: page.id,
        block_code: blockType,
        is_visible: true,
        props: registryEntry.defaultProps ?? {},
      });

      const updatedPage = await reloadPage(false);
      setSelectedBlockId(updatedPage.blocks.at(-1)?.id ?? null);
      setIsAddBlockOpen(false);
    } catch (err) {
      setError(err.message || "Не удалось добавить блок");
    } finally {
      setIsCreatingBlock(false);
    }
  };

  const handleDeleteSelectedBlock = async () => {
    if (!selectedBlock) return;

    const confirmed = window.confirm(
      `Удалить блок "${blockRegistry[selectedBlock.type]?.label || selectedBlock.type}"?`,
    );

    if (!confirmed) return;

    try {
      setIsDeletingBlock(true);
      setError("");

      await deleteBlock(selectedBlock.id);
      const updatedPage = await reloadPage(false);
      setSelectedBlockId(updatedPage.blocks[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Не удалось удалить блок");
    } finally {
      setIsDeletingBlock(false);
    }
  };

  const handleMoveBlock = async (fromIndex, toIndex) => {
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const reordered = reorderList(page.blocks, fromIndex, toIndex);
    const previousBlocks = page.blocks;

    setPage((prev) => ({
      ...prev,
      blocks: reordered,
    }));

    try {
      setIsReordering(true);
      setError("");

      await Promise.all(
        reordered.map((block, index) =>
          updateBlock(block.id, {
            sort_order: 1000 + index,
          }),
        ),
      );

      await Promise.all(
        reordered.map((block) =>
          updateBlock(block.id, {
            sort_order: block.sort_order,
          }),
        ),
      );
    } catch (err) {
      setPage((prev) => ({
        ...prev,
        blocks: previousBlocks,
      }));
      setError(err.message || "Не удалось изменить порядок блоков");
    } finally {
      setIsReordering(false);
      setDraggedBlockId(null);
    }
  };

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
    const createItem =
      blockRegistry[selectedBlock?.type]?.createItem ||
      (() => ({ title: "", description: "" }));

    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;

        return {
          ...block,
          props: {
            ...block.props,
            items: [...(block.props.items || []), createItem()],
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

  const handleImageUpload = async (fieldName, file) => {
    if (!file) return;

    try {
      setUploadingField(fieldName);
      setError("");

      const result = await uploadImage(file);
      updateBlockProp(fieldName, `${API_ORIGIN}${result.url}`);
    } catch (err) {
      setError(err.message || "Не удалось загрузить изображение");
    } finally {
      setUploadingField("");
    }
  };

  const renderFieldInput = (field, value) => {
    if (field.type === "textarea") {
      return (
        <textarea
          className="builder-input builder-textarea"
          value={value ?? ""}
          onChange={(e) => updateBlockProp(field.name, e.target.value)}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          className="builder-input"
          value={value ?? ""}
          onChange={(e) => updateBlockProp(field.name, e.target.value)}
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
              {p.title} ({p.route_path || p.slug})
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox-group") {
      const currentValues = Array.isArray(value) ? value : [];

      return (
        <div className="builder-checkbox-group">
          {field.options?.map((option) => (
            <label key={option.value} className="builder-checkbox-option">
              <input
                type="checkbox"
                checked={currentValues.includes(option.value)}
                onChange={(e) =>
                  updateCheckboxGroup(
                    field.name,
                    option.value,
                    e.target.checked,
                  )
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "image") {
      const previewUrl = resolveMediaUrl(value);

      return (
        <div className="builder-image-field">
          <input
            className="builder-input"
            type="text"
            value={value || ""}
            placeholder="URL изображения"
            onChange={(e) => updateBlockProp(field.name, e.target.value)}
          />

          <label className="builder-upload-button">
            Загрузить с компьютера
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) =>
                handleImageUpload(field.name, e.target.files?.[0])
              }
            />
          </label>

          {uploadingField === field.name ? (
            <div className="builder-upload-status">Загрузка...</div>
          ) : null}

          {previewUrl ? (
            <div className="builder-image-preview">
              <img src={previewUrl} alt={field.label || "Preview"} />
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <input
        className="builder-input"
        type="text"
        value={value ?? ""}
        onChange={(e) => updateBlockProp(field.name, e.target.value)}
      />
    );
  };

  if (isLoading) {
    return <div className="builder-empty">Загрузка страницы...</div>;
  }

  if (error && !page.id) {
    return <div className="builder-empty">Ошибка: {error}</div>;
  }

  return (
    <div className="builder-layout">
      <aside className="builder-sidebar">
        <div className="builder-panel-header">
          <h2>Структура</h2>
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => setIsAddBlockOpen((prev) => !prev)}
          >
            {isAddBlockOpen ? "Закрыть" : "Добавить"}
          </button>
        </div>

        {isAddBlockOpen ? (
          <div className="builder-add-block-panel">
            {Object.entries(blockRegistry).map(([type, config]) => (
              <button
                key={type}
                type="button"
                className="builder-add-block-item"
                onClick={() => handleAddBlock(type)}
                disabled={isCreatingBlock}
              >
                <span className="builder-add-block-title">{config.label}</span>
                <span className="builder-add-block-code">{type}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="builder-block-list">
          {page.blocks.map((block, index) => (
            <button
              key={block.id}
              type="button"
              draggable
              className={`builder-block-item ${
                selectedBlockId === block.id ? "is-active" : ""
              } ${draggedBlockId === block.id ? "is-dragging" : ""}`}
              onClick={() => setSelectedBlockId(block.id)}
              onDragStart={() => setDraggedBlockId(block.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const fromIndex = page.blocks.findIndex(
                  (item) => item.id === draggedBlockId,
                );
                const toIndex = index;
                handleMoveBlock(fromIndex, toIndex);
              }}
              onDragEnd={() => setDraggedBlockId(null)}
            >
              <span className="builder-block-index">{index + 1}</span>

              <span className="builder-block-content">
                <span className="builder-block-label">
                  {blockRegistry[block.type]?.label || block.type}
                </span>
                <span className="builder-block-meta">
                  {block.type} · #{block.sort_order}
                </span>
              </span>

              <span className="builder-block-drag">⋮⋮</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="builder-canvas">
        <div className="builder-canvas-toolbar">
          <span className="builder-canvas-badge">
            {page.title || "Страница"} / {page.slug}
          </span>

          {isReordering ? (
            <span className="builder-canvas-status">Сохраняем порядок...</span>
          ) : null}
        </div>

        <div className="builder-canvas-scroll">
          <div className="builder-preview-frame">
            <PageRenderer blocks={page.blocks} />
          </div>
        </div>
      </section>

      <aside className="builder-settings">
        <div className="builder-panel-header">
          <h2>Настройки</h2>

          <div className="builder-settings-actions">
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={handleSaveSelectedBlock}
              disabled={!selectedBlock || isSaving}
            >
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </button>

            <button
              type="button"
              className="admin-button admin-button-danger"
              onClick={handleDeleteSelectedBlock}
              disabled={!selectedBlock || isDeletingBlock}
            >
              {isDeletingBlock ? "Удаляем..." : "Удалить"}
            </button>
          </div>
        </div>

        {selectedBlock ? (
          <div className="builder-settings-body">
            <p className="builder-settings-type">
              {blockRegistry[selectedBlock.type]?.label || selectedBlock.type}
            </p>

            {error ? <p className="builder-error-text">{error}</p> : null}

            {blockRegistry[selectedBlock.type]?.fields?.map((field) => {
              const value = getFieldValue(selectedBlock, field.name);

              return (
                <div key={field.name} className="builder-field">
                  <label className="builder-label">{field.label}</label>
                  {renderFieldInput(field, value)}
                </div>
              );
            })}

            {blockRegistry[selectedBlock.type]?.hasItemsArray ? (
              <div className="builder-array-group">
                <div className="builder-array-header">
                  <h3>Элементы блока</h3>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={addTextBlockItem}
                  >
                    Добавить пункт
                  </button>
                </div>

                {(selectedBlock.props.items || []).map((item, index) => (
                  <div key={index} className="builder-array-card">
                    <div className="builder-array-card-top">
                      <p className="builder-array-card-title">
                        Пункт {index + 1}
                      </p>
                      <button
                        type="button"
                        className="admin-button admin-button-danger-outline"
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
            ) : null}
          </div>
        ) : (
          <div className="builder-empty">Выбери блок слева</div>
        )}
      </aside>
    </div>
  );
};

export default AdminPageBuilder;
