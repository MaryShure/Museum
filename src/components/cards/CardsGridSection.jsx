import React from "react";
import Card from "./Card";
import CardNoHover from "./CardNoHover";
import CardWithText from "./CardWithText";
import StartText from "./StartText";
import "./cards.css";

const ImageCell = ({
  image,
  altText = "Изображение",
  width,
  maxWidth,
  minHeight,
  height,
}) => {
  const style = {
    width: width || undefined,
    maxWidth: maxWidth || undefined,
    minHeight: minHeight || undefined,
    height: height || undefined,
  };

  return (
    <div className="cards-grid-image-cell" style={style}>
      {image ? <img src={image} alt={altText} /> : null}
    </div>
  );
};

const TextCell = ({
  title,
  description,
  textAlign = "left",
  width,
  maxWidth,
  minHeight,
  height,
}) => {
  const style = {
    textAlign,
    width: width || undefined,
    maxWidth: maxWidth || undefined,
    minHeight: minHeight || undefined,
    height: height || undefined,
  };

  return (
    <div className="cards-grid-text-cell" style={style}>
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
    </div>
  );
};

const renderItem = (item) => {
  if (item.is_visible === false) return null;

  const data = item.props || {};

  switch (item.item_type) {
    case "card":
      if (data.variant === "noHover") {
        return (
          <CardNoHover
            image={data.image}
            altText={data.altText}
            title={data.title}
            description={data.description}
            linkUrl={data.linkUrl}
          />
        );
      }

      return (
        <Card
          image={data.image}
          altText={data.altText}
          title={data.title}
          description={data.description}
          linkUrl={data.linkUrl}
        />
      );

    case "textCard":
      return (
        <CardWithText
          title={data.title}
          description={data.description}
          buttonType={data.buttonType}
          buttonText={data.buttonText}
          linkUrl={data.linkUrl}
          width={data.width}
          maxWidth={data.maxWidth}
          minHeight={data.minHeight}
          height={data.height}
        />
      );

    case "image":
      return (
        <ImageCell
          image={data.image}
          altText={data.altText}
          width={data.width}
          maxWidth={data.maxWidth}
          minHeight={data.minHeight}
          height={data.height}
        />
      );

    case "text":
      return (
        <TextCell
          title={data.title}
          description={data.description}
          textAlign={data.textAlign || "left"}
          width={data.width}
          maxWidth={data.maxWidth}
          minHeight={data.minHeight}
          height={data.height}
        />
      );

    default:
      return null;
  }
};

const CardsGridSection = ({
  showStartText = false,
  title = "",
  description = "",
  items = [],
}) => {
  const sortedItems = [...items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  return (
    <section className="cards-grid-section">
      {showStartText && (title || description) ? (
        <StartText title={title} description={description} />
      ) : null}

      <div className="cards-grid">
        {sortedItems.map((item) => (
          <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default CardsGridSection;
