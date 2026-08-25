"use client";

import { useEffect, useState } from "react";
import { Plate } from "./Plate";
import type { Source } from "@/sanity/lib/image";

/**
 * The home page masthead: a short loop of the reception, with the photograph
 * underneath it as the poster.
 *
 * The photograph is always rendered and the video is layered over it once it
 * can actually play, so the page never opens on a black rectangle and the
 * largest paint is an image rather than a video.
 *
 * The video is only mounted on wider screens, and never when the visitor has
 * asked for reduced motion. That is a data decision as much as a taste one:
 * hanging a four megabyte download on a guest browsing on mobile data is a
 * poor way to introduce a hotel. Mounting conditionally rather than hiding
 * with CSS is what actually prevents the download.
 */
export function HeroVideo({ poster, alt }: { poster: Source | null; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  /** Which source has buffered enough to show, rather than a bare boolean, so
   *  swapping size never reveals a half-loaded frame. */
  const [readySrc, setReadySrc] = useState<string | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const large = window.matchMedia("(min-width: 1280px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const decide = () => {
      if (!wide.matches || still.matches) setSrc(null);
      else setSrc(large.matches ? "/hero-1080.mp4" : "/hero-720.mp4");
    };

    decide();
    for (const q of [wide, large, still]) q.addEventListener("change", decide);
    return () => {
      for (const q of [wide, large, still]) q.removeEventListener("change", decide);
    };
  }, []);

  return (
    <>
      <Plate src={poster} alt={alt} seed="bliss-hero" priority />
      {src ? (
        <video
          // Keying on the source remounts the element, so the browser loads
          // the new file instead of holding on to the old one.
          key={src}
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReadySrc(src)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            readySrc === src ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
