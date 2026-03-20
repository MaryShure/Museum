import React, { useState } from "react";
import MenuButton from "../buttons/MenuButton";
import DotIcon from "../../assets/icons/DotIcon";
import InstagramIcon from "../../assets/icons/InstagramIcon";
import FacebookIcon from "../../assets/icons/FacebookIcon";
import DropdownMenu from "./DropdownMenu";
import "./header.css";

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return(
        <div className={`header ${isDropdownOpen ? 'has-dropdown-open' : ''}`}>
            <div className="home-icon">
                <img src="https://starymensk.by/wp-content/uploads/2023/10/2.png" alt="Home"/>
            </div>
            
            <div className="buttons-bar">
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
            
            <div className="icon-bar"> 
                <InstagramIcon/>
                <FacebookIcon/>
            </div>
        </div>
    );
}

export default Header;