export default function Makgeolli({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* やかん（주전자） */}
      <path d="M6 20 C6 15 10 12 17 12 C24 12 28 15 28 20 L28 32 C28 36 24 38 17 38 C10 38 6 36 6 32 Z" fill="#c9b8a0" />
      <ellipse cx="17" cy="12" rx="11" ry="3.4" fill="#a89a84" />
      {/* 注ぎ口 */}
      <path d="M28 18 L38 13 L38 17 L28 23 Z" fill="#c9b8a0" />
      {/* 取っ手 */}
      <path d="M17 9 C22 3 30 4 31 10" stroke="#a89a84" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* 器 */}
      <path d="M34 28 L50 28 C49 36 45 40 42 40 C39 40 35 36 34 28 Z" fill="#e8dfd0" />
      <ellipse cx="42" cy="28" rx="8" ry="2.4" fill="#fffaf0" />
    </svg>
  );
}
