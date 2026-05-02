import StartText from "../components/cards/StartText";
import CardWithText from "../components/cards/CardWithText";
import "../styles/global.css";
import "../styles/main_page.css";

const FeatureGridBlock = ({
  title,
  card1Title,
  card1Description,
  card1ButtonText,
  card2Title,
  card2Description,
  image1,
  image2,
  card3Title,
  card3Description,
}) => {
  return (
    <div>
      <StartText title={title} />

      <div className="inner-block-grid">
        <CardWithText
          title={card1Title}
          description={card1Description}
          buttonType="secondary"
          buttonText={card1ButtonText}
        />

        <CardWithText title={card2Title} description={card2Description} />

        <img
          className="block-two-item block-two-img block-two-img-3"
          src={image1}
          alt=""
          loading="lazy"
        />

        <img
          className="block-four-img-2 image"
          src={image2}
          alt=""
          loading="lazy"
        />

        <CardWithText
          title={card3Title}
          description={card3Description}
          buttonType="secondary"
          buttonText="Подробнее"
        />
      </div>
    </div>
  );
};

export default FeatureGridBlock;
