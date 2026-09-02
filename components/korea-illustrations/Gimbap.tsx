export default function Gimbap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 海苔 */}
      <circle cx="22" cy="22" r="19" fill="#1e3a2a" />
      {/* ご飯 */}
      <circle cx="22" cy="22" r="15.5" fill="#fffaf0" />
      {/* 具 */}
      <rect x="18" y="12" width="8" height="7" rx="2" fill="#f4c542" />
      <rect x="12" y="20" width="7" height="7" rx="2" fill="#d64e3f" />
      <rect x="25" y="20" width="7" height="7" rx="2" fill="#3fae6a" />
      <rect x="18" y="27" width="8" height="6" rx="2" fill="#e2761a" />
    </svg>
  );
}
