import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { ASSETS } from "../../../lib/assets";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groom = searchParams.get("g") || "Groom";
    const bride = searchParams.get("b") || "Bride";
    const date = searchParams.get("d") || "";

    const coupleImg = ASSETS.couple || "";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            backgroundColor: "#FAF7F2",
            padding: "50px 70px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Outer elegant border frame */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
              border: "2px solid #E6D8C8",
              borderRadius: 24,
            }}
          />

          {/* Left: Couple Illustration in aesthetic Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 440,
              height: 480,
              backgroundColor: "#FFFFFF",
              borderRadius: 28,
              border: "2px solid #F0E6D8",
              boxShadow: "0 12px 36px rgba(100, 70, 50, 0.08)",
              padding: 24,
            }}
          >
            {coupleImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coupleImg}
                alt="Couple Illustration"
                style={{
                  width: 380,
                  height: 420,
                  objectFit: "contain",
                }}
              />
            ) : null}
          </div>

          {/* Right: Personal Couple Typography */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              flex: 1,
              paddingLeft: 60,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                letterSpacing: "0.3em",
                color: "#8A5A36",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              WEDDING INVITATION
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                fontSize: 66,
                fontWeight: 800,
                color: "#2C1E16",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {groom} & {bride}
            </div>
            <div
              style={{
                width: 120,
                height: 3,
                backgroundColor: "#8A5A36",
                marginBottom: 20,
                borderRadius: 2,
              }}
            />
            {date ? (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#6B5A4E",
                  marginBottom: 32,
                }}
              >
                {date}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2C1E16",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 600,
                padding: "12px 28px",
                borderRadius: 50,
                letterSpacing: "0.06em",
              }}
            >
              Buka Undangan Digital
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
