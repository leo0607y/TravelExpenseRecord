export default function Airplane({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="rotate(-28 51 35)">
        {/* 尾翼（垂直） */}
        <path d="M14 24 L7 4 L19 8 L23 25 Z" fill="#0092b0" />
        {/* 尾翼（水平） */}
        <path d="M15 40 L6 55 L18 52 L23 39 Z" fill="#0092b0" />
        {/* 主翼（胴体中央付近から尾翼側へ緩やかに後退角） */}
        <path d="M65 23 L35 6 L28 9 L52 27 Z" fill="#ff8a5c" />
        <path d="M65 41 L35 58 L28 55 L52 37 Z" fill="#ff8a5c" />
        {/* 胴体 */}
        <path
          d="M10 32 C10 25 22 21 42 21 L80 21 C89 21 94 26 96 32 C94 38 89 43 80 43 L42 43 C22 43 10 39 10 32 Z"
          fill="#f4f6f8"
          stroke="#0092b0"
          strokeWidth="2"
        />
        {/* コックピット窓 */}
        <circle cx="82" cy="32" r="3" fill="#0092b0" />
        {/* 客席窓 */}
        <circle cx="36" cy="32" r="2.2" fill="#0092b0" />
        <circle cx="48" cy="32" r="2.2" fill="#0092b0" />
        <circle cx="60" cy="32" r="2.2" fill="#0092b0" />
        <circle cx="72" cy="32" r="2.2" fill="#0092b0" />
      </g>
    </svg>
  );
}
