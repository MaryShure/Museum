import React from "react";
import { Link } from "react-router-dom";
import "./buttons.css";

const SecondaryButton = ({
  icon,
  text,
  linkUrl = "#",
  iconPosition = "right",
  onClick,
}) => {
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return <span className="secondary-button-icon">{icon}</span>;
    }

    if (typeof icon === "string") {
      return <span className="secondary-button-icon">{icon}</span>;
    }

    return null;
  };

  return (
    <Link
      href={linkUrl}
      className={`secondary-button ${!text ? "secondary-button-icon-only" : ""}`}
      onClick={onClick}
    >
      {
        <>
          {iconPosition === "left" && renderIcon()}
          {text && <span className="secondary-button-text">{text}</span>}
          {iconPosition === "right" && renderIcon()}
        </>
      }
    </Link>
  );
};

export default SecondaryButton;
