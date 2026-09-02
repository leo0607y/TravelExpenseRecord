export default function Starfish({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-22 -22 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="#ff9db3">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path key={angle} d="M0,-4 C4,-8 6,-16 0,-20 C-6,-16 -4,-8 0,-4 Z" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle r="6" fill="#ff6f91" />
      <circle cx="-2" cy="-1" r="1" fill="#fff" opacity="0.6" />
      <circle cx="3" cy="2" r="1" fill="#fff" opacity="0.6" />
    </svg>
  );
}
