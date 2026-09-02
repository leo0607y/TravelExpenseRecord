import { ImageResponse } from "next/og";
import { ACTIVE_THEME } from "@/lib/theme";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

const petalColor = ACTIVE_THEME === "guam" ? "#ff6f91" : "#ffffff";
const bgColor = ACTIVE_THEME === "guam" ? "#00b3a4" : "#06c755";
const centerColor = "#ffd166";

export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        {[0, 72, 144, 216, 288].map((deg) => (
          <div
            key={deg}
            style={{
              position: "absolute",
              width: 15,
              height: 24,
              borderRadius: "50%",
              background: petalColor,
              transform: `rotate(${deg}deg) translateY(-9px)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: centerColor,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
