export default function ResortDecorations() {
  return (
    <>
      <svg
        className="resort-decor resort-decor--palm"
        viewBox="0 0 130 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="translate(6,124)">
          {[-70, -45, -20, 5, 30].map((angle, i) => (
            <path
              key={angle}
              d="M0,0 C-9,-32 -7,-72 0,-98 C7,-72 9,-32 0,0 Z"
              fill={i % 2 === 0 ? "#0f9d8a" : "#12b3a0"}
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
      </svg>
      <svg
        className="resort-decor resort-decor--hibiscus"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="translate(22,22)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-10"
              rx="6"
              ry="11"
              fill="#ff6f91"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="4.5" fill="#ffd166" />
        </g>
      </svg>
    </>
  );
}
