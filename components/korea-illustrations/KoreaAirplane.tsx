export default function KoreaAirplane({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 35 L4 18 L11 35 Z" fill="#33517d" />
      <path d="M18 35 L8 52 L14 35 Z" fill="#33517d" />
      <ellipse cx="52" cy="35" rx="36" ry="8" fill="#f4f6f8" stroke="#4a6fa5" strokeWidth="2" />
      <path d="M60 30 L88 8 L92 10 L66 34 Z" fill="#d64e3f" />
      <path d="M60 40 L88 62 L92 60 L66 36 Z" fill="#d64e3f" />
      <circle cx="34" cy="35" r="2.5" fill="#4a6fa5" />
      <circle cx="44" cy="35" r="2.5" fill="#4a6fa5" />
      <circle cx="54" cy="35" r="2.5" fill="#4a6fa5" />
    </svg>
  );
}
