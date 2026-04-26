import React from "react";
import { Link } from "react-router-dom";
import "./cards.css";

const MenuCard = ({ text, image, linkUrl }) => {
  return (
    <Link to={linkUrl}>
      <div className="menu-card">
        <h3 className="menu-card-title">{text}</h3>
        <div className="menu-card-image">
          <img src={image} alt={text} />
        </div>
      </div>
    </Link>
  );
};

export default MenuCard;
