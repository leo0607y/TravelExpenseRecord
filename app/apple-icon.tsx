import { ImageResponse } from "next/og";
import { ACTIVE_THEME } from "@/lib/theme";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const petalColor = ACTIVE_THEME === "guam" ? "#ff6f91" : "#ffffff";
const bgColor = ACTIVE_THEME === "guam" ? "#00b3a4" : "#06c755";
const centerColor = "#ffd166";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background: bgColor,
        }}
      >
        {[0, 72, 144, 216, 288].map((deg) => (
          <div
            key={deg}
            style={{
              position: "absolute",
              width: 56,
              height: 90,
              borderRadius: "50%",
              background: petalColor,
              transform: `rotate(${deg}deg) translateY(-34px)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: centerColor,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
