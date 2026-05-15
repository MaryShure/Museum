import { blockRegistry } from "../block-registry/blockRegistry";

const PageRenderer = ({ blocks = [] }) => {
  return (
    <main className="main-content">
      {blocks.map((block, index) => {
        const registryItem = blockRegistry[block.type];
        if (!registryItem) return null;

        const BlockComponent = registryItem.component;
        const isFirstBlock = index === 0;
        const isHero = block.type === "hero";
        const needsTopOffset = isFirstBlock && !isHero;

        const classNames = [
          "page-block",
          isHero ? "page-block--hero" : "",
          needsTopOffset ? "page-block--with-top-offset" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <section key={block.id} className={classNames}>
            <BlockComponent {...block.props} />
          </section>
        );
      })}
    </main>
  );
};

export default PageRenderer;
