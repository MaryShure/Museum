import { HashRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./pages/ScrollToTop";

import MainPage from "./pages/MainPage";
import ServicesPage from "./pages/ServicesPage";
import TimeTableAndPricePage from "./pages/TimeTableAndPricePage";
import AdminPageBuilder from "./admin/AdminPageBuilder";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <HashRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/timeprice" element={<TimeTableAndPricePage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPageBuilder />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
