export default function Tteokbokki({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 皿 */}
      <ellipse cx="30" cy="30" rx="28" ry="9" fill="#fdf6ec" stroke="#d9c9ad" strokeWidth="1.5" />
      <ellipse cx="30" cy="28" rx="20" ry="6" fill="#d64e3f" />
      {/* トッポギ（餅） */}
      <rect x="14" y="20" width="6" height="12" rx="3" fill="#fff3e0" />
      <rect x="24" y="18" width="6" height="14" rx="3" fill="#fff3e0" />
      <rect x="34" y="20" width="6" height="12" rx="3" fill="#fff3e0" />
      {/* ネギ散らし */}
      <circle cx="18" cy="24" r="1.4" fill="#3fae6a" />
      <circle cx="28" cy="22" r="1.4" fill="#3fae6a" />
      <circle cx="38" cy="24" r="1.4" fill="#3fae6a" />
    </svg>
  );
}
