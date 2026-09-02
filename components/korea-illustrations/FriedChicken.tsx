export default function FriedChicken({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* バスケット */}
      <path d="M6 22 L38 22 L34 43 L10 43 Z" fill="#d64e3f" />
      <path d="M6 22 L38 22 L36.8 28 L7.2 28 Z" fill="#b83c30" />
      {/* チキン（骨付き） */}
      <path d="M13 22 C10 16 13 9 19 9 C25 9 28 14 26 19 L22 24 Z" fill="#e2a34a" />
      <path d="M22 24 L27 29" stroke="#fdf6ec" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 20 C28 13 34 13 36 18 C38 23 34 27 30 25 Z" fill="#e8b45f" />
      {/* 衣のつぶつぶ */}
      <circle cx="18" cy="14" r="1.2" fill="#c98a34" />
      <circle cx="22" cy="17" r="1.2" fill="#c98a34" />
      <circle cx="31" cy="19" r="1.2" fill="#c98a34" />
    </svg>
  );
}
