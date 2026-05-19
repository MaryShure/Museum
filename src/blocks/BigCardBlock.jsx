import React from "react";
import BigCard from "../components/cards/BigCard";

const BigCardBlock = ({
  image,
  altText,
  title,
  description,
  buttonType,
  buttonText,
  linkUrl,
}) => {
  return (
    <section className="page-block page-block-big-card">
      <BigCard
        image={image}
        altText={altText || "Изображение карточки"}
        title={title}
        description={description}
        buttonType={buttonType || ""}
        buttonText={buttonText}
        linkUrl={linkUrl}
      />
    </section>
  );
};

export default BigCardBlock;
