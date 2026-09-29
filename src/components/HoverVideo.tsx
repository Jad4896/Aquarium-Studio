"use client";

import React, { useRef, useState, useEffect } from "react";
import { Video, Play, Maximize2 } from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onEnlarge?: () => void;
  title?: string;
  showBadge?: boolean;
  showEnlargeButton?: boolean;
  autoResetOnLeave?: boolean;
}

export default function HoverVideo({
  src,
  poster,
  className = "w-full h-full object-cover",
  onClick,
  onEnlarge,
  title,
  showBadge = true,
  showEnlargeButton = true,
  autoResetOnLeave = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Ensure video is strictly muted in DOM so browser hover autoplay works reliably
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, [src]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser requires user gesture
        });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      if (autoResetOnLeave) {
        video.currentTime = 0;
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else if (onEnlarge) {
      e.stopPropagation();
      onEnlarge();
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden group/hovervideo select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        muted
        preload="metadata"
        className={className}
      />

      {/* Video Indicator Badge */}
      {showBadge && (
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none transition-all">
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md shadow-md transition-all ${
              isPlaying
                ? "bg-[#00d2be]/90 text-[#0d121a] border-[#00d2be]"
                : "bg-[#0d121a]/85 text-[#8e9fb5] border-[#28364a]"
            }`}
          >
            <Video size={11} className={isPlaying ? "animate-pulse" : ""} />
            <span>{isPlaying ? "PLAYING" : "VIDEO"}</span>
          </div>
        </div>
      )}

      {/* Enlarge Button on Hover */}
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
            title="Click to enlarge video"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
