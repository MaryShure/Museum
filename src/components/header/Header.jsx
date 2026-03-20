import React, { useState } from "react";
import MenuButton from "../buttons/MenuButton";
import DotIcon from "../../assets/icons/DotIcon";
import InstagramIcon from "../../assets/icons/InstagramIcon";
import FacebookIcon from "../../assets/icons/FacebookIcon";
import DropdownMenu from "./DropdownMenu";
import "./header.css";

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleMobileLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return(
        <>
            <div className={`header ${isDropdownOpen ? 'has-dropdown-open' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <div className="home-icon">
                    <img src="https://starymensk.by/wp-content/uploads/2023/10/2.png" alt="Home"/>
                </div>
                
                {/* Десктопное меню (планшет и выше) */}
                <div className="buttons-bar desktop-menu">
                    <div 
                        className="menu-item"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <MenuButton 
                            icon={<DotIcon/>} 
                            text="Услуги" 
                            linkUrl="/"
                        />
                        <DropdownMenu isOpen={isDropdownOpen} />
                    </div>
                    
                    <MenuButton text="Новости" linkUrl="/"/>
                    <MenuButton text="Что посмотреть" linkUrl="/"/>
                    <MenuButton text="Время работы / Цены" linkUrl="/" className="button-color"/>
                </div>
                
                {/* Бургер-меню для мобильных */}
                <button 
                    className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Меню"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <div className="icon-bar"> 
                    <InstagramIcon/>
                    <FacebookIcon/>
                </div>
            </div>
            
            {/* Мобильное выпадающее меню */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <nav className="mobile-menu-nav">
                    <MenuButton text="Услуги" linkUrl="/" onClick={handleMobileLinkClick}/>
                    <MenuButton text="Новости" linkUrl="/" onClick={handleMobileLinkClick}/>
                    <MenuButton text="Что посмотреть" linkUrl="/" onClick={handleMobileLinkClick}/>
                    <MenuButton text="Время работы / Цены" linkUrl="/" className="button-color" onClick={handleMobileLinkClick}/>
                </nav>
            </div>
        </>
    );
}

export default Header;