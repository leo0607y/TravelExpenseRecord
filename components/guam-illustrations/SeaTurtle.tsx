export default function SeaTurtle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* flippers */}
      <ellipse cx="12" cy="10" rx="7" ry="4" fill="#1f9d6b" transform="rotate(-25 12 10)" />
      <ellipse cx="12" cy="36" rx="7" ry="4" fill="#1f9d6b" transform="rotate(25 12 36)" />
      <ellipse cx="46" cy="8" rx="5" ry="3" fill="#1f9d6b" transform="rotate(-15 46 8)" />
      <ellipse cx="46" cy="38" rx="5" ry="3" fill="#1f9d6b" transform="rotate(15 46 38)" />
      {/* shell */}
      <ellipse cx="30" cy="23" rx="22" ry="16" fill="#26b378" />
      <path d="M30 9 L38 18 L34 30 L26 30 L22 18 Z" fill="#1f9d6b" opacity="0.7" />
      <circle cx="18" cy="16" r="3" fill="#1f9d6b" opacity="0.7" />
      <circle cx="42" cy="16" r="3" fill="#1f9d6b" opacity="0.7" />
      <circle cx="18" cy="30" r="3" fill="#1f9d6b" opacity="0.7" />
      <circle cx="42" cy="30" r="3" fill="#1f9d6b" opacity="0.7" />
      {/* head */}
      <circle cx="54" cy="23" r="6" fill="#3fae6a" />
      <circle cx="57" cy="21" r="1.2" fill="#1a3a2c" />
    </svg>
  );
}
