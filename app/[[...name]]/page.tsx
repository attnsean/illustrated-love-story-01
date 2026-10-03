import React from "react";
import Image from "next/image";
import RightSidebar, { ASSETS } from "../components/RightSidebar";
import { headers } from "next/headers";
import { resolveProjectData, isDefaultStorageUrl } from "../../lib/resolveProject";
import type { Metadata } from "next";

export const revalidate = 0;

type Props = {
  params: Promise<{ name?: string[] }>;
};

const formatFallbackGuestName = (raw: string): string => {
  let name = raw;
  try {
    name = decodeURIComponent(raw);
  } catch {}
  name = name
    .replace(/%20/g, " ")
    .replace(/%25/g, " ")
    .replace(/%/g, " ")
    .replace(/\+/g, " ")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return name
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let guestName = "Special Guest";
  const slug = resolvedParams?.name && resolvedParams.name.length > 0 ? resolvedParams.name[0] : undefined;

  const headersList = await headers();
  const host = headersList.get("host") || undefined;

  const dbData = await resolveProjectData(slug, host);

  if (dbData.guest) {
    guestName = dbData.guest.name;
  } else if (resolvedParams?.name && resolvedParams.name.length > 0) {
    guestName = formatFallbackGuestName(resolvedParams.name.join(" "));
  }

  const brideName = dbData.project?.bride_nickname || "Natalie";
  const groomName = dbData.project?.groom_nickname || "Marvel";
  const brideFull = dbData.project?.bride_name || "Natalie C";
  const groomFull = dbData.project?.groom_name || "Marvel A";

  const title = `Wedding Invitation for ${guestName} | ${groomName} & ${brideName}`;
  const description = `We cordially invite ${guestName} to share our special day. The wedding celebration of ${groomFull} & ${brideFull}.`;
  const imageUrl = dbData.project?.cover_photo_url || dbData.project?.opening_photo_url || ASSETS.couple;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: `${groomName} & ${brideName} Wedding`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${groomName} & ${brideName} Wedding Invitation`,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Home({ params }: Props) {
  const resolvedParams = await params;
  let guestName = "Guest Name";
  const slug = resolvedParams?.name && resolvedParams.name.length > 0 ? resolvedParams.name[0] : undefined;

  const headersList = await headers();
  const host = headersList.get("host") || undefined;

  const dbData = await resolveProjectData(slug, host);

  // Check project status
  const isLive = dbData.project ? dbData.project.status === "live" : true;
  const subscription = dbData.project?.subscriptions;
  const isExpired = subscription && (
    subscription.status === "expired" || 
    (subscription.expires_at && new Date(subscription.expires_at) < new Date())
  );

  if (dbData.project && (!isLive || isExpired)) {
    return (
      <main className="min-h-[100dvh] w-full flex items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-white">
          <h2 className="text-2xl font-melody text-neutral-200">Undangan Nonaktif</h2>
          <p className="text-sm font-gaegu text-neutral-400">
            Masa aktif undangan pernikahan digital ini telah selesai.
          </p>
        </div>
      </main>
    );
  }

  if (dbData.guest) {
    guestName = dbData.guest.name;
  } else if (resolvedParams?.name && resolvedParams.name.length > 0) {
    guestName = formatFallbackGuestName(resolvedParams.name.join(" "));
  }

  const brideNickname = dbData.project?.bride_nickname || "Natalie";
  const groomNickname = dbData.project?.groom_nickname || "Marvel";
  const weddingDateRaw = dbData.events?.[0]?.event_date || dbData.project?.wedding_date;

  const formatDateDot = (dateStr?: string | null) => {
    if (!dateStr) return "28 . 02 . 2028";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "28 . 02 . 2028";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} . ${month} . ${year}`;
  };

  const formattedDate = formatDateDot(weddingDateRaw);
  const userPhoto = (!isDefaultStorageUrl(dbData.project?.opening_photo_url) ? dbData.project?.opening_photo_url : null)
    || (!isDefaultStorageUrl(dbData.project?.cover_photo_url) ? dbData.project?.cover_photo_url : null)
    || (!isDefaultStorageUrl(dbData.project?.bride_photo_url) ? dbData.project?.bride_photo_url : null)
    || (!isDefaultStorageUrl(dbData.project?.groom_photo_url) ? dbData.project?.groom_photo_url : null);

  return (
    <main className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-[#faf9f6] text-neutral-900 overflow-hidden relative font-gaegu">
      
      {/* Left side: Desktop Cover / Prewedding (Hidden on mobile) */}
      <div className="hidden md:flex relative md:w-[58%] lg:w-[62%] md:h-[100dvh] items-center justify-center overflow-hidden bg-neutral-100 border-r border-neutral-200">
        {userPhoto ? (
          <>
            <Image 
              src={userPhoto} 
              alt={`Prewedding ${groomNickname} & ${brideNickname}`} 
              fill 
              sizes="(max-width: 768px) 0vw, 62vw"
              className="object-cover object-center brightness-[0.82] select-none"
              draggable={false}
              priority
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#fcfbf9] via-[#f7f4ed] to-[#ede7dc] flex flex-col items-center justify-center p-12">
            {/* Subtle doodle rings in background */}
            <div className="w-80 h-80 opacity-10 absolute pointer-events-none">
              <img src={ASSETS.topRings} alt="Rings watermark" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* Center Card / Typography Overlay */}
        <div className="relative z-10 text-center px-8 py-10 rounded-3xl bg-white/85 backdrop-blur-md border-2 border-neutral-900 shadow-2xl max-w-md mx-6">
          <p className="text-xs uppercase font-gaegu font-bold tracking-[0.25em] text-neutral-800 mb-2">
            The Wedding Of
          </p>

          <div className="flex justify-center mb-2">
            <img src={ASSETS.topRings} alt="Rings" className="w-10 h-auto object-contain" />
          </div>

          <h1 className="font-melody text-4xl lg:text-5xl text-neutral-900 leading-tight mb-2">
            {brideNickname} <br />
            <span className="text-red-600 font-melody text-3xl lg:text-4xl">&amp;</span> <br />
            {groomNickname}
          </h1>

          <div className="h-0.5 w-16 bg-neutral-900 mx-auto my-3"></div>

          <p className="text-base font-gaegu font-bold tracking-[0.3em] text-neutral-800 uppercase">
            {formattedDate}
          </p>

          {/* Cute Illustrated couple illustration in the card */}
          <div className="mt-4 flex justify-center">
            <img 
              src={ASSETS.couple} 
              alt="Illustrated Couple" 
              className="w-44 h-auto object-contain select-none pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Right side: Illustrated Mobile-Style Scrollable Invitation */}
      <RightSidebar 
        guestName={guestName} 
        guest={dbData.guest}
        project={dbData.project}
        events={dbData.events}
        wishes={dbData.wishes}
        stats={dbData.stats}
      />
      
    </main>
  );
}
