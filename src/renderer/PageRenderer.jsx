import { blockRegistry } from "../block-registry/blockRegistry";

const PageRenderer = ({ blocks = [] }) => {
  const visibleBlocks = [...blocks]
    .filter(Boolean)
    .filter((block) => block.is_visible !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <main className="main-content">
      {visibleBlocks.map((block, index) => {
        const registryItem = blockRegistry[block.type];

        if (!registryItem?.component) {
          return null;
        }

        const BlockComponent = registryItem.component;
        const isFirstBlock = index === 0;
        const isHero = block.type === "hero";
        const needsTopOffset = isFirstBlock && !isHero;

        const blockProps = block.props || {};
        const blockItems = Array.isArray(block.items)
          ? block.items
          : Array.isArray(blockProps.items)
            ? blockProps.items
            : [];

        const classNames = [
          "page-block",
          isHero ? "page-block--hero" : "",
          needsTopOffset ? "page-block--with-top-offset" : "",
          `page-block--${block.type}`,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <section
            key={block.id ?? `${block.type}-${index}`}
            className={classNames}
          >
            <BlockComponent
              {...blockProps}
              block={block}
              props={blockProps}
              items={blockItems}
              id={block.id}
              type={block.type}
              type_name={block.type_name}
              sort_order={block.sort_order}
              is_visible={block.is_visible}
            />
          </section>
        );
      })}
    </main>
  );
};

export default PageRenderer;
