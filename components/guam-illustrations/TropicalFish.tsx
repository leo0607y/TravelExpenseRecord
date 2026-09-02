export default function TropicalFish({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* tail */}
      <path d="M4 17 L14 6 L14 28 Z" fill="#ff9633" />
      {/* body */}
      <ellipse cx="30" cy="17" rx="18" ry="13" fill="#ffb648" />
      {/* stripes */}
      <path d="M24 5 C21 11 21 23 24 29" stroke="#ff7a1a" strokeWidth="3" fill="none" />
      <path d="M34 4 C30 11 30 23 34 30" stroke="#ff7a1a" strokeWidth="3" fill="none" />
      {/* top fin */}
      <path d="M28 4 L34 -2 L38 6 Z" fill="#ff7a1a" />
      {/* eye */}
      <circle cx="42" cy="14" r="2.4" fill="#1a3a2c" />
    </svg>
  );
}
