import TextBlock from "../components/cards/TextBlock";

const TextBlockBlock = ({ items = [], minHeight, width, maxWidth, height }) => {
  return (
    <TextBlock
      items={items}
      minHeight={minHeight}
      width={width}
      maxWidth={maxWidth}
      height={height}
    />
  );
};

export default TextBlockBlock;
