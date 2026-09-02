export default function Banchan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 小皿1（キムチ） */}
      <ellipse cx="12" cy="20" rx="11" ry="7" fill="#fdf6ec" stroke="#d9c9ad" strokeWidth="1.2" />
      <ellipse cx="12" cy="19" rx="7" ry="4" fill="#d64e3f" />
      {/* 小皿2（ナムル） */}
      <ellipse cx="30" cy="22" rx="10" ry="6.4" fill="#fdf6ec" stroke="#d9c9ad" strokeWidth="1.2" />
      <ellipse cx="30" cy="21" rx="6.4" ry="3.6" fill="#3fae6a" />
      {/* 小皿3（たくあん） */}
      <ellipse cx="48" cy="19" rx="10" ry="6.4" fill="#fdf6ec" stroke="#d9c9ad" strokeWidth="1.2" />
      <ellipse cx="48" cy="18" rx="6.4" ry="3.6" fill="#f4c542" />
    </svg>
  );
}
