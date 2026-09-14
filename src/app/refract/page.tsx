import type { Metadata } from "next";
import Link from "next/link";
import { RefractConsole } from "@/components/RefractConsole";
import { SpectrumExplorer } from "@/components/SpectrumExplorer";

export const metadata: Metadata = {
  title: "Refract a share into three tokens",
  description:
    "Lock one tokenized share and mint Shield, Core and Edge, three tranche tokens that recombine into one share.",
};

export default function RefractPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="max-w-3xl">
        <p className="text-[12px] font-medium tracking-[0.02em] text-mute">Refract</p>
        <h1 className="mt-3 font-sans text-4xl font-bold leading-[1.04] tracking-[-0.03em] text-ink sm:text-5xl">
          Lock a share, hold its three parts.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
          One share becomes Shield, Core and Edge. Recombine them into a whole
          share anytime.{" "}
          <Link
            href="/docs"
            className="text-ink underline decoration-rule underline-offset-2 transition-opacity hover:opacity-70"
          >
            How it works
          </Link>
        </p>
      </header>

      <div className="mt-14 grid gap-6 xl:grid-cols-2 xl:items-start">
        <RefractConsole />
        <div>
          <p className="mb-3 text-[12px] font-medium tracking-[0.02em] text-mute">
            Model the economics
          </p>
          <SpectrumExplorer />
        </div>
      </div>
    </div>
  );
}
