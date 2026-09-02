export default function Hanok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 瓦屋根（曲線が特徴） */}
      <path d="M2 24 Q10 8 20 16 Q35 2 50 16 Q60 8 68 24 Z" fill="#2a1a12" />
      <path d="M6 24 L64 24 L64 28 L6 28 Z" fill="#4a4a4a" />
      {/* 壁 */}
      <rect x="10" y="28" width="50" height="18" fill="#fdf6ec" stroke="#8a3f2f" strokeWidth="2" />
      <line x1="10" y1="37" x2="60" y2="37" stroke="#8a3f2f" strokeWidth="1.5" />
      <line x1="25" y1="28" x2="25" y2="46" stroke="#8a3f2f" strokeWidth="1.5" />
      <line x1="45" y1="28" x2="45" y2="46" stroke="#8a3f2f" strokeWidth="1.5" />
    </svg>
  );
}
