export default function Popsicle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 棒 */}
      <rect x="13" y="26" width="4" height="20" rx="1.5" fill="#d9a066" />
      {/* アイス本体 */}
      <path
        d="M15 2 C22.5 2 27 8 27 15.5 C27 23 21.5 28 15 28 C8.5 28 3 23 3 15.5 C3 8 7.5 2 15 2 Z"
        fill="#ff6f91"
      />
      <path
        d="M15 2 C10 2 6 5.5 4.5 10.5 C8 9 12 8 15 8 C18 8 22 9 25.5 10.5 C24 5.5 20 2 15 2 Z"
        fill="#ff90ac"
      />
      <line x1="15" y1="6" x2="15" y2="24" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}
