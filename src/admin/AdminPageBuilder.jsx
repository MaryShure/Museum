import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PreviewFrame from "./PreviewFrame";
import { blockRegistry } from "../block-registry/blockRegistry";
import {
  getPageBySlug,
  updateBlock,
  getPages,
  createBlock,
  deleteBlock,
  uploadImage,
  createCardsGridItem,
  updateCardsGridItem,
  deleteCardsGridItem,
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
  items: Array.isArray(block.items) ? block.items : [],
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

const cardsGridItemSchemas = {
  card: {
    label: "Карточка",
    defaultProps: {
      variant: "default",
      image: "",
      altText: "",
      title: "",
      description: "",
      pageId: null,
      linkUrl: "",
    },
    fields: [
      {
        name: "variant",
        label: "Вариант",
        type: "select",
        options: [
          { label: "Обычная", value: "default" },
          { label: "Без hover", value: "noHover" },
        ],
      },
      { name: "image", label: "Изображение", type: "image" },
      { name: "altText", label: "Alt текст", type: "text" },
      { name: "title", label: "Заголовок", type: "text" },
      { name: "description", label: "Описание", type: "textarea" },
      { name: "pageId", label: "Страница", type: "page-select" },
      { name: "linkUrl", label: "Ссылка", type: "text" },
    ],
  },
  textCard: {
    label: "Текстовая карточка",
    defaultProps: {
      title: "",
      description: "",
      buttonType: "", // теперь пустая строка = без кнопки
      buttonText: "",
      pageId: null,
      linkUrl: "",
      width: "",
      maxWidth: "",
      minHeight: "",
      height: "",
    },
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "description", label: "Описание", type: "textarea" },
      {
        name: "buttonType",
        label: "Тип кнопки",
        type: "select",
        options: [
          { label: "Без кнопки", value: "" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
        ],
      },
      { name: "buttonText", label: "Текст кнопки", type: "text" },
      { name: "pageId", label: "Страница", type: "page-select" },
      { name: "linkUrl", label: "Ссылка", type: "text" },
      { name: "width", label: "Width", type: "text" },
      { name: "maxWidth", label: "Max width", type: "text" },
      { name: "minHeight", label: "Min height", type: "text" },
      { name: "height", label: "Height", type: "text" },
    ],
  },
  image: {
    label: "Изображение",
    defaultProps: {
      image: "",
      altText: "",
      width: "",
      maxWidth: "",
      minHeight: "",
      height: "",
    },
    fields: [
      { name: "image", label: "Изображение", type: "image" },
      { name: "altText", label: "Alt текст", type: "text" },
      { name: "width", label: "Width", type: "text" },
      { name: "maxWidth", label: "Max width", type: "text" },
      { name: "minHeight", label: "Min height", type: "text" },
      { name: "height", label: "Height", type: "text" },
    ],
  },
  text: {
    label: "Текст",
    defaultProps: {
      title: "",
      description: "",
      textAlign: "left",
      width: "",
      maxWidth: "",
      minHeight: "",
      height: "",
    },
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "description", label: "Описание", type: "textarea" },
      {
        name: "textAlign",
        label: "Выравнивание",
        type: "select",
        options: [
          { label: "Слева", value: "left" },
          { label: "По центру", value: "center" },
          { label: "Справа", value: "right" },
        ],
      },
      { name: "width", label: "Width", type: "text" },
      { name: "maxWidth", label: "Max width", type: "text" },
      { name: "minHeight", label: "Min height", type: "text" },
      { name: "height", label: "Height", type: "text" },
    ],
  },
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
  const [expandedItems, setExpandedItems] = useState({});
  const [previewWidth, setPreviewWidth] = useState(1280);

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
    setExpandedItems({});

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

  const selectedBlockConfig = useMemo(
    () => (selectedBlock ? blockRegistry[selectedBlock.type] : null),
    [selectedBlock],
  );

  const selectedCardsGridItems = useMemo(() => {
    if (selectedBlock?.type !== "cardsGrid") return [];
    return Array.isArray(selectedBlock.items) ? selectedBlock.items : [];
  }, [selectedBlock]);

  const getLinkedUrlFieldName = (pageFieldName) => {
    const linkedUrlFieldMap = {
      buttonPageId: "buttonLinkUrl",
      card1ButtonPageId: "card1ButtonLinkUrl",
      card1PageId: "card1LinkUrl",
      card2PageId: "card2LinkUrl",
      pageId: "linkUrl",
    };
    return linkedUrlFieldMap[pageFieldName] || null;
  };

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
          if (!nextItems[index]) nextItems[index] = {};
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

  const updatePageSelectProp = (pageFieldName, pageIdValue) => {
    const pageId = pageIdValue ? Number(pageIdValue) : null;
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;
        const nextProps = {
          ...block.props,
          [pageFieldName]: pageId,
        };
        const urlFieldName = getLinkedUrlFieldName(pageFieldName);
        if (urlFieldName) {
          const selectedPage = pages.find((p) => Number(p.id) === pageId);
          nextProps[urlFieldName] = selectedPage
            ? selectedPage.route_path || `/${selectedPage.slug}`
            : "";
        }
        return {
          ...block,
          props: nextProps,
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
        {
          ...selectedBlock,
          ...updated,
        },
        selectedBlock.sort_order,
      );
      setPage((prev) => ({
        ...prev,
        blocks: sortBlocks(
          prev.blocks.map((block) =>
            block.id === normalizedUpdatedBlock.id
              ? {
                  ...block,
                  ...normalizedUpdatedBlock,
                  items: block.items || normalizedUpdatedBlock.items || [],
                }
              : block,
          ),
        ),
      }));
      if (selectedBlock.type === "cardsGrid") {
        const items = selectedCardsGridItems;
        if (items.length > 0) {
          const savePromises = items.map((item) =>
            updateCardsGridItem(selectedBlock.id, item.id, {
              props: item.props,
              sort_order: item.sort_order,
              is_visible: item.is_visible ?? true,
            }),
          );
          await Promise.all(savePromises);
        }
      }
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
    setPage((prev) => ({ ...prev, blocks: reordered }));
    try {
      setIsReordering(true);
      setError("");
      await Promise.all(
        reordered.map((block, index) =>
          updateBlock(block.id, { sort_order: 1000 + index }),
        ),
      );
      await Promise.all(
        reordered.map((block) =>
          updateBlock(block.id, { sort_order: block.sort_order }),
        ),
      );
    } catch (err) {
      setPage((prev) => ({ ...prev, blocks: previousBlocks }));
      setError(err.message || "Не удалось изменить порядок блоков");
    } finally {
      setIsReordering(false);
      setDraggedBlockId(null);
    }
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

  const updateCardsGridItemPropLocal = (itemId, fieldName, value) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;
        return {
          ...block,
          items: (block.items || []).map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  props: {
                    ...(item.props || {}),
                    [fieldName]: value,
                  },
                }
              : item,
          ),
        };
      }),
    }));
  };

  const updateCardsGridItemPageSelectLocal = (
    itemId,
    pageFieldName,
    pageIdValue,
  ) => {
    const pageId = pageIdValue ? Number(pageIdValue) : null;
    const urlFieldName = getLinkedUrlFieldName(pageFieldName);
    const selectedPageData = pages.find((p) => Number(p.id) === pageId);
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== selectedBlockId) return block;
        return {
          ...block,
          items: (block.items || []).map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  props: {
                    ...(item.props || {}),
                    [pageFieldName]: pageId,
                    ...(urlFieldName
                      ? {
                          [urlFieldName]: selectedPageData
                            ? selectedPageData.route_path ||
                              `/${selectedPageData.slug}`
                            : "",
                        }
                      : {}),
                  },
                }
              : item,
          ),
        };
      }),
    }));
  };

  const handleAddCardsGridItem = async (itemType) => {
    if (!selectedBlock || selectedBlock.type !== "cardsGrid") return;
    const schema = cardsGridItemSchemas[itemType];
    if (!schema) return;
    try {
      setError("");
      const created = await createCardsGridItem(selectedBlock.id, {
        item_type: itemType,
        props: schema.defaultProps,
        is_visible: true,
      });
      setPage((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== selectedBlockId) return block;
          return {
            ...block,
            items: [...(block.items || []), created].sort(
              (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
            ),
          };
        }),
      }));
      setExpandedItems((prev) => ({ ...prev, [created.id]: true }));
    } catch (err) {
      setError(err.message || "Не удалось добавить элемент композиции");
    }
  };

  const handleDeleteCardsGridItem = async (itemId) => {
    if (!selectedBlock || selectedBlock.type !== "cardsGrid") return;
    const confirmed = window.confirm("Удалить элемент композиции?");
    if (!confirmed) return;
    try {
      setError("");
      await deleteCardsGridItem(selectedBlock.id, itemId);
      setPage((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== selectedBlockId) return block;
          return {
            ...block,
            items: (block.items || []).filter((item) => item.id !== itemId),
          };
        }),
      }));
      setExpandedItems((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } catch (err) {
      setError(err.message || "Не удалось удалить элемент композиции");
    }
  };

  const handleCardsGridItemImageUpload = async (itemId, fieldName, file) => {
    if (!file) return;
    const fullFieldName = `cards-grid-item-${itemId}-${fieldName}`;
    try {
      setUploadingField(fullFieldName);
      setError("");
      const result = await uploadImage(file);
      updateCardsGridItemPropLocal(
        itemId,
        fieldName,
        `${API_ORIGIN}${result.url}`,
      );
    } catch (err) {
      setError(err.message || "Не удалось загрузить изображение");
    } finally {
      setUploadingField("");
    }
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
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
            <option key={String(option.value)} value={option.value}>
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
          onChange={(e) => updatePageSelectProp(field.name, e.target.value)}
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
    if (field.type === "page-multi-select") {
      const currentValues = Array.isArray(value) ? value.map(Number) : [];
      const maxItems = field.maxSelected ?? 4;

      return (
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ fontSize: "13px", color: "#666" }}>
            Выбрано {currentValues.length} из {maxItems}
          </div>

          {pages.map((p) => {
            const pageId = Number(p.id);
            const isChecked = currentValues.includes(pageId);
            const isDisabled = !isChecked && currentValues.length >= maxItems;

            return (
              <label
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={(e) => {
                    const nextValues = e.target.checked
                      ? [...new Set([...currentValues, pageId])].slice(
                          0,
                          maxItems,
                        )
                      : currentValues.filter((id) => id !== pageId);

                    updateBlockProp(field.name, nextValues);
                  }}
                />
                <span>
                  {p.title} ({p.route_path || p.slug})
                </span>
              </label>
            );
          })}

          {currentValues.length >= maxItems && (
            <div style={{ fontSize: "12px", color: "#b42318" }}>
              Можно выбрать максимум {maxItems} варианта
            </div>
          )}
        </div>
      );
    }
    if (field.type === "checkbox-group") {
      const currentValues = Array.isArray(value) ? value : [];
      return (
        <div className="builder-checkbox-group">
          {field.options?.map((option) => (
            <label
              key={String(option.value)}
              className="builder-checkbox-option"
            >
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
            value={value ?? ""}
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
          {uploadingField === field.name && (
            <div className="builder-upload-status">Загрузка...</div>
          )}
          {previewUrl && (
            <div className="builder-image-preview">
              <img src={previewUrl} alt={`${field.label} preview`} />
            </div>
          )}
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

  const renderLegacyArrayItemFieldInput = (itemIndex, field, value) => {
    const fieldPath = `items.${itemIndex}.${field.name}`;
    const updateArrayItem = (index, key, nextValue) => {
      updateBlockProp(`items.${index}.${key}`, nextValue);
    };
    const updateItemPageSelectProp = (index, pageFieldName, pageIdValue) => {
      const pageId = pageIdValue ? Number(pageIdValue) : null;
      setPage((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== selectedBlockId) return block;
          const nextItems = [...(block.props.items || [])];
          const currentItem = nextItems[index] || {};
          const nextItem = { ...currentItem, [pageFieldName]: pageId };
          const urlFieldName = getLinkedUrlFieldName(pageFieldName);
          if (urlFieldName) {
            const selectedPage = pages.find((p) => Number(p.id) === pageId);
            nextItem[urlFieldName] = selectedPage
              ? selectedPage.route_path || `/${selectedPage.slug}`
              : "";
          }
          nextItems[index] = nextItem;
          return {
            ...block,
            props: { ...block.props, items: nextItems },
          };
        }),
      }));
    };
    const updateItemCheckboxGroup = (
      index,
      fieldName,
      optionValue,
      checked,
    ) => {
      setPage((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (block.id !== selectedBlockId) return block;
          const nextItems = [...(block.props.items || [])];
          const currentItem = nextItems[index] || {};
          const currentValues = Array.isArray(currentItem[fieldName])
            ? currentItem[fieldName]
            : [];
          const nextValues = checked
            ? [...new Set([...currentValues, optionValue])]
            : currentValues.filter((value) => value !== optionValue);
          nextItems[index] = { ...currentItem, [fieldName]: nextValues };
          return {
            ...block,
            props: { ...block.props, items: nextItems },
          };
        }),
      }));
    };
    const handleLegacyItemImageUpload = async (index, fieldName, file) => {
      if (!file) return;
      try {
        setUploadingField(fieldPath);
        setError("");
        const result = await uploadImage(file);
        updateArrayItem(index, fieldName, `${API_ORIGIN}${result.url}`);
      } catch (err) {
        setError(err.message || "Не удалось загрузить изображение");
      } finally {
        setUploadingField("");
      }
    };
    if (field.type === "textarea") {
      return (
        <textarea
          className="builder-input builder-textarea"
          value={value ?? ""}
          onChange={(e) =>
            updateArrayItem(itemIndex, field.name, e.target.value)
          }
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          className="builder-input"
          value={value ?? ""}
          onChange={(e) =>
            updateArrayItem(itemIndex, field.name, e.target.value)
          }
        >
          {(field.options || []).map((option) => (
            <option key={String(option.value)} value={option.value}>
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
            updateItemPageSelectProp(itemIndex, field.name, e.target.value)
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
            <label
              key={String(option.value)}
              className="builder-checkbox-option"
            >
              <input
                type="checkbox"
                checked={currentValues.includes(option.value)}
                onChange={(e) =>
                  updateItemCheckboxGroup(
                    itemIndex,
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
            value={value ?? ""}
            placeholder="URL изображения"
            onChange={(e) =>
              updateArrayItem(itemIndex, field.name, e.target.value)
            }
          />
          <label className="builder-upload-button">
            Загрузить с компьютера
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) =>
                handleLegacyItemImageUpload(
                  itemIndex,
                  field.name,
                  e.target.files?.[0],
                )
              }
            />
          </label>
          {uploadingField === fieldPath && (
            <div className="builder-upload-status">Загрузка...</div>
          )}
          {previewUrl && (
            <div className="builder-image-preview">
              <img src={previewUrl} alt={`${field.label} preview`} />
            </div>
          )}
        </div>
      );
    }
    return (
      <input
        className="builder-input"
        type="text"
        value={value ?? ""}
        onChange={(e) => updateArrayItem(itemIndex, field.name, e.target.value)}
      />
    );
  };

  const renderCardsGridItemFieldInput = (item, field) => {
    const value = item.props?.[field.name] ?? "";
    const fieldPath = `cards-grid-item-${item.id}-${field.name}`;
    if (field.type === "textarea") {
      return (
        <textarea
          className="builder-input builder-textarea"
          value={value ?? ""}
          onChange={(e) =>
            updateCardsGridItemPropLocal(item.id, field.name, e.target.value)
          }
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          className="builder-input"
          value={value ?? ""}
          onChange={(e) =>
            updateCardsGridItemPropLocal(item.id, field.name, e.target.value)
          }
        >
          {(field.options || []).map((option) => (
            <option key={String(option.value)} value={option.value}>
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
            updateCardsGridItemPageSelectLocal(
              item.id,
              field.name,
              e.target.value,
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
    if (field.type === "image") {
      const previewUrl = resolveMediaUrl(value);
      return (
        <div className="builder-image-field">
          <input
            className="builder-input"
            type="text"
            value={value ?? ""}
            placeholder="URL изображения"
            onChange={(e) =>
              updateCardsGridItemPropLocal(item.id, field.name, e.target.value)
            }
          />
          <label className="builder-upload-button">
            Загрузить с компьютера
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) =>
                handleCardsGridItemImageUpload(
                  item.id,
                  field.name,
                  e.target.files?.[0],
                )
              }
            />
          </label>
          {uploadingField === fieldPath && (
            <div className="builder-upload-status">Загрузка...</div>
          )}
          {previewUrl && (
            <div className="builder-image-preview">
              <img src={previewUrl} alt={`${field.label} preview`} />
            </div>
          )}
        </div>
      );
    }
    return (
      <input
        className="builder-input"
        type="text"
        value={value ?? ""}
        onChange={(e) =>
          updateCardsGridItemPropLocal(item.id, field.name, e.target.value)
        }
      />
    );
  };

  if (isLoading)
    return <div className="builder-empty">Загрузка страницы...</div>;
  if (error && !page.id)
    return (
      <div className="builder-empty builder-empty-error">Ошибка: {error}</div>
    );

  return (
    <div className="builder-layout">
      <aside className="builder-sidebar">
        <div className="builder-panel-header">
          <h2>Блоки страницы</h2>
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => setIsAddBlockOpen((prev) => !prev)}
          >
            {isAddBlockOpen ? "Закрыть" : "Добавить блок"}
          </button>
        </div>
        {isAddBlockOpen && (
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
        )}
        <div className="builder-block-list">
          {page.blocks.map((block, index) => (
            <button
              key={block.id}
              type="button"
              draggable
              className={[
                "builder-block-item",
                selectedBlockId === block.id ? "is-active" : "",
                draggedBlockId === block.id ? "is-dragging" : "",
              ]
                .filter(Boolean)
                .join(" ")}
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

          <div className="builder-preview-breakpoints">
            <button
              type="button"
              className={`builder-preview-breakpoint ${previewWidth === 1280 ? "is-active" : ""}`}
              onClick={() => setPreviewWidth(1280)}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`builder-preview-breakpoint ${previewWidth === 768 ? "is-active" : ""}`}
              onClick={() => setPreviewWidth(768)}
            >
              Tablet
            </button>
            <button
              type="button"
              className={`builder-preview-breakpoint ${previewWidth === 390 ? "is-active" : ""}`}
              onClick={() => setPreviewWidth(390)}
            >
              Mobile
            </button>
          </div>

          {isReordering && (
            <span className="builder-canvas-status">Сохраняем порядок...</span>
          )}
        </div>
        <div className="builder-canvas-scroll">
          <div className="builder-preview-frame">
            <PreviewFrame
              blocks={page.blocks}
              width={previewWidth}
              minHeight={900}
            />
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
              {isSaving ? "Сохранение..." : "Сохранить блок"}
            </button>
            <button
              type="button"
              className="admin-button admin-button-danger"
              onClick={handleDeleteSelectedBlock}
              disabled={!selectedBlock || isDeletingBlock}
            >
              {isDeletingBlock ? "Удаление..." : "Удалить блок"}
            </button>
          </div>
        </div>
        {selectedBlock ? (
          <div className="builder-settings-body">
            <p className="builder-settings-type">
              {blockRegistry[selectedBlock.type]?.label || selectedBlock.type}
            </p>
            {error && <p className="builder-error-text">{error}</p>}
            {selectedBlockConfig?.fields?.map((field) => {
              const value = getFieldValue(selectedBlock, field.name);
              return (
                <div key={field.name} className="builder-field">
                  <label className="builder-label">{field.label}</label>
                  {renderFieldInput(field, value)}
                </div>
              );
            })}
            {selectedBlock?.type === "cardsGrid" && (
              <div className="builder-array-group">
                <div className="builder-array-header">
                  <h3>Элементы композиции</h3>
                  <div className="builder-inline-actions">
                    {Object.entries(cardsGridItemSchemas).map(
                      ([itemType, schema]) => (
                        <button
                          key={itemType}
                          type="button"
                          className="admin-button admin-button-secondary"
                          onClick={() => handleAddCardsGridItem(itemType)}
                        >
                          + {schema.label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                {selectedCardsGridItems.length === 0 ? (
                  <p className="builder-empty-text">
                    Элементы композиции пока не добавлены.
                  </p>
                ) : (
                  selectedCardsGridItems.map((item, index) => {
                    const schema = cardsGridItemSchemas[item.item_type];
                    if (!schema) return null;
                    const isExpanded = expandedItems[item.id] ?? false;
                    return (
                      <div key={item.id} className="builder-array-card">
                        <div className="builder-array-card-header">
                          <button
                            type="button"
                            className="builder-array-card-toggle"
                            onClick={() => toggleItemExpand(item.id)}
                          >
                            {isExpanded ? "▼" : "▶"} {index + 1}. {schema.label}
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button-danger-outline"
                            onClick={() => handleDeleteCardsGridItem(item.id)}
                          >
                            Удалить
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="builder-array-card-content">
                            {schema.fields.map((field) => (
                              <div
                                key={`${item.id}-${field.name}`}
                                className="builder-field"
                              >
                                <label className="builder-label">
                                  {field.label}
                                </label>
                                {renderCardsGridItemFieldInput(item, field)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
            {selectedBlockConfig?.hasItemsArray && (
              <div className="builder-array-group">
                <div className="builder-array-header">
                  <h3>Элементы</h3>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => {
                      const createItem =
                        selectedBlockConfig?.createItem || (() => ({}));
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
                                createItem(),
                              ],
                            },
                          };
                        }),
                      }));
                    }}
                  >
                    Добавить элемент
                  </button>
                </div>
                {(selectedBlock.props.items || []).map((item, index) => (
                  <div key={index} className="builder-array-card">
                    <div className="builder-array-card-top">
                      <p className="builder-array-card-title">{index + 1}</p>
                      <button
                        type="button"
                        className="admin-button admin-button-danger-outline"
                        onClick={() => {
                          setPage((prev) => ({
                            ...prev,
                            blocks: prev.blocks.map((block) => {
                              if (block.id !== selectedBlockId) return block;
                              return {
                                ...block,
                                props: {
                                  ...block.props,
                                  items: (block.props.items || []).filter(
                                    (_, itemIndex) => itemIndex !== index,
                                  ),
                                },
                              };
                            }),
                          }));
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                    {selectedBlockConfig.itemFields?.map((field) => {
                      const value = item?.[field.name] ?? "";
                      return (
                        <div
                          key={`${index}-${field.name}`}
                          className="builder-field"
                        >
                          <label className="builder-label">{field.label}</label>
                          {renderLegacyArrayItemFieldInput(index, field, value)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="builder-empty">
            Выбери блок слева, чтобы редактировать его.
          </div>
        )}
      </aside>
    </div>
  );
};

export default AdminPageBuilder;
