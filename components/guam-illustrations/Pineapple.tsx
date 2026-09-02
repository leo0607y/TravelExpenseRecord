export default function Pineapple({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 20 L10 2 L20 10 L20 -2 L30 2 L20 10 Z" fill="#4c9a4c" />
      <ellipse cx="20" cy="40" rx="16" ry="20" fill="#ffcc4d" />
      <path d="M6 32 Q20 28 34 32 M6 40 Q20 36 34 40 M6 48 Q20 44 34 48" stroke="#e0a83f" strokeWidth="1.6" fill="none" />
    </svg>
  );
}
