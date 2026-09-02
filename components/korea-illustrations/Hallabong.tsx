export default function Hallabong({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="20" cy="24" rx="15" ry="13" fill="#ef8a3d" />
      <ellipse cx="16" cy="19" rx="4" ry="3" fill="#ffb648" opacity="0.6" />
      <path d="M20 11 C18 8 20 4 24 3" stroke="#3fae6a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="25" cy="4" rx="4" ry="2.4" fill="#3fae6a" transform="rotate(30 25 4)" />
    </svg>
  );
}
