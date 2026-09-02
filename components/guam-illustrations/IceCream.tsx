export default function IceCream({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 34 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* コーン */}
      <path d="M8 24 L26 24 L17 50 Z" fill="#e2a34a" />
      <path d="M11 30 L17 24 M17 36 L23 27 M14 42 L21 33" stroke="#c98a34" strokeWidth="1.2" />
      {/* アイス下段 */}
      <circle cx="12" cy="21" r="7" fill="#ffb7c9" />
      <circle cx="22" cy="21" r="7" fill="#fdf6ec" />
      {/* アイス上段 */}
      <circle cx="17" cy="12" r="7.5" fill="#8fd6a8" />
      {/* チェリー */}
      <circle cx="17" cy="4" r="3" fill="#d64e3f" />
      <path d="M17 2 C18 -1 21 -1 22 1" stroke="#1f9d6b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
