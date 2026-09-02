export default function HanbokDancer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* チマ（スカート） */}
      <path d="M18 40 C10 52 8 68 10 79 L50 79 C52 68 50 52 42 40 Z" fill="#d64e3f" />
      <path d="M18 40 C10 52 8 68 10 79 L30 79 L26 40 Z" fill="#e8695b" opacity="0.6" />
      {/* チョゴリ（上着） */}
      <path d="M22 24 C20 30 20 36 22 40 L38 40 C40 36 40 30 38 24 Z" fill="#fdf6ec" />
      <path d="M22 24 L30 30 L38 24" stroke="#4a6fa5" strokeWidth="2" fill="none" />
      {/* 頭 */}
      <circle cx="30" cy="14" r="9" fill="#e8956b" />
      {/* 髪（お団子） */}
      <path d="M21 13 C20 5 26 2 30 2 C34 2 40 5 39 13 C35 9 25 9 21 13 Z" fill="#2a1a12" />
      <circle cx="30" cy="4" r="2.6" fill="#2a1a12" />
      {/* 扇 */}
      <path d="M18 30 C10 26 4 18 4 10 C12 12 18 18 22 28 Z" fill="#4a6fa5" opacity="0.85" />
      <path d="M42 30 C50 26 56 18 56 10 C48 12 42 18 38 28 Z" fill="#d64e3f" opacity="0.85" />
      {/* 腕 */}
      <path d="M22 30 C18 28 12 24 8 18" stroke="#e8956b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M38 30 C42 28 48 24 52 18" stroke="#e8956b" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
