"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LightboxMedia } from "@/context/MediaLightboxContext";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  Repeat,
  Info,
  Maximize,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  media: LightboxMedia;
}

export default function MediaLightboxModal({ isOpen, onClose, media }: Props) {
  // Image zoom and pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Video states
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset states when media changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [media.url]);

  // Video duration and sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video || media.type !== "video") return;

    video.volume = isMuted ? 0 : volume;
    video.muted = isMuted;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      // Auto-start video when opened in enlarged view with sound enabled
      video.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay may be blocked by browser policy without user gesture; fallback to muted
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 1) {
      setDuration(video.duration || 0);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [media.type, media.url, isLooping]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (media.type === "video") {
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          togglePlay();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          seekDelta(-5);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          seekDelta(5);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          changeVolumeDelta(0.1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          changeVolumeDelta(-0.1);
        } else if (e.key.toLowerCase() === "m") {
          e.preventDefault();
          toggleMute();
        } else if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          toggleFullscreen();
        }
      } else if (media.type === "image") {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, media.type, isFullscreen, isPlaying, volume, isMuted, zoom]);

  // Video controls functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = parseFloat(e.target.value);
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const seekDelta = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(duration, video.currentTime + delta));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
      video.muted = newVol === 0;
    }
  };

  const changeVolumeDelta = (delta: number) => {
    const newVol = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
      video.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Image zoom functions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(0.5, Math.round((prev - 0.25) * 100) / 100);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSetZoomPreset = (level: number) => {
    setZoom(level);
    if (level === 1) setPan({ x: 0, y: 0 });
  };

  // Wheel zoom on image
  const handleImageWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(5, Math.round((prev + 0.2) * 100) / 100));
    } else {
      setZoom((prev) => {
        const next = Math.max(0.5, Math.round((prev - 0.2) * 100) / 100);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse pan/drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2.2);
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-xl animate-fadeIn select-none text-[#f0f4f8]"
      onClick={(e) => {
        // Light dismiss if clicking directly on overlay backdrop
        if (e.target === e.currentTarget && !isDragging) {
          onClose();
        }
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#28364a]/80 bg-[#0d121a]/90 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                media.type === "video"
                  ? "bg-[#00d2be]/20 text-[#00d2be] border border-[#00d2be]/40"
                  : "bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40"
              }`}
            >
              {media.type === "video" ? "Video View" : "Image Inspect"}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#f0f4f8] truncate">
              {media.title || "Specimen Media"}
            </h2>
          </div>
          {media.subtitle && (
            <span className="hidden md:inline-block text-xs text-[#8e9fb5] truncate border-l border-[#28364a] pl-3">
              {media.subtitle}
            </span>
          )}
          {media.date && (
            <span className="hidden sm:inline-block text-xs text-[#8e9fb5]/80 font-mono">
              {media.date}
            </span>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#161e2b] hover:bg-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] border border-[#28364a] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Close viewer (Esc)"
          >
            <X size={18} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Main Media Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
        {media.type === "image" ? (
          /* Image Viewer Canvas with Zoom & Drag */
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing"
            onWheel={handleImageWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={media.url}
              alt={media.title || "Enlarged Image"}
              draggable={false}
              className={`max-w-[95%] max-h-[85vh] object-contain transition-transform select-none ${
                isDragging ? "transition-none" : "duration-150 ease-out"
              }`}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
            />

            {/* Floating Image Zoom Controls Toolbar */}
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-[#0f1520]/90 border border-[#28364a] backdrop-blur-xl shadow-2xl z-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Zoom Out */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1.5 rounded-lg bg-[#161e2b] hover:bg-[#28364a] text-[#f0f4f8] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </button>

              {/* Current Zoom Level Readout */}
              <span className="text-xs font-mono font-bold text-[#00d2be] px-2 min-w-[54px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              {/* Zoom In */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 5.0}
                className="p-1.5 rounded-lg bg-[#161e2b] hover:bg-[#28364a] text-[#f0f4f8] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </button>

              <div className="h-4 w-[1px] bg-[#28364a] mx-1" />

              {/* Preset buttons */}
              <button
                type="button"
                onClick={() => handleSetZoomPreset(1)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  zoom === 1
                    ? "bg-[#00d2be] text-[#0d121a]"
                    : "bg-[#161e2b] text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
                title="100% standard view"
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => handleSetZoomPreset(2)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  zoom === 2
                    ? "bg-[#00d2be] text-[#0d121a]"
                    : "bg-[#161e2b] text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
                title="200% zoom"
              >
                2x
              </button>
              <button
                type="button"
                onClick={() => handleSetZoomPreset(3)}
                className={`hidden sm:inline-block px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  zoom === 3
                    ? "bg-[#00d2be] text-[#0d121a]"
                    : "bg-[#161e2b] text-[#8e9fb5] hover:text-[#f0f4f8]"
                }`}
                title="300% zoom"
              >
                3x
              </button>

              {/* Reset Zoom */}
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg bg-[#161e2b] hover:bg-[#28364a] text-[#8e9fb5] hover:text-[#00d2be] transition-all cursor-pointer ml-1"
                title="Reset zoom & position (0)"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Instruction hint for dragging */}
            {zoom > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0d121a]/80 border border-[#28364a] px-3 py-1 rounded-full text-[11px] text-[#8e9fb5] backdrop-blur-sm pointer-events-none animate-fadeIn">
                Click & drag to pan around image • Scroll wheel to zoom
              </div>
            )}
          </div>
        ) : (
          /* Video Player with Play/Pause, Volume, Timeline, Fullscreen */
          <div
            ref={videoContainerRef}
            className="w-full max-w-5xl max-h-[85vh] aspect-video bg-black rounded-2xl overflow-hidden border border-[#28364a] shadow-2xl relative flex flex-col justify-end group/player"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => {
              setShowControls(true);
              if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
              hideControlsTimer.current = setTimeout(() => {
                if (isPlaying) setShowControls(false);
              }, 2500);
            }}
          >
            {/* The Video Element */}
            <video
              ref={videoRef}
              src={media.url}
              playsInline
              loop={isLooping}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Big Center Play/Pause Overlay indicator when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-10 transition-opacity"
              >
                <button
                  type="button"
                  className="w-18 h-18 rounded-full bg-[#00d2be] hover:bg-[#14ebd7] text-[#0d121a] flex items-center justify-center shadow-[0_0_30px_rgba(0,210,190,0.6)] hover:scale-110 transition-all cursor-pointer"
                  title="Play (Space)"
                >
                  <Play size={32} className="ml-1 fill-current" />
                </button>
              </div>
            )}

            {/* Sleek Bottom Video Control Bar */}
            <div
              className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 flex flex-col gap-2 z-20 transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Timeline Progress Scrubber */}
              <div className="flex items-center gap-3 w-full">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-[#28364a] rounded-lg appearance-none cursor-pointer accent-[#00d2be] hover:h-2 transition-all"
                  title="Seek video"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {/* Left Controls: Play/Pause, Time */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-[#161e2b]/80 hover:bg-[#00d2be] hover:text-[#0d121a] text-[#f0f4f8] transition-all cursor-pointer"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause size={17} className="fill-current" /> : <Play size={17} className="fill-current ml-0.5" />}
                  </button>

                  {/* Time Display */}
                  <span className="text-xs font-mono text-[#8e9fb5]">
                    <span className="text-[#f0f4f8] font-semibold">{formatTime(currentTime)}</span>
                    <span className="mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </span>
                </div>

                {/* Right Controls: Volume Slider, Loop, Fullscreen */}
                <div className="flex items-center gap-3">
                  {/* Volume Group */}
                  <div className="flex items-center gap-2 bg-[#161e2b]/80 px-2.5 py-1.5 rounded-xl border border-[#28364a]">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="text-[#8e9fb5] hover:text-[#00d2be] transition-colors cursor-pointer"
                      title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={16} className="text-rose-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 size={16} />
                      ) : (
                        <Volume2 size={16} className="text-[#00d2be]" />
                      )}
                    </button>

                    {/* Volume Slider */}
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-18 sm:w-24 h-1.5 bg-[#28364a] rounded-lg appearance-none cursor-pointer accent-[#00d2be]"
                      title="Adjust Volume"
                    />

                    <span className="text-[11px] font-mono text-[#8e9fb5] min-w-[28px] text-right">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>

                  {/* Loop Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isLooping
                        ? "bg-[#00d2be]/20 text-[#00d2be] border border-[#00d2be]/30"
                        : "bg-[#161e2b]/80 text-[#8e9fb5] hover:text-[#f0f4f8]"
                    }`}
                    title={isLooping ? "Loop enabled" : "Loop disabled"}
                  >
                    <Repeat size={16} />
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-[#161e2b]/80 hover:bg-[#28364a] text-[#8e9fb5] hover:text-[#f0f4f8] transition-all cursor-pointer"
                    title="Toggle Fullscreen (F)"
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional Caption Footer */}
      {media.caption && (
        <div className="px-6 py-2.5 border-t border-[#28364a]/80 bg-[#0d121a]/80 text-center text-xs text-[#8e9fb5] shrink-0">
          {media.caption}
        </div>
      )}
    </div>
  );
}
