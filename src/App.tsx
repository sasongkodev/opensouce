import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuranPage from "./pages/QuranPage"; // Ganti path sesuai lokasi file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran/:id" element={<QuranPage />} />
        {/* Tambahkan route lainnya sesuai kebutuhan */}
      </Routes>
    </Router>
  );
}

export default App;
