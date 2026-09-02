export default function Cocktail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 6 H42 L25 34 Z" fill="#ffe08a" stroke="#e0a83f" strokeWidth="2" />
      <rect x="23" y="34" width="4" height="14" fill="#e0a83f" />
      <ellipse cx="25" cy="50" rx="14" ry="4" fill="#e0a83f" />
      <path d="M6 2 Q25 -10 44 2 L40 6 Q25 -2 10 6 Z" fill="#ff6f91" />
      <rect x="30" y="0" width="3" height="20" rx="1.5" fill="#ff6f91" />
    </svg>
  );
}
