import { DitherSeal } from "@/components/DitherSeal";

/**
 * Hero backdrop, Hanko's own: monochrome depth with a single cool Shield glow
 * rising from the bottom, a dither grid that clears behind the headline, film
 * grain over it all, and the seal pressed faintly at the centre. Decorative.
 */
export function HeroBackdrop() {
  return (
    <div
      className="grain pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="hero-depth absolute inset-0" />
      <div className="hero-dots absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <DitherSeal className="h-auto w-[min(62vw,440px)] opacity-[0.06]" />
      </div>
    </div>
  );
}
