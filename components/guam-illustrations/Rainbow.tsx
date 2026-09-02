export default function Rainbow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 44 A36 36 0 0 1 76 44" fill="none" stroke="#ff6f91" strokeWidth="6" />
      <path d="M12 44 A28 28 0 0 1 68 44" fill="none" stroke="#ffb648" strokeWidth="6" />
      <path d="M20 44 A20 20 0 0 1 60 44" fill="none" stroke="#5ec9c0" strokeWidth="6" />
    </svg>
  );
}
