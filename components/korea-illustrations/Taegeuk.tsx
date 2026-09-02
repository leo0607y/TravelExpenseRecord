export default function Taegeuk({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle r="18" fill="#fdf6ec" />
      <path
        d="M0 -18 A9 9 0 0 1 0 0 A9 9 0 0 0 0 18 A18 18 0 0 1 0 -18 Z"
        fill="#d64e3f"
      />
      <path
        d="M0 -18 A18 18 0 0 0 0 18 A9 9 0 0 1 0 0 A9 9 0 0 0 0 -18 Z"
        fill="#4a6fa5"
      />
      <circle cy="-9" r="3.2" fill="#4a6fa5" />
      <circle cy="9" r="3.2" fill="#d64e3f" />
    </svg>
  );
}
