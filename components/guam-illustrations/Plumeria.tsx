export default function Plumeria({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-22 -22 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g>
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M0,-2 C6,-6 8,-16 0,-19 C-8,-16 -6,-6 0,-2 Z"
            fill="#fffaf0"
            stroke="#ffe6b3"
            strokeWidth="0.5"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle r="4" fill="#ffd166" />
    </svg>
  );
}
