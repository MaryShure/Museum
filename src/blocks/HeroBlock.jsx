import "../styles/global.css";
import "../styles/main_page.css";

const HeroBlock = ({ title, subtitle }) => {
  return (
    <div className="first-block">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default HeroBlock;
