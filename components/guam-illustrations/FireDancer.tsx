export default function FireDancer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* fire trail (rotating staff) */}
      <path
        d="M6 40 C6 20 20 8 30 8 C40 8 54 20 54 40 C54 22 42 14 30 14 C18 14 6 22 6 40 Z"
        fill="none"
        stroke="#ff7a1a"
        strokeWidth="3"
        opacity="0.85"
      />
      {/* flame blobs on the ring */}
      <ellipse cx="8" cy="40" rx="6" ry="8" fill="#ff9633" />
      <ellipse cx="6" cy="34" rx="4" ry="5.5" fill="#ffcf5c" />
      <ellipse cx="52" cy="40" rx="6" ry="8" fill="#ff9633" />
      <ellipse cx="54" cy="34" rx="4" ry="5.5" fill="#ffcf5c" />
      {/* torso, twisting pose */}
      <path d="M24 40 C21 48 21 54 25 60 L35 60 C39 54 39 48 36 40 Z" fill="#7a3b2e" />
      {/* legs, lunge */}
      <path d="M25 60 L18 78" stroke="#7a3b2e" strokeWidth="6" strokeLinecap="round" />
      <path d="M35 60 L42 78" stroke="#7a3b2e" strokeWidth="6" strokeLinecap="round" />
      {/* arms holding the staff */}
      <path d="M25 42 L10 38" stroke="#7a3b2e" strokeWidth="5" strokeLinecap="round" />
      <path d="M35 42 L50 38" stroke="#7a3b2e" strokeWidth="5" strokeLinecap="round" />
      {/* head */}
      <circle cx="30" cy="30" r="9" fill="#7a3b2e" />
    </svg>
  );
}
