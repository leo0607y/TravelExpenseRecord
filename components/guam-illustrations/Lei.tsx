export default function Lei({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {[
        { x: 24, y: 7, c: "#ff8fb3" },
        { x: 35, y: 11, c: "#ffd166" },
        { x: 41, y: 21, c: "#ff5b6a" },
        { x: 39, y: 33, c: "#ff8fb3" },
        { x: 30, y: 41, c: "#ffd166" },
        { x: 18, y: 41, c: "#ff5b6a" },
        { x: 9, y: 33, c: "#ffd166" },
        { x: 7, y: 21, c: "#ff8fb3" },
        { x: 13, y: 11, c: "#ff5b6a" },
      ].map((f, i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx={f.x}
              cy={f.y - 3}
              rx="2.1"
              ry="3.2"
              fill={f.c}
              transform={`rotate(${a} ${f.x} ${f.y})`}
            />
          ))}
          <circle cx={f.x} cy={f.y} r="1.5" fill="#fffaf0" />
        </g>
      ))}
    </svg>
  );
}
