import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export const MicIcon = (p: IconProps) => (
  <Svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></Svg>
);
export const SpeakerIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 10v4h3l4 3V7L7 10H4z" /><path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" /></Svg>
);
export const HeadphonesIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="4" y="13" width="4" height="6" rx="1.5" /><rect x="16" y="13" width="4" height="6" rx="1.5" /></Svg>
);
export const UploadIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 15V4M8 8l4-4 4 4" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></Svg>
);
export const PlayIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" stroke="none"><path d="M8 5.5v13l10-6.5z" /></Svg>
);
export const StopIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" stroke="none"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" /></Svg>
);
export const PlusIcon = (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const ChevronIcon = (p: IconProps) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;
export const CloseIcon = (p: IconProps) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;

export const ClarityIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth="1.4"><path d="M2 12h4l2-6 3 12 3-9 2 3h6" /></Svg>
);
export const WarmthIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth="1.4"><path d="M3 8c3-2.5 6-2.5 9 0s6 2.5 9 0M3 12c3-2.5 6-2.5 9 0s6 2.5 9 0M3 16c3-2.5 6-2.5 9 0s6 2.5 9 0" /></Svg>
);
export const SmoothnessIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth="1.4"><path d="M2 14c4-6 7-6 10 0s6 6 10 0" /><path d="M2 10c4-6 7-6 10 0s6 6 10 0" opacity=".45" /></Svg>
);
export const ReverbIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth="1.4"><circle cx="12" cy="12" r="2.5" /><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9" /><path d="M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15" opacity=".5" /></Svg>
);
export const DelayIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth="1.4" strokeDasharray="1.2 3.3"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" strokeDasharray="1 2.5" /></Svg>
);
