export default function HibiscusFlower({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g>
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-11" rx="7" ry="12" fill="#ff6f91" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle r="5" fill="#ffd166" />
    </svg>
  );
}
