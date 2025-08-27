// src/pages/QuranCard.tsx
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  ChevronRight,
  Bookmark,
  Volume2,
  X,
} from "lucide-react";

// ======= Config =======
const API_BASE = "https://equran.id/api/v2";

// ======= Types =======
type Surah = {
  number: number;
  name: string;
  name_latin: string;
  number_of_ayah: number;
  place: string;
  translation: string;
  description?: string;
};

type Ayat = {
  number: {
    inquran: number;
    insurah: number;
  };
  arab: string;
  translation: string;
  latin?: string;
};

type SurahDetail = {
  number: number;
  name: string;
  name_latin: string;
  number_of_ayah: number;
  place: string;
  translation: string;
  ayahs: Ayat[];
};

// ======= Component =======
interface QuranCardProps {
  /** Jika true, daftar surat akan langsung dibuka saat komponen dimount. */
  initialOpen?: boolean;
}

export default function QuranCard({ initialOpen = false }: QuranCardProps) {
  // UI state
  const [isListOpen, setIsListOpen] = useState(initialOpen);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // List state
  const [loadingList, setLoadingList] = useState(false);
  const [surah, setSurah] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Reader state
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // ======= Effects =======
  // Buka daftar otomatis jika diminta
  useEffect(() => {
    if (initialOpen) setIsListOpen(true);
  }, [initialOpen]);

  // Lazy-fetch daftar surat saat list dibuka pertama kali
  useEffect(() => {
    if (!isListOpen || surah.length > 0) return;

    const fetchSurah = async () => {
      try {
        setLoadingList(true);
        const response = await fetch(`${API_BASE}/surat`);
        const data = await response.json();
        setSurah(data.data);
      } catch (error) {
        console.error("Error fetching surah:", error);
      } finally {
        setLoadingList(false);
      }
    };

    fetchSurah();
  }, [isListOpen, surah.length]);

  // Escape untuk menutup dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isReaderOpen) setIsReaderOpen(false);
        else if (isListOpen) setIsListOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isListOpen, isReaderOpen]);

  // ======= Memos =======
  const filteredSurah = useMemo(
    () =>
      surah.filter(
        (s) =>
          s.name_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.number.toString().includes(searchQuery)
      ),
    [surah, searchQuery]
  );

  // ======= Handlers =======
  const handleSurahSelect = async (s: Surah) => {
    setSelectedSurah(s);
    setIsReaderOpen(true);
    setShowLatin(true);
    setShowTranslation(true);

    try {
      setLoadingDetail(true);
      const response = await fetch(`${API_BASE}/surat/${s.number}`);
      const data = await response.json();
      setSurahDetail(data.data);
    } catch (error) {
      console.error("Error fetching surah detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const saveLastRead = (surahNumber: number, ayatNumber: number) => {
    try {
      localStorage.setItem(`last_read_${surahNumber}`, ayatNumber.toString());
    } catch {}
  };

  // ======= UI =======
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Trigger (ikon Qur'an) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsListOpen(true)}
          className="shadow-lg active:scale-[0.98] transition grid place-items-center rounded-2xl bg-indigo-600 text-white w-14 h-14"
          aria-label="Buka daftar surat"
        >
          <BookOpen className="h-6 w-6" />
        </button>
        <p className="text-[11px] text-center text-slate-600 mt-1">Qur'an</p>
      </div>

      {/* ======= Dialog: Daftar Surat ======= */}
      {isListOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6 z-50">
          <div className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-100 grid place-items-center">
                    <BookOpen className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Al-Qur'an</h2>
                    <p className="text-xs text-slate-500">Pilih surat untuk dibaca</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsListOpen(false)}
                  className="h-9 w-9 rounded-xl grid place-items-center hover:bg-slate-100"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Pencarian */}
              <div className="relative mt-4">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari surat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Isi daftar */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {loadingList ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-2/3 bg-slate-200 rounded" />
                      </div>
                      <div className="h-5 w-5 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                filteredSurah.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => handleSurahSelect(s)}
                    className="w-full text-left bg-white rounded-xl p-4 border hover:shadow active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 grid place-items-center font-semibold">
                        {s.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {s.name_latin} • {s.number_of_ayah} ayat
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-md ${
                              s.place === "Mekah"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {s.place}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{s.translation}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-arabic text-xl">{s.name}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======= Dialog: Pembaca Surat ======= */}
      {isReaderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-100 grid place-items-center">
                    <BookOpen className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedSurah?.name_latin}</h2>
                    <p className="text-xs text-slate-500">
                      {selectedSurah?.place} • {selectedSurah?.number_of_ayah} ayat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReaderOpen(false)}
                  className="h-9 w-9 rounded-xl grid place-items-center hover:bg-slate-100"
                  aria-label="Tutup pembaca"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Kontrol tampilan */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowLatin((v) => !v)}
                  className={`py-2 text-xs rounded-xl border ${
                    showLatin
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200"
                  }`}
                >
                  Latin {showLatin ? "✓" : "✗"}
                </button>
                <button
                  onClick={() => setShowTranslation((v) => !v)}
                  className={`py-2 text-xs rounded-xl border ${
                    showTranslation
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200"
                  }`}
                >
                  Terjemah {showTranslation ? "✓" : "✗"}
                </button>
                <button
                  className="py-2 text-xs rounded-xl border border-slate-200 flex items-center justify-center"
                  title="(Opsional) Tambahkan pemutar audio di sini"
                >
                  <Volume2 className="h-4 w-4 mr-1" /> Audio
                </button>
              </div>
            </div>

            {/* Isi ayat */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingDetail ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 w-1/4 bg-slate-200 rounded mb-2" />
                      <div className="h-6 bg-slate-200 rounded mb-2" />
                      <div className="h-4 bg-slate-200 rounded mb-1" />
                      <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : surahDetail ? (
                <div>
                  {surahDetail.ayahs.map((ayah) => (
                    <div key={ayah.number.insurah} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {surahDetail.number}:{ayah.number.insurah}
                        </span>
                        <button
                          onClick={() => saveLastRead(surahDetail.number, ayah.number.insurah)}
                          className="text-xs text-slate-500 flex items-center"
                        >
                          <Bookmark className="h-3 w-3 mr-1" /> Tandai
                        </button>
                      </div>
                      <p className="font-arabic text-2xl text-right mb-2">{ayah.arab}</p>
                      {showLatin && ayah.latin && (
                        <p className="text-sm text-slate-600 mb-2">{ayah.latin}</p>
                      )}
                      {showTranslation && (
                        <p className="text-sm">{ayah.translation}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">Gagal memuat surat.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
