export default function Fan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 扇面（末広がりの扇形） */}
      <path d="M25 38 L4 12 A29 29 0 0 1 46 12 Z" fill="#d64e3f" />
      {/* ひだ（折り目） */}
      <path
        d="M25 38 L10 16 M25 38 L16 10 M25 38 L25 7 M25 38 L34 10 M25 38 L40 16"
        stroke="#fdf6ec"
        strokeWidth="1.3"
        fill="none"
        opacity="0.75"
      />
      {/* 要（かなめ）・持ち手 */}
      <circle cx="25" cy="38" r="2.4" fill="#8a3f2f" />
      <rect x="22.5" y="38" width="5" height="8" rx="2" fill="#8a3f2f" />
    </svg>
  );
}
