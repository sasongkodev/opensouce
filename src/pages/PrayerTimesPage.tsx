// src/pages/PrayerTimesPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  BookOpen,
  Compass,
  
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface Coords {
  lat: number;
  lng: number;
}

interface PrayerTimes {
  date: string; // Format: DD-MM-YYYY
  hijriDate: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
}

const PrayerTimesPage = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Navigation items
  const navItems = useMemo(
    () => [
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
        active: true,
        icon: <Clock className="h-5 w-5" />,
      },
      {
        label: "Kiblat",
        route: "/kiblat",
        active: false,
        icon: <Compass className="h-5 w-5" />,
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

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setIsLocationLoading(false);
      setIsLoading(false);
      return;
    }

    const getLocation = () => {
      setIsLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordsData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(coordsData);
          setIsLocationLoading(false);
          reverseGeocode(coordsData.lat, coordsData.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(
            "Gagal mendapatkan lokasi. " +
              (error.message === "User denied Geolocation"
                ? "Izinkan akses lokasi untuk melihat jadwal sholat."
                : "Silakan coba lagi.")
          );
          setIsLocationLoading(false);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    };

    getLocation();
  }, []);

  // Reverse geocode to get location name
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
      );

      if (!response.ok) {
        throw new Error("Gagal mendapatkan nama lokasi");
      }

      const data = await response.json();
      const displayName = data.display_name || "Lokasi tidak dikenal";

      // Extract city/district name
      const address = data.address;
      const location =
        address?.city ||
        address?.town ||
        address?.village ||
        address?.county ||
        address?.state ||
        displayName.split(",")[0] ||
        "Lokasi tidak dikenal";

      setLocationName(location);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setLocationName("Lokasi tidak dikenal");
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Fetch prayer times when coordinates are available
  useEffect(() => {
    if (!coords) return;

    const fetchPrayerTimes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Using Aladhan API to get prayer times
        const today = new Date();
        const formattedDate = `${today.getDate()}-${
          today.getMonth() + 1
        }-${today.getFullYear()}`;

        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${coords.lat}&longitude=${coords.lng}&method=11`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.code !== 200) {
          throw new Error(result.data || "Gagal memuat jadwal sholat");
        }

        const timings = result.data.timings;
        const date = result.data.date;

        setPrayerTimes({
          date: date.gregorian.date,
          hijriDate: date.hijri.date,
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
          imsak: timings.Imsak,
          midnight: timings.Midnight,
        });
      } catch (err: any) {
        console.error("Error fetching prayer times:", err);
        setError(
          err.message || "Gagal memuat jadwal sholat. Silakan coba lagi."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [coords]);

  // Format today's date in Indonesian
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  // Prayer times data for UI
  const prayerTimesData = useMemo(() => {
    if (!prayerTimes) return [];

    return [
      { name: "Imsak", time: prayerTimes.imsak, icon: "🌙" },
      { name: "Subuh", time: prayerTimes.fajr, icon: "🌅" },
      { name: "Terbit", time: prayerTimes.sunrise, icon: "☀️" },
      { name: "Dzuhur", time: prayerTimes.dhuhr, icon: "☀️" },
      { name: "Ashar", time: prayerTimes.asr, icon: "🌇" },
      { name: "Maghrib", time: prayerTimes.maghrib, icon: "🌆" },
      { name: "Isya", time: prayerTimes.isha, icon: "🌙" },
      { name: "Tengah Malam", time: prayerTimes.midnight, icon: "🌌" },
    ];
  }, [prayerTimes]);

  // Get next prayer
  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: "Subuh", time: prayerTimes.fajr },
      { name: "Dzuhur", time: prayerTimes.dhuhr },
      { name: "Ashar", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isya", time: prayerTimes.isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        return prayer;
      }
    }

    // If no prayer left today, return first prayer of tomorrow (Subuh)
    return prayers[0];
  }, [prayerTimes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
      {/* App Bar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 truncate">{todayStr}</p>
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              Jadwal Sholat
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Location Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 grid place-items-center">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-600">Lokasi Anda</p>
              <p className="font-medium text-slate-900 truncate">
                {isLocationLoading || isReverseGeocoding ? (
                  <span className="inline-flex items-center gap-2">
                    Mendeteksi lokasi...
                    <span className="relative inline-block h-2 w-2">
                      <span className="absolute inline-block h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                      <span className="absolute inline-block h-2 w-2 rounded-full bg-indigo-500" />
                    </span>
                  </span>
                ) : (
                  locationName || "Lokasi tidak dikenal"
                )}
              </p>
            </div>
          </div>

          {coords && (
            <p className="mt-2 text-xs text-slate-500">
              Koordinat: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Next Prayer */}
        {nextPrayer && (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-500 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-xs">Sholat berikutnya</p>
                <h2 className="text-xl font-bold">{nextPrayer.name}</h2>
                <p className="text-2xl font-bold mt-1">{nextPrayer.time}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {/* Hijri Date */}
        {prayerTimes && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 grid place-items-center">
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Tanggal Hijriyah</p>
                <p className="font-medium text-slate-900">
                  {prayerTimes.hijriDate} H
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-white shadow-sm border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-3">
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Prayer Times List */}
        {!isLoading && !error && prayerTimes && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 px-2">
              Jadwal Hari Ini
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {prayerTimesData.map((prayer, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {prayer.icon}
                    </span>
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {prayer.name}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900 tabular-nums">
                      {prayer.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="h-4" />
      </main>

      {/* Bottom Navigation */}
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

// TabItem component with proper icon display
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

export default PrayerTimesPage;
