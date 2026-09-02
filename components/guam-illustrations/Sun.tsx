export default function Sun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#ffb648" strokeWidth="3" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line key={angle} x1="0" y1="-13" x2="0" y2="-17" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle r="10" fill="#ffd166" />
    </svg>
  );
}
