import React from 'react';
import './buttons.css';

const MenuButton = ({ 
  icon,        // Может быть: компонент, строка с именем, или null
  text, 
  linkUrl,
  iconPosition = 'right', 
  onClick 
}) => {
  // Функция для рендера иконки
  const renderIcon = () => {
    if (!icon) return null;
    
    if (React.isValidElement(icon)) {
      return <span className="menu-button-icon">{icon}</span>;
    }
    
    if (typeof icon === 'string') {
      return <span className="menu-button-icon menu-button-icon-text">{icon}</span>;
    }
    
    return null;
  };

  return (
        <a 
            href={linkUrl} 
            className={`menu-button ${!text ? 'menu-button-icon-only' : ''}`}
            onClick={onClick}
        >
            {iconPosition === 'left' && renderIcon()}
            {text && <span>{text}</span>}
            {iconPosition === 'right' && renderIcon()}
        </a>    
  );
};

export default MenuButton;