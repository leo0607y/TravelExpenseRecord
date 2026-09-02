export default function Hanok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 瓦屋根（両端が反り返った軒） */}
      <path d="M2 27 C2 18 8 18 15 17 L31 9 L39 9 L55 17 C62 18 68 18 68 27 Z" fill="#3a2820" />
      <path d="M2 27 C2 18 8 18 15 17 L31 9 L39 9 L55 17 C62 18 68 18 68 27" fill="none" stroke="#1e140e" strokeWidth="1.2" />
      <path d="M6 25 L64 25" stroke="#5a5a5a" strokeWidth="2" strokeLinecap="round" />
      {/* 壁 */}
      <rect x="10" y="28" width="50" height="18" fill="#fdf6ec" stroke="#8a3f2f" strokeWidth="2" />
      <line x1="10" y1="37" x2="60" y2="37" stroke="#8a3f2f" strokeWidth="1.5" />
      <line x1="25" y1="28" x2="25" y2="46" stroke="#8a3f2f" strokeWidth="1.5" />
      <line x1="45" y1="28" x2="45" y2="46" stroke="#8a3f2f" strokeWidth="1.5" />
    </svg>
  );
}
