import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InstagramIcon from "../../assets/icons/InstagramIcon";
import FacebookIcon from "../../assets/icons/FacebookIcon";
import DotIcon from "../../assets/icons/DotIcon";
import { getSiteSettings } from "../../api/siteSettingsApi";
import "./footer.css";

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

const Footer = () => {
  const [config, setConfig] = useState({
    logoLink: "/",
    logoUrl: "",
    columns: [],
    socials: [],
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setConfig({
          logoLink: data.footer_config?.logoLink || "/",
          logoUrl: data.footer_config?.logoUrl || "",
          columns: data.footer_config?.columns || [],
          socials: data.footer_config?.socials || [],
        });
      } catch (error) {
        console.error("Не удалось загрузить настройки footer", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <footer className="footer">
      <div>
        <Link to={config.logoLink || "/"} className="home-icon">
          <img src={config.logoUrl || "/logo192.png"} alt="Логотип" />
        </Link>
      </div>

      {config.columns.map((column) => (
        <div key={column.id}>
          <div>
            <strong>{column.title}</strong>
            {(column.links || []).map((link) => {
              const href = resolveUrl(link);

              return (
                <Link key={link.id} to={href}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <div className="icon-bar">
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
    </footer>
  );
};

export default Footer;
