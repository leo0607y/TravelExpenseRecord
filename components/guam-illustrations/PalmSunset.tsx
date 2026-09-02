export default function PalmSunset({ className }: { className?: string }) {
  const leaf = (rotate: number, fill: string) => (
    <path
      d="M0,0 C-9,-32 -7,-72 0,-98 C7,-72 9,-32 0,0 Z"
      fill={fill}
      transform={`rotate(${rotate})`}
    />
  );

  return (
    <svg className={className} viewBox="-70 -100 140 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* sun */}
      <circle cx="20" cy="-40" r="26" fill="#ffb648" />
      {/* horizon */}
      <rect x="-70" y="10" width="140" height="4" fill="#00a8a0" opacity="0.5" />
      {/* trunk */}
      <path d="M-4 20 C-2 -10 2 -40 8 -62 L14 -60 C6 -38 2 -8 2 20 Z" fill="#8a5a3a" />
      {/* leaves fan */}
      <g transform="translate(8,-62)">
        {leaf(-70, "#1f9d6b")}
        {leaf(-40, "#26b378")}
        {leaf(-10, "#1f9d6b")}
        {leaf(20, "#26b378")}
        {leaf(50, "#1f9d6b")}
      </g>
    </svg>
  );
}
