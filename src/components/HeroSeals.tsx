import Image from "next/image";

/**
 * Japanese hanko seal collage as monochrome hero art.
 * Source is red ink; CSS forces black-and-white and blends into the field.
 */
export function HeroSeals({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Soft field behind seals */}
      <div className="hero-seals-field absolute inset-0" />

      {/* Primary seal plate */}
      <div className="hero-seals-wrap absolute inset-0 flex items-center justify-center">
        <div className="hero-seals-float relative h-[min(92%,720px)] w-[min(110%,860px)] max-w-none">
          <Image
            src="/hanko-seals.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="hero-seals-img object-contain object-center"
          />
        </div>
      </div>

      {/* Edge fade so seals dissolve into the panel */}
      <div className="hero-seals-vignette absolute inset-0" />
    </div>
  );
}
