import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/global.css";
import "../styles/main_page.css";
import PageRenderer from "../renderer/PageRenderer";
import { getPageBySlug } from "../../server/src/api/pagesApi";

const CmsPage = ({ defaultSlug = "main", wrapWithMainContent = false }) => {
  const { slug } = useParams();
  const pageSlug = slug || defaultSlug;

  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getPageBySlug(pageSlug);
        setPage(data);
      } catch (err) {
        setError(err.message || "Не удалось загрузить страницу");
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageSlug]);

  if (isLoading) {
    return <div className="cms-page-state">Загрузка страницы...</div>;
  }

  if (error) {
    return <div className="cms-page-state">Ошибка: {error}</div>;
  }

  if (!page || !page.blocks?.length) {
    return (
      <div className="cms-page-state">
        Для страницы пока нет опубликованных блоков.
      </div>
    );
  }

  const content = <PageRenderer blocks={page.blocks} />;

  if (wrapWithMainContent) {
    return <div className="main-content">{content}</div>;
  }

  return content;
};

export default CmsPage;
