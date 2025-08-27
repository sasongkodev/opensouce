// src/pages/HomePage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  BookOpen,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Compass,
  Bookmark,
  Search,
  Settings,
  Home as HomeIcon,
} from "lucide-react";

// shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Coords {
  lat: number;
  lng: number;
}

interface PrayerTime {
  key: string;
  label: string;
  time: string;
}

interface QuickActionItem {
  icon: React.ReactNode;
  label: string;
  route: string;
}

const HomePage = () => {
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Request geolocation on component mount or retry
  useEffect(() => {
    if (!navigator.geolocation || locationAllowed !== null) return;
    
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true);
        setCoords({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
        setIsLoading(false);
      },
      (error) => {
        console.warn("❌ Gagal mendapatkan lokasi:", error.message);
        setLocationAllowed(false);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [locationAllowed]);

  const handleRetryLocation = useCallback(() => {
    setLocationAllowed(null);
  }, []);

  // Date (ID) helper
  const todayStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());
    } catch {
      return "Hari ini";
    }
  }, []);

  // Placeholder Hijri — integrate real converter later
  const hijriToday = "— Hijriyah akan otomatis diisi";

  // Placeholder next prayer — replace with real calculation later
  const nextPrayerLabel = "Dzuhur";
  const nextPrayerTime = "12:03"; // WIB

  // Prayer times data
  const prayerTimes: PrayerTime[] = useMemo(() => [
    { key: "subuh", label: "Subuh", time: "04:37" },
    { key: "dzuhur", label: "Dzuhur", time: "12:03" },
    { key: "ashar", label: "Ashar", time: "15:24" },
    { key: "maghrib", label: "Maghrib", time: "17:59" },
    { key: "isya", label: "Isya", time: "19:09" },
  ], []);

  // Quick actions data
  const quickActions: QuickActionItem[] = useMemo(() => [
    { icon: <BookOpen className="h-5 w-5" />, label: "Qur'an", route: "/quran" },
    { icon: <Search className="h-5 w-5" />, label: "Tafsir", route: "/tafsir" },
    { icon: <Clock className="h-5 w-5" />, label: "Jadwal", route: "/jadwal" },
    { icon: <CalendarIcon className="h-5 w-5" />, label: "Hijriyah", route: "/kalender" },
    { icon: <Compass className="h-5 w-5" />, label: "Kiblat", route: "/kiblat" },
    { icon: <Bookmark className="h-5 w-5" />, label: "Bookmark", route: "/bookmark" },
    { icon: <Settings className="h-5 w-5" />, label: "Pengaturan", route: "/settings" },
  ], []);

  // Navigation items
  const navItems = useMemo(() => [
    { label: "Beranda", active: true, icon: <HomeIcon className="h-5 w-5" /> },
    { label: "Qur'an", active: false, icon: <BookOpen className="h-5 w-5" /> },
    { label: "Jadwal", active: false, icon: <Clock className="h-5 w-5" /> },
    { label: "Kalender", active: false, icon: <CalendarIcon className="h-5 w-5" /> },
    { label: "Lainnya", active: false, icon: <Settings className="h-5 w-5" /> },
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
      {/* App Bar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-indigo-100 grid place-items-center">
              <BookOpen className="w-5 h-5 text-indigo-700" aria-hidden />
            </div>
            <div className="truncate">
              <p className="text-xs text-slate-500 truncate">{todayStr}</p>
              <h1 className="text-lg font-semibold text-slate-900 truncate">Al‑Qur'an Digital</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Pengaturan">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Location banner */}
        <div className="flex items-center gap-2 text-slate-700 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-indigo-600" />
          {isLoading && (
            <span className="inline-flex items-center gap-2">
              Mencoba mendeteksi lokasi… <span className="sr-only">Loading</span>
              <span className="relative inline-block h-2 w-2">
                <span className="absolute inline-block h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="absolute inline-block h-2 w-2 rounded-full bg-indigo-500" />
              </span>
            </span>
          )}
          {locationAllowed === true && (
            <span>
              Lokasi aktif{coords ? (
                <>
                  : <span className="font-medium"> {coords.lat.toFixed(3)}°, {coords.lng.toFixed(3)}°</span>
                </>
              ) : null}
            </span>
          )}
          {locationAllowed === false && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-red-600">Izin lokasi ditolak.</span>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRetryLocation}>
                Coba Lagi
              </Button>
            </div>
          )}
        </div>

        {/* Next Prayer / Hero */}
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-xs">Salat berikutnya</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold leading-tight">{nextPrayerLabel}</h2>
                  <span className="text-lg">{nextPrayerTime} WIB</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
                <Clock className="h-6 w-6" aria-hidden />
              </div>
            </div>
            <p className="text-indigo-100 text-xs mt-2">{hijriToday}</p>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <section>
          <h2 className="sr-only">Akses Cepat</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((item) => (
              <QuickItem 
                key={item.label} 
                icon={item.icon} 
                label={item.label} 
                onClick={() => { /* route to item.route */ }} 
              />
            ))}
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 h-20 grid place-items-center text-slate-400 text-xs">
              Tambah
            </div>
          </div>
        </section>

        {/* Card: Al-Quran */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <CardTitle className="text-lg">Al‑Qur'an</CardTitle>
              <CardDescription>Baca & pelajari kitab suci</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm mb-4">
              Baca mushaf dengan tajwid, terjemahan, dan tafsir lengkap.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Baca Sekarang
              </Button>
              <Button variant="outline" className="w-full rounded-xl">
                Lanjutkan Terakhir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card: Jadwal Salat */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="p-2 bg-green-100 rounded-xl">
              <Clock className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <CardTitle className="text-lg">Jadwal Salat</CardTitle>
              <CardDescription>Waktu salat harian</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-200" />
                <Skeleton className="h-4 w-1/2 bg-slate-200" />
              </div>
            )}
            {locationAllowed === true && (
              <div className="grid grid-cols-3 gap-3 text-sm text-slate-700">
                {prayerTimes.map((prayer) => (
                  <div key={prayer.key} className="rounded-xl border bg-slate-50 px-3 py-2 flex items-center justify-between">
                    <span className="font-medium">{prayer.label}</span>
                    <span className="tabular-nums">{prayer.time}</span>
                  </div>
                ))}
              </div>
            )}
            {locationAllowed === false && (
              <div>
                <p className="text-red-600 text-sm">Aktifkan izin lokasi untuk menampilkan jadwal salat.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full rounded-xl" 
                  onClick={handleRetryLocation}
                >
                  Coba Lagi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Kalender Hijriyah */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <CardTitle className="text-lg">Kalender Hijriyah</CardTitle>
              <CardDescription>Tanggal Islam hari ini</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-slate-800 font-semibold text-base">Segera hadir</p>
            <p className="text-slate-500 text-sm">{todayStr}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-indigo-600 hover:text-indigo-800 w-full justify-start px-0">
              Lihat Kalender Lengkap
            </Button>
          </CardContent>
        </Card>

        <div className="h-2" />
      </main>

      {/* Bottom Nav (Mobile) */}
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
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;

/* --------------------------- Small UI pieces --------------------------- */
interface QuickItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickItem({ icon, label, onClick }: QuickItemProps) {
  return (
    <button
      onClick={onClick}
      className="h-20 rounded-2xl border bg-white/70 active:scale-95 transition grid place-items-center text-slate-700 hover:shadow-sm"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-slate-100 grid place-items-center">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </button>
  );
}

interface TabItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

function TabItem({ label, icon, active = false }: TabItemProps) {
  return (
    <button
      className={`flex flex-col items-center gap-1 rounded-xl py-1 ${
        active ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div className={`h-9 w-9 grid place-items-center rounded-xl ${active ? "bg-indigo-50" : "bg-transparent"}`}>
        {icon}
      </div>
      <span className="text-[10px] leading-none font-medium">{label}</span>
    </button>
  );
}