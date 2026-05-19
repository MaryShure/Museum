import { useEffect, useMemo, useState } from "react";
import CardsBar from "../components/cards/CardsBar";
import { getPages } from "../api/pagesApi";

const CardsBarBlock = ({
  selectedPageIds = [],
  buttonPageId = null,
  buttonLinkUrl = "",
}) => {
  const [allPages, setAllPages] = useState([]);

  useEffect(() => {
    getPages().then((list) => {
      setAllPages(Array.isArray(list) ? list : list.pages || []);
    });
  }, []);

  const selectedPages = useMemo(() => {
    const ids = selectedPageIds.map(Number);

    return ids
      .map((id) => allPages.find((page) => Number(page.id) === id))
      .filter(Boolean)
      .map((page) => ({
        id: page.id,
        text: page.title,
        image: page.preview_image || "",
        linkUrl: page.route_path || `/${page.slug}`,
      }));
  }, [selectedPageIds, allPages]);

  const resolvedButtonUrl = useMemo(() => {
    if (buttonPageId) {
      const linkedPage = allPages.find(
        (page) => Number(page.id) === Number(buttonPageId),
      );
      if (linkedPage) {
        return linkedPage.route_path || `/${linkedPage.slug}`;
      }
    }

    return buttonLinkUrl || "/";
  }, [buttonPageId, buttonLinkUrl, allPages]);

  return <CardsBar cards={selectedPages} buttonLinkUrl={resolvedButtonUrl} />;
};

export default CardsBarBlock;
