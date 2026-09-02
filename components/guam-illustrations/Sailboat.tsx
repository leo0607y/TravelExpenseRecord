export default function Sailboat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* マスト */}
      <rect x="25" y="4" width="2.4" height="30" fill="#8a5a3a" />
      {/* 帆（大） */}
      <path d="M28 6 L44 32 L28 32 Z" fill="#fdf6ec" stroke="#d9c9ad" strokeWidth="1.2" />
      {/* 帆（小） */}
      <path d="M24 10 L24 32 L11 32 Z" fill="#ff8a5c" />
      {/* 船体 */}
      <path d="M6 34 L47 34 C44 41 38 44 27 44 C16 44 9 41 6 34 Z" fill="#0092b0" />
      {/* 波 */}
      <path d="M2 46 C7 43 11 49 16 46 C21 43 25 49 30 46 C35 43 39 49 44 46" stroke="#5fd6dd" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
