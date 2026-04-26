import "./styles/global.css";
import "./styles/main_page.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import MainPage from "./pages/MainPage";
import TimeTableAndPricePage from "./pages/ServicesPage";
import ServicesPage from "./pages/ServicesPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/timeprice" element={<TimeTableAndPricePage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
