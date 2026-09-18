import React from 'react';

interface MeteorologyLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export const MeteorologyLogo: React.FC<MeteorologyLogoProps> = ({
  size = 36,
  className = '',
  showGlow = true,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {showGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#0abde3]/30 via-[#48dbfb]/20 to-[#1dd1a1]/30 blur-md -z-10 animate-pulse"
          style={{ animationDuration: '4s' }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform hover:scale-105 duration-300 drop-shadow-[0_2px_10px_rgba(10,189,227,0.35)]"
      >
        <defs>
          <linearGradient id="vortexGradient1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#48dbfb" />
            <stop offset="50%" stopColor="#0abde3" />
            <stop offset="100%" stopColor="#1dd1a1" />
          </linearGradient>

          <linearGradient id="contourGradient" x1="10" y1="38" x2="38" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1dd1a1" />
            <stop offset="60%" stopColor="#0abde3" />
            <stop offset="100%" stopColor="#48dbfb" />
          </linearGradient>

          <linearGradient id="warmFrontGradient" x1="16" y1="12" x2="36" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#feca57" />
          </linearGradient>

          <linearGradient id="shieldBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#030712" stopOpacity="0.95" />
          </linearGradient>

          <radialGradient id="centerCore" cx="24" cy="24" r="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#48dbfb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0abde3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Rounded Shield / Hex-Glass Container */}
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          fill="url(#shieldBg)"
          stroke="url(#vortexGradient1)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Ambient Core Radial Glow */}
        <circle cx="24" cy="24" r="14" fill="url(#centerCore)" />

        {/* Outer Isobaric Streamline / Atmospheric Contour Ring 1 */}
        <path
          d="M 12 24 C 12 16 18 10 26 10 C 34 10 38 15 38 21 C 38 28 32 33 25 33 C 19 33 16 29 16 25 C 16 20 20 17 25 17 C 29 17 31 19 31 23"
          stroke="url(#contourGradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner Synoptic Flow Vector / Isobar Contour 2 */}
        <path
          d="M 17 31 C 20 35 27 37 32 34 C 36 31 37 25 35 20"
          stroke="url(#vortexGradient1)"
          strokeWidth="1.8"
          strokeDasharray="2.5 3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Frontal Boundary / Thermal Advection Jet Indicator */}
        <path
          d="M 10 17 C 14 13 22 13 28 15"
          stroke="url(#warmFrontGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Core Weather Station Telemetry Beacon */}
        <circle cx="25" cy="23" r="3.2" fill="#48dbfb" />
        <circle cx="25" cy="23" r="5" stroke="#1dd1a1" strokeWidth="1" strokeOpacity="0.7" fill="none" />
        <circle cx="25" cy="23" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
};

export default MeteorologyLogo;
