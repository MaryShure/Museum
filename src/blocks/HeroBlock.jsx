import "../styles/global.css";
import "../styles/main_page.css";

const HeroBlock = ({
  title,
  subtitle,
  backgroundImage,
  textAlign = "center",
}) => {
  const heroStyle = {
    backgroundImage: backgroundImage ? `url("${backgroundImage}")` : undefined,
  };

  return (
    <div
      className={`first-block first-block--align-${textAlign}`}
      style={heroStyle}
    >
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default HeroBlock;
