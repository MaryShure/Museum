import { HashRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import MainPage from "./pages/MainPage";
import ServicesPage from "./pages/ServicesPage";
import TimeTableAndPricePage from "./pages/TimeTableAndPricePage";

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/timeprice" element={<TimeTableAndPricePage />} />
      </Routes>

      <Footer />
    </HashRouter>
  );
}

export default App;
