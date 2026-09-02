export default function HanbokCouple({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 女性（左）チマ */}
      <path d="M12 34 C6 44 5 54 7 59 L33 59 C35 54 34 44 28 34 Z" fill="#d64e3f" />
      <path d="M12 34 C6 44 5 54 7 59 L20 59 L17 34 Z" fill="#e8695b" opacity="0.6" />
      {/* 女性 チョゴリ */}
      <path d="M15 20 C13 25 13 30 15 34 L25 34 C27 30 27 25 25 20 Z" fill="#fdf6ec" />
      <path d="M15 20 L20 25 L25 20" stroke="#4a6fa5" strokeWidth="1.6" fill="none" />
      {/* 女性 頭・髪 */}
      <circle cx="20" cy="13" r="7" fill="#e8956b" />
      <path d="M14 12 C13 6 17 4 20 4 C23 4 27 6 26 12 C23 9 17 9 14 12 Z" fill="#2a1a12" />
      {/* 女性 腕 */}
      <path d="M15 25 C11 27 8 29 7 32" stroke="#e8956b" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M25 25 C29 27 32 29 33 32" stroke="#e8956b" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* 男性（右）トゥルマギ */}
      <path d="M48 32 C43 42 42 52 44 59 L70 59 C72 52 71 42 66 32 Z" fill="#2f4a6b" />
      <path d="M48 32 C43 42 42 52 44 59 L57 59 L54 32 Z" fill="#3d5f87" opacity="0.6" />
      {/* 男性 チョゴリ襟 */}
      <path d="M50 20 C48 25 48 29 50 32 L64 32 C66 29 66 25 64 20 Z" fill="#fdf6ec" />
      <path d="M50 20 L57 25 L64 20" stroke="#2f4a6b" strokeWidth="1.6" fill="none" />
      {/* 男性 頭・髪 */}
      <circle cx="57" cy="13" r="7" fill="#e8956b" />
      {/* 갓（帽子） */}
      <ellipse cx="57" cy="6.5" rx="9" ry="2.2" fill="#1c1c1c" />
      <path d="M51 6.5 C51 1.5 63 1.5 63 6.5 Z" fill="#1c1c1c" />
      {/* 男性 腕 */}
      <path d="M50 25 C46 27 43 29 42 33" stroke="#e8956b" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M64 25 C68 27 71 29 72 33" stroke="#e8956b" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
