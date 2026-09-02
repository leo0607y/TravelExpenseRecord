export default function NamsanTower({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 58 L18 20 L22 20 L26 58 Z" fill="#4a6fa5" />
      <path d="M10 24 L30 24 L26 18 L14 18 Z" fill="#33517d" />
      <ellipse cx="20" cy="14" rx="7" ry="9" fill="#4a6fa5" />
      <circle cx="20" cy="8" r="2.5" fill="#d64e3f" />
      <rect x="16" y="30" width="8" height="3" fill="#fdf6ec" opacity="0.7" />
      <rect x="15" y="42" width="10" height="3" fill="#fdf6ec" opacity="0.7" />
    </svg>
  );
}
