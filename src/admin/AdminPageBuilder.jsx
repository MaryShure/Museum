import { useState } from "react";
import { mainPageData } from "../data/mainPageData";
import PageRenderer from "../renderer/PageRenderer";
import { blockRegistry } from "../block-registry/blockRegistry";

const AdminPageBuilder = () => {
  const [page, setPage] = useState(mainPageData);
  const [selectedBlockId, setSelectedBlockId] = useState(
    page.blocks[0]?.id ?? null,
  );

  const selectedBlock = page.blocks.find(
    (block) => block.id === selectedBlockId,
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

  return (
    <div className="builder-layout">
      <aside className="builder-sidebar">
        <div className="builder-panel-header">
          <h2>Структура</h2>
          <button className="admin-button admin-button-secondary">
            Добавить
          </button>
        </div>

        <div className="builder-block-list">
          {page.blocks.map((block, index) => (
            <button
              key={block.id}
              className={`builder-block-item ${selectedBlockId === block.id ? "is-active" : ""}`}
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

      <section className="builder-canvas">
        <div className="builder-canvas-toolbar">
          <span className="builder-canvas-badge">Desktop preview</span>
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
        </div>

        {selectedBlock ? (
          <div className="builder-settings-body">
            <p className="builder-settings-type">
              {blockRegistry[selectedBlock.type]?.label || selectedBlock.type}
            </p>

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
                value = selectedBlock.props[field.name] || "";
              }

              return (
                <div key={field.name} className="builder-field">
                  <label className="builder-label">{field.label}</label>

                  {field.type === "textarea" ? (
                    <textarea
                      className="builder-input builder-textarea"
                      value={value || ""}
                      onChange={(e) =>
                        updateBlockProp(field.name, e.target.value)
                      }
                    />
                  ) : field.type === "checkbox-group" ? (
                    <div className="builder-checkbox-group">
                      {field.options.map((option) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        const checked = currentValues.includes(option.value);

                        return (
                          <label
                            key={option.value}
                            className="builder-checkbox-item"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                let nextValues;

                                if (checked) {
                                  nextValues = currentValues.filter(
                                    (item) => item !== option.value,
                                  );
                                } else {
                                  if (currentValues.length >= 4) return;
                                  nextValues = [...currentValues, option.value];
                                }

                                updateBlockProp(field.name, nextValues);
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}

                      <p className="builder-help-text">
                        Можно выбрать не более 4 карточек.
                      </p>
                    </div>
                  ) : (
                    <input
                      className="builder-input"
                      type="text"
                      value={value || ""}
                      onChange={(e) =>
                        updateBlockProp(field.name, e.target.value)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="builder-empty">Выбери блок слева</div>
        )}
      </aside>
    </div>
  );
};

export default AdminPageBuilder;
