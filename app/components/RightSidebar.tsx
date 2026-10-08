"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { DbGuest, DbProject, DbEvent, DbWish, isDefaultStorageUrl } from "../../lib/resolveProject";

import { ASSETS } from "../../lib/assets";
export { ASSETS };

interface Props {
  guestName: string;
  guest?: DbGuest | null;
  project?: DbProject | null;
  events?: DbEvent[] | null;
  wishes?: DbWish[] | null;
  stats?: {
    attending: number;
    wishes: number;
  };
  existingRsvp?: any | null;
}

const formatHonorific = (name?: string | null, prefix: string = "") => {
  if (!name || !name.trim()) return "";
  const trimmed = name.trim();
  if (/^(bpk\.?|bapak|ibu)/i.test(trimmed)) return trimmed;
  return `${prefix} ${trimmed}`;
};

export default function RightSidebar({ guestName, guest, project, events, wishes: initialWishes, stats, existingRsvp }: Props) {
  // Couple Info
  const brideNickname = project?.bride_nickname || "Natalie";
  const groomNickname = project?.groom_nickname || "Marvel";
  const brideFull = project?.bride_name || "Natalie C";
  const groomFull = project?.groom_name || "Marvel A";

  // Event Info
  const mainEvent = events && events.length > 0 ? events[0] : null;
  const weddingDateRaw = mainEvent?.event_date || project?.wedding_date || (project?.countdown_target ? project.countdown_target.split('T')[0] : null);
  const formatDateDisplay = (dateStr?: string | null) => {
    if (!dateStr) return "28.02.2028";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    } catch {
      return "28.02.2028";
    }
  };
  const formattedDate = formatDateDisplay(weddingDateRaw);

  const extractTime = () => {
    if (mainEvent?.event_time) {
      return `${mainEvent.event_time.slice(0, 5)} WIB`;
    }
    if ((project as any)?.wedding_time) {
      return `${(project as any).wedding_time.slice(0, 5)} WIB`;
    }
    if (project?.countdown_target && project.countdown_target.includes("T")) {
      const timePart = project.countdown_target.split("T")[1]?.slice(0, 5);
      if (timePart) return `${timePart} WIB`;
    }
    return "15:00 WIB";
  };
  const formattedTime = extractTime();

  const venueName = mainEvent?.venue_name || (project as any)?.venue_name || "Villa Dago";
  const venueAddress = mainEvent?.venue_address || (project as any)?.venue_address || "Jl. Dago Pakar Permai No. 1, Bandung";
  const mapsUrl = mainEvent?.venue_maps_url || (project as any)?.venue_maps_url || "https://maps.google.com";

  // Story Milestones
  const dbStories = (project as any)?.love_story_items || (project as any)?.wedding_stories;
  const stories = Array.isArray(dbStories) && dbStories.length > 0
    ? dbStories
    : [
        {
          year: "2019",
          title: "First Meet",
          story: "Berawal dari perkenalan singkat di sebuah kafe hingga berlanjut ke pertemuan berikutnya.",
        },
        {
          year: "2020",
          title: "The Spark",
          story: "Mulai menyadari dan merasakan adanya rasa yang berbeda di antara keduanya.",
        },
        {
          year: "2024",
          title: "The Proposal",
          story: "Di tempat yang tenang dan penuh makna, sebuah janji terucap untuk melangkah bersama selamanya.",
        },
      ];

  // Bank Info
  let paymentAccounts: any[] = [];
  try {
    if (Array.isArray((project as any)?.payment_accounts)) {
      paymentAccounts = (project as any).payment_accounts;
    } else if (typeof (project as any)?.payment_accounts === "string") {
      paymentAccounts = JSON.parse((project as any).payment_accounts);
    }
  } catch (e) {
    paymentAccounts = [];
  }

  const formatBankTitle = (name?: string) => {
    if (!name) return "BANK BCA";
    const clean = name.replace(/:/g, "").trim().toUpperCase();
    return clean.startsWith("BANK") ? clean : `BANK ${clean}`;
  };

  const brideBank = paymentAccounts[0]
    ? {
        bank_name: paymentAccounts[0].provider || paymentAccounts[0].bank_name || "BANK BCA",
        account_number: paymentAccounts[0].account_number || "777555231",
        owner_name: paymentAccounts[0].account_name || paymentAccounts[0].owner_name || brideFull,
        nickname: brideNickname,
      }
    : ((project as any)?.bride_bank || {
        bank_name: "BANK BCA",
        account_number: "777555231",
        owner_name: brideFull,
        nickname: brideNickname,
      });

  const groomBank = paymentAccounts[1]
    ? {
        bank_name: paymentAccounts[1].provider || paymentAccounts[1].bank_name || "BANK BCA",
        account_number: paymentAccounts[1].account_number || "777555005",
        owner_name: paymentAccounts[1].account_name || paymentAccounts[1].owner_name || groomFull,
        nickname: groomNickname,
      }
    : ((project as any)?.groom_bank || {
        bank_name: "BANK BCA",
        account_number: "777555005",
        owner_name: groomFull,
        nickname: groomNickname,
      });

  const coverPhoto = (!isDefaultStorageUrl(project?.opening_photo_url) ? project?.opening_photo_url : null)
    || (!isDefaultStorageUrl(project?.cover_photo_url) ? project?.cover_photo_url : null);

  // State Management
  const isGuestLocked = Boolean(guestName && guestName !== "Guest Name" && guestName.trim() !== "");
    // Dress Code
  const hasDresscode = (project as any)?.has_dresscode !== false;
  
  const parseDresscodeColors = (): { hex: string; name: string }[] => {
    const rawColors = (project as any)?.dresscode_colors;
    if (Array.isArray(rawColors) && rawColors.length > 0) {
      return rawColors.map((c: any) => ({
        hex: typeof c === "string" ? c : (c?.hex || c?.color || "#ffffff"),
        name: typeof c === "string" ? c : (c?.name || c?.label || "")
      }));
    }
    if (typeof rawColors === "string" && rawColors.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(rawColors);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            hex: typeof c === "string" ? c : (c?.hex || c?.color || "#ffffff"),
            name: typeof c === "string" ? c : (c?.name || c?.label || "")
          }));
        }
      } catch {}
    }
    const eventDc = mainEvent?.dresscode || (project as any)?.dresscode;
    if (eventDc && typeof eventDc === "string" && eventDc.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(eventDc);
        if (Array.isArray(parsed.colors) && parsed.colors.length > 0) {
          return parsed.colors.map((c: any) => ({
            hex: typeof c === "string" ? c : (c?.hex || "#ffffff"),
            name: typeof c === "string" ? c : (c?.name || "")
          }));
        }
      } catch {}
    }
    return [
      { name: "Cream White", hex: "#FAF7F2" },
      { name: "Warm Sand", hex: "#E6D7C3" },
      { name: "Soft Terracotta", hex: "#C98A7D" },
      { name: "Sage Green", hex: "#9EA992" },
      { name: "Midnight Black", hex: "#2A2B2A" },
    ];
  };

  const dresscodeColors = parseDresscodeColors();

  const [willBeThere, setWillBeThere] = useState<"yes" | "no" | null>(
    existingRsvp ? (existingRsvp.attendance === "not_attending" ? "no" : "yes") : "yes"
  );
  const [rsvpName, setRsvpName] = useState(isGuestLocked ? guestName : "");
  const [rsvpEmail, setRsvpEmail] = useState(guest?.email || "");
  const [rsvpStatus, setRsvpStatus] = useState<string>(
    existingRsvp ? (existingRsvp.attendance === "not_attending" ? "not_attending" : "attending") : "attending"
  );
  const [guestCount, setGuestCount] = useState<number>(existingRsvp?.pax || 1);
  const [rsvpNotes, setRsvpNotes] = useState<string>("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [hasSubmittedRsvp, setHasSubmittedRsvp] = useState(Boolean(existingRsvp));
  const [savedAttendance, setSavedAttendance] = useState<{ status: string; pax: number } | null>(
    existingRsvp ? { status: existingRsvp.attendance || "attending", pax: existingRsvp.pax || 1 } : null
  );
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.touchAction = "";
    };
  }, [isOpened]);

  const handleOpenInvitation = () => {
    setIsOpened(true);
    if (!userPausedRef.current && audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Wishes State
  const [wishesList, setWishesList] = useState<DbWish[]>(initialWishes || [
    {
      id: "1",
      project_id: project?.id || "",
      name: "Jessica & Kevin",
      message: "Happy wedding for both of you! Semoga cinta kalian selalu mekar seperti bunga di musim semi.",
      is_approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      project_id: project?.id || "",
      name: "Rian & Sarah",
      message: `Selamat menempuh hidup baru ${groomNickname} & ${brideNickname}! Bahagia selalu hingga kakek nenek.`,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
  ]);
  const [wishName, setWishName] = useState(guestName !== "Guest Name" ? guestName : "");
  const [wishMessage, setWishMessage] = useState("");
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wishSuccess, setWishSuccess] = useState(false);

  // Toast / Copy notification
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Music Player
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef(false);

  useEffect(() => {
    const handleFirstClick = () => {
      if (userPausedRef.current) return;
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    window.addEventListener("click", handleFirstClick, { once: true });
    return () => window.removeEventListener("click", handleFirstClick);
  }, []);

  const toggleMusic = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      userPausedRef.current = true;
    } else {
      userPausedRef.current = false;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

    // RSVP Form Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpSubmitting(true);

    try {
      const activeProjectId = project?.id || "1bf6f05c-f64a-40c9-b67a-490b52289bd4";
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: activeProjectId,
          guest_id: guest?.id,
          name: rsvpName,
          guest_name: rsvpName,
          email: rsvpEmail,
          status: rsvpStatus,
          attendance: rsvpStatus === "attending" ? "attending" : "not_attending",
          pax: guestCount,
          guests_count: guestCount,
          notes: rsvpNotes,
          message: rsvpNotes,
        }),
      });

      if (res.ok) {
        setRsvpSuccess(true);
        setHasSubmittedRsvp(true);
        const savedData = {
          status: rsvpStatus,
          pax: guestCount,
          submittedAt: new Date().toISOString()
        };
        setSavedAttendance(savedData);
        if (typeof window !== "undefined") {
          const targetName = (rsvpName || guestName || "anon").toLowerCase().trim();
          localStorage.setItem(`sera_rsvp_${activeProjectId}_${encodeURIComponent(targetName)}`, JSON.stringify(savedData));
          localStorage.setItem(`sera_rsvp_submitted_${activeProjectId}`, JSON.stringify(savedData));
        }
      }
    } catch (err) {
      console.error("RSVP error:", err);
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Wishes Form Submit
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishMessage.trim()) return;
    setWishSubmitting(true);

    try {
      const activeProjectId = project?.id || "1bf6f05c-f64a-40c9-b67a-490b52289bd4";
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: activeProjectId,
          guest_id: guest?.id,
          name: wishName,
          message: wishMessage,
        }),
      });

      if (res.ok) {
        const newWish: DbWish = {
          id: Date.now().toString(),
          project_id: activeProjectId,
          name: wishName,
          message: wishMessage,
          is_approved: true,
          created_at: new Date().toISOString(),
        };
        setWishesList([newWish, ...wishesList]);
        setWishMessage("");
        setWishSuccess(true);
        setTimeout(() => setWishSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Wish error:", err);
    } finally {
      setWishSubmitting(false);
    }
  };

  return (
    <div className={`relative w-full md:w-[42%] lg:w-[38%] ${isOpened ? "min-h-[100dvh] md:h-[100dvh] md:overflow-y-auto md:overflow-x-hidden" : "h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none touch-none"} bg-[#faf9f6] text-neutral-900 selection:bg-red-500 selection:text-white border-l border-neutral-200 shadow-2xl flex-shrink-0`}>
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={project?.music_url || "/audio/bgm.mp3"} 
        loop 
        preload="auto" 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Ambient Doodles & Hearts in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", x: `${15 + i * 15}vw`, opacity: 0.2, scale: 0.8 }}
            animate={{
              y: "-10vh",
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.1, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 18 + i * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2.5,
            }}
            className="absolute text-red-500/50 text-xl font-bold select-none"
          >
            {i % 2 === 0 ? "♥" : "✦"}
          </motion.div>
        ))}
      </div>

      {/* Floating Music Button with Vinyl Spin Animation */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleMusic(e);
        }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-neutral-300 flex items-center justify-center text-neutral-900 transition-all hover:bg-neutral-900 hover:text-white group cursor-pointer"
        title={isPlaying ? "Jeda Musik (Pause)" : "Putar Musik (Play)"}
      >
        {isPlaying ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="text-xl inline-block select-none"
          >
            🎵
          </motion.span>
        ) : (
          <span className="flex items-center justify-center text-neutral-700 group-hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <rect x="6" y="4" width="3.5" height="16" rx="1.2" />
              <rect x="14.5" y="4" width="3.5" height="16" rx="1.2" />
            </svg>
          </span>
        )}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -25, x: [0, 8, -5] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className="absolute text-xs text-red-500 pointer-events-none -top-2 right-1 font-bold"
          >
            ♪
          </motion.div>
        )}
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {!isOpened && (
          <motion.section
            id="cover-section"
            initial={{ opacity: 1, y: 0 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
            className="fixed md:absolute inset-0 z-50 h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between items-center text-center px-4 sm:px-6 py-2.5 sm:py-4 overflow-hidden select-none touch-none overscroll-none bg-[#faf9f6]"
          >
            {/* Ambient Floating Hearts & Doodles in Cover */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-35">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ y: "105vh", opacity: 0.3 }}
                  animate={{
                    y: "-10vh",
                    opacity: [0.2, 0.7, 0.2],
                    scale: [0.9, 1.15, 0.9],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 16 + i * 2.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 2,
                  }}
                  style={{ left: (10 + i * 16) + "%" }}
                  className="absolute text-red-500/50 text-xl font-bold select-none"
                >
                  {i % 2 === 0 ? "♥" : "✦"}
                </motion.div>
              ))}
            </div>

            {/* Top Rings + "THE WEDDING OF" */}
            <div className="relative z-10 pt-1 space-y-1 shrink-0">
              <div className="flex justify-center">
                <motion.img
                  animate={{ rotate: [-2, 2, -2], scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  src={ASSETS.topRings}
                  alt="Wedding Rings"
                  className="w-10 sm:w-12 h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                />
              </div>
              <p className="font-gaegu font-bold text-[11px] sm:text-xs tracking-[0.3em] uppercase text-neutral-600">
                THE WEDDING OF
              </p>
              <h1 className="font-gaegu font-bold text-3xl sm:text-4xl lg:text-4xl text-neutral-900 leading-tight tracking-wide drop-shadow-sm">
                {brideNickname} <span className="text-red-600 font-gaegu text-2xl sm:text-3xl">&amp;</span> {groomNickname}
              </h1>
            </div>

            {/* Center: Couple Illustration or Custom Cover Photo */}
            <div className="relative z-10 my-auto flex-1 min-h-0 w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center py-1 sm:py-2 px-2 overflow-hidden">
              {coverPhoto ? (
                <div className="relative flex-1 min-h-0 max-h-[46vh] sm:max-h-[50vh] aspect-[4/5] rounded-2xl overflow-hidden border-3 border-neutral-900 shadow-xl bg-white p-1.5 flex items-center justify-center">
                  <img src={coverPhoto} alt="Cover Photo" className="w-full h-full object-cover rounded-xl" />
                </div>
              ) : (
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="flex justify-center items-center flex-1 min-h-0 w-full overflow-hidden"
                >
                  <img
                    src={ASSETS.couple}
                    alt="Illustrated Couple"
                    className="max-h-[38vh] sm:max-h-[42vh] max-w-[95%] sm:max-w-full w-auto h-auto object-contain select-none pointer-events-none drop-shadow-md transition-all"
                  />
                </motion.div>
              )}

              <div className="mt-2 mb-1 inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full border border-neutral-300/80 bg-white/80 backdrop-blur-xs shadow-2xs shrink-0">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                <p className="font-gaegu font-bold text-xs sm:text-sm tracking-[0.2em] text-neutral-800">
                  {formattedDate}
                </p>
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              </div>
            </div>

            {/* Bottom: Guest Greeting Card & "Buka Undangan" Button */}
            <div className="relative z-10 w-full max-w-[280px] sm:max-w-[310px] space-y-3 pb-1 shrink-0 mx-auto">
              <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-neutral-200/90 p-3 sm:p-3.5 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.06)] space-y-1.5 transition-all">
                <div className="flex items-center justify-center gap-2 text-neutral-400">
                  <span className="h-[1px] w-5 bg-neutral-200" />
                  <p className="font-gaegu font-bold text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wider">
                    Kepada Yth. Bapak/Ibu/Saudara/i:
                  </p>
                  <span className="h-[1px] w-5 bg-neutral-200" />
                </div>
                <div className="px-2 py-0.5">
                  <p className="font-gaegu font-bold text-lg sm:text-xl text-neutral-900 tracking-wide truncate drop-shadow-2xs">
                    {guestName}
                  </p>
                </div>
                <p className="font-gaegu font-light text-[9.5px] sm:text-[10px] text-neutral-400 italic leading-tight">
                  *Mohon maaf jika ada kesalahan penulisan nama/gelar
                </p>
              </div>

              {/* Buka Undangan Button - Refined Compact Aesthetic */}
              <div className="pt-0.5 flex justify-center">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleOpenInvitation}
                  className="relative group inline-flex items-center justify-center gap-2 px-5 py-2 sm:py-2.5 rounded-full bg-[#1e1b18] hover:bg-neutral-900 text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.22)] hover:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.32)] transition-all duration-300 border border-[#38332d] cursor-pointer overflow-hidden mx-auto"
                >
                  {/* Subtle shimmer sweep on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                  {/* Delicate Minimalist Mail Icon */}
                  <svg 
                    className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 shrink-0" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  >
                    <rect width="20" height="16" x="2" y="4" rx="3" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>

                  <span className="font-gaegu font-bold text-sm sm:text-base tracking-wider text-neutral-100 group-hover:text-white transition-colors">
                    Buka Undangan
                  </span>

                  {/* Sleek Arrow Indicator */}
                  <svg 
                    className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Column */}
      <div className="relative max-w-md mx-auto px-5 py-8 space-y-12 sm:space-y-14 z-10">
        
        {/* 1. HERO SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-3 pt-2"
        >
          <p className="text-xs sm:text-sm font-gaegu tracking-[0.25em] text-neutral-800 uppercase font-bold">
            YOU ARE INVITED TO OUR WEDDING
          </p>

          {/* Top Wedding Rings with Gentle Floating Pulse */}
          <div className="flex justify-center py-1">
            <motion.img 
              animate={{ rotate: [-2, 2, -2], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              src={ASSETS.topRings} 
              alt="Wedding Rings" 
              className="w-12 h-auto object-contain select-none pointer-events-none drop-shadow-sm" 
            />
          </div>

          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-gaegu font-bold text-4xl sm:text-5xl text-neutral-900 leading-tight tracking-wide drop-shadow-sm"
          >
            {brideNickname} <br />
            <span className="text-red-600 font-gaegu font-bold text-3xl sm:text-4xl inline-block animate-pulse">&amp;</span> <br />
            {groomNickname}
          </motion.h1>

          {(brideFull || groomFull) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-2 space-y-0.5"
            >
              <p className="font-gaegu text-lg sm:text-xl font-bold text-neutral-800 tracking-wide">
                {brideFull} &amp; {groomFull}
              </p>
              {Boolean((project as any)?.bride_father || (project as any)?.bride_mother) && (
                <p className="font-gaegu text-xs sm:text-sm text-neutral-600">
                  Putri dari {formatHonorific((project as any)?.bride_father, "Bpk.")}{Boolean((project as any)?.bride_father && (project as any)?.bride_mother) ? " & " : ""}{formatHonorific((project as any)?.bride_mother, "Ibu")}
                </p>
              )}
              {Boolean((project as any)?.groom_father || (project as any)?.groom_mother) && (
                <p className="font-gaegu text-xs sm:text-sm text-neutral-600">
                  Putra dari {formatHonorific((project as any)?.groom_father, "Bpk.")}{Boolean((project as any)?.groom_father && (project as any)?.groom_mother) ? " & " : ""}{formatHonorific((project as any)?.groom_mother, "Ibu")}
                </p>
              )}
            </motion.div>
          )}

          {/* Couple Illustration with Gentle Floating Bob */}
          <div className="pt-3 flex justify-center">
            <motion.img 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
              whileHover={{ scale: 1.03 }}
              src={ASSETS.couple} 
              alt="Illustrated Couple" 
              className="w-64 sm:w-72 h-auto object-contain select-none pointer-events-none drop-shadow-md cursor-pointer" 
            />
          </div>
        </motion.section>

        {/* 2. DATE & PLACE SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-5 pt-2"
        >
          <p className="text-xs sm:text-sm font-gaegu tracking-[0.2em] text-neutral-800 uppercase font-bold">
            the details of our big day
          </p>

          <div className="flex justify-center">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={ASSETS.titleDatePlace} 
              alt="Date & Place" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <div className="space-y-4 pt-2">
            {/* Calendar */}
            <motion.div 
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm py-2 px-4 rounded-full border border-neutral-200/80 shadow-sm max-w-xs mx-auto"
            >
              <img src={ASSETS.calendarIcon} alt="Calendar" className="w-6 h-6 object-contain" />
              <span className="font-gaegu text-xl sm:text-2xl font-bold text-neutral-900 tracking-wider">
                {formattedDate}
              </span>
            </motion.div>

            {/* Time */}
            <motion.div 
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm py-2 px-4 rounded-full border border-neutral-200/80 shadow-sm max-w-xs mx-auto"
            >
              <img src={ASSETS.clockIcon} alt="Clock" className="w-6 h-6 object-contain" />
              <span className="font-gaegu text-xl sm:text-2xl font-bold text-neutral-900 tracking-wider">
                {formattedTime}
              </span>
            </motion.div>

            {/* Location */}
            <motion.div 
              whileHover={{ scale: 1.03, y: -2 }}
              className="flex flex-col items-center justify-center gap-1 bg-white/70 backdrop-blur-sm py-2.5 px-4 rounded-2xl border border-neutral-200/80 shadow-sm max-w-xs mx-auto"
            >
              <div className="flex items-center justify-center gap-3">
                <img src={ASSETS.pinIcon} alt="Location Pin" className="w-6 h-6 object-contain" />
                <span className="font-gaegu text-xl sm:text-2xl font-bold text-neutral-900 tracking-wider">
                  {venueName}
                </span>
              </div>
              {venueAddress && (
                <p className="text-xs text-neutral-600 font-gaegu max-w-xs text-center mt-0.5">
                  {venueAddress}
                </p>
              )}
            </motion.div>
          </div>

          {/* Open Map Button */}
          <div className="pt-2 flex justify-center">
            <motion.a
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-neutral-900 text-white font-gaegu font-bold text-sm tracking-widest px-8 py-3 rounded-full hover:bg-neutral-800 transition-all shadow-md group"
            >
              <img src={ASSETS.pinIcon} alt="Pin" className="w-4 h-4 object-contain brightness-0 invert group-hover:animate-bounce" />
              <span>OPEN MAP</span>
            </motion.a>
          </div>
        </motion.section>

        {/* 3. OUR STORY SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 pt-4"
        >
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4 leading-snug">
            a Journey of a thousand miles begins with a single step.
          </p>

          <div className="flex justify-center">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={ASSETS.titleOurStory} 
              alt="Our Story" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          {/* Vertical Timeline */}
          <div className="relative max-w-sm mx-auto pt-8 pb-4">
            {/* Seamless Center Vertical Line */}
            <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-neutral-900 z-0"></div>

            <div className="space-y-12 relative z-10">
              {stories.map((item: any, idx: number) => {
                const isEven = idx % 2 === 1;
                const iconSrc = item.icon || (idx === 0 ? ASSETS.timelineHeart : idx === 1 ? ASSETS.timelineFlowers : ASSETS.timelineRings);

                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="flex items-center justify-between gap-4"
                  >
                    {/* Left Side */}
                    <div className="w-1/2 text-right pr-2">
                      {!isEven ? (
                        <motion.span 
                          whileHover={{ scale: 1.08 }}
                          className={`font-gaegu font-bold text-red-600 block leading-tight cursor-default whitespace-nowrap ${(item.year || "").length > 7 ? "text-base sm:text-lg tracking-tight" : (item.year || "").length > 4 ? "text-xl sm:text-2xl tracking-normal" : "text-3xl sm:text-4xl tracking-wider"}`}
                        >
                          {item.year || "2019"}
                        </motion.span>
                      ) : (
                        <div className="bg-white/80 p-3 rounded-2xl border border-neutral-200 shadow-sm text-right">
                          <h4 className="font-gaegu font-bold text-base text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                          <p className="font-gaegu font-light text-xs text-neutral-600 leading-relaxed mt-0.5">
                            {item.story || item.desc || item.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center Icon: NO CIRCLE BORDER, ENLARGED (User request: gausah dibuletin lagi sama digedein lagi) */}
                    <motion.div 
                      whileInView={{ scale: [0.8, 1.15, 1], opacity: 1 }}
                      viewport={{ once: false, amount: 0.2 }}
                      whileHover={{ scale: 1.25, rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 shrink-0 bg-[#fdfbf7] flex items-center justify-center z-10 py-1 select-none cursor-pointer"
                    >
                      <img 
                        src={iconSrc} 
                        alt="Timeline Icon" 
                        className="w-14 h-14 object-contain select-none pointer-events-none drop-shadow-sm" 
                      />
                    </motion.div>

                    {/* Right Side */}
                    <div className="w-1/2 text-left pl-2">
                      {isEven ? (
                        <motion.span 
                          whileHover={{ scale: 1.08 }}
                          className={`font-gaegu font-bold text-red-600 block leading-tight cursor-default whitespace-nowrap ${(item.year || "").length > 7 ? "text-base sm:text-lg tracking-tight" : (item.year || "").length > 4 ? "text-xl sm:text-2xl tracking-normal" : "text-3xl sm:text-4xl tracking-wider"}`}
                        >
                          {item.year || "2020"}
                        </motion.span>
                      ) : (
                        <div className="bg-white/80 p-3 rounded-2xl border border-neutral-200 shadow-sm text-left">
                          <h4 className="font-gaegu font-bold text-base text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                          <p className="font-gaegu font-light text-xs text-neutral-600 leading-relaxed mt-0.5">
                            {item.story || item.desc || item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* 4. DRESS CODE SECTION */}
        {hasDresscode && (
          <motion.section 
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15, margin: "-30px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-4 pt-4"
          >
            <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-6 leading-relaxed">
              To maintain the harmony of our wedding theme, we kindly request our guests to wear
            </p>

            <div className="flex justify-center">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src={ASSETS.titleDressCode} 
                alt="Dress Code" 
                className="w-36 h-auto object-contain select-none pointer-events-none" 
              />
            </div>

            <div className="flex justify-center pt-2">
              <motion.img 
                whileHover={{ scale: 1.04 }}
                src={ASSETS.dressCodeAttire} 
                alt="Formal Attire" 
                className="w-44 h-auto object-contain select-none pointer-events-none drop-shadow-sm" 
              />
            </div>

            {dresscodeColors.length > 0 && (
              <div className="pt-3">
                <p className="text-xs font-gaegu font-bold tracking-[0.2em] text-neutral-600 uppercase mb-3">
                  COLOR PALETTE
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 px-4">
                  {dresscodeColors.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.25, y: -4 }}
                      style={{ backgroundColor: c.hex }}
                      className="w-9 h-9 rounded-full border border-neutral-300/80 shadow-sm cursor-pointer"
                      title={c.name || c.hex}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* 5. WEDDING GIFT SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 pt-4">
          <div className="flex justify-center mb-2">
            <h3 className="font-gaegu font-bold text-5xl sm:text-6xl text-neutral-900 leading-tight">
              Wedding <br /> Gift
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            {/* Bride Tag Card */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.25 }} className="relative flex flex-col items-center bg-white border-2 border-neutral-900 rounded-3xl p-4 sm:p-5 shadow-sm">
              {/* Heart Loop Top */}
              <div className="w-7 h-7 border-2 border-neutral-900 rounded-full flex items-center justify-center -mt-7 bg-white mb-2 shadow-xs">
                <span className="text-xs text-red-500">♥</span>
              </div>

              {/* Red Badge Name */}
              <div className="border border-red-500 rounded-full px-4 py-0.5 mb-2 bg-transparent">
                <span className="font-gaegu font-bold text-xl sm:text-2xl text-red-500 block leading-tight">
                  {brideBank.nickname || brideNickname}
                </span>
              </div>

              <span className="font-gaegu text-base sm:text-lg font-bold text-neutral-800 tracking-wide">{formatBankTitle(brideBank.bank_name)}</span>
              <span className="font-gaegu font-bold text-2xl sm:text-3xl text-neutral-900 tracking-widest my-0.5 select-all">{brideBank.account_number || "777555231"}</span>
              <span className="font-gaegu text-xs sm:text-sm font-bold text-neutral-600">A.N {brideBank.owner_name || brideFull}</span>

              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => copyToClipboard(brideBank.account_number || "777555231", "Nomor rekening")} className="mt-3 w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-sm"><span className="font-gaegu font-bold text-sm tracking-wider uppercase">SALIN REKENING</span></motion.button>
            </motion.div>

            {/* Groom Tag Card */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.25 }} className="relative flex flex-col items-center bg-white border-2 border-neutral-900 rounded-3xl p-4 sm:p-5 shadow-sm">
              {/* Heart Loop Top */}
              <div className="w-7 h-7 border-2 border-neutral-900 rounded-full flex items-center justify-center -mt-7 bg-white mb-2 shadow-xs">
                <span className="text-xs text-red-500">♥</span>
              </div>

              {/* Red Badge Name */}
              <div className="border border-red-500 rounded-full px-4 py-0.5 mb-2 bg-transparent">
                <span className="font-gaegu font-bold text-xl sm:text-2xl text-red-500 block leading-tight">
                  {groomBank.nickname || groomNickname}
                </span>
              </div>

              <span className="font-gaegu text-base sm:text-lg font-bold text-neutral-800 tracking-wide">{formatBankTitle(groomBank.bank_name)}</span>
              <span className="font-gaegu font-bold text-2xl sm:text-3xl text-neutral-900 tracking-widest my-0.5 select-all">{groomBank.account_number || "777555005"}</span>
              <span className="font-gaegu text-xs sm:text-sm font-bold text-neutral-600">A.N {groomBank.owner_name || groomFull}</span>

              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => copyToClipboard(groomBank.account_number || "777555005", "Nomor rekening")} className="mt-3 w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-sm"><span className="font-gaegu font-bold text-sm tracking-wider uppercase">SALIN REKENING</span></motion.button>
            </motion.div>
          </div>

          {/* Red Note Box */}
          <div className="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50/50 text-center font-gaegu text-red-600 space-y-1"><p className="text-base sm:text-lg font-bold">#Note:</p><p className="text-xs sm:text-sm font-bold leading-snug">- Pastikan Nama Bank dan Pemilik Rekening sudah sesuai dengan nama pasangan</p><p className="text-xs sm:text-sm font-bold leading-snug">- Konfirmasi pengiriman kado/tanda kasih melalui pesan pribadi kepada mempelai</p></div>
        </motion.section>

        {/* 6. RSVP SECTION (ARCH ILLUSTRATION) */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 pt-4">
          <p className="text-xs sm:text-sm font-gaegu tracking-[0.2em] text-neutral-800 uppercase font-bold">
            kindly let us know if you can join us
          </p>

          {/* RSVP Script Title (01-15.png) */}
          <div className="flex justify-center">
            <img 
              src={ASSETS.titleRsvp} 
              alt="RSVP" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          {/* The Exact Arch Illustration with Dynamic User-Controlled Checkmarks */}
          <div className="relative max-w-[280px] sm:max-w-[300px] mx-auto select-none">
            <div className="relative drop-shadow-md rounded-[50px] overflow-hidden bg-white">
              <img 
                src={ASSETS.rsvpArch} 
                alt="Will you be there? RSVP Arch" 
                className="w-full h-auto object-contain pointer-events-none" 
              />

              {/* Interactive Row 1: Yes! */}
              <button
                type="button"
                onClick={() => {
                  if (hasSubmittedRsvp) return;
                  setWillBeThere("yes");
                  setRsvpStatus("attending");
                }}
                disabled={hasSubmittedRsvp}
                className="absolute left-[31%] top-[28%] w-[45%] h-[6%] flex items-center cursor-pointer group rounded-md transition-colors hover:bg-neutral-100/40"
                title="Pilih Hadir (Yes!)"
              >
                <span className="sr-only">Hadir (Yes!)</span>
              </button>

              {/* Dynamic Checkmark for Box 1 (Yes!) */}
              <AnimatePresence>
                {willBeThere === "yes" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 22 }}
                    className="absolute left-[32.6%] top-[29.1%] w-[5.5%] h-[4.2%] pointer-events-none flex items-center justify-center"
                  >
                    <svg viewBox="0 0 28 24" fill="none" className="w-full h-full drop-shadow-xs">
                      <path 
                        d="M3 13.5L10 20.5L25 3.5" 
                        stroke="#dc2626" 
                        strokeWidth="4.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Row 2: Sorry, can't make it */}
              <button
                type="button"
                onClick={() => {
                  if (hasSubmittedRsvp) return;
                  setWillBeThere("no");
                  setRsvpStatus("not_attending");
                }}
                disabled={hasSubmittedRsvp}
                className="absolute left-[31%] top-[35%] w-[55%] h-[8.5%] flex items-center cursor-pointer group rounded-md transition-colors hover:bg-neutral-100/40"
                title="Pilih Tidak Hadir (Sorry, can't make it)"
              >
                <span className="sr-only">Tidak Hadir (Sorry, can't make it)</span>
              </button>

              {/* Dynamic Checkmark for Box 2 (Sorry, cant make it) */}
              <AnimatePresence>
                {willBeThere === "no" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 22 }}
                    className="absolute left-[32.6%] top-[35.8%] w-[5.5%] h-[4.2%] pointer-events-none flex items-center justify-center"
                  >
                    <svg viewBox="0 0 28 24" fill="none" className="w-full h-full drop-shadow-xs">
                      <path 
                        d="M3 13.5L10 20.5L25 3.5" 
                        stroke="#dc2626" 
                        strokeWidth="4.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* 7. ATTENDANCE FORM SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 pt-4"
        >
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4">
            Your presence is our greatest honor
          </p>

          <div className="flex justify-center">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={ASSETS.titleAttendance} 
              alt="Attendance" 
              className="w-40 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          {hasSubmittedRsvp ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 border-2 border-neutral-900 rounded-3xl p-6 shadow-sm max-w-sm mx-auto text-center space-y-3.5 my-2"
            >
              <div className="w-12 h-12 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold drop-shadow-xs">
                ✓
              </div>
              <div className="space-y-1">
                <h4 className="font-gaegu font-bold text-2xl text-neutral-900 leading-tight">
                  Konfirmasi Kehadiran Tersimpan
                </h4>
                <p className="font-gaegu text-sm text-neutral-600">
                  Halo <strong>{rsvpName || guestName}</strong>, Anda telah mengonfirmasi kehadiran sebelumnya.
                </p>
              </div>
              <div className="inline-block bg-neutral-50 rounded-2xl px-6 py-2.5 border-2 border-neutral-200">
                <p className="font-gaegu font-bold text-sm text-neutral-700">
                  Status:{" "}
                  <span className={savedAttendance?.status === "attending" || savedAttendance?.status === "hadir" ? "text-emerald-600 font-extrabold" : "text-neutral-500 font-extrabold"}>
                    {savedAttendance?.status === "attending" || savedAttendance?.status === "hadir"
                      ? `✓ Hadir (${savedAttendance?.pax || 1} Orang)`
                      : "✕ Tidak Hadir"}
                  </span>
                </p>
              </div>
              <p className="font-gaegu text-xs text-neutral-500">
                Data kehadiran Anda telah tercatat di sistem kami. Terima kasih!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4 pt-2 text-left max-w-sm mx-auto">
              {/* Field: Guest Identity */}
              <div>
                <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                  Guest Identity
                </label>
                <input
                  type="text"
                  required
                  value={isGuestLocked ? guestName : rsvpName}
                  onChange={(e) => {
                    if (!isGuestLocked) setRsvpName(e.target.value);
                  }}
                  readOnly={isGuestLocked}
                  placeholder="Guest Name"
                  className={`w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all ${
                    isGuestLocked
                      ? "bg-neutral-100/90 cursor-not-allowed select-none text-neutral-700 font-bold"
                      : "bg-white focus:ring-2 focus:ring-neutral-900"
                  }`}
                />
              </div>

              {/* Field: Email Address */}
              <div>
                <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  placeholder="To Receive your digital invitation"
                  className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white transition-all"
                />
              </div>

              {/* Field: Number of Guests */}
              <div>
                <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                  Number of Guests
                </label>
                <div className="relative">
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full appearance-none border-2 border-neutral-900 rounded-full pl-5 pr-11 py-2.5 font-gaegu text-base font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white transition-all cursor-pointer shadow-xs"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 Persons</option>
                    <option value={3}>3 Persons</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-800 flex items-center justify-center">
                    <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Field: Confirmation Presence Status */}
              <div>
                <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                  Confirmation of Presence
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpStatus("attending");
                      setWillBeThere("yes");
                    }}
                    className={`py-2 px-4 rounded-full font-gaegu font-bold text-sm border-2 border-neutral-900 transition-all ${
                      rsvpStatus === "attending" ? "bg-neutral-900 text-white shadow-sm" : "bg-white text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    ✓ Hadir (Yes!)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpStatus("not_attending");
                      setWillBeThere("no");
                    }}
                    className={`py-2 px-4 rounded-full font-gaegu font-bold text-sm border-2 border-neutral-900 transition-all ${
                      rsvpStatus === "not_attending" ? "bg-neutral-900 text-white shadow-sm" : "bg-white text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    ✕ Tidak Hadir
                  </button>
                </div>
              </div>

              {/* Confirm Presence Button */}
              <div className="pt-3 flex justify-center">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={rsvpSubmitting}
                  className="relative group select-none"
                >
                  <img 
                    src={ASSETS.btnConfirmPresence} 
                    alt="Confirm Presence" 
                    className="w-44 h-auto object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all" 
                  />
                </motion.button>
              </div>

              {rsvpSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs font-gaegu font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200 mt-2"
                >
                  Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.
                </motion.div>
              )}
            </form>
          )}
        </motion.section>

        {/* 8. BLESSINGS & WISHES SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 pt-4"
        >
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4">
            Give your blessing for us
          </p>

          <div className="flex justify-center">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={ASSETS.titleBlessings} 
              alt="Blessings & Wishes" 
              className="w-44 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <form onSubmit={handleWishSubmit} className="space-y-4 pt-2 text-left max-w-sm mx-auto">
            {/* Sender Name */}
            <div>
              <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                Name
              </label>
              <input
                type="text"
                required
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                placeholder="Your Name"
                className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white transition-all"
              />
            </div>

            {/* Message / Prayer */}
            <div>
              <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                Prayers &amp; Wishes
              </label>
              <textarea
                required
                rows={3}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Write your warmest wishes for the bride & groom..."
                className="w-full border-2 border-neutral-900 rounded-2xl px-5 py-3 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white resize-none transition-all"
              />
            </div>

            {/* Submit Blessing Button */}
            <div className="pt-2 flex justify-center">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={wishSubmitting}
                className="relative group select-none"
              >
                <img 
                  src={ASSETS.btnSubmitBlessing} 
                  alt="Submit Blessing" 
                  className="w-44 h-auto object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all" 
                />
              </motion.button>
            </div>

            {wishSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs font-gaegu font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200 mt-2"
              >
                Terima kasih atas doa dan ucapan hangatnya!
              </motion.div>
            )}
          </form>

          {/* Live Wishes Wall Cards */}
          <div className="pt-6 space-y-3 max-w-sm mx-auto text-left">
            <div className="flex items-center justify-between px-2">
              <span className="font-gaegu text-xs font-bold text-neutral-500 uppercase tracking-widest">
                Wishes Wall ({wishesList.length})
              </span>
              <span className="text-red-500 font-bold text-xs">♥ with love</span>
            </div>

            <div className="space-y-3.5 max-h-[520px] sm:max-h-[580px] overflow-y-auto p-1.5 pb-6 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
              {wishesList.map((w, idx) => (
                <motion.div
                  key={w.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white border-2 border-neutral-900 rounded-2xl p-4 shadow-sm relative transition-all ${
                    idx % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.5deg]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-gaegu font-bold text-sm text-neutral-900">
                      {w.name}
                    </h5>
                  </div>
                  <p className="font-gaegu font-light text-xs text-neutral-700 leading-relaxed">
                    {w.message}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 9. FOOTER */}
        <motion.footer 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2, margin: "-20px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 pt-10 pb-6 border-t border-neutral-200/60">
          <p className="font-gaegu font-bold text-2xl text-neutral-900">
            {brideNickname} &amp; {groomNickname}
          </p>
          <p className="font-gaegu text-xs text-neutral-500 tracking-wider">
            Thank you for being part of our special love story.
          </p>
          <div className="pt-2">
            <a 
              href="https://www.serastory.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-gaegu font-bold text-neutral-400 hover:text-neutral-700 transition-colors uppercase tracking-widest"
            >
              <span>Crafted with ♥ by SERA STORY</span>
            </a>
          </div>
        </motion.footer>

      </div>
    </div>
  );
}
