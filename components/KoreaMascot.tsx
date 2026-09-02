export default function KoreaMascot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 耳 */}
      <circle cx="12" cy="10" r="8" fill="#ef8a3d" />
      <circle cx="48" cy="10" r="8" fill="#ef8a3d" />
      <circle cx="12" cy="11" r="3.6" fill="#fff3e0" />
      <circle cx="48" cy="11" r="3.6" fill="#fff3e0" />
      {/* 顔 */}
      <ellipse cx="30" cy="28" rx="23" ry="19" fill="#ef8a3d" />
      <ellipse cx="30" cy="34" rx="13" ry="10" fill="#fff3e0" />
      {/* 目 */}
      <ellipse cx="21" cy="25" rx="2.6" ry="3.2" fill="#2a1a12" />
      <ellipse cx="39" cy="25" rx="2.6" ry="3.2" fill="#2a1a12" />
      {/* 鼻・口 */}
      <ellipse cx="30" cy="32" rx="3" ry="2.2" fill="#2a1a12" />
      <path d="M30 34 Q30 38 25 39" stroke="#2a1a12" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M30 34 Q30 38 35 39" stroke="#2a1a12" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* しま模様 */}
      <path d="M13 15 Q18 20 15 27" stroke="#2a1a12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M47 15 Q42 20 45 27" stroke="#2a1a12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M20 11 Q24 15 22 20" stroke="#2a1a12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M40 11 Q36 15 38 20" stroke="#2a1a12" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 前足 */}
      <ellipse cx="20" cy="46" rx="4.5" ry="3" fill="#ef8a3d" />
      <ellipse cx="40" cy="46" rx="4.5" ry="3" fill="#ef8a3d" />
    </svg>
  );
}
