import { HashRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./pages/ScrollToTop";

import CmsPage from "./pages/CmsPage";
import AdminPageBuilder from "./admin/AdminPageBuilder";
import AdminPagesList from "./admin/AdminPagesList";
import AdminLayoutSettings from "./admin/AdminLayoutSettings";
import AdminCalendarPage from "./admin/AdminCalendarPage";
import AdminBookingsPage from "./admin/AdminBookingsPage";
import AdminLogin from "./admin/AdminLogin";
import ProtectedRoute from "./admin/ProtectedRoute";

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

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPagesList />} />
            <Route path="calendar" element={<AdminCalendarPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="layout" element={<AdminLayoutSettings />} />
            <Route path=":slug" element={<AdminPageBuilder />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
