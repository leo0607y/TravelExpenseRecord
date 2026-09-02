export default function Fan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 36 C4 20 14 6 30 4 C34 12 32 22 24 30 C16 34 8 36 4 36 Z"
        fill="#d64e3f"
      />
      <path d="M4 36 C10 24 20 12 30 4" stroke="#fdf6ec" strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d="M8 34 C12 22 20 10 28 6" stroke="#fdf6ec" strokeWidth="1.4" fill="none" opacity="0.6" />
      <rect x="0" y="33" width="8" height="4" rx="2" fill="#8a3f2f" transform="rotate(-35 4 35)" />
    </svg>
  );
}
