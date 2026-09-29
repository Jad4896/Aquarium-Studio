"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import MediaLightboxModal from "@/components/MediaLightboxModal";

export interface LightboxMedia {
  type: "image" | "video";
  url: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  date?: string;
}

interface MediaLightboxContextType {
  openMedia: (media: LightboxMedia) => void;
  closeMedia: () => void;
  currentMedia: LightboxMedia | null;
}

const MediaLightboxContext = createContext<MediaLightboxContextType>({
  openMedia: () => {},
  closeMedia: () => {},
  currentMedia: null,
});

export function MediaLightboxProvider({ children }: { children: React.ReactNode }) {
  const [currentMedia, setCurrentMedia] = useState<LightboxMedia | null>(null);

  const openMedia = useCallback((media: LightboxMedia) => {
    setCurrentMedia(media);
  }, []);

  const closeMedia = useCallback(() => {
    setCurrentMedia(null);
  }, []);

  return (
    <MediaLightboxContext.Provider value={{ openMedia, closeMedia, currentMedia }}>
      {children}
      {currentMedia && (
        <MediaLightboxModal
          isOpen={Boolean(currentMedia)}
          onClose={closeMedia}
          media={currentMedia}
        />
      )}
    </MediaLightboxContext.Provider>
  );
}

export function useMediaLightbox() {
  return useContext(MediaLightboxContext);
}
