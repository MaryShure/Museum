import React from "react";
import MenuCard from "./MenuCard";
import PrimaryButton from "../buttons/PrimaryButton";
import ArrowRight from "../../assets/icons/ArrowRight";

const Cardsbar = () => {
    return(
        <div className="cards-bar">
            <MenuCard 
            text="Экскурсии"
            image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
            linkUrl="/banquet"
            />
            <MenuCard 
              text="Экскурсии"
              image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
              linkUrl="/banquet"
            />
            <MenuCard 
              text="Экскурсии"
              image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
              linkUrl="/banquet"
            />
            <MenuCard 
              text="Экскурсии"
              image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
              linkUrl="/banquet"
            />
            <PrimaryButton icon={<ArrowRight/>} linkUrl="/"/>
        </div>
    );
}

export default Cardsbar;