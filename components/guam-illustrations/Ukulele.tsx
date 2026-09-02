export default function Ukulele({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* ヘッド */}
      <rect x="15" y="2" width="10" height="7" rx="2" fill="#8a5a3a" />
      {/* ネック */}
      <rect x="17.5" y="8" width="5" height="24" fill="#c9915c" />
      {/* ボディ（ひょうたん型） */}
      <path
        d="M20 28 C10 28 6 35 8 42 C10 50 14 56 20 56 C26 56 30 50 32 42 C34 35 30 28 20 28 Z"
        fill="#ff9633"
      />
      <path
        d="M20 28 C15 28 12 32 13 36 C17 34 23 34 27 36 C28 32 25 28 20 28 Z"
        fill="#ff8a1f"
        opacity="0.5"
      />
      {/* サウンドホール */}
      <circle cx="20" cy="43" r="5.5" fill="#5a3a22" />
      {/* 弦 */}
      <line x1="17" y1="8" x2="17" y2="52" stroke="#fdf6ec" strokeWidth="1" opacity="0.8" />
      <line x1="20" y1="8" x2="20" y2="52" stroke="#fdf6ec" strokeWidth="1" opacity="0.8" />
      <line x1="23" y1="8" x2="23" y2="52" stroke="#fdf6ec" strokeWidth="1" opacity="0.8" />
    </svg>
  );
}
