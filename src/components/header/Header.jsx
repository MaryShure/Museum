import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import MenuButton from "../buttons/MenuButton";
import DotIcon from "../../assets/icons/DotIcon";
import InstagramIcon from "../../assets/icons/InstagramIcon";
import FacebookIcon from "../../assets/icons/FacebookIcon";
import DropdownMenu from "./DropdownMenu";
import { getSiteSettings } from "../../api/siteSettingsApi";
import "./header.css";
import "../map/map.css";

const resolveUrl = (item) => {
  if (item?.url) return item.url;
  if (item?.page?.route_path) return item.page.route_path;
  return "#";
};

const getSocialIcon = (type) => {
  if (type === "instagram") return <InstagramIcon />;
  if (type === "facebook") return <FacebookIcon />;
  return <DotIcon />;
};

const Header = () => {
  const [config, setConfig] = useState({
    logoLink: "/",
    logoUrl: "",
    menuItems: [],
    socials: [],
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setConfig({
          logoLink: data.header_config?.logoLink || "/",
          logoUrl: data.header_config?.logoUrl || "",
          menuItems: data.header_config?.menuItems || [],
          socials: data.header_config?.socials || [],
        });
      } catch (error) {
        console.error("Не удалось загрузить настройки header", error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const activeDropdown = useMemo(
    () =>
      config.menuItems.find(
        (item) => item.id === activeDropdownId && item.type === "dropdown",
      ) || null,
    [config.menuItems, activeDropdownId],
  );

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openDropdown = (itemId) => {
    clearCloseTimeout();
    setActiveDropdownId(itemId);
    setIsDropdownOpen(true);
  };

  const closeDropdown = () => {
    clearCloseTimeout();
    setActiveDropdownId(null);
    setIsDropdownOpen(false);
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      closeDropdown();
    }, 200);
  };

  // Обработчики для хедера
  const handleHeaderMouseLeave = () => {
    scheduleClose();
  };

  // Обработчик для пункта меню
  const handleMenuItemMouseEnter = (item, hasDropdown) => {
    if (hasDropdown) {
      openDropdown(item.id);
    } else {
      closeDropdown();
    }
  };

  // Обработчики для дропдауна
  const handleDropdownMouseEnter = () => {
    clearCloseTimeout(); // Отменяем запланированное закрытие
  };

  const handleDropdownMouseLeave = () => {
    scheduleClose(); // Планируем закрытие
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <header
        className={`header ${isDropdownOpen ? "has-dropdown-open" : ""}`}
        onMouseLeave={handleHeaderMouseLeave}
      >
        <Link to={config.logoLink || "/"} className="home-icon">
          <img src={config.logoUrl || "/logo192.png"} alt="Логотип" />
        </Link>

        <div className="buttons-bar desktop-menu">
          {config.menuItems.map((item) => {
            const linkUrl = resolveUrl(item);
            const hasDropdown =
              item.type === "dropdown" && item.dropdownItems?.length > 0;

            return (
              <div
                key={item.id}
                className="menu-item"
                onMouseEnter={() => handleMenuItemMouseEnter(item, hasDropdown)}
              >
                <MenuButton
                  text={item.label}
                  linkUrl={linkUrl}
                  icon={hasDropdown ? <DotIcon /> : null}
                  iconPosition="right"
                />
              </div>
            );
          })}
        </div>

        <div className="icon-bar desktop-menu">
          {config.socials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.type || "social"}
            >
              {getSocialIcon(social.type)}
            </a>
          ))}
        </div>

        <button
          type="button"
          className={`buttons-bar mobile-menu-toggle ${
            isMobileMenuOpen ? "is-active" : ""
          }`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <span className="burger-icon">
            <span />
            <span />
            <span />
          </span>
        </button>

        <DropdownMenu
          isOpen={isDropdownOpen}
          items={activeDropdown?.dropdownItems || []}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        />
      </header>

      <div
        className={`mobile-menu ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
      >
        <div className="mobile-menu-content">
          <nav className="mobile-menu-nav">
            {config.menuItems.map((item) => {
              const linkUrl = resolveUrl(item);
              return (
                <Link key={item.id} to={linkUrl} onClick={closeMobileMenu}>
                  <MenuButton text={item.label} />
                </Link>
              );
            })}
          </nav>

          <div className="map-content">
            <hr />
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
            {config.socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.type || "social"}
              >
                {getSocialIcon(social.type)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
