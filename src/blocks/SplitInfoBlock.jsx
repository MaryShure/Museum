import StartText from "../components/cards/StartText";
import CardWithText from "../components/cards/CardWithText";
import "../styles/global.css";
import "../styles/main_page.css";

const SplitInfoBlock = ({
  title,
  description,
  leftCardTitle,
  leftCardDescription,
  rightCardTitle,
  rightCardDescription,
}) => {
  return (
    <div>
      <StartText title={title} description={description} />

      <div className="inner-block">
        <CardWithText
          title={leftCardTitle}
          description={leftCardDescription}
          height="100%"
        />
        <CardWithText
          title={rightCardTitle}
          description={rightCardDescription}
          height="100%"
        />
      </div>
    </div>
  );
};

export default SplitInfoBlock;
