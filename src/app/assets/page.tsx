import type { Metadata } from "next";
import { AssetsTable } from "@/components/AssetsTable";
import { assets } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Assets",
  description:
    "Index of tokenized asset claim records on Solana — issuer, custody, redeemability, and grade.",
};

export default function AssetsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
          Index
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Tokenized assets
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute">
          Public claim records graded from primary documents. Fields without a
          verified source render as{" "}
          <span className="font-mono text-ink">NOT DISCLOSED</span>. Absence is
          the product.
        </p>
      </header>

      <AssetsTable assets={assets} />
    </div>
  );
}
