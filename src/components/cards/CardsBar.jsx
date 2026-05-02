import React from "react";
import MenuCard from "./MenuCard";
import PrimaryButton from "../buttons/PrimaryButton";
import ArrowRight from "../../assets/icons/ArrowRight";
import icon1 from "../../assets/images/icon_1.png";
import icon2 from "../../assets/images/icon_2.png";
import icon3 from "../../assets/images/icon_3.png";
import icon4 from "../../assets/images/icon_4.png";
import icon5 from "../../assets/images/icon_5.png";

const mockCards = [
  {
    id: 1,
    text: "Экскурсии",
    image: icon1,
    linkUrl: "/services",
  },
  {
    id: 2,
    text: "Расписание",
    image: icon2,
    linkUrl: "/timeprice",
  },
  {
    id: 3,
    text: "Мероприятия",
    image: icon3,
    linkUrl: "/events",
  },
  {
    id: 4,
    text: "Проживание",
    image: icon4,
    linkUrl: "/stay",
  },
  {
    id: 5,
    text: "Контакты",
    image: icon5,
    linkUrl: "/contacts",
  },
];

const CardsBar = ({ cards = mockCards, cardNumbers = [1, 2, 3, 4] }) => {
  const selectedCards = cardNumbers
    .slice(0, 4)
    .map((number) => cards[number - 1])
    .filter(Boolean);

  return (
    <div className="cards-bar">
      {selectedCards.map((card) => (
        <MenuCard
          key={card.id}
          text={card.text}
          image={card.image}
          linkUrl={card.linkUrl}
        />
      ))}

      <div className="cards-bar-button">
        <PrimaryButton linkUrl="/services" icon={<ArrowRight />} />
      </div>
    </div>
  );
};

export default CardsBar;
