export default function JindoDog({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* しっぽ（巻き尾） */}
      <path d="M9 26 C3 22 4 14 10 15 C14 16 14 21 11 22" stroke="#e8c9a0" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* 体 */}
      <ellipse cx="22" cy="28" rx="14" ry="10" fill="#f0d8b8" />
      {/* 脚 */}
      <rect x="14" y="34" width="4.5" height="10" rx="2" fill="#e8c9a0" />
      <rect x="26" y="34" width="4.5" height="10" rx="2" fill="#e8c9a0" />
      {/* 頭 */}
      <circle cx="38" cy="19" r="10" fill="#f0d8b8" />
      {/* 耳 */}
      <path d="M31 12 L30 3 L37 9 Z" fill="#e8c9a0" />
      <path d="M45 12 L47 3 L40 9 Z" fill="#e8c9a0" />
      {/* 口元 */}
      <ellipse cx="42" cy="23" rx="6" ry="4.6" fill="#fffaf0" />
      <circle cx="45.5" cy="21.5" r="1.8" fill="#3a2a1c" />
      {/* 目 */}
      <circle cx="35" cy="17" r="1.7" fill="#3a2a1c" />
      <circle cx="42" cy="16" r="1.7" fill="#3a2a1c" />
    </svg>
  );
}
