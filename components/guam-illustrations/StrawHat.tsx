export default function StrawHat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* つば */}
      <ellipse cx="30" cy="28" rx="28" ry="7" fill="#e8c078" />
      <ellipse cx="30" cy="28" rx="28" ry="7" fill="none" stroke="#c9a05a" strokeWidth="1" />
      {/* 山（クラウン） */}
      <path d="M14 26 C14 12 20 4 30 4 C40 4 46 12 46 26 Z" fill="#f0d29a" />
      <path d="M14 26 C14 12 20 4 30 4 C40 4 46 12 46 26" fill="none" stroke="#c9a05a" strokeWidth="1" />
      {/* リボン */}
      <rect x="12" y="21" width="36" height="5" fill="#d64e3f" />
    </svg>
  );
}
