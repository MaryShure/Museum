import React from "react";
import CardsGridSection from "../components/cards/CardsGridSection";

const CardsGridBlock = ({ props = {}, items = [] }) => {
  return (
    <section className="page-block page-block-cards-grid">
      <CardsGridSection
        showStartText={props.showStartText === "yes"}
        title={props.title || ""}
        description={props.description || ""}
        items={items}
      />
    </section>
  );
};

export default CardsGridBlock;
