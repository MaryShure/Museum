import { useState } from "react";
import "../styles/global.css";
import "../styles/main_page.css";
import Card from "../components/cards/Card";
import Cardsbar from "../components/cards/CardsBar";
import SecondaryButton from "../components/buttons/SecondaryButton";
import Map from "../components/map/Map";
import CardMini from "../components/cards/CardMini";
import CardWithText from "../components/cards/CardWithText";
import CardNoHover from "../components/cards/CardNoHover";
import BigCard from "../components/cards/BigCard";
import TextBlock from "../components/cards/TextBlock";
import StartText from "../components/cards/StartText";
import PrimaryButton from "../components/buttons/PrimaryButton";

const TimeTableAndPricePage = () => {
  return (
    <>
      <div className="main-content">
        <div>
          <StartText title="Графік працы" />
          <TextBlock
            items={[
              {
                title: "Індывідуальна",
                description:
                  "Субота і нядзеля \n 11:00 – 18:00 \n Па запісе ці ў вольным парадку ў межах графіку.",
              },
              {
                title: "Групавыя візіты",
                description:
                  "Буднія дні для груп ад 15 чалавек \n Любы дзень \n Паводле папярэдняй дамоўленасці. ",
              },
              {
                title: "Паслугі сядзібы ",
                description:
                  "Пакоі / Лазня / Залы \n Любы дзень \n Паводле папярэдняга браніравання.",
              },
            ]}
            minHeight={300}
          />
        </div>
      </div>
    </>
  );
};

export default TimeTableAndPricePage;
