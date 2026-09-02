export default function TropicalBird({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 尾羽 */}
      <path d="M14 32 L4 48 L10 47 L11 50 L20 38 Z" fill="#ffd166" />
      <path d="M16 33 L9 49 L14 48 L20 39 Z" fill="#ff8a5c" />
      {/* 体 */}
      <ellipse cx="24" cy="26" rx="11" ry="13" fill="#1f9d6b" />
      {/* 翼 */}
      <path d="M27 20 C34 22 36 30 30 34 C26 30 25 24 27 20 Z" fill="#26b378" />
      {/* 頭 */}
      <circle cx="27" cy="13" r="8" fill="#ffd166" />
      {/* くちばし */}
      <path d="M34 12 C40 11 41 16 35 18 C33 17 33 14 34 12 Z" fill="#ff5b6a" />
      {/* 目 */}
      <circle cx="29" cy="11" r="1.7" fill="#2a1a12" />
      {/* 足 */}
      <path d="M22 39 L22 45 M27 39 L27 45" stroke="#e2a34a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
