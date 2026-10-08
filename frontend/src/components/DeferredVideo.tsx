"use client";

import { useEffect, useRef, useState } from "react";

export function DeferredVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return <video ref={videoRef} src={nearViewport ? "/video.mp4" : undefined} preload="none" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />;
}
