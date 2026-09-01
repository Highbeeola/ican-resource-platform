import { GraduationCap } from "lucide-react";

interface Props {
  className?: string;
  textSize?: string;
}

export default function BrandLogo({
  className = "",
  textSize = "text-xl",
}: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* LOGO ICON BOX */}
      <div className="bg-[#f59e0b] p-1.5 rounded-lg shadow-sm flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>

      {/* LOGO TEXT (Dual-Tone Typography) */}
      <div
        className={`font-extrabold tracking-tight ${textSize} flex items-center gap-1`}
      >
        <span className="text-[#1e3a8a]">KRL</span>
        <span className="text-slate-600 font-medium">Academy</span>
      </div>
    </div>
  );
}
