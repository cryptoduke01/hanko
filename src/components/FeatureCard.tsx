import { DitherSeal } from "@/components/DitherSeal";

/**
 * A cutout feature panel: a framed, rounded card that sits inset on the page
 * with our own texture inside, the spectrum washed along its base, a dither
 * grid, film grain, and the seal bleeding off one corner. Content sits on top.
 */
export function FeatureCard({
  eyebrow,
  title,
  body,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-rule bg-haze ${className}`}
    >
      {/* texture */}
      <div className="card-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -bottom-24 -right-16 opacity-[0.1] sm:-right-10"
        aria-hidden
      >
        <DitherSeal className="w-[300px] sm:w-[380px]" />
      </div>

      {/* content */}
      <div className="relative px-6 py-16 text-center sm:px-14 sm:py-20">
        {eyebrow && (
          <p className="text-[12px] font-medium tracking-[0.02em] text-mute">
            {eyebrow}
          </p>
        )}
        <h2 className="mx-auto mt-3 max-w-2xl font-sans text-3xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          {title}
        </h2>
        {body && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mute sm:text-base">
            {body}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
