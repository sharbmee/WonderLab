import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ExperiencesPage from "./pages/ExperiencesPage";
import ExperiencePage from "./pages/ExperiencePage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/experiences/:id" element={<ExperiencePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;