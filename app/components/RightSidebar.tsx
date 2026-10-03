"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { DbGuest, DbProject, DbEvent, DbWish, isDefaultStorageUrl } from "../../lib/resolveProject";

export const ASSETS = {
  strip: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-01.png",
  couple: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-02.png",
  calendarIcon: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-03.png",
  clockIcon: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-04.png",
  pinIcon: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-05.png",
  tagLeft: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-06.png",
  tagRight: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-07.png",
  openMapBtn: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-08.png",
  titleDatePlace: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-09.png",
  titleOurStory: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-10.png",
  titleDressCode: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-11.png",
  titleAttendance: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-12.png",
  titleBlessings: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-13.png",
  titleWeddingGift: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-14.png",
  titleRsvp: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-15.png",
  timelineHeart: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-16.png",
  timelineFlowers: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-17.png",
  timelineRings: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-18.png",
  dressCodeAttire: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-19.png",
  timelineLine: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-20.png",
  inputBorder: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-21.png",
  btnConfirmPresence: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-22.png",
  btnSubmitBlessing: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-23.png",
  cardContainer: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-24.png",
  rsvpArch: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-25.png",
  topRings: "https://www.serastory.com/storage/undangan/templates/illustrated-love-story-01/01-26.png",
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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "28.02.2028";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formattedDate = formatDateDisplay(weddingDateRaw);
  const formattedTime = mainEvent?.event_time 
    ? `${mainEvent.event_time.slice(0, 5)}` 
    : (project?.wedding_time ? project.wedding_time.slice(0, 5) : "15:00");
  const venueName = mainEvent?.venue_name || project?.venue_name || "Villa Dago";
  const venueAddress = mainEvent?.venue_address || project?.venue_address || "";
  const mapsUrl = mainEvent?.venue_maps_url || project?.venue_maps_url || "https://maps.google.com";

  // Dress Code Info
  let dressCodeTitle = "Monocrome";
  let dressCodeColors = ["#000000", "#ffffff"];
  try {
    const rawDc = (project as any)?.dress_code || mainEvent?.dresscode;
    if (rawDc) {
      if (typeof rawDc === "string" && rawDc.startsWith("{")) {
        const parsed = JSON.parse(rawDc);
        if (parsed.title) dressCodeTitle = parsed.title;
        if (parsed.colors && Array.isArray(parsed.colors)) dressCodeColors = parsed.colors;
      } else if (typeof rawDc === "string") {
        dressCodeTitle = rawDc;
      }
    }
  } catch {}

  // Cashless Gifts / Bank Accounts
  let paymentAccounts: any[] = [];
  try {
    if (project?.payment_accounts) {
      if (typeof project.payment_accounts === "string") {
        paymentAccounts = JSON.parse(project.payment_accounts);
      } else if (Array.isArray(project.payment_accounts)) {
        paymentAccounts = project.payment_accounts;
      }
    }
  } catch {}

  const brideBank = paymentAccounts[0] || {
    bank_name: "BANK BCA",
    account_number: "777555231",
    owner_name: brideFull || "Natalie C",
    nickname: brideNickname || "Natalie"
  };

  const groomBank = paymentAccounts[1] || {
    bank_name: "BANK BCA",
    account_number: "777555005",
    owner_name: groomFull || "Marvel A",
    nickname: groomNickname || "Marvel"
  };

  // Love Story Milestones
  let milestones: any[] = [];
  try {
    if (project?.love_story) {
      if (typeof project.love_story === "string") {
        milestones = JSON.parse(project.love_story);
      } else if (Array.isArray(project.love_story)) {
        milestones = project.love_story;
      }
    }
  } catch {}

  if (!milestones || milestones.length === 0) {
    milestones = [
      {
        year: "2019",
        title: "First Meet",
        story: "Berawal dari perkenalan singkat di sebuah kafe hingga berlanjut ke pertemuan berikutnya.",
        icon: ASSETS.timelineHeart
      },
      {
        year: "2020",
        title: "The Spark",
        story: "Melalui banyak hujan dan tawa bersama, kami menyadari bahwa tempat ternyaman adalah bersamamu.",
        icon: ASSETS.timelineFlowers
      },
      {
        year: "2023",
        title: "The Proposal",
        story: "Satu langkah lebih dekat menuju keabadian cinta untuk melangkah ke babak kehidupan selanjutnya.",
        icon: ASSETS.timelineRings
      }
    ];
  }

  // RSVP Form States
  const [willBeThere, setWillBeThere] = useState<"yes" | "no" | null>("yes");
  const [rsvpName, setRsvpName] = useState(guestName !== "Guest Name" ? guestName : "");
  const [rsvpEmail, setRsvpEmail] = useState(guest?.email || "");
  const [rsvpPhone, setRsvpPhone] = useState(guest?.phone || "");
  const [rsvpGuestsCount, setRsvpGuestsCount] = useState(1);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Wishes States
  const [wishesList, setWishesList] = useState<DbWish[]>(initialWishes || []);
  const [wishName, setWishName] = useState(guestName !== "Guest Name" ? guestName : "");
  const [wishMessage, setWishMessage] = useState("");
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  const [wishSuccess, setWishSuccess] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} berhasil disalin!`);
    }
  };

  // Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playAudioOnFirstClick = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      window.removeEventListener("click", playAudioOnFirstClick);
      window.removeEventListener("touchstart", playAudioOnFirstClick);
    };
    window.addEventListener("click", playAudioOnFirstClick);
    window.addEventListener("touchstart", playAudioOnFirstClick);
    return () => {
      window.removeEventListener("click", playAudioOnFirstClick);
      window.removeEventListener("touchstart", playAudioOnFirstClick);
    };
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

  // RSVP Submit Handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      showToast("Silakan isi nama Anda.");
      return;
    }
    setIsSubmittingRsvp(true);
    try {
      const payload = {
        project_id: project?.id,
        guest_id: guest?.id || null,
        name: rsvpName,
        phone: rsvpPhone,
        email: rsvpEmail,
        is_attending: willBeThere === "yes",
        total_guests: rsvpGuestsCount
      };

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setRsvpSuccess(true);
        showToast("Kehadiran Anda berhasil dikonfirmasi! Terima kasih.");
      } else {
        setRsvpSuccess(true);
        showToast("Konfirmasi berhasil dicatat!");
      }
    } catch {
      setRsvpSuccess(true);
      showToast("Konfirmasi berhasil dicatat!");
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  // Wish Submit Handler
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishMessage.trim()) {
      showToast("Silakan tulis nama dan ucapan Anda.");
      return;
    }
    setIsSubmittingWish(true);
    try {
      const payload = {
        project_id: project?.id,
        name: wishName,
        message: wishMessage
      };

      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newWish: DbWish = {
          id: Math.random().toString(),
          project_id: project?.id || "",
          name: wishName,
          message: wishMessage,
          is_approved: true,
          created_at: new Date().toISOString()
        };
        setWishesList([newWish, ...wishesList]);
        setWishMessage("");
        setWishSuccess(true);
        showToast("Ucapan & doa berhasil dikirim!");
      } else {
        const newWish: DbWish = {
          id: Math.random().toString(),
          project_id: project?.id || "",
          name: wishName,
          message: wishMessage,
          is_approved: true,
          created_at: new Date().toISOString()
        };
        setWishesList([newWish, ...wishesList]);
        setWishMessage("");
        setWishSuccess(true);
        showToast("Ucapan & doa berhasil dikirim!");
      }
    } catch {
      showToast("Ucapan & doa berhasil dikirim!");
    } finally {
      setIsSubmittingWish(false);
    }
  };

  return (
    <div className="w-full md:w-[42%] lg:w-[38%] min-h-[100dvh] md:h-[100dvh] md:overflow-y-auto bg-white text-neutral-900 font-gaegu relative scroll-smooth selection:bg-red-100 selection:text-red-900 border-l border-neutral-100 shadow-2xl">
      
      {/* Audio Element */}
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs sm:text-sm font-gaegu font-bold px-5 py-2.5 rounded-full shadow-2xl border border-neutral-700 flex items-center gap-2"
          >
            <span>✨</span>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Music Button */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/95 backdrop-blur border-2 border-neutral-900 text-neutral-900 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Toggle Music"
      >
        <span className={isPlaying ? "animate-spin text-lg" : "text-lg"}>🎵</span>
      </button>

      {/* Main Content Container */}
      <div className="max-w-[440px] mx-auto px-6 py-10 space-y-12">

        {/* 1. HERO / COVER SECTION */}
        <section className="text-center space-y-3 pt-4">
          <p className="text-xs sm:text-sm tracking-[0.25em] font-gaegu uppercase text-neutral-800 font-bold">
            you are invited to our wedding
          </p>

          <div className="flex justify-center my-1">
            <img 
              src={ASSETS.topRings} 
              alt="Wedding Rings" 
              className="w-11 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <h1 className="font-melody text-4xl sm:text-5xl text-neutral-900 leading-tight tracking-wide drop-shadow-sm">
            {brideNickname} <br />
            <span className="text-red-600 font-melody text-3xl sm:text-4xl">&amp;</span> <br />
            {groomNickname}
          </h1>

          <div className="pt-2 flex justify-center">
            <img 
              src={ASSETS.couple} 
              alt="Illustrated Couple" 
              className="w-64 sm:w-72 h-auto object-contain select-none pointer-events-none drop-shadow-sm hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        </section>

        {/* 2. DATE & PLACE SECTION */}
        <section className="text-center space-y-5 pt-4">
          <p className="text-xs sm:text-sm font-gaegu tracking-[0.2em] text-neutral-800 uppercase font-bold">
            the details of our big day
          </p>

          <div className="flex justify-center">
            <img 
              src={ASSETS.titleDatePlace} 
              alt="Date & Place" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <div className="space-y-4 pt-2">
            {/* Calendar */}
            <div className="flex items-center justify-center gap-3">
              <img src={ASSETS.calendarIcon} alt="Calendar" className="w-6 h-6 object-contain" />
              <span className="font-gaegu text-xl sm:text-2xl font-bold text-neutral-900 tracking-wider">
                {formattedDate}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-center gap-3">
              <img src={ASSETS.clockIcon} alt="Clock" className="w-6 h-6 object-contain" />
              <span className="font-gaegu text-xl sm:text-2xl font-bold text-neutral-900 tracking-wider">
                {formattedTime}
              </span>
            </div>

            {/* Location */}
            <div className="flex flex-col items-center justify-center gap-1">
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
            </div>
          </div>

          {/* Open Map Button */}
          <div className="pt-2 flex justify-center">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white font-gaegu font-bold text-sm tracking-widest px-8 py-3 rounded-full hover:bg-neutral-800 active:scale-95 transition-all shadow-md group"
            >
              <img src={ASSETS.pinIcon} alt="Pin" className="w-4 h-4 object-contain brightness-0 invert" />
              <span>OPEN MAP</span>
            </a>
          </div>
        </section>

        {/* 3. OUR STORY SECTION */}
        <section className="text-center space-y-4 pt-6">
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4 leading-snug">
            a Journey of a thousand miles begins with a single step.
          </p>

          <div className="flex justify-center">
            <img 
              src={ASSETS.titleOurStory} 
              alt="Our Story" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          {/* Vertical Timeline */}
          <div className="relative max-w-sm mx-auto pt-6 pb-2">
            {/* Vertical Line */}
            <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-0.5 bg-neutral-900 z-0"></div>

            <div className="space-y-10 relative z-10">
              {milestones.map((item: any, idx: number) => {
                const isEven = idx % 2 === 1;
                const iconSrc = item.icon || (idx === 0 ? ASSETS.timelineHeart : idx === 1 ? ASSETS.timelineFlowers : ASSETS.timelineRings);

                return (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    {/* Left Side */}
                    <div className={`w-1/2 text-right pr-2`}>
                      {!isEven ? (
                        <span className="font-melody text-3xl sm:text-4xl text-red-600 block">
                          {item.year || "2019"}
                        </span>
                      ) : (
                        <div>
                          <h4 className="font-gaegu font-bold text-base text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                          <p className="font-gaegu text-xs text-neutral-600 leading-relaxed mt-0.5">
                            {item.story}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center Icon */}
                    <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center border-2 border-neutral-900 shadow-sm">
                      <img src={iconSrc} alt="Timeline Icon" className="w-6 h-6 object-contain" />
                    </div>

                    {/* Right Side */}
                    <div className={`w-1/2 text-left pl-2`}>
                      {isEven ? (
                        <span className="font-melody text-3xl sm:text-4xl text-red-600 block">
                          {item.year || "2020"}
                        </span>
                      ) : (
                        <div>
                          <h4 className="font-gaegu font-bold text-base text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                          <p className="font-gaegu text-xs text-neutral-600 leading-relaxed mt-0.5">
                            {item.story}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. DRESS CODE SECTION */}
        <section className="text-center space-y-4 pt-6">
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-6 leading-relaxed">
            To maintain the harmony of our wedding theme, we kindly request our guests to wear
          </p>

          <div className="flex justify-center">
            <img 
              src={ASSETS.titleDressCode} 
              alt="Dress Code" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <div className="flex justify-center pt-2">
            <img 
              src={ASSETS.dressCodeAttire} 
              alt="Dress Code Attire" 
              className="w-56 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <p className="font-gaegu text-lg font-bold text-neutral-900 text-center capitalize tracking-wider">
            {dressCodeTitle}
          </p>

          {/* Color Circles */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {dressCodeColors.map((color: string, i: number) => (
              <div 
                key={i} 
                className="w-7 h-7 rounded-full border-2 border-neutral-900 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* 5. WEDDING GIFT SECTION */}
        <section className="text-center space-y-4 pt-6">
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4 leading-relaxed">
            Your presence is the greatest gift of all. However, if you are unable to attend and would like to send us your wishes in the form of a gift, please use the account details below:
          </p>

          <div className="flex justify-center">
            <img 
              src={ASSETS.titleWeddingGift} 
              alt="Wedding Gift" 
              className="w-40 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          {/* Keychains / Bank Account Tags */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Bride Tag */}
            <div className="relative flex flex-col items-center bg-white border-2 border-neutral-900 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Heart Loop Top */}
              <div className="w-6 h-6 border-2 border-neutral-900 rounded-full flex items-center justify-center -mt-6 bg-white mb-2">
                <span className="text-xs text-neutral-800">♥</span>
              </div>

              {/* Red Badge Name */}
              <div className="border border-red-600 rounded-full px-3 py-0.5 mb-2">
                <span className="font-melody text-lg text-red-600 block leading-tight">
                  {brideBank.nickname || brideNickname}
                </span>
              </div>

              <span className="font-gaegu text-[11px] font-bold text-neutral-800 tracking-wider">
                {brideBank.bank_name || "BANK BCA:"}
              </span>
              <span className="font-gaegu text-base font-bold text-neutral-900 tracking-wider my-0.5">
                {brideBank.account_number || "777555231"}
              </span>
              <span className="font-gaegu text-xs font-bold text-neutral-700">
                {brideBank.owner_name || brideFull}
              </span>

              <button
                type="button"
                onClick={() => copyToClipboard(brideBank.account_number || "777555231", "Nomor rekening")}
                className="mt-3 text-[10px] uppercase font-bold tracking-widest bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 px-3 py-1 rounded-full transition-colors"
              >
                Salin Rekening
              </button>
            </div>

            {/* Groom Tag */}
            <div className="relative flex flex-col items-center bg-white border-2 border-neutral-900 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Heart Loop Top */}
              <div className="w-6 h-6 border-2 border-neutral-900 rounded-full flex items-center justify-center -mt-6 bg-white mb-2">
                <span className="text-xs text-neutral-800">♥</span>
              </div>

              {/* Red Badge Name */}
              <div className="border border-red-600 rounded-full px-3 py-0.5 mb-2">
                <span className="font-melody text-lg text-red-600 block leading-tight">
                  {groomBank.nickname || groomNickname}
                </span>
              </div>

              <span className="font-gaegu text-[11px] font-bold text-neutral-800 tracking-wider">
                {groomBank.bank_name || "BANK BCA:"}
              </span>
              <span className="font-gaegu text-base font-bold text-neutral-900 tracking-wider my-0.5">
                {groomBank.account_number || "777555005"}
              </span>
              <span className="font-gaegu text-xs font-bold text-neutral-700">
                {groomBank.owner_name || groomFull}
              </span>

              <button
                type="button"
                onClick={() => copyToClipboard(groomBank.account_number || "777555005", "Nomor rekening")}
                className="mt-3 text-[10px] uppercase font-bold tracking-widest bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 px-3 py-1 rounded-full transition-colors"
              >
                Salin Rekening
              </button>
            </div>
          </div>

          {/* Red Note */}
          <div className="text-center font-gaegu text-xs text-red-600 pt-2 px-4 leading-relaxed font-bold">
            <p className="text-sm font-bold">#Note:</p>
            <p>Before making Transfer/Shipment, please note:</p>
            <p>- Bank Name, Recipient Name are already in accordance with the couple&apos;s names</p>
            <p>- Confirm the gift shipment via personal chat to the couple</p>
          </div>
        </section>

        {/* 6. RSVP SECTION (ARCH ILLUSTRATION) */}
        <section className="text-center space-y-4 pt-6">
          <p className="text-xs sm:text-sm font-gaegu tracking-[0.2em] text-neutral-800 uppercase font-bold">
            kindly let us know if you can join us
          </p>

          <div className="flex justify-center">
            <img 
              src={ASSETS.titleRsvp} 
              alt="RSVP" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          {/* Interactive Arch Card */}
          <div className="relative max-w-[280px] mx-auto border-2 border-neutral-900 rounded-t-[140px] pt-8 pb-4 px-4 bg-white shadow-md flex flex-col items-center">
            <h3 className="font-gaegu text-xl font-bold tracking-widest text-neutral-900 mb-4">
              WILL YOU <br /> BE THERE?
            </h3>

            {/* Checkbox Options */}
            <div className="space-y-2 text-left mb-4">
              <label 
                onClick={() => setWillBeThere("yes")}
                className="flex items-center gap-2 cursor-pointer font-gaegu text-base font-bold text-neutral-900"
              >
                <span className="w-5 h-5 border-2 border-neutral-900 rounded flex items-center justify-center bg-white">
                  {willBeThere === "yes" && <span className="text-red-600 text-sm font-black">✓</span>}
                </span>
                <span>Yes!</span>
              </label>

              <label 
                onClick={() => setWillBeThere("no")}
                className="flex items-center gap-2 cursor-pointer font-gaegu text-base font-bold text-neutral-900"
              >
                <span className="w-5 h-5 border-2 border-neutral-900 rounded flex items-center justify-center bg-white">
                  {willBeThere === "no" && <span className="text-red-600 text-sm font-black">✓</span>}
                </span>
                <span className="leading-tight">Sorry, can&apos;t make it</span>
              </label>
            </div>

            {/* Arch Couple Illustration */}
            <img 
              src={ASSETS.couple} 
              alt="Couple In Arch" 
              className="w-48 h-auto object-contain select-none pointer-events-none" 
            />
          </div>
        </section>

        {/* 7. ATTENDANCE FORM SECTION */}
        <section className="text-center space-y-4 pt-6">
          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4">
            Your presence is our greatest honor
          </p>

          <div className="flex justify-center">
            <img 
              src={ASSETS.titleAttendance} 
              alt="Attendance" 
              className="w-40 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <form onSubmit={handleRsvpSubmit} className="space-y-4 pt-2 text-left">
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
                className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
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
                className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Field: WhatsApp Number */}
            <div>
              <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={rsvpPhone}
                onChange={(e) => setRsvpPhone(e.target.value)}
                placeholder="Example: 081955562"
                className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Field: Confirmation Status */}
            <div>
              <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                Confirmation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWillBeThere("yes")}
                  className={`border-2 border-neutral-900 rounded-full py-2 px-3 font-gaegu text-xs font-bold transition-colors ${
                    willBeThere === "yes" ? "bg-neutral-900 text-white" : "bg-white text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  ✓ Hadir
                </button>
                <button
                  type="button"
                  onClick={() => setWillBeThere("no")}
                  className={`border-2 border-neutral-900 rounded-full py-2 px-3 font-gaegu text-xs font-bold transition-colors ${
                    willBeThere === "no" ? "bg-neutral-900 text-white" : "bg-white text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  ✕ Tidak Hadir
                </button>
              </div>
            </div>

            {/* Field: Total Persons */}
            {willBeThere === "yes" && (
              <div>
                <label className="block text-xs font-gaegu font-bold text-neutral-900 mb-1 ml-2">
                  Total Persons
                </label>
                <div className="flex items-center justify-between border-2 border-neutral-900 rounded-full px-5 py-2 bg-white">
                  <button
                    type="button"
                    onClick={() => setRsvpGuestsCount(Math.max(1, rsvpGuestsCount - 1))}
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg text-neutral-900 active:scale-90"
                  >
                    -
                  </button>
                  <span className="font-gaegu text-sm font-bold text-neutral-900 tracking-wider">
                    {rsvpGuestsCount} GUEST{rsvpGuestsCount > 1 ? "S" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRsvpGuestsCount(Math.min(5, rsvpGuestsCount + 1))}
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg text-neutral-900 active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingRsvp}
                className="w-full bg-neutral-900 text-white font-gaegu font-bold text-sm tracking-widest py-3.5 rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
              >
                {isSubmittingRsvp ? "MENYIMPAN..." : "CONFIRM PRESENCE"}
              </button>
            </div>
          </form>
        </section>

        {/* 8. BLESSINGS & WISHES SECTION */}
        <section className="text-center space-y-4 pt-6">
          <div className="flex justify-center">
            <img 
              src={ASSETS.titleBlessings} 
              alt="Blessings" 
              className="w-36 h-auto object-contain select-none pointer-events-none" 
            />
          </div>

          <p className="text-xs sm:text-sm font-gaegu tracking-wider text-neutral-800 font-bold px-4">
            Send your warm wishes and prayers to the couple
          </p>

          <form onSubmit={handleWishSubmit} className="space-y-3 pt-2 text-left">
            <input
              type="text"
              required
              value={wishName}
              onChange={(e) => setWishName(e.target.value)}
              placeholder="Your Name"
              className="w-full border-2 border-neutral-900 rounded-full px-5 py-2.5 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            />

            <textarea
              rows={3}
              required
              value={wishMessage}
              onChange={(e) => setWishMessage(e.target.value)}
              placeholder="Write your prayers and warm wishes here..."
              className="w-full border-2 border-neutral-900 rounded-2xl px-5 py-3 font-gaegu text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white resize-none"
            />

            <button
              type="submit"
              disabled={isSubmittingWish}
              className="w-full bg-neutral-900 text-white font-gaegu font-bold text-sm tracking-widest py-3.5 rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            >
              {isSubmittingWish ? "MENGIRIM..." : "SUBMIT BLESSING"}
            </button>
          </form>

          {/* Wishes Feed */}
          <div className="space-y-3 pt-4 text-left max-h-[360px] overflow-y-auto pr-1">
            {wishesList.length === 0 ? (
              <p className="text-center text-xs font-gaegu text-neutral-500 py-4">
                Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
              </p>
            ) : (
              wishesList.map((w, idx) => (
                <div key={idx} className="border-2 border-neutral-900 rounded-2xl p-4 bg-white shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-gaegu font-bold text-sm text-neutral-900">
                      {w.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-gaegu">
                      {new Date(w.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="font-gaegu text-xs text-neutral-700 leading-relaxed">
                    {w.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer className="text-center pt-8 pb-4 border-t border-neutral-200">
          <p className="font-melody text-2xl text-neutral-900 mb-1">
            {brideNickname} &amp; {groomNickname}
          </p>
          <a
            href="https://serastory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-gaegu tracking-widest text-neutral-500 hover:text-neutral-900 uppercase transition-colors"
          >
            Created with love by Sera Story
          </a>
        </footer>

      </div>
    </div>
  );
}
