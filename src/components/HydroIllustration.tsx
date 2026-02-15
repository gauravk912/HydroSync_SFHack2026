export default function HydroIllustration() {
  return (
    <div className="relative">
      {/* Soft blob background */}
      <div className="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-b from-sky-100 via-blue-50 to-white blur-0 dark:from-sky-900/25 dark:via-blue-900/10 dark:to-transparent" />

      <svg
        viewBox="0 0 860 420"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* sky */}
        <defs>
          <linearGradient id="gSky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#EAF6FF" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="gSkyDark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0B1220" />
            <stop offset="1" stopColor="#0B1220" />
          </linearGradient>
          <linearGradient id="gWater" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6FD3FF" />
            <stop offset="1" stopColor="#1C7DFF" />
          </linearGradient>
        </defs>

        {/* Background panel */}
        <rect x="0" y="0" width="860" height="420" rx="28" fill="url(#gSky)" className="dark:hidden" />
        <rect x="0" y="0" width="860" height="420" rx="28" fill="url(#gSkyDark)" className="hidden dark:block" />

        {/* clouds */}
        <g opacity="0.9" className="dark:opacity-30">
          <path d="M125 105c0-18 15-33 33-33 10 0 19 4 25 11 4-12 16-21 30-21 18 0 33 15 33 33 0 1 0 3-1 4 14 2 25 15 25 30 0 17-14 31-31 31H146c-20 0-36-16-36-36 0-9 3-17 9-23 2-9 9-16 16-19z" fill="#DFF2FF"/>
          <path d="M640 90c0-15 12-27 27-27 8 0 15 3 20 9 3-10 13-17 24-17 15 0 27 12 27 27v3c12 2 21 13 21 25 0 14-11 25-25 25H664c-16 0-29-13-29-29 0-7 3-14 7-19 2-7 8-13 14-17z" fill="#DFF2FF"/>
        </g>

        {/* hills */}
        <path d="M0 250c120-60 250-70 370-30 120 40 220 25 320-25 70-35 120-40 170-25v250H0V250z"
          fill="#DDF7E6" className="dark:fill-[#10321F]" opacity="0.9" />
        <path d="M0 260c150-70 290-60 420-15 120 42 220 30 300-5 60-25 95-28 140-18v198H0V260z"
          fill="#CDEBFF" className="dark:fill-[#0B2A4A]" opacity="0.7" />

        {/* factory base */}
        <g transform="translate(330,165)">
          <rect x="0" y="70" width="260" height="120" rx="12" fill="#E9F1FF" className="dark:fill-[#17233A]" />
          <rect x="18" y="92" width="84" height="98" rx="10" fill="#FFFFFF" className="dark:fill-[#0E172A]" opacity="0.95"/>
          <rect x="120" y="92" width="120" height="98" rx="10" fill="#FFFFFF" className="dark:fill-[#0E172A]" opacity="0.95"/>

          {/* roof */}
          <path d="M10 75L85 40l80 35v15H10V75z" fill="#CDEBFF" className="dark:fill-[#0B2A4A]" />
          <path d="M160 75l55-30 55 30v15H160V75z" fill="#CDEBFF" className="dark:fill-[#0B2A4A]" />

          {/* smokestacks */}
          <rect x="40" y="0" width="40" height="90" rx="12" fill="#C8D7F5" className="dark:fill-[#243B64]" />
          <rect x="95" y="12" width="36" height="78" rx="12" fill="#C8D7F5" className="dark:fill-[#243B64]" />
          <rect x="210" y="10" width="34" height="80" rx="12" fill="#C8D7F5" className="dark:fill-[#243B64]" />

          {/* windows */}
          <g opacity="0.9">
            <rect x="30" y="110" width="20" height="16" rx="4" fill="#7CC7FF" />
            <rect x="56" y="110" width="20" height="16" rx="4" fill="#7CC7FF" />
            <rect x="30" y="132" width="20" height="16" rx="4" fill="#7CC7FF" />
            <rect x="56" y="132" width="20" height="16" rx="4" fill="#7CC7FF" />

            <rect x="140" y="110" width="22" height="16" rx="4" fill="#7CC7FF" />
            <rect x="168" y="110" width="22" height="16" rx="4" fill="#7CC7FF" />
            <rect x="196" y="110" width="22" height="16" rx="4" fill="#7CC7FF" />
            <rect x="140" y="132" width="22" height="16" rx="4" fill="#7CC7FF" />
            <rect x="168" y="132" width="22" height="16" rx="4" fill="#7CC7FF" />
            <rect x="196" y="132" width="22" height="16" rx="4" fill="#7CC7FF" />
          </g>
        </g>

        {/* recycle arrow */}
        <g transform="translate(560,85)">
          <path d="M85 40c-30-22-70-18-92 9" stroke="#4FA8FF" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M-10 55l20-16-2 26z" fill="#4FA8FF"/>
          <path d="M-8 80c25 28 70 30 96 5" stroke="#23C58E" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M92 92l-22-10 20-16z" fill="#23C58E"/>
        </g>

        {/* droplets */}
        <g>
          <path d="M710 170c0 16-13 29-29 29s-29-13-29-29c0-15 20-36 29-54 9 18 29 39 29 54z" fill="#4FA8FF" opacity="0.95"/>
          <path d="M250 330c0 16-13 29-29 29s-29-13-29-29c0-15 20-36 29-54 9 18 29 39 29 54z" fill="#4FA8FF" opacity="0.85"/>
          <path d="M565 320c0 14-11 25-25 25s-25-11-25-25c0-13 17-31 25-46 8 15 25 33 25 46z" fill="#23C58E" opacity="0.85"/>
        </g>

        {/* water */}
        <path d="M0 320c120-48 260-65 390-35 135 32 240 25 320-6 80-32 120-35 150-20v161H0V320z"
          fill="url(#gWater)" opacity="0.95" />
        <path d="M0 344c130-52 270-50 410-18 135 30 240 22 310-2 75-26 110-26 140-14v110H0V344z"
          fill="#0D5BFF" opacity="0.35" />

        {/* water highlights */}
        <g opacity="0.8">
          <path d="M120 365c50 20 110 20 160 0" stroke="#CFF3FF" strokeWidth="10" strokeLinecap="round" />
          <path d="M370 372c40 16 90 16 130 0" stroke="#CFF3FF" strokeWidth="10" strokeLinecap="round" />
          <path d="M590 370c35 14 80 14 115 0" stroke="#CFF3FF" strokeWidth="10" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
