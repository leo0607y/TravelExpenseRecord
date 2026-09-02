export default function LatteStone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* haligi（柱） */}
      <path d="M14 58 L13 20 C13 14 27 14 27 20 L26 58 Z" fill="#9c8a76" />
      {/* tasa（笠石） */}
      <path d="M4 20 C4 10 36 10 36 20 C36 24 4 24 4 20 Z" fill="#b7a68f" />
      <ellipse cx="20" cy="20" rx="16" ry="4" fill="#cbbca4" opacity="0.6" />
    </svg>
  );
}
