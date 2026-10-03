"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { DbGuest, DbProject, DbEvent, DbWish, isDefaultStorageUrl } from "../../lib/resolveProject";

export const ASSETS = {
  strip: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-01.png",
  couple: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-02.png",
  calendarIcon: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-03.png",
  clockIcon: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-04.png",
  pinIcon: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-05.png",
  tagLeft: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-06.png",
  tagRight: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-07.png",
  openMapBtn: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-08.png",
  titleDatePlace: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-09.png",
  titleOurStory: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-10.png",
  titleDressCode: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-11.png",
  titleAttendance: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-12.png",
  titleBlessings: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-13.png",
  titleWeddingGift: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-14.png",
  titleRsvp: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-15.png",
  timelineHeart: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-16.png",
  timelineFlowers: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-17.png",
  timelineRings: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-18.png",
  dressCodeAttire: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-19.png",
  timelineLine: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-20.png",
  inputBorder: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-21.png",
  btnConfirmPresence: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-22.png",
  btnSubmitBlessing: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-23.png",
  cardContainer: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-24.png",
  rsvpArch: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-25.png?v=3",
  topRings: "https://cdn.serastory.com/undangan/templates/illustrated-love-story-01/01-26.png",
};

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
}

export default function RightSidebar({ guestName, guest, project, events, wishes: initialWishes, stats }: Props) {
  // Couple Info
  const brideNickname = project?.bride_nickname || "Natalie";
  const groomNickname = project?.groom_nickname || "Marvel";
  const brideFull = project?.bride_name || "Natalie C";
  const groomFull = project?.groom_name || "Marvel A";

  // Event Info
  const mainEvent = events && events.length > 0 ? events[0] : null;
  const weddingDateRaw = mainEvent?.event_date || project?.wedding_date; // YYYY-MM-DD
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
  const formattedTime = mainEvent?.event_time ? `${mainEvent.event_time.slice(0, 5)} WIB` : "15:00 WIB";
  const venueName = mainEvent?.venue_name || "Villa Dago";
  const venueAddress = mainEvent?.venue_address || "Jl. Dago Pakar Permai No. 1, Bandung";
  const mapsUrl = mainEvent?.venue_maps_url || "https://maps.google.com";

  // Story Milestones
  const dbStories = (project as any)?.wedding_stories || (project as any)?.love_story_items;
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
  const brideBank = (project as any)?.bride_bank || {
    bank_name: "BANK BCA:",
    account_number: "777555231",
    owner_name: brideFull,
    nickname: brideNickname,
  };
  const groomBank = (project as any)?.groom_bank || {
    bank_name: "BANK BCA:",
    account_number: "777555005",
    owner_name: groomFull,
    nickname: groomNickname,
  };

  // State Management
  const [willBeThere, setWillBeThere] = useState<"yes" | "no" | null>("yes");
  const [rsvpName, setRsvpName] = useState(guestName !== "Guest Name" ? guestName : "");
  const [rsvpEmail, setRsvpEmail] = useState(guest?.email || "");
  const [rsvpStatus, setRsvpStatus] = useState<string>("attending");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [rsvpNotes, setRsvpNotes] = useState<string>("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

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
      message: "Selamat menempuh hidup baru Marvel & Natalie! Bahagia selalu hingga kakek nenek.",
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

  useEffect(() => {
    const handleFirstClick = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      window.removeEventListener("click", handleFirstClick);
    };
    window.addEventListener("click", handleFirstClick);
    return () => window.removeEventListener("click", handleFirstClick);
  }, [isPlaying]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // RSVP Form Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpSubmitting(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project?.id || "",
          guest_id: guest?.id,
          name: rsvpName,
          email: rsvpEmail,
          
          guests_count: guestCount,
          notes: rsvpNotes,
        }),
      });

      if (res.ok) {
        setRsvpSuccess(true);
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
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project?.id || "",
          guest_id: guest?.id,
          name: wishName,
          message: wishMessage,
          
        }),
      });

      if (res.ok) {
        const newWish: DbWish = {
          id: Date.now().toString(),
          project_id: project?.id || "",
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
    <div className="relative w-full md:w-[42%] lg:w-[38%] min-h-[100dvh] md:h-[100dvh] md:overflow-y-auto md:overflow-x-hidden bg-[#faf9f6] text-neutral-900 selection:bg-red-500 selection:text-white border-l border-neutral-200 shadow-2xl flex-shrink-0">
      {/* Audio Element */}
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

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
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-neutral-300 flex items-center justify-center text-neutral-900 transition-all hover:bg-neutral-900 hover:text-white group"
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        <motion.span
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="text-xl inline-block"
        >
          🎵
        </motion.span>
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
        {copiedText && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-5 py-2.5 rounded-full font-gaegu text-sm font-bold shadow-xl border border-neutral-700 flex items-center gap-2"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{copiedText} berhasil disalin!</span>
          </motion.div>
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
            className="font-melody text-4xl sm:text-5xl text-neutral-900 leading-tight tracking-wide drop-shadow-sm"
          >
            {brideNickname} <br />
            <span className="text-red-600 font-melody text-3xl sm:text-4xl inline-block animate-pulse">&amp;</span> <br />
            {groomNickname}
          </motion.h1>

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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
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
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="flex items-center justify-between gap-4"
                  >
                    {/* Left Side */}
                    <div className="w-1/2 text-right pr-2">
                      {!isEven ? (
                        <motion.span 
                          whileHover={{ scale: 1.08 }}
                          className="font-melody text-3xl sm:text-4xl text-red-600 block leading-tight cursor-default"
                        >
                          {item.year || "2019"}
                        </motion.span>
                      ) : (
                        <div className="bg-white/80 p-3 rounded-2xl border border-neutral-200 shadow-sm text-right">
                          <h4 className="font-gaegu font-bold text-base text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                          <p className="font-gaegu text-xs text-neutral-600 leading-relaxed mt-0.5">
                            {item.story}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center Icon: NO CIRCLE BORDER, ENLARGED (User request: gausah dibuletin lagi sama digedein lagi) */}
                    <motion.div 
                      whileInView={{ scale: [0.8, 1.15, 1], opacity: 1 }}
                      viewport={{ once: true }}
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
                          className="font-melody text-3xl sm:text-4xl text-red-600 block leading-tight cursor-default"
                        >
                          {item.year || "2020"}
                        </motion.span>
                      ) : (
                        <div className="bg-white/80 p-3 rounded-2xl border border-neutral-200 shadow-sm text-left">
                          <h4 className="font-gaegu font-bold text-base text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                          <p className="font-gaegu text-xs text-neutral-600 leading-relaxed mt-0.5">
                            {item.story}
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
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
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

          <div className="pt-3">
            <p className="text-xs font-gaegu font-bold tracking-[0.2em] text-neutral-600 uppercase mb-3">
              COLOR PALETTE
            </p>
            <div className="flex items-center justify-center gap-3">
              {[
                { name: "Cream White", bg: "bg-[#FAF7F2]", border: "border-neutral-300" },
                { name: "Warm Sand", bg: "bg-[#E6D7C3]", border: "border-neutral-300" },
                { name: "Soft Terracotta", bg: "bg-[#C98A7D]", border: "border-neutral-400" },
                { name: "Sage Green", bg: "bg-[#9EA992]", border: "border-neutral-400" },
                { name: "Midnight Black", bg: "bg-[#2A2B2A]", border: "border-neutral-900" },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.25, y: -4 }}
                  className={`w-9 h-9 rounded-full ${c.bg} ${c.border} border-2 shadow-sm cursor-pointer`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WEDDING GIFT SECTION */}
        <section className="text-center space-y-4 pt-4">
          <div className="flex justify-center mb-2">
            <h3 className="font-melody text-5xl sm:text-6xl text-neutral-900 leading-tight">
              Wedding <br /> Gift
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            {/* Bride Tag Card */}
            <div className="relative flex flex-col items-center bg-white border-2 border-neutral-900 rounded-3xl p-4 sm:p-5 shadow-sm">
              {/* Heart Loop Top */}
              <div className="w-7 h-7 border-2 border-neutral-900 rounded-full flex items-center justify-center -mt-7 bg-white mb-2 shadow-xs">
                <span className="text-xs text-red-500">♥</span>
              </div>

              {/* Red Badge Name */}
              <div className="border border-red-500 rounded-full px-4 py-0.5 mb-2 bg-transparent">
                <span className="font-melody text-xl sm:text-2xl text-red-500 block leading-tight">
                  {brideBank.nickname || brideNickname}
                </span>
              </div>

              <span className="font-melody text-sm sm:text-base italic text-neutral-800 tracking-wider">
                {brideBank.bank_name || "BANK BCA:"}
              </span>
              <span className="font-serif font-bold text-lg sm:text-xl text-neutral-900 tracking-wider my-0.5">
                {brideBank.account_number || "777555231"}
              </span>
              <span className="font-melody text-xs sm:text-sm text-neutral-700">
                {brideBank.owner_name || brideFull}
              </span>

              <button
                type="button"
                onClick={() => copyToClipboard(brideBank.account_number || "777555231", "Nomor rekening")}
                className="mt-3 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full flex flex-col items-center justify-center transition-colors shadow-sm"
              >
                <span className="font-melody text-xs sm:text-sm tracking-widest uppercase leading-none">SALIN</span>
                <span className="font-melody text-xs sm:text-sm tracking-widest uppercase leading-none mt-0.5">REKENING</span>
              </button>
            </div>

            {/* Groom Tag Card */}
            <div className="relative flex flex-col items-center bg-white border-2 border-neutral-900 rounded-3xl p-4 sm:p-5 shadow-sm">
              {/* Heart Loop Top */}
              <div className="w-7 h-7 border-2 border-neutral-900 rounded-full flex items-center justify-center -mt-7 bg-white mb-2 shadow-xs">
                <span className="text-xs text-red-500">♥</span>
              </div>

              {/* Red Badge Name */}
              <div className="border border-red-500 rounded-full px-4 py-0.5 mb-2 bg-transparent">
                <span className="font-melody text-xl sm:text-2xl text-red-500 block leading-tight">
                  {groomBank.nickname || groomNickname}
                </span>
              </div>

              <span className="font-melody text-sm sm:text-base italic text-neutral-800 tracking-wider">
                {groomBank.bank_name || "BANK BCA:"}
              </span>
              <span className="font-serif font-bold text-lg sm:text-xl text-neutral-900 tracking-wider my-0.5">
                {groomBank.account_number || "777555005"}
              </span>
              <span className="font-melody text-xs sm:text-sm text-neutral-700">
                {groomBank.owner_name || groomFull}
              </span>

              <button
                type="button"
                onClick={() => copyToClipboard(groomBank.account_number || "777555005", "Nomor rekening")}
                className="mt-3 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full flex flex-col items-center justify-center transition-colors shadow-sm"
              >
                <span className="font-melody text-xs sm:text-sm tracking-widest uppercase leading-none">SALIN</span>
                <span className="font-melody text-xs sm:text-sm tracking-widest uppercase leading-none mt-0.5">REKENING</span>
              </button>
            </div>
          </div>

          {/* Red Note Box */}
          <div className="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50/50 text-center font-melody text-red-600 space-y-1">
            <p className="text-base sm:text-lg font-bold italic">#Note:</p>
            <p className="text-xs sm:text-sm leading-snug italic">- Pastikan Nama Bank dan Pemilik Rekening sudah sesuai dengan nama pasangan</p>
            <p className="text-xs sm:text-sm leading-snug italic">- Konfirmasi pengiriman kado/tanda kasih melalui pesan pribadi kepada mempelai</p>
          </div>
        </section>

        {/* 6. RSVP SECTION (ARCH ILLUSTRATION 01-25.png) */}
        <section className="text-center space-y-4 pt-4">
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
                  setWillBeThere("yes");
                  setRsvpStatus("attending");
                }}
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
                  setWillBeThere("no");
                  setRsvpStatus("not_attending");
                }}
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
        </section>

        {/* 7. ATTENDANCE FORM SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
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

          <form onSubmit={handleRsvpSubmit} className="space-y-4 pt-2 text-left max-w-sm mx-auto">
            {/* Field: Guest Identity */}
            <div>
              <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                Guest Identity
              </label>
              <input
                type="text"
                required
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Guest Name"
                className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white transition-all"
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
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white transition-all cursor-pointer"
              >
                <option value={1}>1 Person</option>
                <option value={2}>2 Persons</option>
                <option value={3}>3 Persons</option>
              </select>
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
        </motion.section>

        {/* 8. BLESSINGS & WISHES SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
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

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
              {wishesList.map((w, idx) => (
                <motion.div
                  key={w.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white border-2 border-neutral-900 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all ${
                    idx % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.5deg]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-gaegu font-bold text-sm text-neutral-900">
                      {w.name}
                    </h5>
                    <span className="text-[10px] font-gaegu font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {"Hadir"}
                    </span>
                  </div>
                  <p className="font-gaegu text-xs text-neutral-700 leading-relaxed">
                    {w.message}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 9. FOOTER */}
        <footer className="text-center space-y-3 pt-10 pb-6 border-t border-neutral-200/60">
          <p className="font-melody text-2xl text-neutral-900">
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
        </footer>

      </div>
    </div>
  );
}
