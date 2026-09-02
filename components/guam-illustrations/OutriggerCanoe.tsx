export default function OutriggerCanoe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* sail */}
      <path d="M30 4 L30 26 L14 24 Z" fill="#fff7e8" stroke="#ffd27a" strokeWidth="1.5" />
      <path d="M30 4 L30 26" stroke="#8a5a3a" strokeWidth="2" />
      {/* hull */}
      <path d="M6 30 C6 24 60 24 64 30 C56 34 14 34 6 30 Z" fill="#8a5a3a" />
      {/* outrigger booms + float */}
      <path d="M20 28 L20 38 M46 28 L46 38" stroke="#5a3a24" strokeWidth="2" />
      <ellipse cx="33" cy="38" rx="16" ry="3" fill="#5a3a24" />
    </svg>
  );
}
