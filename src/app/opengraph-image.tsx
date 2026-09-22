import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const siteName = process.env.SITE_NAME || "স্বাস্থ্যকর";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        letterSpacing: "-0.02em",
        fontWeight: 700,
        background: "#064e3b",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 800,
          marginBottom: 16,
        }}
      >
        {`SwasthyoKor - ${siteName}`}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          fontWeight: 400,
          opacity: 0.9,
        }}
      >
        ১০০% খাঁটি ও অর্গানিক পণ্যের অনলাইন স্টোর
      </div>
    </div>,
    {
      ...size,
    },
  );
}
