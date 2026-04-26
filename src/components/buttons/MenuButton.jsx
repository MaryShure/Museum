import React from "react";
import "./buttons.css";
import { Link } from "react-router-dom";

const MenuButton = ({
  icon,
  text,
  linkUrl,
  iconPosition = "right",
  onClick,
}) => {
  // Функция для рендера иконки
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return <span className="menu-button-icon">{icon}</span>;
    }

    if (typeof icon === "string") {
      return (
        <span className="menu-button-icon menu-button-icon-text">{icon}</span>
      );
    }

    return null;
  };

  return (
    <Link
      to={linkUrl}
      className={`menu-button ${!text ? "menu-button-icon-only" : ""}`}
      onClick={onClick}
    >
      {
        <>
          {iconPosition === "left" && renderIcon()}
          {text && <span>{text}</span>}
          {iconPosition === "right" && renderIcon()}
        </>
      }
    </Link>
  );
};

export default MenuButton;
