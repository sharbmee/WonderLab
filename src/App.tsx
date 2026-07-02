import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ExperiencesPage from "./pages/ExperiencesPage";
import ExperiencePage from "./pages/ExperiencePage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

// BrowserRouter: enables client-side routing (no full page reloads)
// Routes: looks at the current URL and renders the matching Route
// Route: maps a URL path to a component
// ":id" is a URL parameter — it captures whatever comes after /experiences/
//   e.g. /experiences/coin-flip  →  id = "coin-flip"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/experiences/:id" element={<ExperiencePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}