import PageRenderer from "../renderer/PageRenderer";
import { mainPageData } from "../data/mainPageData";
import "../styles/global.css";

const MainPage = () => {
  return (
    <>
      <div className="main-content">
        <PageRenderer blocks={mainPageData.blocks} />
      </div>
    </>
  );
};

export default MainPage;
