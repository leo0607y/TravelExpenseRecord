export default function Bibimbap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 器 */}
      <path d="M4 20 C4 32 14 38 30 38 C46 38 56 32 56 20 Z" fill="#8a5a3a" />
      <ellipse cx="30" cy="20" rx="26" ry="7" fill="#fdf6ec" />
      {/* ご飯 */}
      <ellipse cx="30" cy="21" rx="18" ry="5" fill="#fffaf0" />
      {/* ナムル・具材 */}
      <path d="M14 19 C16 15 21 14 24 17" stroke="#3fae6a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M36 18 C39 15 44 16 45 19" stroke="#e2761a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M20 15 C22 12 27 12 29 14" stroke="#3fae6a" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* コチュジャン */}
      <circle cx="30" cy="16" r="4.5" fill="#d64e3f" />
      {/* 卵黄 */}
      <circle cx="40" cy="21" r="3.6" fill="#f4b942" stroke="#fdf6ec" strokeWidth="1" />
    </svg>
  );
}
