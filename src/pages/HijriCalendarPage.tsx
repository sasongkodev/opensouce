// src/pages/HijriCalendarPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  BookOpen,
  Clock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  weekday: string;
}

const HijriCalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        active: false,
        icon: <Clock className="h-5 w-5" />,
      },
      {
        label: "Kalender",
        route: "/kalender",
        active: true,
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

  // Fetch Hijri date based on Gregorian date
  useEffect(() => {
    const fetchHijriDate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Format date as DD-MM-YYYY for API
        const formattedDate = `${currentDate.getDate()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getFullYear()}`;

        // Using Aladhan API to get Hijri date
        const response = await fetch(
          `https://api.aladhan.com/v1/gToH/${formattedDate}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.code !== 200) {
          throw new Error(result.data || "Gagal memuat tanggal Hijriah");
        }

        const hijri = result.data.hijri;

        setHijriDate({
          day: parseInt(hijri.day),
          month: parseInt(hijri.month.number),
          year: parseInt(hijri.year),
          monthName: hijri.month.en,
          weekday: hijri.weekday.en,
        });
      } catch (err: any) {
        console.error("Error fetching Hijri date:", err);
        setError(
          err.message || "Gagal memuat tanggal Hijriah. Silakan coba lagi."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHijriDate();
  }, [currentDate]);

  // Format today's date in Indonesian
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(currentDate);
  }, [currentDate]);

  // Month names in Indonesian
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Hijri month names in Indonesian
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

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Days from previous month to show
    const prevMonthDays = firstDay.getDay();
    // Days from next month to show
    const nextMonthDays = 6 - lastDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;
    const todayDate = isCurrentMonth ? today.getDate() : -1;

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: i === todayDate,
      });
    }

    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentDate]);

  // Weekday names in Indonesian
  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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
              Kalender Hijriah
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Date Info Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Gregorian Date */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 grid place-items-center">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Tanggal Masehi</p>
                <p className="font-medium text-slate-900">
                  {currentDate.getDate()} {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Hijri Date */}
          {hijriDate && !isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">Tanggal Hijriah</p>
                  <p className="font-medium">
                    {hijriDate.day} {hijriMonthNames[hijriDate.month - 1]}{" "}
                    {hijriDate.year} H
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State for Hijri Date */}
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
              </div>
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
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="rounded-xl"
          >
            &larr; Bulan Lalu
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="rounded-xl"
          >
            Hari Ini
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="rounded-xl"
          >
            Bulan Depan &rarr;
          </Button>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Calendar Header */}
          <div className="mb-3 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-slate-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  h-10 flex items-center justify-center text-sm rounded-lg
                  ${day.isToday ? "bg-indigo-600 text-white font-semibold" : ""}
                  ${!day.isCurrentMonth ? "text-slate-400" : "text-slate-900"}
                  ${
                    day.isCurrentMonth && !day.isToday
                      ? "hover:bg-slate-100"
                      : ""
                  }
                `}
              >
                {day.date}
              </div>
            ))}
          </div>
        </div>

        {/* Hijri Month Info */}
        {hijriDate && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium text-slate-900 mb-2">
              Bulan Hijriah Sekarang
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">
                {hijriMonthNames[hijriDate.month - 1]}
              </span>
              <span className="text-slate-500 text-sm">{hijriDate.year} H</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Bulan ke-{hijriDate.month} dalam kalender Hijriah
            </p>
          </div>
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

export default HijriCalendarPage;
