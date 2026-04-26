import React from "react";
import { Link } from "react-router-dom";
import "./cards.css";

const Card = ({
  image,
  title,
  description,
  linkUrl,
  altText = "Изображение товара",
}) => {
  return (
    <Link to={linkUrl} className="card">
      {image && (
        <div className="card-image">
          <img src={image} alt={altText} />
        </div>
      )}

      <div className="card-content">
        {title && <h3 className="card-title">{title}</h3>}

        <hr></hr>

        {description && <p className="card-description">{description}</p>}
      </div>
    </Link>
  );
};

export default Card;
