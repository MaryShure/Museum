import TextBlock from "../components/cards/TextBlock";

const TextBlockBlock = ({ props = {}, ...rest }) => {
  const source = props && Object.keys(props).length ? props : rest;

  return (
    <TextBlock
      items={source.items || []}
      minHeight={source.minHeight || ""}
      width={source.width || ""}
      maxWidth={source.maxWidth || ""}
      height={source.height || ""}
    />
  );
};

export default TextBlockBlock;
