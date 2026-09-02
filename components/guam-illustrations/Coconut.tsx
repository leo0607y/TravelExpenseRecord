export default function Coconut({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="#7a5236" />
      <circle cx="20" cy="20" r="10" fill="#c9a179" />
      <circle cx="14" cy="14" r="2" fill="#4a3322" />
      <circle cx="24" cy="13" r="2" fill="#4a3322" />
      <circle cx="20" cy="19" r="2" fill="#4a3322" />
      {/* leaf sprout */}
      <path d="M20 5 C14 0 10 2 8 6 C14 6 18 6 20 5 Z" fill="#3fae6a" />
      <path d="M20 5 C26 0 30 2 32 6 C26 6 22 6 20 5 Z" fill="#1f9d6b" />
    </svg>
  );
}
