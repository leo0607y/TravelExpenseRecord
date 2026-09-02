export default function BeachUmbrella({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 傘（縞模様） */}
      <path d="M25 4 C13 4 3 15 2 24 L25 24 Z" fill="#ff5b6a" />
      <path d="M25 4 C37 4 47 15 48 24 L25 24 Z" fill="#ffd166" />
      <path d="M2 24 L48 24 L44 28 L6 28 Z" fill="#ff5b6a" opacity="0.85" />
      {/* 軸 */}
      <rect x="23" y="24" width="4" height="32" fill="#8a5a3a" />
      {/* 砂に映る影 */}
      <ellipse cx="25" cy="57" rx="13" ry="2.6" fill="#d9c9ad" opacity="0.6" />
    </svg>
  );
}
