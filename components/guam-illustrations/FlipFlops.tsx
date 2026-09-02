export default function FlipFlops({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 左 */}
      <g transform="rotate(-12 14 22)">
        <ellipse cx="14" cy="22" rx="8" ry="17" fill="#00b8c4" />
        <ellipse cx="14" cy="22" rx="5.6" ry="14.4" fill="#5fd6dd" />
        <path d="M14 12 L9 21 M14 12 L19 21" stroke="#ffd166" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="11" r="1.8" fill="#ffd166" />
      </g>
      {/* 右 */}
      <g transform="rotate(12 34 22)">
        <ellipse cx="34" cy="22" rx="8" ry="17" fill="#ff8a5c" />
        <ellipse cx="34" cy="22" rx="5.6" ry="14.4" fill="#ffab88" />
        <path d="M34 12 L29 21 M34 12 L39 21" stroke="#fdf6ec" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="34" cy="11" r="1.8" fill="#fdf6ec" />
      </g>
    </svg>
  );
}
