import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MenuButton from "../buttons/MenuButton";
import DotIcon from "../../assets/icons/DotIcon";
import InstagramIcon from "../../assets/icons/InstagramIcon";
import FacebookIcon from "../../assets/icons/FacebookIcon";
import DropdownMenu from "./DropdownMenu";
import "./header.css";
import "../map/map.css";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`header ${
          isDropdownOpen ? "has-dropdown-open" : ""
        } ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <a href="#/" className="home-icon">
          <img
            src="https://starymensk.by/wp-content/uploads/2023/10/2.png"
            alt="Логотип"
          />
        </a>

        <div className="buttons-bar desktop-menu">
          <div
            className="menu-item"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <MenuButton icon={<DotIcon />} text="Услуги" linkUrl="/services" />
            <DropdownMenu isOpen={isDropdownOpen} />
          </div>

          <MenuButton text="Новости" linkUrl="/about" />
          <MenuButton text="Что посмотреть" linkUrl="/afisha" />
          <MenuButton text="График работы/Цены" linkUrl="/timeprice" />
        </div>

        <div className="icon-bar desktop-menu">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </a>
          <button
            type="button"
            className={`secondary-button mobile-menu-toggle ${
              isMobileMenuOpen ? "is-active" : ""
            }`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="burger-icon" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
      >
        <div className="mobile-menu-content">
          <nav className="mobile-menu-nav">
            <MenuButton
              text="Услуги"
              linkUrl="/services"
              onClick={closeMobileMenu}
            />
            <MenuButton
              text="Новости"
              linkUrl="/about"
              onClick={closeMobileMenu}
            />
            <MenuButton
              text="Что посмотреть"
              linkUrl="/afisha"
              onClick={closeMobileMenu}
            />
            <MenuButton
              text="График работы/Цены"
              linkUrl="/timeprice"
              onClick={closeMobileMenu}
            />
          </nav>

          <div className="map-content">
            <div className="map-text-block">
              <h2>Адрес</h2>
              <p>д. Городище, Минский район, ул. Замковая, 1</p>
            </div>
            <div className="map-text-block">
              <h2>Для навигаторов</h2>
              <p>Введите «Стары Менск» или координаты: 53.8247, 27.3411</p>
            </div>
          </div>

          <div className="mobile-socials">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
