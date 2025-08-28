// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuranPage from "./pages/QuranPage";
import PrayerTimesPage from "./pages/PrayerTimesPage"; // Tambahkan import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran/:id" element={<QuranPage />} />
        <Route path="/jadwal" element={<PrayerTimesPage />} />{" "}
        {/* Tambahkan route */}
      </Routes>
    </Router>
  );
}

export default App;
