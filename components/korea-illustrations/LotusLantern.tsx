export default function LotusLantern({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 吊り紐 */}
      <path d="M20 2 L20 9" stroke="#8a3f2f" strokeWidth="1.6" strokeLinecap="round" />
      {/* 灯り本体 */}
      <ellipse cx="20" cy="24" rx="13" ry="15" fill="#d64e3f" />
      {/* 蓮の花びら */}
      <path d="M20 9 C15 13 12 18 12 24 C16 21 24 21 28 24 C28 18 25 13 20 9 Z" fill="#e8695b" />
      <path d="M7 24 C10 28 14 32 20 34 C18 30 18 27 20 24 Z" fill="#e8695b" opacity="0.8" />
      <path d="M33 24 C30 28 26 32 20 34 C22 30 22 27 20 24 Z" fill="#e8695b" opacity="0.8" />
      {/* 灯り */}
      <circle cx="20" cy="25" r="4" fill="#ffd166" />
      {/* 房飾り */}
      <path d="M20 39 L20 46" stroke="#f4c542" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 46 L24 46 L22 51 L18 51 Z" fill="#f4c542" />
    </svg>
  );
}
