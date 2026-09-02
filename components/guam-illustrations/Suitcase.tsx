export default function Suitcase({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="20" y="4" width="20" height="12" rx="4" fill="none" stroke="#7a4a2b" strokeWidth="4" />
      <rect x="6" y="14" width="48" height="32" rx="6" fill="#ff8a5c" />
      <rect x="6" y="26" width="48" height="6" fill="#e8703d" />
      <rect x="26" y="14" width="8" height="32" fill="#e8703d" />
    </svg>
  );
}
