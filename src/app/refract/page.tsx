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
    <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-[11px] tracking-[0.01em] text-mute">Refract</p>
        <h1 className="mt-4 font-sans text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-4xl">
          Lock a share, hold its three parts.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
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

      <div className="mt-10">
        <RefractConsole />
      </div>

      <div className="mt-12">
        <p className="mb-3 text-[11px] tracking-[0.01em] text-mute">
          Model the economics
        </p>
        <SpectrumExplorer />
      </div>
    </div>
  );
}
