import "./styles/global.css";
import "./styles/main_page.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import MainPage from "./pages/MainPage";
import TimeTableAndPricePage from "./pages/TimeTableAndPricePage";
import ServicesPage from "./pages/ServicesPage";

function App() {
  return (
    <HashRouter>
      <Header />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/timeprice" element={<TimeTableAndPricePage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>

      <Footer />
    </HashRouter>
  );
}

export default App;
