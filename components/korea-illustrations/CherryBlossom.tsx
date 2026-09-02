export default function CherryBlossom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          d="M22 22 C17 18 16 11 19 7 C20 9 21 10 22 10 C23 10 24 9 25 7 C28 11 27 18 22 22 Z"
          fill="#ffb7c9"
          transform={`rotate(${angle} 22 22)`}
        />
      ))}
      <circle cx="22" cy="22" r="3.6" fill="#f4c542" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="22"
          y1="20"
          x2="22"
          y2="16"
          stroke="#e8859f"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${angle} 22 22)`}
        />
      ))}
    </svg>
  );
}
