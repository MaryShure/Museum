import React from "react";
import './cards.css';

const MenuCard = ({ text, image, linkUrl }) => {
  return (
    <a href={linkUrl}>
      <div className="menu-card">
        <h3 className="menu-card-title">{text}</h3>
        <div className="menu-card-image">
          <img src={image} alt={text} />
        </div>
      </div>
    </a>
  );
};

export default MenuCard;