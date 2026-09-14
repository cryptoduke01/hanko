import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Hanko splits a tokenized share into Shield, Core and Edge, three fully backed tokens that recombine into one share.",
};

const SECTIONS = [
  {
    n: "01",
    t: "What Hanko is",
    body: (
      <p className="mt-3 text-mute">
        Hanko splits a tokenized stock into three tokens you can hold on their
        own: Shield, the safe part, Core, the middle, and Edge, the upside. Hold
        one, or hold all three. Put all three back together and you get your
        share.
      </p>
    ),
  },
  {
    n: "02",
    t: "How it works",
    body: (
      <p className="mt-3 text-mute">
        You lock one tokenized share in a vault. The vault mints three tokens
        against it, each a claim on part of the share&apos;s value at a set date.
        The three claims always add up to exactly the share, never more. Fully
        backed, no leverage. On the settlement date the vault reads the price and
        pays each token its part. Hold all three and you can recombine them into
        the share anytime.
      </p>
    ),
  },
  {
    n: "03",
    t: "The three tokens",
    body: (
      <>
        <p className="mt-3 text-mute">
          With a floor L and a cap U, at a settlement price S:
        </p>
        <ul className="mt-3 space-y-2 text-mute">
          <li>
            <span className="text-[color:var(--shield)]">Shield</span> pays{" "}
            <span className="tabular-nums text-ink">min(S, L)</span>. The first,
            safest part. Impaired only if the stock falls below the floor.
          </li>
          <li>
            <span className="text-[color:var(--core)]">Core</span> pays the value
            between L and U. Plain exposure through the middle.
          </li>
          <li>
            <span className="text-[color:var(--edge)]">Edge</span> pays whatever
            is above U. The upside, and it can never be liquidated.
          </li>
        </ul>
        <p className="mt-3 tabular-nums text-ink">Shield + Core + Edge = S.</p>
      </>
    ),
  },
  {
    n: "04",
    t: "Why it is possible",
    body: (
      <p className="mt-3 text-mute">
        A tokenized share is a programmable token, so a contract can lock it and
        issue claim tokens whose payoffs are set in code and settled against a
        price feed. It is the same technique a bond desk uses to strip a bond
        into principal and coupons, and Pendle uses to split yield, applied to
        equity.
      </p>
    ),
  },
  {
    n: "05",
    t: "Real securities",
    body: (
      <p className="mt-3 text-mute">
        The underlying can be a real, custody-backed tokenized security. Backpack
        Securities has opened a public mint and redeem API, so a real US share
        can be issued on Solana and redeemed back one to one. Hanko refracts that
        security into its three parts; recombine the parts into a whole share and
        redeem it for the real stock. The demo uses test shares in place of this.
      </p>
    ),
  },
  {
    n: "06",
    t: "What Hanko is not",
    body: (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
        <li>Not leverage. Every token is fully backed by a real share.</li>
        <li>Not rehypothecation. The share stays locked until you recombine or settle.</li>
        <li>Not financial advice.</li>
      </ul>
    ),
  },
  {
    n: "07",
    t: "Roadmap",
    body: (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
        <li>Real underlyings and redemption via Backpack Securities</li>
        <li>Tranche markets so each token trades with depth</li>
        <li>Pyth price feeds for settlement</li>
      </ul>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-12 animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.2em] text-mute">
          How it works
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          One share, split three ways.
        </h1>
      </header>

      <div className="space-y-12 text-sm leading-relaxed">
        {SECTIONS.map((s) => (
          <section key={s.n}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              {s.n} · {s.t}
            </h2>
            {s.body}
          </section>
        ))}
      </div>

      <p className="mt-14">
        <Link
          href="/refract"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-ink underline decoration-rule underline-offset-4 transition-opacity duration-200 hover:opacity-60"
        >
          Refract a share
          <ArrowRight size={13} />
        </Link>
      </p>

      <p className="mt-6 text-xs text-mute">Not financial advice.</p>
    </div>
  );
}
