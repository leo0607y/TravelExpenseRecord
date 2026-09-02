import { ImageResponse } from "next/og";
import { getServerTheme } from "@/lib/theme";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

const THEME_STYLE = {
  guam: { bg: "#00b3a4", fur: "#a9754f", furDark: "#7a5236", muzzle: "#c9a179" },
  korea: { bg: "#4a6fa5", fur: "#ef8a3d", furDark: "#2a1a12", muzzle: "#fff3e0" },
  default: { bg: "#06c755", fur: "#a9754f", furDark: "#7a5236", muzzle: "#c9a179" },
} as const;

export default function Icon() {
  const theme = getServerTheme();
  const { bg, fur, furDark, muzzle } = THEME_STYLE[theme];
  const isKorea = theme === "korea";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          borderRadius: 12,
        }}
      >
        {isKorea ? (
          <svg width="42" height="35" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="10" r="8" fill={fur} />
            <circle cx="48" cy="10" r="8" fill={fur} />
            <circle cx="12" cy="11" r="3.6" fill={muzzle} />
            <circle cx="48" cy="11" r="3.6" fill={muzzle} />
            <ellipse cx="30" cy="28" rx="23" ry="19" fill={fur} />
            <ellipse cx="30" cy="34" rx="13" ry="10" fill={muzzle} />
            <ellipse cx="21" cy="25" rx="2.6" ry="3.2" fill={furDark} />
            <ellipse cx="39" cy="25" rx="2.6" ry="3.2" fill={furDark} />
            <ellipse cx="30" cy="32" rx="3" ry="2.2" fill={furDark} />
          </svg>
        ) : (
          <svg width="42" height="35" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="34" rx="22" ry="14" fill={fur} />
            <circle cx="14" cy="20" r="14" fill={fur} />
            <circle cx="5" cy="10" r="5" fill={fur} />
            <circle cx="20" cy="8" r="5" fill={fur} />
            <circle cx="5" cy="10" r="2.4" fill={furDark} />
            <circle cx="20" cy="8" r="2.4" fill={furDark} />
            <ellipse cx="8" cy="25" rx="7" ry="5.5" fill={muzzle} />
            <circle cx="10" cy="17" r="1.6" fill={furDark} />
            <circle cx="19" cy="16" r="1.6" fill={furDark} />
            <ellipse cx="7" cy="24" rx="2" ry="1.4" fill={furDark} />
            <ellipse cx="20" cy="46" rx="4.5" ry="3" fill={furDark} />
            <ellipse cx="40" cy="46" rx="4.5" ry="3" fill={furDark} />
          </svg>
        )}
      </div>
    ),
    { ...size }
  );
}
