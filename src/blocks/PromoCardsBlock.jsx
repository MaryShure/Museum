import Card from "../components/cards/Card";
import PrimaryButton from "../components/buttons/PrimaryButton";
import "../styles/global.css";
import "../styles/main_page.css";

const PromoCardsBlock = ({
  title,
  description,
  buttonText,
  card1Image,
  card1Title,
  card1Description,
  card2Image,
  card2Title,
  card2Description,
}) => {
  return (
    <div className="block-six">
      <div className="block-six-text">
        <h2>{title}</h2>
        <p>{description}</p>
        <PrimaryButton text={buttonText} />
      </div>

      <div>
        <Card
          image={card1Image}
          title={card1Title}
          description={card1Description}
        />
        <Card
          image={card2Image}
          title={card2Title}
          description={card2Description}
        />
      </div>
    </div>
  );
};

export default PromoCardsBlock;
