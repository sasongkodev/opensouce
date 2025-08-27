import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  Headphones,
  MoreVertical,
  Play,
  Share2,
  
  Search,
  Home,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

// --- Types
export type SurahCardData = {
  number: number; // 1..114
  arabicName: string; // الفاتحة
  transliteration: string; // Al-Fātiḥah
  translation: string; // Pembukaan
  revelation: "Makkiyah" | "Madaniyah" | string;
  ayahCount: number;
  juzFrom: number;
  juzTo?: number;
  lastReadAyah?: number; // e.g. 5
  lastReadAt?: string; // ISO string
  audioUrl?: string; // mp3 preview for the surah
};

// --- Helpers
const formatLastRead = (iso?: string) => {
  if (!iso) return "Belum mulai";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "";
  }
};

const getAudioUrl = (surah: number) =>
  // Sumber publik demo (boleh diganti dengan CDN internal)
  `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surah}.mp3`;

// --- UI Primitives (tailwind-only, no external UI kit required)
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function IconButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
) {
  const { className = "", active, ...rest } = props;
  return (
    <button
      className={
        `inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md active:scale-95 ${
          active ? "ring-2 ring-emerald-500/50" : ""
        } ` + className
      }
      {...rest}
    />
  );
}

// --- Core Card Component
export function QuranCard({
  data,
  onBookmark,
  onPlay,
  onContinue,
}: {
  data: SurahCardData;
  onBookmark?: (surah: SurahCardData) => void;
  onPlay?: (surah: SurahCardData) => void;
  onContinue?: (surah: SurahCardData) => void;
}) {
  const progress = useMemo(() => {
    if (!data.lastReadAyah || data.ayahCount === 0) return 0;
    return Math.min(
      100,
      Math.round((data.lastReadAyah / data.ayahCount) * 100)
    );
  }, [data.lastReadAyah, data.ayahCount]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
        <div className="relative flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/10 backdrop-blur">
          <span className="text-lg font-bold tabular-nums">{data.number}</span>
          <svg
            className="absolute -bottom-1 -right-1 h-8 w-8 opacity-30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 12h20M12 2v20" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xl font-semibold">
              {data.transliteration}
            </h3>
            <Chip>{data.revelation}</Chip>
            <Chip>{data.ayahCount} ayat</Chip>
          </div>
          <p className="text-sm/6 opacity-95">{data.translation}</p>
        </div>
        <IconButton
          aria-label="Lainnya"
          className="text-white/90 hover:bg-white/10 hover:text-white"
        >
          <MoreVertical className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Terakhir dibaca</p>
            <p className="truncate text-sm font-medium text-slate-800">
              {data.lastReadAyah ? (
                <>
                  Ayat {data.lastReadAyah} • {formatLastRead(data.lastReadAt)}
                </>
              ) : (
                <>Belum mulai</>
              )}
            </p>
          </div>

          {/* Progress ring */}
          <div className="relative">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
              />
              <path
                className="text-emerald-500"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${progress}, 100`}
                d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-xs font-semibold text-slate-700">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Chip>
              Juz {data.juzFrom}
              {data.juzTo && data.juzTo !== data.juzFrom
                ? `–${data.juzTo}`
                : ""}
            </Chip>
          </div>
          <p className="font-arabic text-2xl leading-none">{data.arabicName}</p>
        </div>

        {/* Actions */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onContinue?.(data)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <BookOpen className="h-4 w-4" /> Lanjut Baca
            </button>
            <button
              onClick={() => onPlay?.(data)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black active:scale-95"
            >
              <Play className="h-4 w-4" /> Putar Audio
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton aria-label="Tandai" onClick={() => onBookmark?.(data)}>
              <Bookmark className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label="Dengarkan">
              <Headphones className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label="Bagikan">
              <Share2 className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Demo Page: menampilkan beberapa kartu & interaksi dasar
const SAMPLE: SurahCardData[] = [
  {
    number: 1,
    arabicName: "ٱلْفَاتِحَة",
    transliteration: "Al-Fātiḥah",
    translation: "Pembukaan",
    revelation: "Makkiyah",
    ayahCount: 7,
    juzFrom: 1,
    lastReadAyah: 3,
    lastReadAt: new Date().toISOString(),
    audioUrl: getAudioUrl(1),
  },
  {
    number: 2,
    arabicName: "ٱلْبَقَرَة",
    transliteration: "Al-Baqarah",
    translation: "Sapi Betina",
    revelation: "Madaniyah",
    ayahCount: 286,
    juzFrom: 1,
    juzTo: 3,
    lastReadAyah: 120,
    lastReadAt: new Date(Date.now() - 36e5 * 18).toISOString(),
    audioUrl: getAudioUrl(2),
  },
  {
    number: 112,
    arabicName: "ٱلْإِخْلَاص",
    transliteration: "Al-Ikhlāṣ",
    translation: "Ikhlas",
    revelation: "Makkiyah",
    ayahCount: 4,
    juzFrom: 30,
    lastReadAyah: 2,
    lastReadAt: new Date(Date.now() - 36e5 * 72).toISOString(),
    audioUrl: getAudioUrl(112),
  },
];

export default function QuranCardPage() {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE;
    return SAMPLE.filter((s) =>
      [
        s.transliteration.toLowerCase(),
        s.translation.toLowerCase(),
        s.arabicName,
        String(s.number),
      ].some((v) => v.includes(q))
    );
  }, [query]);

  const handleBookmark = (s: SurahCardData) => {
    setBookmarked((prev) =>
      prev.includes(s.number)
        ? prev.filter((n) => n !== s.number)
        : [...prev, s.number]
    );
  };

  const handlePlay = (s: SurahCardData) => {
    if (!audioRef.current) return;
    audioRef.current.src = s.audioUrl || "";
    audioRef.current.play().catch(() => void 0);
  };

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

  const navItems = useMemo(
    () => [
      {
        label: "Beranda",
        route: "/",
        active: false,
        icon: <Home className="h-5 w-5" />,
      },
      {
        label: "Qur'an",
        route: "/quran",
        active: true,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-[calc(env(safe-area-inset-bottom)+88px)]">
      {/* App Bar (match HomePage) */}
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
                Daftar Surah
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
        {/* Search */}
        <div className="max-w-md mx-auto px-4 pb-3">
          <label className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:ring-2"
              placeholder="Cari surah… (nama / terjemahan / nomor)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {filtered.map((s) => (
          <div key={s.number} className="relative">
            <QuranCard
              data={s}
              onContinue={() => console.log("continue", s.number)}
              onPlay={handlePlay}
              onBookmark={handleBookmark}
            />
            <button
              className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
              onClick={() => handleBookmark(s)}
            >
              {bookmarked.includes(s.number) ? (
                <>
                  <BookmarkCheck className="h-4 w-4" /> Tersimpan
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" /> Simpan
                </>
              )}
            </button>
          </div>
        ))}
        <div className="h-2" />
      </main>

      {/* Bottom Nav (match HomePage) */}
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

      {/* Hidden audio element for previews */}
      <audio ref={audioRef} />

      {/* Fonts note: gunakan kelas font-arabic di tailwind untuk font Arab */}
      <style>{`
        .font-arabic {
          font-family: 'Noto Naskh Arabic', 'Scheherazade New', system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}

/* --------------------------- Small UI pieces --------------------------- */
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
