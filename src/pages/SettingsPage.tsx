// src/pages/SettingsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Settings,
  Clock,
  CalendarIcon,
  BookOpen,
  ArrowLeft,
  Moon,
  Bell,
  Bookmark,
  Download,
  Trash2,
  Shield,
  HelpCircle,
  Mail,
  Volume2,
  Wifi,
  Globe,
  Share2,
  Database,
  Lock,
  Eye,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ===========================
   Simple Switch component
   =========================== */
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}
function Switch({ checked, onCheckedChange, className = "" }: SwitchProps) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
      } ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ===========================
   Simple Label component
   =========================== */
interface LabelProps {
  children: React.ReactNode;
  className?: string;
}
function Label({ children, className = "" }: LabelProps) {
  return <span className={`text-sm font-medium ${className}`}>{children}</span>;
}

/* ===========================
   Hook Dark Mode (lokal halaman)
   - Persist pakai localStorage
   - Pasang kelas 'dark' di <html>
   - Sinkron ke system theme & antar tab
   =========================== */
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // apply ke <html> + persist
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("darkMode", String(isDarkMode));
    } catch {}
  }, [isDarkMode]);

  // ikuti perubahan system theme JIKA user belum set preferensi manual (saved === null)
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("darkMode");
      if (saved === null) setIsDarkMode(e.matches);
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  // sync antar tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "darkMode" && e.newValue != null) {
        setIsDarkMode(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleDarkMode = (enabled: boolean) => setIsDarkMode(enabled);
  return { isDarkMode, toggleDarkMode };
};

/* ===========================
   Settings Page
   =========================== */
const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fontSize, setFontSize] = useState("medium");

  // Load other settings from localStorage on mount
  useEffect(() => {
    const savedNotifications =
      localStorage.getItem("notifications") !== "false";
    const savedAutoPlay = localStorage.getItem("autoPlay") === "true";
    const savedFontSize = localStorage.getItem("fontSize") || "medium";

    setNotifications(savedNotifications);
    setAutoPlay(savedAutoPlay);
    setFontSize(savedFontSize);

    // Apply font size segera
    document.documentElement.style.fontSize =
      savedFontSize === "kecil"
        ? "14px"
        : savedFontSize === "besar"
        ? "18px"
        : "16px";
  }, []);

  // Handle notifications toggle
  const handleNotificationsToggle = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", checked.toString());
  };

  // Handle auto play toggle
  const handleAutoPlayToggle = (checked: boolean) => {
    setAutoPlay(checked);
    localStorage.setItem("autoPlay", checked.toString());
  };

  // Handle font size change
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    document.documentElement.style.fontSize =
      size === "kecil" ? "14px" : size === "besar" ? "18px" : "16px";
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
      label: "Jadwal",
      route: "/jadwal",
      active: false,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "Kalender",
      route: "/kalender",
      active: false,
      icon: <CalendarIcon className="h-5 w-5" />,
    },
    {
      label: "Pengaturan",
      route: "/settings",
      active: true,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const settingsSections = [
    {
      title: "Tampilan",
      items: [
        {
          icon: (
            <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          ),
          label: "Mode Gelap",
          description:
            "Ubah tampilan menjadi gelap/terang (persist semua halaman)",
          action: (
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          ),
        },
        // (Dihilangkan Mode Terang karena redundan)
        {
          icon: (
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ),
          label: "Ukuran Teks",
          description: "Sesuaikan ukuran font untuk kenyamanan membaca",
          action: (
            <div className="flex gap-2">
              {["kecil", "medium", "besar"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    fontSize === size
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          ),
        },
        {
          icon: (
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ),
          label: "Responsif",
          description: "Optimalkan tampilan untuk perangkat mobile",
          action: <Switch checked={true} onCheckedChange={() => {}} />,
        },
      ],
    },
    {
      title: "Notifikasi",
      items: [
        {
          icon: (
            <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          ),
          label: "Notifikasi",
          description: "Aktifkan notifikasi waktu shalat",
          action: (
            <Switch
              checked={notifications}
              onCheckedChange={handleNotificationsToggle}
            />
          ),
        },
        {
          icon: (
            <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          ),
          label: "Suara Adzan",
          description: "Putar suara adzan saat waktu shalat",
          action: (
            <Switch checked={autoPlay} onCheckedChange={handleAutoPlayToggle} />
          ),
        },
        {
          icon: <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
          label: "Pengingat 15 Menit",
          description: "Pengingat 15 menit sebelum waktu shalat",
          action: <Switch checked={true} onCheckedChange={() => {}} />,
        },
      ],
    },
    {
      title: "Koneksi",
      items: [
        {
          icon: <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />,
          label: "Sinkronisasi Online",
          description: "Sinkronkan data dengan server",
          action: <Switch checked={true} onCheckedChange={() => {}} />,
        },
        {
          icon: <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
          label: "Lokasi Otomatis",
          description: "Deteksi lokasi untuk waktu shalat",
          action: <Switch checked={true} onCheckedChange={() => {}} />,
        },
        {
          icon: (
            <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          ),
          label: "Cache Data",
          description: "Simpan data offline untuk akses cepat",
          action: <Switch checked={true} onCheckedChange={() => {}} />,
        },
      ],
    },
    {
      title: "Privasi & Keamanan",
      items: [
        {
          icon: <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />,
          label: "Kunci Aplikasi",
          description: "Kunci aplikasi dengan PIN atau sidik jari",
          action: <Switch checked={false} onCheckedChange={() => {}} />,
        },
        {
          icon: <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          label: "Mode Privasi",
          description: "Sembunyikan konten sensitif",
          action: <Switch checked={false} onCheckedChange={() => {}} />,
        },
        {
          icon: (
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ),
          label: "Perlindungan Data",
          description: "Enkripsi data lokal",
          action: <Switch checked={true} onCheckedChange={() => {}} />,
        },
      ],
    },
    {
      title: "Data & Penyimpanan",
      items: [
        {
          icon: (
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ),
          label: "Unduh Quran Offline",
          description: "Simpan Quran untuk akses offline",
          action: (
            <Button variant="outline" size="sm" className="text-xs">
              Unduh
            </Button>
          ),
        },
        {
          icon: (
            <Bookmark className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          ),
          label: "Ekspor Bookmark",
          description: "Ekspor bookmark ke file",
          action: (
            <Button variant="outline" size="sm" className="text-xs">
              Ekspor
            </Button>
          ),
        },
        {
          icon: <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />,
          label: "Hapus Cache",
          description: "Bersihkan data cache aplikasi",
          action: (
            <Button variant="outline" size="sm" className="text-xs">
              Bersihkan
            </Button>
          ),
        },
      ],
    },
    {
      title: "Bantuan & Dukungan",
      items: [
        {
          icon: (
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ),
          label: "Pusat Bantuan",
          description: "Temukan jawaban untuk pertanyaan umum",
          action: (
            <Button variant="ghost" size="sm" className="text-xs">
              Buka
            </Button>
          ),
        },
        {
          icon: <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />,
          label: "Hubungi Kami",
          description: "Kirim feedback atau lapor bug",
          action: (
            <Button variant="ghost" size="sm" className="text-xs">
              Kirim
            </Button>
          ),
        },
        {
          icon: (
            <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          ),
          label: "Bagikan Aplikasi",
          description: "Bagikan aplikasi dengan teman",
          action: (
            <Button variant="ghost" size="sm" className="text-xs">
              Bagikan
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-[calc(env(safe-area-inset-bottom)+88px)]">
      <Header
        onBack={() => navigate(-1)}
        title="Pengaturan"
        todayStr={todayStr}
      />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6 pb-6">
        {/* App Info Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Quran App
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Versi 1.0.0
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Aplikasi Al-Quran digital dengan tafsir
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white px-1">
                {section.title}
              </h3>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex items-center justify-between p-4 ${
                      itemIndex < section.items.length - 1
                        ? "border-b border-slate-100 dark:border-slate-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <Label className="text-sm font-medium text-slate-900 dark:text-white block mb-1">
                          {item.label}
                        </Label>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-3">{item.action}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2024 Quran App • Made with ❤️ for Ummah
          </p>
        </div>
      </main>

      <BottomNav navItems={navItems} navigate={navigate} />
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
      className="sticky top-0 z-20 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60"
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
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {todayStr}
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
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
      className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70"
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
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div
        className={`h-9 w-9 grid place-items-center rounded-xl transition-colors ${
          active
            ? "bg-indigo-50 dark:bg-indigo-900/30 shadow-sm"
            : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] leading-none font-medium">{label}</span>
    </button>
  );
}

export default SettingsPage;
