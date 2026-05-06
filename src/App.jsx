import { HashRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./pages/ScrollToTop";

import CmsPage from "./pages/CmsPage";
import AdminPageBuilder from "./admin/AdminPageBuilder";
import AdminPagesList from "./admin/AdminPagesList";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <HashRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={<CmsPage defaultSlug="main" wrapWithMainContent />}
          />
          <Route path="/:slug" element={<CmsPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPagesList />} />
          <Route path="/admin/:slug" element={<AdminPageBuilder />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
