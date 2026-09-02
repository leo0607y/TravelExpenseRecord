export default function SnorkelMask({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* シュノーケル */}
      <path d="M42 30 C46 30 47 24 47 18 L47 6" stroke="#ff8a5c" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* バンド */}
      <path d="M4 15 L8 15 M38 15 L44 15" stroke="#0092b0" strokeWidth="3.4" strokeLinecap="round" />
      {/* マスク本体 */}
      <rect x="7" y="7" width="32" height="21" rx="8" fill="#0092b0" />
      <rect x="10.5" y="10.5" width="25" height="12" rx="5" fill="#bfeef5" />
      <path d="M13 13 C16 12 19 12 22 13" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* 鼻あて */}
      <path d="M17 28 C20 33 26 33 29 28 Z" fill="#0092b0" />
    </svg>
  );
}
