export default function Surfboard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 2 C26 20 26 70 15 88 C4 70 4 20 15 2 Z" fill="#ffe08a" stroke="#e0a83f" strokeWidth="2" />
      <rect x="13" y="10" width="4" height="70" fill="#ff6f45" />
    </svg>
  );
}
