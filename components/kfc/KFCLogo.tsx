import { cn } from "@/lib/utils";

interface KFCLogoProps {
  className?: string;
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg" | "xl";
  white?: boolean;
}

export function KFCLogo({ className, variant = "full", size = "md", white = false }: KFCLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-sm" },
    md: { icon: 40, text: "text-base" },
    lg: { icon: 56, text: "text-xl" },
    xl: { icon: 80, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];
  const fill = white ? "#FFFFFF" : "#E4002B";
  const textColor = white ? "text-white" : "text-[#E4002B]";

  if (variant === "icon") {
    return (
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Red circle background */}
        <circle cx="50" cy="50" r="50" fill={fill} />
        {/* Colonel face simplified */}
        <ellipse cx="50" cy="42" rx="20" ry="24" fill="#FFF5E6" />
        {/* Hair */}
        <path d="M30 32 Q50 14 70 32 Q65 20 50 18 Q35 20 30 32Z" fill="white" />
        {/* Eyes */}
        <ellipse cx="42" cy="40" rx="3" ry="2.5" fill="#333" />
        <ellipse cx="58" cy="40" rx="3" ry="2.5" fill="#333" />
        {/* Glasses */}
        <rect x="37" y="37" width="12" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
        <rect x="51" y="37" width="12" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
        <line x1="49" y1="40.5" x2="51" y2="40.5" stroke="#333" strokeWidth="1.5" />
        {/* Nose */}
        <ellipse cx="50" cy="47" rx="2" ry="2.5" fill="#D4A574" />
        {/* Mustache */}
        <path d="M42 52 Q50 55 58 52 Q54 57 50 56 Q46 57 42 52Z" fill="white" />
        {/* Goatee */}
        <ellipse cx="50" cy="60" rx="6" ry="5" fill="white" />
        {/* KFC text */}
        <text x="50" y="82" textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="14" fill="white">KFC</text>
        {/* Bow tie */}
        <path d="M44 64 L48 67 L44 70 Z" fill="#1A1A1A" />
        <path d="M56 64 L52 67 L56 70 Z" fill="#1A1A1A" />
        <ellipse cx="50" cy="67" rx="2.5" ry="2" fill="#1A1A1A" />
      </svg>
    );
  }

  if (variant === "text") {
    return (
      <span className={cn("font-black tracking-wider", textColor, text, className)}>
        KFC Sync
      </span>
    );
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" fill={fill} />
        <ellipse cx="50" cy="42" rx="20" ry="24" fill="#FFF5E6" />
        <path d="M30 32 Q50 14 70 32 Q65 20 50 18 Q35 20 30 32Z" fill="white" />
        <ellipse cx="42" cy="40" rx="3" ry="2.5" fill="#333" />
        <ellipse cx="58" cy="40" rx="3" ry="2.5" fill="#333" />
        <rect x="37" y="37" width="12" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
        <rect x="51" y="37" width="12" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
        <line x1="49" y1="40.5" x2="51" y2="40.5" stroke="#333" strokeWidth="1.5" />
        <ellipse cx="50" cy="47" rx="2" ry="2.5" fill="#D4A574" />
        <path d="M42 52 Q50 55 58 52 Q54 57 50 56 Q46 57 42 52Z" fill="white" />
        <ellipse cx="50" cy="60" rx="6" ry="5" fill="white" />
        <text x="50" y="82" textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="14" fill="white">KFC</text>
        <path d="M44 64 L48 67 L44 70 Z" fill="#1A1A1A" />
        <path d="M56 64 L52 67 L56 70 Z" fill="#1A1A1A" />
        <ellipse cx="50" cy="67" rx="2.5" ry="2" fill="#1A1A1A" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={cn("font-black tracking-wider uppercase", textColor, text)}>
          KFC
        </span>
        <span className={cn("font-semibold tracking-widest text-xs uppercase", white ? "text-white/80" : "text-gray-500")}>
          SYNC
        </span>
      </div>
    </div>
  );
}

// Static KFC Colonel SVG artwork
export function KFCColonelArt({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* KFC themed artwork block */}
      <div className="relative w-full h-full bg-[#E4002B] rounded-2xl overflow-hidden flex items-end justify-start">
        {/* Background stripes */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[#BB0020] to-transparent" />
        </div>
        {/* Colonel silhouette */}
        <div className="relative z-10 text-[120px] leading-none pb-2 pl-4 select-none">
          👴
        </div>
        {/* KFC Logo text */}
        <div className="absolute top-4 right-4 text-white">
          <div className="text-4xl font-black tracking-wider">KFC</div>
          <div className="text-xs font-semibold tracking-widest opacity-80">VIETNAM</div>
        </div>
        {/* Decorative stripes */}
        <div className="absolute bottom-0 right-0 w-16 h-full opacity-30">
          <div className="absolute top-0 right-0 w-4 h-full bg-white" />
          <div className="absolute top-0 right-8 w-3 h-full bg-white" />
        </div>
      </div>
    </div>
  );
}
