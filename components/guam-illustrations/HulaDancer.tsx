export default function HulaDancer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* grass skirt */}
      <path d="M14 54 L10 78 L16 56 L20 79 L26 55 L30 79 L34 55 L38 79 L44 56 L50 78 L46 54 Z" fill="#3fae6a" />
      {/* torso */}
      <path d="M22 30 C20 40 20 48 24 56 L36 56 C40 48 40 40 38 30 Z" fill="#e8956b" />
      {/* lei necklace */}
      <ellipse cx="30" cy="32" rx="10" ry="4" fill="none" stroke="#ff6f91" strokeWidth="3" />
      {/* head */}
      <circle cx="30" cy="16" r="10" fill="#e8956b" />
      {/* hair */}
      <path d="M20 14 C19 6 26 2 30 2 C34 2 41 6 40 14 C36 10 24 10 20 14 Z" fill="#3a2a1c" />
      {/* flower in hair */}
      <circle cx="38" cy="10" r="3" fill="#ffd166" />
      {/* arms raised */}
      <path d="M22 34 C14 30 8 24 6 16" stroke="#e8956b" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M38 34 C46 30 52 24 54 16" stroke="#e8956b" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* hands */}
      <circle cx="6" cy="16" r="4" fill="#e8956b" />
      <circle cx="54" cy="16" r="4" fill="#e8956b" />
      {/* legs */}
      <ellipse cx="24" cy="70" rx="4" ry="7" fill="#e8956b" />
      <ellipse cx="36" cy="70" rx="4" ry="7" fill="#e8956b" />
    </svg>
  );
}
