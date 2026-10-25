import React, { useEffect, useRef, useState } from "react";

/* The city background as a looping video (the 85 MB GIF, re-encoded).
   It must always move, phones included:
   1. autoplay · muted · playsInline · loop
   2. if the browser blocks autoplay (iOS Low Power Mode, data saver),
      retry on the first touch or key press
   3. until the video is actually playing, the poster drifts slowly so the
      page is never static */
const SMALL = "(max-width: 640px)";

export default function Background() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [small] = useState(() => typeof window !== "undefined" && window.matchMedia(SMALL).matches);
  const src = small ? "/bg/bg-mobile.mp4" : "/bg/bg.mp4";
  const poster = small ? "/bg/bg-poster-mobile.jpg" : "/bg/bg-poster.jpg";

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let armed = false;
    const tryPlay = () => v.play().catch(() => {});
    const onPlaying = () => setPlaying(true);
    const onStall = () => setPlaying(false);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onStall);
    v.addEventListener("waiting", onStall);

    // retry on the first gesture if autoplay was refused
    const gestures = ["touchstart", "pointerdown", "keydown"];
    const onGesture = () => {
      tryPlay();
      if (!v.paused) gestures.forEach((g) => window.removeEventListener(g, onGesture));
    };
    const arm = () => {
      if (armed) return;
      armed = true;
      gestures.forEach((g) => window.addEventListener(g, onGesture, { passive: true }));
    };
    tryPlay();
    const check = setTimeout(() => {
      if (v.paused) arm();
    }, 1200);

    // resume after tab switches / app backgrounding
    const onVisible = () => document.visibilityState === "visible" && v.paused && tryPlay();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(check);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onStall);
      v.removeEventListener("waiting", onStall);
      document.removeEventListener("visibilitychange", onVisible);
      gestures.forEach((g) => window.removeEventListener(g, onGesture));
    };
  }, []);

  return (
    <div className={`moving-background ${playing ? "is-playing" : "is-waiting"}`} aria-hidden="true">
      <img className="bg-poster" src={poster} alt="" decoding="async" />
      <video
        ref={ref}
        className="bg-video"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
      />
    </div>
  );
}
