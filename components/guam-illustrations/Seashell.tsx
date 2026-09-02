export default function Seashell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 4 C36 8 40 22 34 34 C30 40 14 40 10 34 C4 22 8 8 22 4 Z" fill="#ffd6c2" />
      {[-14, -7, 0, 7, 14].map((x) => (
        <path key={x} d={`M22 8 L${22 + x} 34`} stroke="#ff9c7a" strokeWidth="2" fill="none" />
      ))}
      <path d="M14 34 Q22 40 30 34" stroke="#ff9c7a" strokeWidth="2" fill="none" />
    </svg>
  );
}
