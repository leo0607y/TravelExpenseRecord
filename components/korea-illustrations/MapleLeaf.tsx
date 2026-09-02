export default function MapleLeaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20 2 L23 12 L32 8 L26 16 L36 18 L26 22 L32 30 L23 26 L20 38 L17 26 L8 30 L14 22 L4 18 L14 16 L8 8 L17 12 Z"
        fill="#d64e3f"
      />
      <path d="M20 2 L20 38" stroke="#8a3f2f" strokeWidth="1.2" />
    </svg>
  );
}
