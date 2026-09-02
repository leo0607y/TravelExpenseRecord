export default function Soju({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* ボトル */}
      <rect x="10" y="14" width="14" height="30" rx="3" fill="#3fae6a" />
      <rect x="14" y="6" width="6" height="10" fill="#3fae6a" />
      <rect x="13" y="4" width="8" height="3" rx="1.5" fill="#2a2a2a" />
      <rect x="9" y="24" width="16" height="10" fill="#fdf6ec" />
      {/* グラス */}
      <path d="M28 28 L34 28 L32.5 42 L29.5 42 Z" fill="none" stroke="#4a6fa5" strokeWidth="2" />
    </svg>
  );
}
