export default function Mango({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 実 */}
      <path d="M22 8 C33 8 40 17 38 27 C36 37 28 41 21 40 C11 39 5 31 6 22 C7 13 13 8 22 8 Z" fill="#ffb648" />
      <path d="M14 14 C10 19 9 26 12 32 C8 26 8 18 14 14 Z" fill="#ff9633" opacity="0.7" />
      <path d="M31 12 C37 17 38 25 35 31 C38 23 36 16 31 12 Z" fill="#ff5b6a" opacity="0.6" />
      {/* 葉 */}
      <path d="M23 8 C25 2 32 1 35 4 C31 5 27 7 25 10 Z" fill="#1f9d6b" />
      <path d="M23 9 L30 4" stroke="#177a53" strokeWidth="1" />
    </svg>
  );
}
