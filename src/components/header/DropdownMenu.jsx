import React from 'react';
import MenuCard from '../cards/MenuCard';
import './dropdown.css';

const DropdownMenu = ({ isOpen }) => {
  // Массив с данными для карточек
  const services = [
    { text: "Экскурсии", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/excursions" },
    { text: "Банкеты", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/banquets" },
    { text: "Мастер-классы", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/masterclasses" },
    { text: "Квесты", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/quests" },
    { text: "Фотосессии", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/photoshoots" },
    { text: "Лекции", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/lectures" },
    { text: "Концерты", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/concerts" },
    { text: "Выставки", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/exhibitions" },
    { text: "Детские праздники", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/kids" },
    { text: "Корпоративы", image: "https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg", linkUrl: "/corporate" }
  ];

  return (
    <div className={`dropdown-menu ${isOpen ? 'dropdown-open' : ''}`}>
      <div className="dropdown-content">
        {services.map((service, index) => (
          <MenuCard
            key={index}
            text={service.text}
            image={service.image}
            linkUrl={service.linkUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;