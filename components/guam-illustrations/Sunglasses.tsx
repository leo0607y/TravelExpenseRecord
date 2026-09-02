export default function Sunglasses({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="16" cy="15" rx="14" ry="11" fill="#2b2b2b" />
      <ellipse cx="44" cy="15" rx="14" ry="11" fill="#2b2b2b" />
      <rect x="27" y="12" width="6" height="4" fill="#2b2b2b" />
      <ellipse cx="12" cy="11" rx="4" ry="3" fill="#ffffff" opacity="0.35" />
      <ellipse cx="40" cy="11" rx="4" ry="3" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}
