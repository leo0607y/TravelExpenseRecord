export default function OceanWave({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 30 Q12 18 25 30 T50 30 T75 30 T100 30 V40 H0 Z" fill="#7fd6d0" opacity="0.55" />
      <path d="M0 24 Q14 34 28 24 T56 24 T84 24 T100 24 V40 H0 Z" fill="#3aa9c9" opacity="0.6" />
      <path d="M0 34 Q10 26 20 34 T40 34 T60 34 T80 34 T100 34 V40 H0 Z" fill="#0092b0" opacity="0.7" />
    </svg>
  );
}
