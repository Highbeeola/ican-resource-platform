import React from "react";
import Image from "next/image";

interface Props {
  className?: string;
}

export default function BrandLogo({ className = "" }: Props) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="KRL Academy"
        width={180}
        height={48}
        className="h-10 w-auto object-contain"
        priority
      />
    </div>
  );
}
