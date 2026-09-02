export default function Flamingo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 体 */}
      <ellipse cx="23" cy="34" rx="11" ry="9" fill="#ff8fb3" />
      {/* 翼の影 */}
      <path d="M15 30 C19 32 22 36 18 42" stroke="#ff6f9c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* 首 */}
      <path d="M14 30 C6 26 6 14 14 8" stroke="#ff8fb3" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      {/* 頭 */}
      <circle cx="14" cy="8" r="4.6" fill="#ff8fb3" />
      {/* くちばし */}
      <path d="M10 7 L2 5 L10 10 Z" fill="#4a4a4a" />
      {/* 目 */}
      <circle cx="14" cy="7" r="1" fill="#2a1a12" />
      {/* 脚 */}
      <path d="M20 42 L16 58" stroke="#e07a9c" strokeWidth="2" strokeLinecap="round" />
      <path d="M27 42 L27 58" stroke="#e07a9c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
