import React from "react";
import MenuCard from "./MenuCard";
import PrimaryButton from "../buttons/PrimaryButton";
import ArrowRight from "../../assets/icons/ArrowRight";

const CardsBar = ({ cards = [], buttonLinkUrl = "/" }) => {
  return (
    <div className="cards-bar">
      {cards.map((card) => (
        <MenuCard
          key={card.id}
          text={card.text}
          image={card.image}
          linkUrl={card.linkUrl}
        />
      ))}

      <div className="cards-bar-button">
        <PrimaryButton linkUrl={buttonLinkUrl} icon={<ArrowRight />} />
      </div>
    </div>
  );
};

export default CardsBar;
