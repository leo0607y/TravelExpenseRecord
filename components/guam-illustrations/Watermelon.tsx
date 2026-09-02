export default function Watermelon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 8 A25 25 0 0 1 46 8 L25 34 Z" fill="#2f9e52" />
      <path d="M8 10 A21 21 0 0 1 42 10 L25 30 Z" fill="#fdf6ec" />
      <path d="M11 12 A18 18 0 0 1 39 12 L25 28 Z" fill="#ff5b6a" />
      <circle cx="19" cy="16" r="1.4" fill="#2a1a12" />
      <circle cx="31" cy="16" r="1.4" fill="#2a1a12" />
      <circle cx="25" cy="22" r="1.4" fill="#2a1a12" />
    </svg>
  );
}
