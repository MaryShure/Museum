import React from "react";
import "./cards.css";
import PrimaryButton from "../buttons/PrimaryButton";
import SecondaryButton from "../buttons/SecondaryButton";

const BigCard = ({
  image,
  title,
  description,
  buttonType,
  buttonText,
  linkUrl,
  altText = "",
}) => {
  console.log("BigCard render", {
    image,
    title,
    description,
    buttonType,
    buttonText,
    linkUrl,
  });
  const canRenderButton = buttonType && buttonText && linkUrl;

  const renderButton = () => {
    if (!canRenderButton) return null;

    if (buttonType === "primary") {
      return <PrimaryButton text={buttonText} linkUrl={linkUrl} />;
    }

    if (buttonType === "secondary") {
      return <SecondaryButton text={buttonText} linkUrl={linkUrl} />;
    }

    return null;
  };

  return (
    <div className="big-card">
      {image && (
        <div className="big-card-image">
          <img src={image} alt={altText || title || "Изображение карточки"} />
        </div>
      )}

      <div className="big-card-content">
        {title && <h3 className="card-title">{title}</h3>}

        {description && <p className="card-description">{description}</p>}

        {canRenderButton ? (
          <div className="big-card-actions">{renderButton()}</div>
        ) : null}
      </div>
    </div>
  );
};

export default BigCard;
