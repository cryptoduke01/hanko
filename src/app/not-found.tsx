import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[11px] tracking-[0.01em] text-mute tabular-nums">
        404
      </p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
        This page came apart.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        The page you are looking for does not exist. Head back and refract a
        share instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/refract"
          className="press btn-liquid inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12px] font-semibold tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Refract a share
          <ArrowUpRight size={14} />
        </Link>
        <Link
          href="/"
          className="press inline-flex items-center rounded-full border border-rule px-6 py-3 text-[12px] font-semibold tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
