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
import { useNavigate } from "react-router-dom";

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

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  weekday: string;
}

const HomePage = () => {
  const navigate = useNavigate();

  // States
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [hijriLoading, setHijriLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);

  // Reverse geocode coordinates to get location name
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Gagal mendapatkan nama lokasi");
      }

      const data = await response.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state ||
        "Lokasi tidak dikenal";

      setLocationName(city);
    } catch (error) {
      console.error("❌ Error reverse geocoding:", error);
      setLocationName("Lokasi tidak dikenal");
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Fetch Hijri date
  const fetchHijriDate = useCallback(async () => {
    setHijriLoading(true);
    try {
      const today = new Date();
      const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

      const response = await fetch(
        `https://api.aladhan.com/v1/gToH/${formattedDate}`
      );

      if (!response.ok) {
        throw new Error("Gagal mendapatkan tanggal Hijriah");
      }

      const result = await response.json();

      if (result.code === 200) {
        const hijri = result.data.hijri;
        setHijriDate({
          day: parseInt(hijri.day),
          month: parseInt(hijri.month.number),
          year: parseInt(hijri.year),
          monthName: hijri.month.en,
          weekday: hijri.weekday.en,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching Hijri date:", error);
    } finally {
      setHijriLoading(false);
    }
  }, []);

  // Fetch prayer times
  const fetchPrayerTimes = useCallback(async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=3`
      );

      if (!res.ok) throw new Error("Failed to fetch prayer times");

      const data = await res.json();
      const timings = data.data.timings;

      const formattedPrayerTimes: PrayerTime[] = [
        { key: "subuh", label: "Subuh", time: timings.Fajr },
        { key: "dzuhur", label: "Dzuhur", time: timings.Dhuhr },
        { key: "ashar", label: "Ashar", time: timings.Asr },
        { key: "maghrib", label: "Maghrib", time: timings.Maghrib },
        { key: "isya", label: "Isya", time: timings.Isha },
      ];

      setPrayerTimes(formattedPrayerTimes);
    } catch (error) {
      console.error("❌ Error fetching prayer times:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get next prayer
  const getNextPrayer = useCallback(() => {
    if (!prayerTimes.length) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayerTimes) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;

      if (prayerTimeInMinutes > currentTime) {
        return prayer;
      }
    }

    return prayerTimes[0];
  }, [prayerTimes]);

  // Request geolocation
  useEffect(() => {
    if (!navigator.geolocation || locationAllowed !== null) return;

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordsData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocationAllowed(true);
        setCoords(coordsData);
        reverseGeocode(coordsData.lat, coordsData.lng);
        fetchPrayerTimes(coordsData.lat, coordsData.lng);
      },
      (error) => {
        console.warn("❌ Gagal mendapatkan lokasi:", error.message);
        setLocationAllowed(false);
        setLocationName(null);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [locationAllowed, reverseGeocode, fetchPrayerTimes]);

  // Fetch Hijri date when component mounts
  useEffect(() => {
    fetchHijriDate();
  }, [fetchHijriDate]);

  // Auto refresh at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        if (coords) {
          fetchPrayerTimes(coords.lat, coords.lng);
          fetchHijriDate();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [coords, fetchPrayerTimes, fetchHijriDate]);

  const handleRetryLocation = useCallback(() => {
    setLocationAllowed(null);
    setLocationName(null);
    setCoords(null);
    setPrayerTimes([]);
  }, []);

  // Date helper
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

  // Computed values
  const nextPrayer = useMemo(() => getNextPrayer(), [getNextPrayer]);

  // Quick actions data
  const quickActions: QuickActionItem[] = useMemo(
    () => [
      {
        icon: <BookOpen className="h-5 w-5" />,
        label: "Qur'an",
        route: "/quran",
      },
      {
        icon: <Search className="h-5 w-5" />,
        label: "Tafsir",
        route: "/tafsir",
      },
      {
        icon: <Clock className="h-5 w-5" />,
        label: "Jadwal",
        route: "/jadwal",
      },
      {
        icon: <CalendarIcon className="h-5 w-5" />,
        label: "Hijriyah",
        route: "/kalender",
      },
      {
        icon: <Compass className="h-5 w-5" />,
        label: "Kiblat",
        route: "/kiblat",
      },
      {
        icon: <Bookmark className="h-5 w-5" />,
        label: "Bookmark",
        route: "/bookmark",
      },
      {
        icon: <Settings className="h-5 w-5" />,
        label: "Pengaturan",
        route: "/settings",
      },
    ],
    []
  );

  // Navigation items
  const navItems = useMemo(
    () => [
      {
        label: "Beranda",
        route: "/",
        active: true,
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
        label: "Lainnya",
        route: "/settings",
        active: false,
        icon: <Settings className="h-5 w-5" />,
      },
    ],
    []
  );

  // Hijri month names
  const hijriMonthNames = [
    "Muharram",
    "Shafar",
    "Rabi'ul Awwal",
    "Rabi'ul Akhir",
    "Jumadil Awal",
    "Jumadil Akhir",
    "Rajab",
    "Sya'ban",
    "Ramadhan",
    "Syawal",
    "Dzulqa'dah",
    "Dzulhijjah",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
      {/* App Bar */}
      <header
        className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-indigo-100 grid place-items-center">
              <BookOpen className="w-5 h-5 text-indigo-700" aria-hidden />
            </div>
            <div className="truncate">
              <p className="text-xs text-slate-500 truncate">{todayStr}</p>
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                Al-Qur'an mu
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            aria-label="Pengaturan"
            onClick={() => navigate("/settings")}
          >
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
              Mencoba mendeteksi lokasi…{" "}
              <span className="sr-only">Loading</span>
              <span className="relative inline-block h-2 w-2">
                <span className="absolute inline-block h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="absolute inline-block h-2 w-2 rounded-full bg-indigo-500" />
              </span>
            </span>
          )}
          {(locationAllowed === true || isReverseGeocoding) && (
            <span>
              {isReverseGeocoding ? (
                "Mendapatkan nama lokasi..."
              ) : (
                <>
                  Lokasi aktif:{" "}
                  <span className="font-medium">
                    {locationName ||
                      (coords
                        ? `${coords.lat.toFixed(3)}°, ${coords.lng.toFixed(3)}°`
                        : "...")}
                  </span>
                </>
              )}
            </span>
          )}
          {locationAllowed === false && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-red-600">Izin lokasi ditolak.</span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={handleRetryLocation}
              >
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
                  <h2 className="text-2xl font-bold leading-tight">
                    {nextPrayer?.label || "Memuat..."}
                  </h2>
                  <span className="text-lg">
                    {nextPrayer?.time ? `${nextPrayer.time} WIB` : "..."}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
                <Clock className="h-6 w-6" aria-hidden />
              </div>
            </div>
            {/* Hijri Date Display */}
            <div className="mt-2">
              {hijriLoading ? (
                <Skeleton className="h-4 w-32 bg-indigo-200/50" />
              ) : hijriDate ? (
                <p className="text-indigo-100 text-xs">
                  {hijriDate.day} {hijriMonthNames[hijriDate.month - 1]}{" "}
                  {hijriDate.year} H
                </p>
              ) : (
                <p className="text-indigo-100 text-xs">
                  Tanggal Hijriah tidak tersedia
                </p>
              )}
            </div>
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
                onClick={() => navigate(item.route)}
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
              <CardTitle className="text-lg">Al-Qur'an</CardTitle>
              <CardDescription>Baca & pelajari kitab suci</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm mb-4">
              Baca mushaf dengan tajwid, terjemahan, dan tafsir lengkap.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                onClick={() => navigate("/quran")}
              >
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
            {(locationAllowed === true || isReverseGeocoding) && (
              <div className="grid grid-cols-3 gap-3 text-sm text-slate-700">
                {prayerTimes.map((prayer) => (
                  <div
                    key={prayer.key}
                    className="rounded-xl border bg-slate-50 px-3 py-2 flex items-center justify-between"
                  >
                    <span className="font-medium">{prayer.label}</span>
                    <span className="tabular-nums">{prayer.time}</span>
                  </div>
                ))}
              </div>
            )}
            {locationAllowed === false && (
              <div>
                <p className="text-red-600 text-sm">
                  Aktifkan izin lokasi untuk menampilkan jadwal salat.
                </p>
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
            {hijriLoading ? (
              <Skeleton className="h-4 w-1/2 bg-slate-200" />
            ) : hijriDate ? (
              <>
                <p className="text-slate-800 font-semibold text-base">
                  {hijriDate.day} {hijriMonthNames[hijriDate.month - 1]}{" "}
                  {hijriDate.year} H
                </p>
                <p className="text-slate-500 text-sm">
                  {hijriDate.weekday}, {todayStr}
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">
                Tanggal Hijriah tidak tersedia
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-indigo-600 hover:text-indigo-800 w-full justify-start px-0"
              onClick={() => navigate("/kalender")}
            >
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
              onClick={() => navigate(item.route)}
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
        <div className="h-9 w-9 rounded-xl bg-slate-100 grid place-items-center">
          {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </button>
  );
}

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
      className={`flex flex-col items-center gap-1 rounded-xl py-1 ${
        active ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div
        className={`h-9 w-9 grid place-items-center rounded-xl ${
          active ? "bg-indigo-50" : "bg-transparent"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] leading-none font-medium">{label}</span>
    </button>
  );
}