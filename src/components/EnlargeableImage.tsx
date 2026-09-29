"use client";

import React, { useState } from "react";
import { ZoomIn, Maximize2 } from "lucide-react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onEnlarge?: () => void;
  showEnlargeButton?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function EnlargeableImage({
  src,
  alt = "Specimen Image",
  className = "w-full h-full object-cover",
  onClick,
  onEnlarge,
  showEnlargeButton = true,
  onError,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onEnlarge) {
      e.stopPropagation();
      onEnlarge();
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden group/enlargeable select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        onError={onError}
      />

      {/* Enlarge / Zoom Button on Hover */}
      {showEnlargeButton && (onEnlarge || onClick) && (
        <div
          className={`absolute top-2 right-2 z-10 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (onEnlarge) onEnlarge();
            else if (onClick) onClick(e);
          }}
        >
          <button
            type="button"
            className="p-1.5 rounded-lg bg-[#0d121a]/85 hover:bg-[#00d2be] text-[#8e9fb5] hover:text-[#0d121a] border border-[#28364a] hover:border-[#00d2be] backdrop-blur-sm transition-all shadow-lg cursor-pointer"
            title="Click to enlarge & zoom"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
