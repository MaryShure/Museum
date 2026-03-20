import React from "react";
import './buttons.css'

const PrimaryButton = ({
    icon,        // Может быть: компонент, строка с именем, или null
    text, 
    linkUrl,
    iconPosition = 'right', 
    onClick 
}) => {
    const renderIcon = () => {
        if (!icon) return null;
        
        if (React.isValidElement(icon)) {
          return <span className="primary-button-icon">{icon}</span>;
        }
        
        if (typeof icon === 'string') {
          return <span className="primary-button-icon menu-button-icon-text">{icon}</span>;
        }
        
        return null;
    };
    
    return (
            <a 
                href={linkUrl} 
                className={`primary-button ${!text ? 'primary-button-icon-only' : ''}`}
                onClick={onClick}
            >
                {iconPosition === 'left' && renderIcon()}
                {text && <span>{text}</span>}
                {iconPosition === 'right' && renderIcon()}
            </a>    
    );
}

export default PrimaryButton;