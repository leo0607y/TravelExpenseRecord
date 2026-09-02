export default function Bingsu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* かき氷の山 */}
      <path d="M9 24 C9 12 16 5 24 5 C32 5 39 12 39 24 Z" fill="#fdfdfd" />
      <path d="M13 20 C15 13 19 9 24 9 C29 9 33 13 35 20 Z" fill="#eaf4ff" />
      {/* あずき */}
      <circle cx="19" cy="15" r="2.4" fill="#8a3f2f" />
      <circle cx="27" cy="13" r="2.4" fill="#8a3f2f" />
      <circle cx="24" cy="19" r="2.4" fill="#a04a37" />
      {/* いちご */}
      <path d="M31 8 C34 8 35 11 33 13 C31 15 29 13 29 11 C29 9 30 8 31 8 Z" fill="#d64e3f" />
      {/* 器 */}
      <path d="M6 24 L42 24 C40 34 34 41 24 41 C14 41 8 34 6 24 Z" fill="#4a6fa5" />
      <ellipse cx="24" cy="24" rx="18" ry="3.4" fill="#5f83b8" />
      <rect x="21" y="41" width="6" height="4" fill="#3d5f87" />
    </svg>
  );
}
