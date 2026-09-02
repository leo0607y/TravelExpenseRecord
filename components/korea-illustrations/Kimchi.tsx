export default function Kimchi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 甕（オンギ） */}
      <path d="M8 20 C4 26 4 40 10 46 L30 46 C36 40 36 26 32 20 Z" fill="#8a5a3a" />
      <ellipse cx="20" cy="20" rx="12" ry="4" fill="#6e4429" />
      {/* 白菜キムチ */}
      <path d="M12 18 C10 10 14 4 20 2 C26 4 30 10 28 18 C24 14 16 14 12 18 Z" fill="#d64e3f" />
      <path d="M15 16 C14 10 17 6 20 4 C23 6 26 10 25 16" fill="none" stroke="#a03327" strokeWidth="1.2" />
    </svg>
  );
}
