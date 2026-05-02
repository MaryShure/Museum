import { blockRegistry } from "../block-registry/blockRegistry";

const PageRenderer = ({ blocks }) => {
  return (
    <>
      {blocks.map((block) => {
        const registryItem = blockRegistry[block.type];

        if (!registryItem) return null;

        const Component = registryItem.component;

        return <Component key={block.id} {...block.props} />;
      })}
    </>
  );
};

export default PageRenderer;
