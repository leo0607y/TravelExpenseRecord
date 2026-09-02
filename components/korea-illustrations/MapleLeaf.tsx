export default function MapleLeaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20 3 C21 7 20 10 23 9 C27 7 28 4 31 6 C29 9 27 12 30 13 C34 14 37 12 38 15
           C35 18 31 18 32 21 C35 24 38 25 37 29 C33 27 29 27 28 30 C30 34 33 36 30 38
           C26 36 24 33 22 33 C21 33 20 34 20 36 C20 34 19 33 18 33 C16 33 14 36 10 38
           C7 36 10 34 12 30 C11 27 7 27 3 29 C2 25 5 24 8 21 C9 18 5 18 2 15
           C3 12 6 14 10 13 C13 12 11 9 9 6 C12 4 13 7 17 9 C20 10 19 7 20 3 Z"
        fill="#d64e3f"
      />
      <path d="M20 12 L20 30 M20 18 L15 22 M20 18 L25 22 M20 24 L14 27 M20 24 L26 27" stroke="#8a3f2f" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M19 34 C19 37 19 39 17 40" stroke="#6e4429" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
