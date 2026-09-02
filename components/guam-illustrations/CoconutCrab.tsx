export default function CoconutCrab({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* legs */}
      {[6, 14].map((y, i) => (
        <g key={i}>
          <path d={`M14 ${16 + y - 12} L2 ${8 + y}`} stroke="#5b3a29" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M36 ${16 + y - 12} L48 ${8 + y}`} stroke="#5b3a29" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      {/* claws */}
      <ellipse cx="8" cy="26" rx="6" ry="4" fill="#8a5a3a" transform="rotate(-20 8 26)" />
      <ellipse cx="42" cy="26" rx="6" ry="4" fill="#8a5a3a" transform="rotate(20 42 26)" />
      {/* body */}
      <ellipse cx="25" cy="18" rx="14" ry="10" fill="#a9754f" />
      <circle cx="19" cy="10" r="2" fill="#3a2a1c" />
      <circle cx="31" cy="10" r="2" fill="#3a2a1c" />
    </svg>
  );
}
