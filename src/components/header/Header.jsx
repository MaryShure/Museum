import React from "react";
import MenuButton from "../buttons/MenuButton";
import DotIcon from "../../assets/icons/DotIcon";
import InstagramIcon from "../../assets/icons/InstagramIcon"
import FacebookIcon from "../../assets/icons/FacebookIcon"
import "./header.css"

const Header = () => {
    return(
        <div className="header">
            <div className="home-icon">
                <img src="https://starymensk.by/wp-content/uploads/2023/10/2.png"/>
            </div>
            <div className="buttons-bar">
                <MenuButton icon={<DotIcon color="var(--primary-300)" />} text="Услуги" linkUrl="/"/>
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