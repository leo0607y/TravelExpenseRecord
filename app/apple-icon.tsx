import { ImageResponse } from "next/og";
import { ACTIVE_THEME } from "@/lib/theme";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const bgColor = ACTIVE_THEME === "guam" ? "#00b3a4" : "#06c755";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgColor,
        }}
      >
        <svg width="150" height="125" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="30" cy="34" rx="22" ry="14" fill="#a9754f" />
          <circle cx="14" cy="20" r="14" fill="#a9754f" />
          <circle cx="5" cy="10" r="5" fill="#a9754f" />
          <circle cx="20" cy="8" r="5" fill="#a9754f" />
          <circle cx="5" cy="10" r="2.4" fill="#7a5236" />
          <circle cx="20" cy="8" r="2.4" fill="#7a5236" />
          <ellipse cx="8" cy="25" rx="7" ry="5.5" fill="#c9a179" />
          <circle cx="10" cy="17" r="1.6" fill="#3a2a1c" />
          <circle cx="19" cy="16" r="1.6" fill="#3a2a1c" />
          <ellipse cx="7" cy="24" rx="2" ry="1.4" fill="#3a2a1c" />
          <ellipse cx="20" cy="46" rx="4.5" ry="3" fill="#7a5236" />
          <ellipse cx="40" cy="46" rx="4.5" ry="3" fill="#7a5236" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
