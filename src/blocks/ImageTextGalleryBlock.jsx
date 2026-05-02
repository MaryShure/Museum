import CardWithText from "../components/cards/CardWithText";
import "../styles/global.css";
import "../styles/main_page.css";

const ImageTextGalleryBlock = ({ title, description, images = [] }) => {
  return (
    <div className="block-two">
      <div className="block-two-item block-two-text">
        <CardWithText title={title} description={description} />
      </div>

      <img
        className="block-two-item block-two-img block-two-img-1"
        src={images[0]}
        alt=""
        loading="lazy"
      />

      <img
        className="block-two-item block-two-img block-two-img-2"
        src={images[1]}
        alt=""
        loading="lazy"
      />

      <img
        className="block-two-item block-two-img block-two-img-3"
        src={images[2]}
        alt=""
        loading="lazy"
      />
    </div>
  );
};

export default ImageTextGalleryBlock;
