// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuranPage from "./pages/QuranPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import HijriCalendarPage from "./pages/HijriCalendarPage";
import TafsirPage from "./pages/TafsirPage";
import SettingsPage from "./pages/SettingsPage"; // Tambahkan import SettingsPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran/:id" element={<QuranPage />} />
        <Route path="/jadwal" element={<PrayerTimesPage />} />
        <Route path="/kalender" element={<HijriCalendarPage />} />
        <Route path="/tafsir" element={<TafsirPage />} />
        <Route path="/tafsir/:id" element={<TafsirPage />} />
        <Route path="/settings" element={<SettingsPage />} />{" "}
        {/* Tambahkan route untuk Settings */}
      </Routes>
    </Router>
  );
}

export default App;
