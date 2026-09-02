export default function DolHareubang({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 帽子 */}
      <ellipse cx="20" cy="12" rx="14" ry="5" fill="#8a8378" />
      <path d="M10 12 L14 4 L26 4 L30 12 Z" fill="#a49c8d" />
      {/* 顔・体 */}
      <path d="M8 16 C6 30 6 46 10 58 L30 58 C34 46 34 30 32 16 Z" fill="#a49c8d" />
      {/* 目・鼻 */}
      <circle cx="14" cy="24" r="3" fill="#4a463e" />
      <circle cx="26" cy="24" r="3" fill="#4a463e" />
      <ellipse cx="20" cy="30" rx="4" ry="5" fill="#8a8378" />
      {/* 手 */}
      <ellipse cx="10" cy="42" rx="4" ry="6" fill="#8a8378" />
      <ellipse cx="30" cy="42" rx="4" ry="6" fill="#8a8378" />
    </svg>
  );
}
