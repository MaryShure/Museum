import React from "react";
import { Link } from "react-router-dom";
import "./cards.css";

const CardMini = ({
  image,
  title,
  description,
  linkUrl,
  altText = "Изображение товара",
}) => {
  return (
    <Link to={linkUrl} className="card-mini">
      {image && (
        <div className="card-mini-image">
          <img src={image} alt={altText} />
        </div>
      )}

      <div className="card-mini-content">
        {title && <h3 className="card-title">{title}</h3>}

        {description && <p className="card-mini-description">{description}</p>}
      </div>
    </Link>
  );
};

export default CardMini;
