export default function Lightstick({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="26" width="6" height="22" rx="3" fill="#e5e5e5" />
      <circle cx="15" cy="16" r="12" fill="#fdf6ec" opacity="0.5" />
      <path
        d="M15 4 L18 12 L27 12 L20 18 L23 27 L15 21 L7 27 L10 18 L3 12 L12 12 Z"
        fill="#d64e3f"
      />
    </svg>
  );
}
