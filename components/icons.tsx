import React from 'react';

export const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const PlayIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M8 5v14l11-7z"></path>
    </svg>
);

export const PauseIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
    </svg>
);

export const LoaderIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 200"
    >
        <radialGradient id="a" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
            <stop offset="0" stopColor="#A455FF"></stop>
            <stop offset=".3" stopColor="#A455FF" stopOpacity=".9"></stop>
            <stop offset=".6" stopColor="#A455FF" stopOpacity=".6"></stop>
            <stop offset=".8" stopColor="#A455FF" stopOpacity=".3"></stop>
            <stop offset="1" stopColor="#A455FF" stopOpacity="0"></stop>
        </radialGradient>
        <circle 
            transform-origin="center" 
            fill="none" 
            stroke="url(#a)" 
            strokeWidth="15" 
            strokeLinecap="round" 
            strokeDasharray="200 1000" 
            strokeDashoffset="0" 
            cx="100" 
            cy="100" 
            r="70">
            <animateTransform 
                type="rotate" 
                attributeName="transform" 
                calcMode="spline" 
                dur="2s" 
                values="360;0" 
                keyTimes="0;1" 
                keySplines="0 0 1 1" 
                repeatCount="indefinite">
            </animateTransform>
        </circle>
        <circle 
            transform-origin="center" 
            fill="none" 
            opacity=".2" 
            stroke="#A455FF" 
            strokeWidth="15" 
            strokeLinecap="round" 
            cx="100" 
            cy="100" 
            r="70">
        </circle>
    </svg>
);

export const SparkleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3z" />
    <path d="M20 3L18 5" />
    <path d="M4 21L6 19" />
  </svg>
);

export const ImageIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

export const UploadIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export const WandIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path>
        <path d="m14 7 3 3"></path>
        <path d="M5 6v4"></path>
        <path d="M19 14v4"></path>
        <path d="M10 2v2"></path>
        <path d="M7 8H3"></path>
        <path d="M21 16h-4"></path>
        <path d="M12 20v2"></path>
    </svg>
);

export const SunriseIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 2L12 6"></path>
        <path d="M6 12L2 12"></path>
        <path d="M22 12L18 12"></path>
        <path d="M19.07 4.93L16.24 7.76"></path>
        <path d="M4.93 19.07L7.76 16.24"></path>
        <path d="M19.07 19.07L16.24 16.24"></path>
        <path d="M4.93 4.93L7.76 7.76"></path>
        <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"></path>
        <path d="M2 18H22"></path>
    </svg>
);


export const JournalIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

export const ShareIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

export const GlobeIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

export const MicrophoneIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
    </svg>
);

export const HeadphonesIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2z"></path>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
    </svg>
);