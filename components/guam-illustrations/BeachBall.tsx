export default function BeachBall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="22" cy="22" r="18" fill="#fdf6ec" />
      <path d="M22 4 C29 10 29 34 22 40 C15 34 15 10 22 4 Z" fill="#ff5b6a" />
      <path d="M22 4 C13 7 6 14 4 22 C10 20 17 15 22 4 Z" fill="#00b8c4" />
      <path d="M22 40 C31 37 38 30 40 22 C34 24 27 29 22 40 Z" fill="#ffd166" />
      <circle cx="22" cy="22" r="18" fill="none" stroke="#e0d3ba" strokeWidth="1.4" />
      <circle cx="22" cy="22" r="3.2" fill="#fdf6ec" stroke="#e0d3ba" strokeWidth="1" />
    </svg>
  );
}
