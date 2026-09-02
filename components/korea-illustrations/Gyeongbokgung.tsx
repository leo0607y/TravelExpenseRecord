export default function Gyeongbokgung({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 屋根 */}
      <path d="M4 26 Q40 4 76 26 L70 26 Q40 12 10 26 Z" fill="#2a1a12" />
      <path d="M8 28 L72 28 L72 34 L8 34 Z" fill="#d64e3f" />
      {/* 柱と門 */}
      <rect x="10" y="34" width="6" height="22" fill="#8a3f2f" />
      <rect x="64" y="34" width="6" height="22" fill="#8a3f2f" />
      <rect x="26" y="34" width="6" height="22" fill="#8a3f2f" />
      <rect x="48" y="34" width="6" height="22" fill="#8a3f2f" />
      {/* アーチ門 */}
      <path d="M34 56 L34 44 A6 6 0 0 1 46 44 L46 56 Z" fill="#2a1a12" />
      {/* 台座 */}
      <rect x="4" y="56" width="72" height="4" fill="#4a6fa5" opacity="0.5" />
    </svg>
  );
}
