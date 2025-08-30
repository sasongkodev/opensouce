// src/pages/TafsirPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  
  BookOpen,
  Search,
  Home as HomeIcon,
  Settings,
  
  CalendarIcon,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface TafsirAyat {
  ayat: number;
  teks: string;
}

interface TafsirData {
  surat: string;
  nama_surat: string;
  jumlah_ayat: number;
  tafsir: TafsirAyat[];
}

interface SurahListItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

const TafsirPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState<"list" | "detail">(id ? "detail" : "list");
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);
  const [surahList, setSurahList] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTafsir, setFilteredTafsir] = useState<TafsirAyat[]>([]);
  const [filteredSurah, setFilteredSurah] = useState<SurahListItem[]>([]);
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  // Fetch list of surah
  const fetchSurahList = useCallback(async () => {
    try {
      setListLoading(true);
      const response = await fetch("https://equran.id/api/v2/surat");

      if (!response.ok) {
        throw new Error("Gagal memuat daftar surat");
      }

      const data = await response.json();
      setSurahList(data.data);
      setFilteredSurah(data.data);
    } catch (err) {
      console.error("Error fetching surah list:", err);
    } finally {
      setListLoading(false);
    }
  }, []);

  // Fetch tafsir data berdasarkan nomor surat
  const fetchTafsir = useCallback(async (suratId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://equran.id/api/v2/tafsir/${suratId}`
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data tafsir");
      }

      const data = await response.json();
      setTafsirData(data.data);
      setFilteredTafsir(data.data.tafsir);
      setView("detail");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Error fetching tafsir:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter functions
  useEffect(() => {
    if (tafsirData && searchTerm) {
      const filtered = tafsirData.tafsir.filter(
        (ayat) =>
          ayat.teks.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ayat.ayat.toString().includes(searchTerm)
      );
      setFilteredTafsir(filtered);
    } else if (tafsirData) {
      setFilteredTafsir(tafsirData.tafsir);
    }
  }, [searchTerm, tafsirData]);

  useEffect(() => {
    if (searchTerm && surahList.length > 0) {
      const filtered = surahList.filter(
        (surah) =>
          surah.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          surah.arti.toLowerCase().includes(searchTerm.toLowerCase()) ||
          surah.nomor.toString().includes(searchTerm)
      );
      setFilteredSurah(filtered);
    } else {
      setFilteredSurah(surahList);
    }
  }, [searchTerm, surahList]);

  // Fetch data when id changes
  useEffect(() => {
    if (id) {
      fetchTafsir(id);
    } else {
      setView("list");
    }
  }, [id, fetchTafsir]);

  useEffect(() => {
    fetchSurahList();
  }, [fetchSurahList]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSurahSelect = (surahNumber: number) => {
    navigate(`/tafsir/${surahNumber}`);
  };

  const handleBookmark = (surahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((n) => n !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  // Format date
  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Navbar items
  const navItems = [
    {
      label: "Beranda",
      route: "/",
      active: false,
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      label: "Qur'an",
      route: "/quran",
      active: false,
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Tafsir",
      route: "/tafsir",
      active: true,
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: "Kalender",
      route: "/kalender",
      active: false,
      icon: <CalendarIcon className="h-5 w-5" />,
    },
    {
      label: "Lainnya",
      route: "/settings",
      active: false,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Loading state
  if (loading && view === "detail") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <Header
          onBack={() => navigate(-1)}
          title="Memuat Tafsir..."
          todayStr={todayStr}
        />

        <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <div className="w-full h-11 rounded-xl border border-slate-200 bg-white animate-pulse" />
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>

        <BottomNav navItems={navItems} navigate={navigate} />
      </div>
    );
  }

  // Error state
  if (error && view === "detail") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <Header
          onBack={() => navigate(-1)}
          title="Tafsir Al-Qur'an"
          todayStr={todayStr}
        />

        <main className="max-w-md mx-auto px-4 pt-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Gagal Memuat Tafsir
            </h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchTafsir(id || "1")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              Coba Lagi
            </Button>
          </div>
        </main>

        <BottomNav navItems={navItems} navigate={navigate} />
      </div>
    );
  }

  // Surah List View
  if (view === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <Header
          onBack={() => navigate(-1)}
          title="Daftar Tafsir Surah"
          todayStr={todayStr}
        />

        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              placeholder="Cari surah (nama, arti, atau nomor)..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Results Count */}
          {!listLoading && filteredSurah.length > 0 && (
            <p className="text-sm text-slate-600 px-1">
              Menampilkan {filteredSurah.length} dari 114 surah
              {searchTerm && ` untuk "${searchTerm}"`}
            </p>
          )}

          {/* Surah List */}
          <div className="space-y-3">
            {listLoading ? (
              [...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                  </div>
                </div>
              ))
            ) : filteredSurah.length > 0 ? (
              filteredSurah.map((surah) => (
                <div
                  key={surah.nomor}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 cursor-pointer group"
                  onClick={() => handleSurahSelect(surah.nomor)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {surah.nomor}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {surah.namaLatin}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {surah.arti} • {surah.jumlahAyat} ayat
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleBookmark(surah.nomor, e)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {bookmarked.includes(surah.nomor) ? (
                        <BookmarkCheck className="h-5 w-5 text-indigo-600 fill-current" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                      {surah.tempatTurun}
                    </span>
                    <span className="font-arabic text-xl font-bold text-indigo-700">
                      {surah.nama}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Surah Tidak Ditemukan
                </h3>
                <p className="text-slate-600 mb-4">
                  Tidak ada surah yang cocok dengan pencarian "{searchTerm}"
                </p>
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  Tampilkan Semua Surah
                </Button>
              </div>
            )}
          </div>
        </main>

        <BottomNav navItems={navItems} navigate={navigate} />
      </div>
    );
  }

  // Tafsir Detail View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <Header
        onBack={() => navigate("/tafsir")}
        title={
          tafsirData ? `Tafsir ${tafsirData.nama_surat}` : "Tafsir Al-Qur'an"
        }
        todayStr={todayStr}
      />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            placeholder="Cari tafsir dalam surah ini..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm placeholder:text-slate-400"
          />
        </div>

        {/* Surat Info */}
        {tafsirData && (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-500 to-indigo-600 p-5 shadow-sm text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {tafsirData.nama_surat}
                </h2>
                <p className="text-indigo-100 text-sm opacity-90">
                  {tafsirData.jumlah_ayat} Ayat • {tafsirData.surat}
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/15 grid place-items-center backdrop-blur-sm">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {tafsirData && searchTerm && (
          <p className="text-sm text-slate-600 px-1">
            Ditemukan {filteredTafsir.length} ayat dengan kata "{searchTerm}"
          </p>
        )}

        {/* Tafsir List */}
        <div className="space-y-4 pb-6">
          {filteredTafsir.length > 0 ? (
            filteredTafsir.map((ayat) => (
              <div
                key={ayat.ayat}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Ayat Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {ayat.ayat}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Ayat {ayat.ayat}
                    </h3>
                    <p className="text-xs text-slate-500">Tafsir lengkap</p>
                  </div>
                </div>

                {/* Tafsir Content */}
                <div
                  className="tafsir-content text-slate-700 leading-relaxed text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: ayat.teks
                      .replace(/<p>/g, '<p class="mb-3 last:mb-0">')
                      .replace(
                        /<strong>/g,
                        '<strong class="font-semibold text-slate-900">'
                      ),
                  }}
                />

                {/* Decorative Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Tafsir Quran</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
                      <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
                      <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm ? "Tafsir Tidak Ditemukan" : "Belum Ada Tafsir"}
              </h3>
              <p className="text-slate-600">
                {searchTerm
                  ? `Tidak ada tafsir yang cocok dengan "${searchTerm}"`
                  : "Memuat tafsir untuk surah ini..."}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  Tampilkan Semua Tafsir
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav navItems={navItems} navigate={navigate} />

      {/* Custom Styles for Tafsir Content */}
      <style>{`
        .tafsir-content {
          line-height: 1.7;
          text-align: justify;
        }
        .tafsir-content p {
          margin-bottom: 0.75rem;
        }
        .tafsir-content p:last-child {
          margin-bottom: 0;
        }
        .tafsir-content strong {
          color: #1e293b;
          font-weight: 600;
        }
        .font-arabic {
          font-family: 'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', system-ui;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

// Header Component
interface HeaderProps {
  onBack: () => void;
  title: string;
  todayStr: string;
}

function Header({ onBack, title, todayStr }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={onBack}
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{todayStr}</p>
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}

// Bottom Navigation Component
interface BottomNavProps {
  navItems: Array<{
    label: string;
    route: string;
    active: boolean;
    icon: React.ReactNode;
  }>;
  navigate: (route: string) => void;
}

function BottomNav({ navItems, navigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigasi bawah"
    >
      <div className="mx-auto max-w-md px-6 py-2 grid grid-cols-5 gap-2 text-xs">
        {navItems.map((item) => (
          <TabItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={item.active}
            onClick={() => navigate(item.route)}
          />
        ))}
      </div>
    </nav>
  );
}

// TabItem Component
interface TabItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function TabItem({ label, icon, active = false, onClick }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl py-1 transition-colors ${
        active ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div
        className={`h-9 w-9 grid place-items-center rounded-xl transition-colors ${
          active ? "bg-indigo-50 shadow-sm" : "bg-transparent hover:bg-slate-50"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] leading-none font-medium">{label}</span>
    </button>
  );
}

export default TafsirPage;
