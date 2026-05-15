import React from "react";
import MenuCard from "../cards/MenuCard";
import "./dropdown.css";

const resolveUrl = (item) => {
  if (item?.url) return item.url;
  if (item?.page?.route_path) return item.page.route_path;
  return "#";
};

const DropdownMenu = ({ isOpen, items = [] }) => {
  return (
    <div className={`dropdown-menu ${isOpen ? "dropdown-open" : ""}`}>
      <div className="dropdown-content">
        {items.map((item) => (
          <MenuCard
            key={item.id}
            text={item.title}
            image={item.image}
            linkUrl={resolveUrl(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
