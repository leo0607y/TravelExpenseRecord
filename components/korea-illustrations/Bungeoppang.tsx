export default function Bungeoppang({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 体（鯛焼き型） */}
      <path
        d="M6 17 C6 9 15 4 26 4 C36 4 43 9 45 15 L53 6 L53 28 L45 19 C43 25 36 30 26 30 C15 30 6 25 6 17 Z"
        fill="#e2a34a"
      />
      {/* 焼き目 */}
      <path d="M13 12 C18 9 24 8 30 9" stroke="#c98a34" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M13 22 C18 25 24 26 30 25" stroke="#c98a34" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* ひれ */}
      <path d="M28 6 C30 2 34 2 35 5" stroke="#c98a34" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 目 */}
      <circle cx="14" cy="15" r="2" fill="#5a3a22" />
    </svg>
  );
}
